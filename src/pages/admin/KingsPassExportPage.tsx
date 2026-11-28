"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/authentication/use-auth";
import { PageContainer } from "@/components/shared/PageContainer";
import { Download } from "lucide-react";

type Registration = {
  id: string;
  first_name: string;
  surname: string;
  kingschat_username: string | null;
  designation: string | null;
  title: string | null;
  age_group: string | null;
  zone_id: string;
  registration_status: string;
  payment_status: string;
  registration_source: string;
  created_at: string;
};

type Zone = {
  id: string;
  name: string;
};

export function KingsPassExportPage() {
  const { profile } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [zoneFilter, setZoneFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [regResult, zoneResult] = await Promise.all([
        supabase
          .from("registrations")
          .select("*")
          .eq("payment_status", "paid")
          .order("created_at", { ascending: false }),
        supabase.from("zones").select("id, name").order("name"),
      ]);

      if (regResult.error) {
        setError(regResult.error.message);
        setLoading(false);
        return;
      }
      if (zoneResult.error) {
        setError(zoneResult.error.message);
        setLoading(false);
        return;
      }

      setRegistrations(
        (regResult.data ?? []).map((r) => ({
          id: r.id,
          first_name: r.first_name,
          surname: r.surname,
          kingschat_username: r.kingschat_username,
          designation: r.designation,
          title: r.title,
          age_group: r.age_group,
          zone_id: r.zone_id,
          registration_status: r.registration_status,
          payment_status: r.payment_status,
          registration_source: r.registration_source,
          created_at: r.created_at,
        }))
      );
      setZones(zoneResult.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load export data");
    } finally {
      setLoading(false);
    }
  };

  const filtered = registrations.filter((r) => {
    if (zoneFilter === "all") return true;
    return r.zone_id === zoneFilter;
  });

  const totalPaid = registrations.length;
  const filteredCount = filtered.length;

  const handleExport = async () => {
    if (!profile) return;
    if (filteredCount === 0) {
      setError("No paid registrations to export.");
      return;
    }

    setError(null);
    setSuccess(null);
    setExporting(true);

    try {
      // Create export batch
      const { data: batch, error: batchError } = await supabase
        .from("export_batches")
        .insert({
          export_type: "kingspass",
          zone_id: zoneFilter === "all" ? null : zoneFilter,
          actor_id: profile.id,
          status: "pending",
          total_rows: filteredCount,
          exported_rows: 0,
          file_name: `kingspass-${new Date().toISOString().slice(0, 10)}.csv`,
        })
        .select("id, file_name")
        .single();

      if (batchError) throw batchError;

      // Build CSV content
      const headers = [
        "first_name",
        "surname",
        "kingschat_username",
        "designation",
        "title",
        "age_group",
        "zone_id",
        "registration_status",
        "payment_status",
        "registration_source",
      ];

      const escapeCsv = (val: string | null | undefined) => {
        if (val === null || val === undefined) return "";
        const s = String(val);
        if (s.includes(",") || s.includes('"') || s.includes("\n")) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };

      const rows = filtered.map((r) => [
        escapeCsv(r.first_name),
        escapeCsv(r.surname),
        escapeCsv(r.kingschat_username),
        escapeCsv(r.designation),
        escapeCsv(r.title),
        escapeCsv(r.age_group),
        escapeCsv(r.zone_id),
        escapeCsv(r.registration_status),
        escapeCsv(r.payment_status),
        escapeCsv(r.registration_source),
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      // Insert export rows
      const exportRows = filtered.map((r, idx) => ({
        batch_id: batch.id,
        row_number: idx + 1,
        first_name: r.first_name,
        surname: r.surname,
        kingschat_username: r.kingschat_username,
        designation: r.designation,
        title: r.title,
        age_group: r.age_group,
        zone_id: r.zone_id,
        payment_status: r.payment_status,
        registration_source: r.registration_source,
      }));

      if (exportRows.length > 0) {
        const { error: rowsError } = await supabase.from("export_rows").insert(exportRows);
        if (rowsError) throw rowsError;
      }

      // Trigger file download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", batch.file_name || "kingspass-export.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Mark batch as completed
      await supabase
        .from("export_batches")
        .update({ status: "completed", exported_rows: filteredCount, completed_at: new Date().toISOString() })
        .eq("id", batch.id);

      setSuccess(`KingsPass export completed: ${filteredCount} paid registration(s) exported.`);
    } catch (err) {
      await supabase
        .from("export_batches")
        .update({ status: "failed" })
        .eq("id", (await supabase.from("export_batches").select("id").order("created_at", { ascending: false }).limit(1)).data?.[0]?.id || "");
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer className="py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground">Loading KingsPass export data...</p>
        </div>
      </PageContainer>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <PageContainer className="py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">KingsPass Export</h1>
          <p className="text-sm text-muted-foreground">
            Export paid-only registrations for KingsPass card generation.
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
          <p className="font-medium">Export complete</p>
          <p>{success}</p>
        </div>
      )}

      <div className="grid gap-4 mb-6 md:grid-cols-4">
        <div className="rounded-lg border p-5">
          <p className="text-sm font-medium text-muted-foreground">Total Paid Registrations</p>
          <p className="text-2xl font-bold text-green-600">{totalPaid}</p>
        </div>
        <div className="rounded-lg border p-5">
          <p className="text-sm font-medium text-muted-foreground">In Export</p>
          <p className="text-2xl font-bold">{filteredCount}</p>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="zone_filter" className="block text-sm font-medium mb-2">
          Filter by Zone
        </label>
        <select
          id="zone_filter"
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
          className="w-full rounded border pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Zones</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id}>{z.name}</option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-left text-muted-foreground">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">KingsChat</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Age Group</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No paid registrations found for export.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const zone = zones.find((z) => z.id === r.zone_id);
                return (
                  <tr key={r.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.first_name} {r.surname}</td>
                    <td className="px-4 py-3 text-muted-foreground">{zone?.name || r.zone_id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.kingschat_username || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.designation || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.age_group || "-"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleExport}
        disabled={exporting || filteredCount === 0}
        className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
      >
        <Download className="w-4 h-4" />
        {exporting ? "Exporting..." : `Export ${filteredCount} Paid Registration(s) to CSV`}
      </button>

      <p className="mt-4 text-sm text-muted-foreground">
        Only payment-confirmed participants can be included in the HQ KingsPass export.
        Unpaid registrations are excluded.
      </p>
    </PageContainer>
  );
}
