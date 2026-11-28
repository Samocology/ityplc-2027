"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/authentication/use-auth";
import { PageContainer } from "@/components/shared/PageContainer";
import { Clock, FileText, ChevronRight } from "lucide-react";

type ImportBatch = {
  id: string;
  zone_id: string;
  actor_id: string | null;
  source: string;
  file_name: string;
  status: string;
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  imported_rows: number;
  created_at: string;
  completed_at: string | null;
};

export function ZoneImportHistoryPage() {
  const { profile } = useAuth();
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBatches();
  }, [profile?.zone_id]);

  const loadBatches = async () => {
    if (!profile?.zone_id) return;
    try {
      const { data, error: err } = await supabase
        .from("import_batches")
        .select("*")
        .eq("zone_id", profile.zone_id)
        .order("created_at", { ascending: false });

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setBatches((data ?? []).map((b) => ({
        id: b.id,
        zone_id: b.zone_id,
        actor_id: b.actor_id,
        source: b.source,
        file_name: b.file_name,
        status: b.status,
        total_rows: b.total_rows,
        valid_rows: b.valid_rows,
        error_rows: b.error_rows,
        imported_rows: b.imported_rows,
        created_at: b.created_at,
        completed_at: b.completed_at,
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load import history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer className="py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground">Loading import history...</p>
        </div>
      </PageContainer>
    );
  }

  if (!profile?.zone_id) {
    return (
      <PageContainer className="py-12 max-w-md">
        <div className="rounded border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">No zone assigned to this account.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Import History</h1>
          <p className="text-sm text-muted-foreground">
            Zone ID: {profile.zone_id} &middot; Review past bulk import jobs.
          </p>
        </div>
        <a
          href="/zone"
          className="inline-flex items-center gap-2 rounded border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          <span>← Back to dashboard</span>
        </a>
      </div>

      {error && (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-4 mb-6 text-sm text-destructive">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {batches.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <Clock className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm font-medium">No import history</p>
            <p className="text-xs text-muted-foreground">Bulk import jobs will appear here.</p>
          </div>
          <a
            href="/zone/bulk-upload"
            className="mt-4 inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <FileText className="w-4 h-4" /> Start a bulk upload
          </a>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Total</th>
                <th className="px-4 py-3 text-center">Imported</th>
                <th className="px-4 py-3 text-center">Errors</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{b.file_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      b.status === "completed" ? "bg-green-100 text-green-700" :
                      b.status === "failed" ? "bg-destructive/10 text-destructive" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{b.total_rows}</td>
                  <td className="px-4 py-3 text-center">{b.imported_rows}</td>
                  <td className="px-4 py-3 text-center">{b.error_rows}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(b.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/zone/import-history/${b.id}`}
                      className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      View details <ChevronRight className="w-3 h-3 ml-1" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}
