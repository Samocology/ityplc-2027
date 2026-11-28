/**
 * Brevo Transactional Email API client.
 *
 * Centralized client for all Brevo email delivery across ITYPLC 2027.
 * Used by both the Supabase Edge Function (auth emails) and the frontend
 * (application notification emails via the centralized email service).
 *
 * Secrets (BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME) must
 * never be exposed in the browser. They are read only by the Edge Function
 * and server-side email service.
 */

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

export interface BrevoError {
  code: string;
  message: string;
  statusCode: number;
}

declare const Deno: { env: { get(key: string): string | undefined } };

const BREVO_API_BASE = "https://api.brevo.com/v3";
const BREVO_SEND_EMAIL_ENDPOINT = `${BREVO_API_BASE}/smtp/email`;

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

  /**
   * Send a single email via Brevo with exponential backoff retry.
   * Throws BrevoError on permanent failure after all retries exhausted.
   */
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
        const response = await fetch(BREVO_SEND_EMAIL_ENDPOINT, {
          method: "POST",
          headers: {
            "accept": "application/json",
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

        // Handle Brevo error response
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

/**
 * Create a BrevoClient instance from environment variables.
 * Only call this in server-side contexts (Edge Function, server route).
 * Never call from browser/client code.
 */
export function createBrevoClientFromEnv(): BrevoClient {
  const apiKey = Deno.env.get("BREVO_API_KEY");
  const senderEmail = Deno.env.get("BREVO_SENDER_EMAIL");
  const senderName = Deno.env.get("BREVO_SENDER_NAME") || "ITYPLC 2027";

  if (!apiKey) {
    throw new Error("BREVO_API_KEY environment variable is required");
  }
  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL environment variable is required");
  }

  return new BrevoClient({
    apiKey,
    senderEmail,
    senderName,
  });
}
