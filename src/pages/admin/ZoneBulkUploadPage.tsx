"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/authentication/use-auth";
import { PageContainer } from "@/components/shared/PageContainer";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";

type ImportRow = {
  rowNumber: number;
  firstName: string;
  surname: string;
  kingschatUsername?: string;
  designation?: string;
  title?: string;
  ageGroup?: string;
  paymentStatus: "unpaid" | "paid";
  errors: string[];
  status: "valid" | "error";
};

const REQUIRED_HEADERS = ["first_name", "surname", "payment_status"];
const VALID_PAYMENT_STATUSES = ["unpaid", "paid"];

function parseCSV(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  return lines.map((line) => {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        fields.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    fields.push(current);
    return fields.map((f) => f.trim().replace(/^"(.*)"$/, "$1"));
  });
}

export function ZoneBulkUploadPage() {
  const { profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportRow[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [stage, setStage] = useState<"file" | "preview" | "submitting" | "done">("file");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingKeys, setExistingKeys] = useState<Set<string>>(new Set());

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a CSV file.");
      return;
    }

    setError(null);
    setFile(selectedFile);
    setStage("file");

    const text = await selectedFile.text();

    try {
      const rows = parseCSV(text);
      if (rows.length < 2) {
        setError("CSV must contain a header row and at least one data row.");
        return;
      }

      const headers = rows[0].map((h) => h.toLowerCase().trim());
      const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
      if (missing.length > 0) {
        setError(`Missing required headers: ${missing.join(", ")}`);
        return;
      }

      // Load existing registrations for duplicate detection
      if (profile?.zone_id) {
        const { data } = await supabase
          .from("registrations")
          .select("first_name, surname, zone_id")
          .eq("zone_id", profile.zone_id);
        const existing = new Set(
          (data ?? []).map((r) => `${r.first_name.toLowerCase()}|${r.surname.toLowerCase()}|${r.zone_id}`)
        );
        setExistingKeys(existing);
      }

      const parsed: ImportRow[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.every((c) => c.trim() === "")) continue;

        const getField = (name: string) => {
          const idx = headers.indexOf(name);
          return idx >= 0 ? row[idx] || undefined : undefined;
        };

        const firstName = getField("first_name") || "";
        const surname = getField("surname") || "";
        const paymentStatus = (getField("payment_status") || "unpaid").toLowerCase();

        const errors: string[] = [];
        if (!firstName) errors.push("First name is required");
        if (!surname) errors.push("Surname is required");
        if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
          errors.push(`Payment status must be one of: ${VALID_PAYMENT_STATUSES.join(", ")}`);
        }

        // Duplicate check
        if (profile?.zone_id && firstName && surname) {
          const key = `${firstName.toLowerCase()}|${surname.toLowerCase()}|${profile.zone_id}`;
          if (existingKeys.has(key)) {
            errors.push("Duplicate registration already exists in this zone");
          }
        }

        parsed.push({
          rowNumber: i + 1,
          firstName,
          surname,
          kingschatUsername: getField("kingschat_username") || undefined,
          designation: getField("designation") || undefined,
          title: getField("title") || undefined,
          ageGroup: getField("age_group") || undefined,
          paymentStatus: (VALID_PAYMENT_STATUSES.includes(paymentStatus) ? paymentStatus : "unpaid") as "unpaid" | "paid",
          errors,
          status: errors.length > 0 ? "error" : "valid",
        });
      }

      setPreview(parsed);
      setValidCount(parsed.filter((r) => r.status === "valid").length);
      setErrorCount(parsed.filter((r) => r.status === "error").length);
      setStage("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV");
    }
  };

  const handleImport = async () => {
    if (!profile?.zone_id || preview.length === 0) return;

    setStage("submitting");
    setError(null);

    const validRows = preview.filter((r) => r.status === "valid");

    try {
      // Create import batch
      const { data: batch, error: batchError } = await supabase
        .from("import_batches")
        .insert({
          zone_id: profile.zone_id,
          source: "csv_upload",
          file_name: file?.name || "upload.csv",
          status: "pending",
          total_rows: preview.length,
          valid_rows: validRows.length,
          error_rows: preview.length - validRows.length,
          imported_rows: 0,
        })
        .select("id")
        .single();

      if (batchError) throw batchError;

      // Insert valid registrations
      const registrationsToInsert = validRows.map((r) => ({
        first_name: r.firstName,
        surname: r.surname,
        kingschat_username: r.kingschatUsername || null,
        designation: r.designation || null,
        title: r.title || null,
        age_group: r.ageGroup || null,
        zone_id: profile.zone_id,
        registration_status: "registered",
        payment_status: r.paymentStatus,
        registration_source: "zone_bulk_upload",
      }));

      if (registrationsToInsert.length > 0) {
        const { data: inserted, error: insertError } = await supabase
          .from("registrations")
          .insert(registrationsToInsert)
          .select("id");

        if (insertError) throw insertError;

        // Insert import rows for valid entries
        const importRows = inserted?.map((_reg, idx) => ({
          batch_id: batch.id,
          row_number: validRows[idx].rowNumber,
          first_name: validRows[idx].firstName,
          surname: validRows[idx].surname,
          kingschat_username: validRows[idx].kingschatUsername || null,
          designation: validRows[idx].designation || null,
          title: validRows[idx].title || null,
          age_group: validRows[idx].ageGroup || null,
          zone_id: profile.zone_id,
          payment_status: validRows[idx].paymentStatus,
          registration_source: "zone_bulk_upload",
          status: "imported" as const,
          error_message: null,
        })) || [];

        // Insert import rows for error entries
        const errorRows = preview.filter((r) => r.status === "error").map((r) => ({
          batch_id: batch.id,
          row_number: r.rowNumber,
          first_name: r.firstName || null,
          surname: r.surname || null,
          kingschat_username: r.kingschatUsername || null,
          designation: r.designation || null,
          title: r.title || null,
          age_group: r.ageGroup || null,
          zone_id: profile.zone_id,
          payment_status: r.paymentStatus,
          registration_source: "zone_bulk_upload",
          status: "error" as const,
          error_message: r.errors.join("; "),
        }));

        const allImportRows = [...importRows, ...errorRows];
        if (allImportRows.length > 0) {
          await supabase.from("import_rows").insert(allImportRows);
        }

        // Update batch
        await supabase
          .from("import_batches")
          .update({
            status: "completed",
            imported_rows: inserted?.length || 0,
            completed_at: new Date().toISOString(),
          })
          .eq("id", batch.id);
      }

      setSuccess(`Import completed: ${validRows.length} registered, ${preview.length - validRows.length} rows with errors.`);
      setStage("done");
    } catch (err) {
      await supabase
        .from("import_batches")
        .update({ status: "failed" })
        .eq("id", (await supabase.from("import_batches").select("id").order("created_at", { ascending: false }).limit(1)).data?.[0]?.id || "");
      setError(err instanceof Error ? err.message : "Import failed");
      setStage("preview");
    }
  };

  const reset = () => {
    setFile(null);
    setPreview([]);
    setValidCount(0);
    setErrorCount(0);
    setStage("file");
    setError(null);
    setSuccess(null);
  };

  if (stage === "done") {
    return (
      <PageContainer className="py-12 max-w-lg">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Import complete</h2>
          <p className="text-muted-foreground mb-6">{success}</p>
          <button
            onClick={reset}
            className="rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Import another file
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Bulk Registration Upload</h1>
          <p className="text-sm text-muted-foreground">
            Upload participants via CSV. Zone: {profile?.zone_id}
          </p>
        </div>
        <a
          href="/zone"
          className="inline-flex items-center gap-2 rounded border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          <span>← Back to dashboard</span>
        </a>
      </div>

      {stage === "file" && (
        <div className="rounded-lg border border-dashed p-12 text-center mb-8">
          <div className="flex flex-col items-center justify-center gap-3">
            <Upload className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm font-medium">Upload CSV file</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Required columns: first_name, surname, payment_status. Optional: kingschat_username, designation, title, age_group.
            </p>
          </div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          {error && (
            <div className="mt-4 rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 inline mr-2" /> {error}
            </div>
          )}
        </div>
      )}

      {stage === "preview" && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Preview & Validate</h2>
              <p className="text-sm text-muted-foreground">
                Review rows before importing. {errorCount} row(s) have errors.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setFile(null); setStage("file"); }}
                className="rounded border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Choose different file
              </button>
              <button
                onClick={handleImport}
                disabled={validCount === 0}
                className={`rounded px-4 py-2 text-sm font-semibold transition-colors ${
                  validCount === 0
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                Import {validCount} Valid Row(s)
              </button>
            </div>
          </div>

          <div className="grid gap-4 mb-6">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium text-muted-foreground">Total rows</p>
              <p className="text-2xl font-bold">{preview.length}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium text-muted-foreground">Valid</p>
              <p className="text-2xl font-bold text-green-600">{validCount}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium text-muted-foreground">Errors</p>
              <p className="text-2xl font-bold text-amber-600">{errorCount}</p>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50 text-left text-muted-foreground">
                  <th className="px-4 py-2">Row</th>
                  <th className="px-4 py-2">First Name</th>
                  <th className="px-4 py-2">Surname</th>
                  <th className="px-4 py-2">Payment</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {preview.map((row) => (
                  <tr key={row.rowNumber} className={`hover:bg-muted/50 transition-colors ${row.status === "error" ? "bg-amber-50" : ""}`}>
                    <td className="px-4 py-2 font-mono text-muted-foreground">#{row.rowNumber}</td>
                    <td className="px-4 py-2">{row.firstName}</td>
                    <td className="px-4 py-2">{row.surname}</td>
                    <td className="px-4 py-2">{row.paymentStatus}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        row.status === "valid"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {row.status === "valid" ? "Valid" : "Error"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {row.errors.join("; ") || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {error && (
            <div className="mt-4 rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 inline mr-2" /> {error}
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
