"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/authentication/use-auth";
import { PageContainer } from "@/components/shared/PageContainer";
import { FileText, ShieldCheck, Mail, Phone } from "lucide-react";

type NotificationTemplate = {
  id: string;
  name: string;
  channel: "email" | "sms" | "kingschat";
  subject: string | null;
  body: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export function NotificationTemplatesPage() {
  const { isHqAdmin } = useAuth();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [channel, setChannel] = useState<"email" | "sms" | "kingschat">("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!isHqAdmin) return;
    loadTemplates();
  }, [isHqAdmin]);

  const loadTemplates = async () => {
    try {
      const { data, error: err } = await supabase
        .from("notification_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setTemplates((data ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        channel: t.channel as "email" | "sms" | "kingschat",
        subject: t.subject,
        body: t.body,
        is_active: t.is_active,
        created_by: t.created_by,
        created_at: t.created_at,
        updated_at: t.updated_at,
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notification templates");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const { error: err } = await supabase.from("notification_templates").insert({
        name,
        channel,
        subject: channel === "email" ? subject || null : null,
        body,
        is_active: true,
      });

      if (err) throw err;

      setName("");
      setChannel("email");
      setSubject("");
      setBody("");
      await loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create notification template");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const { error: err } = await supabase
        .from("notification_templates")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (err) throw err;
      await loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update notification template");
    }
  };

  if (!isHqAdmin) {
    return null;
  }

  if (loading) {
    return (
      <PageContainer className="py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground">Loading notification templates...</p>
        </div>
      </PageContainer>
    );
  }

  const channelIcon = (ch: string) => {
    if (ch === "email") return <Mail className="w-4 h-4" />;
    if (ch === "sms") return <Phone className="w-4 h-4" />;
    return <ShieldCheck className="w-4 h-4" />;
  };

  return (
    <PageContainer className="py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Notification Templates</h1>
          <p className="text-sm text-muted-foreground">
            Configure email, SMS, and KingsChat notification templates.
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

      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5" />
            <h3 className="font-semibold">Create Notification Template</h3>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="name" className="block text-sm font-medium">
                Template Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value.trim())}
                placeholder="e.g. Registration Confirmation"
                required
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="channel" className="block text-sm font-medium">
                Channel
              </label>
              <select
                id="channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value as "email" | "sms" | "kingschat")}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="kingschat">KingsChat</option>
              </select>
            </div>

            {channel === "email" && (
              <div className="space-y-1">
                <label htmlFor="subject" className="block text-sm font-medium">
                  Subject
                </label>
                <input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value.trim())}
                  placeholder="e.g. Your ITYPLC 2027 Registration"
                  required
                  className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="body" className="block text-sm font-medium">
                Message Body
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder="Use {{first_name}}, {{surname}}, {{zone_name}} as placeholders..."
                required
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {`Available placeholders: {{first_name}}, {{surname}}, {{zone_name}}, {{kingschat_username}}`}
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Template"}
            </button>
          </form>
        </div>

        <div className="rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-semibold">Existing Templates</h3>
          </div>
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notification templates configured yet.</p>
          ) : (
            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded bg-muted/50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {channelIcon(t.channel)}
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t.channel}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{t.name}</p>
                    {t.subject && (
                      <p className="text-xs text-muted-foreground">{t.subject}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.body.slice(0, 60)}{t.body.length > 60 ? "..." : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(t.id, t.is_active)}
                    className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                      t.is_active
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    }`}
                  >
                    {t.is_active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
