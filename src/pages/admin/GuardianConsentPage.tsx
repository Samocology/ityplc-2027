"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/authentication/use-auth";
import { PageContainer } from "@/components/shared/PageContainer";
import { FileText, ShieldCheck } from "lucide-react";

type ConsentTemplate = {
  id: string;
  zone_id: string | null;
  title: string;
  description: string;
  is_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export function GuardianConsentPage() {
  const { isHqAdmin } = useAuth();
  const [templates, setTemplates] = useState<ConsentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [isRequired, setIsRequired] = useState(true);

  const [zones, setZones] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!isHqAdmin) return;
    loadTemplates();
    loadZones();
  }, [isHqAdmin]);

  const loadTemplates = async () => {
    try {
      const { data, error: err } = await supabase
        .from("guardian_consent_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setTemplates((data ?? []).map((t) => ({
        id: t.id,
        zone_id: t.zone_id,
        title: t.title,
        description: t.description,
        is_required: t.is_required,
        is_active: t.is_active,
        created_at: t.created_at,
        updated_at: t.updated_at,
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load consent templates");
    } finally {
      setLoading(false);
    }
  };

  const loadZones = async () => {
    try {
      const { data, error: err } = await supabase
        .from("zones")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (err) {
        setError(err.message);
        return;
      }
      setZones((data ?? []).map((z) => ({ id: z.id, name: z.name })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load zones");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const { error: err } = await supabase.from("guardian_consent_templates").insert({
        title,
        description,
        zone_id: zoneId || null,
        is_required: isRequired,
        is_active: true,
      });

      if (err) throw err;

      setTitle("");
      setDescription("");
      setZoneId("");
      setIsRequired(true);
      await loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create consent template");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const { error: err } = await supabase
        .from("guardian_consent_templates")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (err) throw err;
      await loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update consent template");
    }
  };

  if (!isHqAdmin) {
    return null;
  }

  if (loading) {
    return (
      <PageContainer className="py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground">Loading consent templates...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Guardian Consent Management</h1>
          <p className="text-sm text-muted-foreground">
            Configure consent requirements that guardians must respond to.
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
            <h3 className="font-semibold">Create Consent Template</h3>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="title" className="block text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value.trim())}
                placeholder="e.g. Photo Release Consent"
                required
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="description" className="block text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value.trim())}
                rows={3}
                placeholder="Describe what this consent covers..."
                required
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="zone_id" className="block text-sm font-medium">
                Zone (optional - leave blank for global)
              </label>
              <select
                id="zone_id"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All zones (global)</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_required"
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="rounded border-primary focus:ring-primary"
              />
              <label htmlFor="is_required" className="text-sm font-medium">
                Required consent
              </label>
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
            <h3 className="font-semibold">Existing Consent Templates</h3>
          </div>
          {loading || templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No consent templates configured yet.</p>
          ) : (
            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.is_required ? "Required" : "Optional"} &middot;
                      {t.zone_id ? `Zone-specific` : "Global"} &middot;
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

      <div className="rounded-lg border p-6">
        <h3 className="font-semibold mb-3">How it works</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>
            Create consent templates that guardians must respond to (e.g. photo
            release, medical consent, travel permission).
          </li>
          <li>
            Zone-specific templates apply only to that zone; global templates
            apply to all zones.
          </li>
          <li>
            Guardians respond via a secure link sent with their consent request.
            Responses are tracked as pending, granted, or denied.
          </li>
          <li>
            Zone admins and HQ admins can view response status for guardians in
            their scope.
          </li>
        </ul>
      </div>
    </PageContainer>
  );
}
