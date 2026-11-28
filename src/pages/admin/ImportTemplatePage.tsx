"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/authentication/use-auth";
import { PageContainer } from "@/components/shared/PageContainer";
import { FileText, ShieldCheck } from "lucide-react";

type ImportTemplate = {
  id: string;
  name: string;
  description: string | null;
  headers: string[];
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export function ImportTemplatePage() {
  const { isHqAdmin } = useAuth();
  const [templates, setTemplates] = useState<ImportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [headersInput, setHeadersInput] = useState("");

  useEffect(() => {
    if (!isHqAdmin) return;
    loadTemplates();
  }, [isHqAdmin]);

  const loadTemplates = async () => {
    try {
      const { data, error: err } = await supabase
        .from("import_templates")
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
        description: t.description,
        headers: Array.isArray(t.headers) ? t.headers : [],
        is_active: t.is_active,
        created_by: t.created_by,
        created_at: t.created_at,
        updated_at: t.updated_at,
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load import templates");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const headers = headersInput
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);

    if (headers.length === 0) {
      setError("Please enter at least one header.");
      setSaving(false);
      return;
    }

    try {
      const { error: err } = await supabase.from("import_templates").insert({
        name,
        description: description || null,
        headers,
        is_active: true,
      });

      if (err) throw err;

      setName("");
      setDescription("");
      setHeadersInput("");
      await loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create import template");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const { error: err } = await supabase
        .from("import_templates")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (err) throw err;
      await loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update import template");
    }
  };

  if (!isHqAdmin) {
    return null;
  }

  if (loading) {
    return (
      <PageContainer className="py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground">Loading import templates...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Import Templates</h1>
          <p className="text-sm text-muted-foreground">
            Approved CSV import templates for zone bulk uploads.
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
            <h3 className="font-semibold">Create Import Template</h3>
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
                placeholder="e.g. Standard Zone Registration"
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
                placeholder="Describe this template..."
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="headers" className="block text-sm font-medium">
                CSV Headers (comma-separated)
              </label>
              <input
                id="headers"
                value={headersInput}
                onChange={(e) => setHeadersInput(e.target.value)}
                placeholder="first_name, surname, email, payment_status"
                required
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Example: first_name, surname, kingschat_username, designation, title, age_group, payment_status
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
            <h3 className="font-semibold">Approved Templates</h3>
          </div>
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No import templates configured yet.</p>
          ) : (
            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.description || "No description"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.headers.join(", ")} &middot; {t.is_active ? "Active" : "Inactive"}
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
            HQ creates approved import templates defining the expected CSV columns.
          </li>
          <li>
            Zone admins select a template when uploading a bulk registration file.
          </li>
          <li>
            Uploaded files are validated against the template headers before import.
          </li>
          <li>
            Only active templates are available for zone bulk uploads.
          </li>
        </ul>
      </div>
    </PageContainer>
  );
}
