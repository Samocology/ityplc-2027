

export interface BrevoSendEmailRequest {
  to: Array<{ email: string; name?: string }>;
  sender: { name: string; email: string };
  subject: string;
  htmlContent?: string;
  textContent?: string;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  tags?: string[];
  templateId?: number;
}

export interface BrevoSendEmailResponse {
  messageId: string;
}

export class BrevoClientError extends Error {
  statusCode?: number;
  code?: string;

  constructor(message: string, statusCode?: number, code?: string) {
    super(message);
    this.name = "BrevoClientError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class BrevoClient {
  private apiKey: string;
  private senderEmail: string;
  private senderName: string;
  private maxRetries: number;
  private baseDelayMs: number;

  constructor({
    apiKey,
    senderEmail,
    senderName = "ITYPLC 2027",
    maxRetries = 3,
    baseDelayMs = 1000,
  }: {
    apiKey: string;
    senderEmail: string;
    senderName?: string;
    maxRetries?: number;
    baseDelayMs?: number;
  }) {
    this.apiKey = apiKey;
    this.senderEmail = senderEmail;
    this.senderName = senderName;
    this.maxRetries = maxRetries;
    this.baseDelayMs = baseDelayMs;
  }

  async sendEmail(request: BrevoSendEmailRequest): Promise<BrevoSendEmailResponse> {
    const payload = {
      sender: {
        name: this.senderName,
        email: this.senderEmail,
      },
      to: request.to,
      subject: request.subject,
      htmlContent: request.htmlContent,
      textContent: request.textContent,
      headers: request.headers,
      params: request.params,
      tags: request.tags ?? ["ityplc-2027"],
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "api-key": this.apiKey,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const result = await response.json();
          return {
            messageId: result.messageId || result.id || `brevo-${Date.now()}`,
          };
        }

        const errorBody = await response.json().catch(() => ({}));
        const statusCode = response.status;

        // Permanent errors: do not retry
        if (statusCode === 400 || statusCode === 401 || statusCode === 403) {
          throw new BrevoClientError(
            errorBody.message || `Brevo API error (${statusCode})`,
            statusCode,
            errorBody.code || "brevo_api_error",
          );
        }

        // Retryable: 429 (rate limit), 5xx (server error)
        lastError = new BrevoClientError(
          errorBody.message || `Brevo API error (${statusCode})`,
          statusCode,
          errorBody.code || "brevo_api_error",
        );

        if (attempt < this.maxRetries) {
          const delay = this.baseDelayMs * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      } catch (err) {
        if (err instanceof BrevoClientError && err.statusCode && err.statusCode < 500 && err.statusCode !== 429) {
          throw err;
        }
        lastError = err as Error;
        if (attempt < this.maxRetries) {
          const delay = this.baseDelayMs * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new BrevoClientError("Brevo delivery failed after retries", 500, "brevo_delivery_failed");
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ------------------------------------------------------------------
// Imports
// ------------------------------------------------------------------

import { serve } from "https://deno.land/std@0.223.0/http/server.ts";

// ------------------------------------------------------------------
// Configuration
// ------------------------------------------------------------------

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const BREVO_SENDER_EMAIL = Deno.env.get("BREVO_SENDER_EMAIL");
const BREVO_SENDER_NAME = Deno.env.get("BREVO_SENDER_NAME") || "ITYPLC 2027";
const SEND_EMAIL_HOOK_SECRET = Deno.env.get("SEND_EMAIL_HOOK_SECRET");

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

type AuthEmailEvent = {
  type: string;
  email: string;
  token?: string;
  redirect_to?: string;
  site_url?: string;
  created_at?: string;
  expires_at?: string;
  otp?: string;
  [key: string]: unknown;
};

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/**
 * Verify the Supabase Auth Hook webhook signature.
 * Supabase signs the request body using HMAC-SHA256 with the hook secret.
 * The signature is sent in the X-Webhook-Signature header.
 */
function verifyWebhookSignature(
  body: string | Uint8Array,
  signature: string | null,
  secret: string | undefined,
): boolean {
  if (!secret || !signature) {
    return false;
  }

  try {
    const bodyBytes =
      typeof body === "string" ? new TextEncoder().encode(body) : body;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const signatureBytes = hexToBytes(signature);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      bodyBytes,
    );

    return isValid;
  } catch {
    return false;
  }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Generate the confirmation URL for auth emails.
 * Uses the token data supplied by Supabase Auth.
 */
function buildAuthUrl(event: AuthEmailEvent): string {
  const base = event.redirect_to || event.site_url || "";
  const token = event.token || "";

  if (!base || !token) {
    return "";
  }

  const url = new URL(base);

  if (base.includes("/auth/") || base.includes("/confirm")) {
    url.searchParams.set("token", token);
    url.searchParams.set("type", event.type);
    if (event.redirect_to) {
      url.searchParams.set("redirect_to", event.redirect_to);
    }
    return url.toString();
  }

  url.pathname = "/auth/confirm";
  url.searchParams.set("token", token);
  url.searchParams.set("type", event.type);
  if (event.redirect_to) {
    url.searchParams.set("redirect_to", event.redirect_to);
  }
  return url.toString();
}

/**
 * Build the HTML email body for auth emails.
 */
function buildEmailHtml(
  eventType: string,
  email: string,
  token: string | undefined,
  authUrl: string,
): string {
  const supportEmail = BREVO_SENDER_EMAIL || "support@ityplc2027.org";
  const currentYear = new Date().getFullYear();

  const buttonText = getButtonText(eventType);
  const headline = getHeadline(eventType);
  const bodyText = getBodyText(eventType, email);
  const expiryMinutes = 15;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f28c28 0%, #df791b 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">ITYPLC 2027</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0; font-size: 14px;">Conference Administration Portal</p>
  </div>

  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef; border-top: none;">
    <h2 style="color: #14213a; font-size: 20px; margin-top: 0;">${headline}</h2>
    <p style="color: #555; font-size: 16px;">${bodyText}</p>

    ${authUrl ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${authUrl}" style="background: #f28c28; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
        ${buttonText}
      </a>
    </div>
    <p style="color: #888; font-size: 14px;">This link expires in ${expiryMinutes} minutes.</p>
    ` : `
    <p style="color: #888; font-size: 14px;">Your verification code: <strong style="font-family: monospace; font-size: 18px;">${token || "N/A"}</strong></p>
    `}

    <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">

    <p style="color: #888; font-size: 12px; margin: 0;">
      If you did not request this email, please ignore it or contact
      <a href="mailto:${supportEmail}" style="color: #f28c28;">${supportEmail}</a>.
    </p>
    <p style="color: #888; font-size: 12px; margin: 10px 0 0;">
      © ${currentYear} ITYPLC 2027. All rights reserved.
    </p>
  </div>
</body>
</html>`;
}

function getButtonText(eventType: string): string {
  switch (eventType) {
    case "signup":
      return "Confirm My Account";
    case "recovery":
      return "Reset My Password";
    case "invite":
      return "Accept Invitation";
    case "email_change":
      return "Confirm New Email";
    default:
      return "Verify My Email";
  }
}

function getHeadline(eventType: string): string {
  switch (eventType) {
    case "signup":
      return "Welcome to ITYPLC 2027";
    case "recovery":
      return "Reset Your Password";
    case "invite":
      return "Admin Invitation";
    case "email_change":
      return "Confirm Your New Email";
    case "magic_link":
      return "Sign In to ITYPLC 2027";
    case "otp":
      return "Your Verification Code";
    default:
      return "Confirm Your Email";
  }
}

function getBodyText(eventType: string, email: string): string {
  switch (eventType) {
    case "signup":
      return `Thank you for registering for ITYPLC 2027. Please confirm your email address (${email}) to complete your account setup.`;
    case "recovery":
      return `You requested a password reset for your ITYPLC 2027 account (${email}). Click the button below to create a new password.`;
    case "invite":
      return `You have been invited to join the ITYPLC 2027 administration team. Click below to accept the invitation and set up your account.`;
    case "email_change":
      return `You requested to change your email address to ${email}. Please confirm this change.`;
    case "magic_link":
      return `Click below to sign in to your ITYPLC 2027 administration account.`;
    case "otp":
      return `Use the verification code below to complete your ITYPLC 2027 sign in.`;
    default:
      return `Please confirm your email address (${email}) for ITYPLC 2027.`;
  }
}

/**
 * Send an email via Brevo with retry logic.
 */
async function sendViaBrevo(
  brevo: BrevoClient,
  toEmail: string,
  subject: string,
  htmlContent: string,
  textContent: string,
): Promise<{ success: boolean; messageId: string | null; error: string | null }> {
  try {
    const result = await brevo.sendEmail({
      to: [{ email: toEmail }],
      sender: {
        name: BREVO_SENDER_NAME,
        email: BREVO_SENDER_EMAIL,
      },
      subject,
      htmlContent,
      textContent,
      tags: ["ityplc-2027", "auth"],
    });

    return { success: true, messageId: result.messageId, error: null };
  } catch (err) {
    if (err instanceof BrevoClientError) {
      return {
        success: false,
        messageId: null,
        error: `Brevo API error (${err.statusCode}): ${err.message}`,
      };
    }
    return {
      success: false,
      messageId: null,
      error: err instanceof Error ? err.message : "Unknown Brevo error",
    };
  }
}

// ------------------------------------------------------------------
// Main handler
// ------------------------------------------------------------------

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type, x-webhook-signature",
      },
    });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  // Validate required configuration
  if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
    console.error("Missing Brevo configuration");
    return jsonResponse({ error: "Email service misconfigured" }, 500);
  }

  // Read request body
  let body: string;
  try {
    body = await req.text();
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  // Verify webhook signature
  const signature = req.headers.get("x-webhook-signature");
  if (!verifyWebhookSignature(body, signature, SEND_EMAIL_HOOK_SECRET)) {
    console.warn("Invalid webhook signature");
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  // Parse the Supabase Auth email event
  let event: AuthEmailEvent;
  try {
    event = JSON.parse(body);
  } catch {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  const { type, email, token } = event;

  if (!type || !email) {
    return jsonResponse({ error: "Missing required fields: type, email" }, 400);
  }

  console.log(
    `Processing auth email: type=${type}, email=${email}`,
  );

  // Initialize Brevo client
  const brevo = new BrevoClient({
    apiKey: BREVO_API_KEY,
    senderEmail: BREVO_SENDER_EMAIL,
    senderName: BREVO_SENDER_NAME,
    maxRetries: MAX_RETRIES,
    baseDelayMs: BASE_DELAY_MS,
  });

  // Build the auth URL from Supabase token data
  const authUrl = buildAuthUrl(event);

  // Build email content
  const subject = getSubjectForType(type);
  const htmlContent = buildEmailHtml(type, email, token, authUrl);

  // Extract text content (strip HTML for fallback)
  const textContent = htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  // Send via Brevo
  const result = await sendViaBrevo(
    brevo,
    email,
    subject,
    htmlContent,
    textContent,
  );

  if (result.success) {
    console.log(
      `Auth email sent successfully: type=${type}, email=${email}, messageId=${result.messageId}`,
    );
    return jsonResponse({
      status: "sent",
      type,
      email,
      messageId: result.messageId,
    });
  }

  // Delivery failed - return error to Supabase
  console.error(
    `Auth email delivery failed: type=${type}, email=${email}, error=${result.error}`,
  );

  return jsonResponse(
    {
      status: "failed",
      type,
      email,
      error: result.error,
    },
    502,
  );
});

/**
 * Get the email subject line for each auth event type.
 */
function getSubjectForType(type: string): string {
  switch (type) {
    case "signup":
      return "Confirm your ITYPLC 2027 account";
    case "recovery":
      return "Reset your ITYPLC 2027 password";
    case "invite":
      return "ITYPLC 2027 Admin Invitation";
    case "email_change":
      return "Confirm your new email address";
    case "magic_link":
      return "Sign in to ITYPLC 2027";
    case "otp":
      return "Your ITYPLC 2027 verification code";
    default:
      return "Confirm your email address - ITYPLC 2027";
  }
}
