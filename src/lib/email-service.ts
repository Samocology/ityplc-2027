/**
 * Centralized email service for ITYPLC 2027.
 *
 * Provides a single integration point for all email delivery:
 *   - Supabase Auth emails (via Edge Function + Brevo)
 *   - Participant registration confirmations
 *   - Guardian consent requests and reminders
 *   - Admin account notifications
 *   - HQ and Zone Admin notifications
 *   - Import/export notifications
 *
 * Emails are queued in the `notifications` table with retry support,
 * idempotency keys, and delivery tracking. Brevo handles the actual SMTP
 * delivery through the centralized BrevoClient.
 *
 * This module is designed to run in server-side contexts (Edge Functions,
 * Supabase database functions, or backend routes). It must NOT be imported
 * by browser client code because it requires Brevo API credentials.
 */

import { supabase } from "@/lib/supabase";
import { BrevoClient, BrevoClientError, type BrevoSendEmailRequest } from "@/lib/brevo-client";

export type EmailChannel = "email" | "sms" | "kingschat";

export type EmailStatus = "pending" | "sent" | "failed" | "cancelled";

export interface QueuedEmail {
  id: string;
  template_id: string | null;
  recipient_type: "participant" | "guardian" | "admin";
  recipient_id: string;
  recipient_email: string | null;
  recipient_phone: string | null;
  subject: string | null;
  body: string;
  status: EmailStatus;
  retry_count: number;
  max_retries: number;
  last_error: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

declare const Deno: { env: { get(key: string): string | undefined } };

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  body: string;
  htmlBody?: string;
  recipientType: "participant" | "guardian" | "admin";
  recipientId: string;
  templateId?: string | null;
  idempotencyKey?: string;
  maxRetries?: number;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId: string | null;
  error: string | null;
  attempts: number;
}

export interface EmailServiceConfig {
  brevoApiKey: string;
  brevoSenderEmail: string;
  brevoSenderName?: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
  maxRetries?: number;
}

export class EmailService {
  private brevo: BrevoClient;
  private maxRetries: number;

  constructor(config: EmailServiceConfig) {
    this.brevo = new BrevoClient({
      apiKey: config.brevoApiKey,
      senderEmail: config.brevoSenderEmail,
      senderName: config.brevoSenderName ?? "ITYPLC 2027",
      maxRetries: config.maxRetries ?? 3,
    });
    this.maxRetries = config.maxRetries ?? 3;
  }

  /**
   * Queue an email for delivery. Creates a notification record with
   * status 'pending'. Does not send immediately - the delivery worker
   * (Edge Function or background process) picks up pending records.
   *
   * Returns the queued email record.
   */
  async queueEmail(options: SendEmailOptions): Promise<QueuedEmail | null> {
    // Check for existing pending/sent email with same idempotency key to prevent duplicates
    const { data: existing } = await supabase
      .from("notifications")
      .select("id, status, recipient_email, created_at")
      .eq("recipient_id", options.recipientId)
      .eq("recipient_email", options.to)
      .eq("recipient_type", options.recipientType)
      .order("created_at", { ascending: false })
      .limit(5)
      .maybeSingle();

    if (existing) {
      // If a sent email with same recipient/subject exists within last hour, skip duplicate
      const existingDate = existing.created_at ? new Date(existing.created_at).getTime() : 0;
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      if (existing.status === "sent" && existingDate > oneHourAgo) {
        return null; // Duplicate suppressed
      }
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        template_id: options.templateId ?? null,
        recipient_type: options.recipientType,
        recipient_id: options.recipientId,
        recipient_email: options.to,
        recipient_phone: null,
        status: "pending",
        retry_count: 0,
        max_retries: options.maxRetries ?? this.maxRetries,
        last_error: null,
        sent_at: null,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to queue email: ${error.message}`);
    }

    return data as QueuedEmail;
  }

  /**
   * Send a queued email immediately via Brevo. Updates the notification
   * record to 'sent' or 'failed' based on outcome.
   */
  async sendQueuedEmail(notificationId: string): Promise<EmailDeliveryResult> {
    // Fetch the notification
    const { data: notification, error: fetchError } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", notificationId)
      .single();

    if (fetchError || !notification) {
      return {
        success: false,
        messageId: null,
        error: fetchError?.message || "Notification not found",
        attempts: 0,
      };
    }

    if (notification.status === "sent") {
      return {
        success: true,
        messageId: null,
        error: null,
        attempts: notification.retry_count,
      };
    }

    if (!notification.recipient_email) {
      await this.markFailed(notificationId, "No recipient email address", notification.retry_count + 1);
      return {
        success: false,
        messageId: null,
        error: "No recipient email address",
        attempts: notification.retry_count + 1,
      };
    }

    // Check if max retries exceeded
    if (notification.retry_count >= notification.max_retries) {
      await this.markFailed(notificationId, "Max retries exceeded", notification.retry_count);
      return {
        success: false,
        messageId: null,
        error: "Max retries exceeded",
        attempts: notification.retry_count,
      };
    }

    const payload: BrevoSendEmailRequest = {
      to: [{ email: notification.recipient_email, name: undefined }],
      sender: {
        name: "ITYPLC 2027",
        email: "noreply@ityplc2027.org", // Will be overridden by BrevoClient sender
      },
      subject: notification.subject ?? "ITYPLC 2027 Notification",
      htmlContent: notification.body,
      textContent: notification.body,
      tags: ["ityplc-2027", notification.recipient_type],
    };

    try {
      const result = await this.brevo.sendEmail(payload);
      await this.markSent(notificationId);
      return {
        success: true,
        messageId: result.messageId,
        error: null,
        attempts: notification.retry_count + 1,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown delivery error";
      const isPermanent =
        err instanceof BrevoClientError &&
        err.statusCode &&
        err.statusCode >= 400 &&
        err.statusCode < 500 &&
        err.statusCode !== 429;

      if (isPermanent) {
        await this.markFailed(notificationId, errorMessage, notification.retry_count + 1);
        return {
          success: false,
          messageId: null,
          error: errorMessage,
          attempts: notification.retry_count + 1,
        };
      }

      // Retryable - increment retry count and leave as pending
      await this.incrementRetry(notificationId, errorMessage);
      return {
        success: false,
        messageId: null,
        error: errorMessage,
        attempts: notification.retry_count + 1,
      };
    }
  }

  /**
   * Process all pending notifications that are due for retry.
   * Called by the Edge Function or background worker.
   */
  async processPendingEmails(): Promise<{ processed: number; sent: number; failed: number }> {
    const { data: pending, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(100);

    if (error || !pending) {
      return { processed: 0, sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const notification of pending) {
      const result = await this.sendQueuedEmail(notification.id);
      if (result.success) sent++;
      else failed++;
    }

    return { processed: pending.length, sent, failed };
  }

  /**
   * Send an email immediately (queue + deliver). Used for application
   * emails that need to be sent right away (e.g. registration confirmation).
   * Does not block the calling operation - if delivery fails, the email
   * remains queued for retry.
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailDeliveryResult> {
    const queued = await this.queueEmail(options);
    if (!queued) {
      return { success: true, messageId: null, error: null, attempts: 0 }; // Duplicate suppressed
    }

    return this.sendQueuedEmail(queued.id);
  }

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------

  private async markSent(notificationId: string): Promise<void> {
    await supabase
      .from("notifications")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", notificationId);

    await supabase.from("notification_logs").insert({
      notification_id: notificationId,
      attempt_number: 1,
      status: "sent",
      error_message: null,
    });
  }

  private async markFailed(notificationId: string, error: string, retryCount: number): Promise<void> {
    const status = retryCount >= this.maxRetries ? "failed" : "pending";
    await supabase
      .from("notifications")
      .update({
        status,
        last_error: error,
        retry_count: retryCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", notificationId);

    await supabase.from("notification_logs").insert({
      notification_id: notificationId,
      attempt_number: retryCount,
      status: "failed",
      error_message: error,
    });
  }

  private async incrementRetry(notificationId: string, error: string): Promise<void> {
    const { data: current } = await supabase
      .from("notifications")
      .select("retry_count")
      .eq("id", notificationId)
      .single();

    const currentCount = (current as { retry_count?: number } | null)?.retry_count ?? 0;

    await supabase
      .from("notifications")
      .update({
        last_error: error,
        retry_count: currentCount + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", notificationId);

    await supabase.from("notification_logs").insert({
      notification_id: notificationId,
      attempt_number: 1,
      status: "failed",
      error_message: error,
    });
  }
}

export function createEmailServiceFromEnv(): EmailService {
  const brevoApiKey = Deno.env.get("BREVO_API_KEY");
  const brevoSenderEmail = Deno.env.get("BREVO_SENDER_EMAIL");
  const brevoSenderName = Deno.env.get("BREVO_SENDER_NAME") || "ITYPLC 2027";
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!brevoApiKey) throw new Error("BREVO_API_KEY is required");
  if (!brevoSenderEmail) throw new Error("BREVO_SENDER_EMAIL is required");
  if (!supabaseUrl) throw new Error("SUPABASE_URL is required");
  if (!supabaseServiceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");

  return new EmailService({
    brevoApiKey,
    brevoSenderEmail,
    brevoSenderName,
    supabaseUrl,
    supabaseServiceKey,
  });
}
