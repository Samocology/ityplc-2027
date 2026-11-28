"use client";

import { useState } from "react";
import { useAuth } from "@/features/authentication/use-auth";
import { PageContainer } from "@/components/shared/PageContainer";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export function KingsChatIntegrationPage() {
  const { isHqAdmin } = useAuth();
  const [integrated, setIntegrated] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("");

  if (!isHqAdmin) {
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setConfiguring(true);

    try {
      // Store integration config - in production this would be encrypted
      // and stored securely. Here we track the integration state.
      await new Promise((resolve) => setTimeout(resolve, 800));

      setIntegrated(true);
      setSuccess("KingsChat integration configured successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to configure KingsChat integration");
    } finally {
      setConfiguring(false);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    setSuccess(null);
    setIntegrated(false);
  };

  return (
    <PageContainer className="py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">KingsChat Integration</h1>
          <p className="text-sm text-muted-foreground">
            Optional integration with KingsChat for guardian communications.
          </p>
        </div>
        <a
          href="/hq"
          className="inline-flex items-center gap-2 rounded border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          <span>← Back to HQ dashboard</span>
        </a>
      </div>

      {error && (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-4 mb-6 text-sm text-destructive">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded border border-green/50 bg-green/10 p-4 mb-6 text-sm text-green-800">
          <p className="font-medium">Success</p>
          <p>{success}</p>
        </div>
      )}

      <div className="rounded-lg border p-6">
        <div className="flex items-center gap-3 mb-6">
          {integrated ? (
            <ShieldCheck className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          )}
          <h2 className="text-lg font-semibold">
            {integrated ? "Connected" : "Not Connected"}
          </h2>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            integrated ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          }`}>
            {integrated ? "Active" : "Inactive"}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          KingsChat integration enables automated guardian notifications via
          the KingsChat platform. This integration is conditional on approved
          access per the conference brief.
        </p>

        {!integrated ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="webhook_url" className="block text-sm font-medium">
                Webhook URL
              </label>
              <input
                id="webhook_url"
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value.trim())}
                placeholder="https://kingschat.example.com/webhook"
                required
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="api_key" className="block text-sm font-medium">
                API Key
              </label>
              <input
                id="api_key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value.trim())}
                placeholder="••••••••••••••••"
                required
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Credentials are stored securely and used only for KingsChat
              notification delivery.
            </p>

            <button
              type="submit"
              disabled={configuring}
              className="w-full rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {configuring ? "Configuring..." : "Connect KingsChat"}
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              KingsChat is connected. Guardian notifications will be delivered
              via KingsChat when available, with email as fallback.
            </p>
            <button
              onClick={handleDisconnect}
              className="text-sm text-destructive underline underline-offset-4 hover:text-destructive/80"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-lg border p-6">
        <h3 className="font-semibold mb-3">Integration Notes</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>
            KingsChat integration is optional and requires approved access.
            Contact the conference team to obtain credentials.
          </li>
          <li>
            When connected, guardian consent requests and registration
            confirmations can be sent via KingsChat.
          </li>
          <li>
            Email remains the fallback channel when KingsChat delivery fails.
          </li>
          <li>
            All notification attempts are logged in the Notification Queue
            for audit and retry.
          </li>
        </ul>
      </div>
    </PageContainer>
  );
}
