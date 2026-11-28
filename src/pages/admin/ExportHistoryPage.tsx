"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/authentication/use-auth";
import { PageContainer } from "@/components/shared/PageContainer";
import { Download, Clock, FileText } from "lucide-react";

type ExportBatch = {
  id: string;
  export_type: string;
  zone_id: string | null;
  actor_id: string | null;
  status: string;
  total_rows: number;
  exported_rows: number;
  file_name: string | null;
  created_at: string;
  completed_at: string | null;
  zone_name: string | null;
};

export function ExportHistoryPage() {
  const { profile, isHqAdmin, isZoneAdmin } = useAuth();
  const [batches, setBatches] = useState<ExportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoneFilter, setZoneFilter] = useState("all");

  const [zones, setZones] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadData();
  }, [profile?.zone_id, isHqAdmin, isZoneAdmin]);

  const loadData = async () => {
    try {
      const [zoneResult, batchResult] = await Promise.all([
        supabase.from("zones").select("id, name").order("name"),
        supabase
          .from("export_batches")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (zoneResult.error) {
        setError(zoneResult.error.message);
        setLoading(false);
        return;
      }
      if (batchResult.error) {
        setError(batchResult.error.message);
        setLoading(false);
        return;
      }

      setZones((zoneResult.data ?? []).map((z) => ({ id: z.id, name: z.name })));

      const zoneMap = new Map((zoneResult.data ?? []).map((z) => [z.id, z.name]));

      const mapped = (batchResult.data ?? [])
        .filter((b) => {
          // Zone admins can only see batches in their zone
          if (isZoneAdmin && !isHqAdmin) {
            return b.zone_id === profile?.zone_id;
          }
          return true;
        })
        .map((b) => ({
          id: b.id,
          export_type: b.export_type,
          zone_id: b.zone_id,
          actor_id: b.actor_id,
          status: b.status,
          total_rows: b.total_rows,
          exported_rows: b.exported_rows,
          file_name: b.file_name,
          created_at: b.created_at,
          completed_at: b.completed_at,
          zone_name: b.zone_id ? zoneMap.get(b.zone_id) || b.zone_id : "All Zones (HQ)",
        }));

      setBatches(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load export history");
    } finally {
      setLoading(false);
    }
  };

  const filtered = batches.filter((b) => {
    if (zoneFilter === "all") return true;
    return b.zone_id === zoneFilter || (zoneFilter === "null" && b.zone_id === null);
  });

  const totalExports = batches.length;
  const completed = batches.filter((b) => b.status === "completed").length;
  const failed = batches.filter((b) => b.status === "failed").length;
  const pending = batches.filter((b) => b.status === "pending").length;

  if (loading) {
    return (
      <PageContainer className="py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground">Loading export history...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Export History</h1>
          <p className="text-sm text-muted-foreground">
            Review past export jobs including KingsPass exports.
          </p>
        </div>
        <a
          href={isHqAdmin ? "/hq" : "/zone"}
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

      <div className="grid gap-4 mb-6 md:grid-cols-4">
        <div className="rounded-lg border p-5">
          <p className="text-sm font-medium text-muted-foreground">Total Exports</p>
          <p className="text-2xl font-bold">{totalExports}</p>
        </div>
        <div className="rounded-lg border p-5">
          <p className="text-sm font-medium text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-green-600">{completed}</p>
        </div>
        <div className="rounded-lg border p-5">
          <p className="text-sm font-medium text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{pending}</p>
        </div>
        <div className="rounded-lg border p-5">
          <p className="text-sm font-medium text-muted-foreground">Failed</p>
          <p className="text-2xl font-bold text-destructive">{failed}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 lg:w-1/3">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="w-full rounded border pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Zones</option>
            <option value="null">HQ (All Zones)</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <Clock className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm font-medium">No export history</p>
            <p className="text-xs text-muted-foreground">Export jobs will appear here.</p>
          </div>
          {isHqAdmin && (
            <a
              href="/hq/kingspass-export"
              className="mt-4 inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Download className="w-4 h-4" /> Start a KingsPass Export
            </a>
          )}
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Rows</th>
                <th className="px-4 py-3 text-center">Exported</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No export jobs found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const statusColor =
                    b.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : b.status === "failed"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-amber-100 text-amber-700";
                  return (
                    <tr key={b.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{b.file_name || "Untitled"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {b.export_type === "kingspass" ? "KingsPass" : "Registrations"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{b.zone_name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{b.total_rows}</td>
                      <td className="px-4 py-3 text-center">{b.exported_rows}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Showing {filtered.length} of {totalExports} export jobs.
        </p>
      )}
    </PageContainer>
  );
}
