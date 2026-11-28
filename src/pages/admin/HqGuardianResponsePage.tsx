"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/authentication/use-auth";
import { PageContainer } from "@/components/shared/PageContainer";
import { Mail, Clock, CheckCircle, XCircle } from "lucide-react";

type GuardianResponseView = {
  id: string;
  guardian_id: string;
  registration_id: string;
  participant_name: string;
  guardian_name: string;
  guardian_email: string;
  consent_title: string;
  response: string;
  responded_at: string | null;
  zone_id: string;
  zone_name: string;
};

export function HqGuardianResponsePage() {
  const { isHqAdmin } = useAuth();
  const [responses, setResponses] = useState<GuardianResponseView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoneFilter, setZoneFilter] = useState("all");
  const [responseFilter, setResponseFilter] = useState("all");

  const [zones, setZones] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!isHqAdmin) return;
    loadData();
  }, [isHqAdmin]);

  const loadData = async () => {
    try {
      const [zoneResult, guardResult, regResult] = await Promise.all([
        supabase.from("zones").select("id, name").order("name"),
        supabase.from("guardian_responses").select(`
          *,
          guardians (
            id,
            first_name,
            surname,
            email,
            registration_id
          ),
          guardian_consent_templates (
            id,
            title
          )
        `),
        supabase.from("registrations").select("id, first_name, surname, zone_id"),
      ]);

      if (zoneResult.error) {
        setError(zoneResult.error.message);
        setLoading(false);
        return;
      }
      if (guardResult.error) {
        setError(guardResult.error.message);
        setLoading(false);
        return;
      }
      if (regResult.error) {
        setError(regResult.error.message);
        setLoading(false);
        return;
      }

      setZones((zoneResult.data ?? []).map((z) => ({ id: z.id, name: z.name })));

      const regMap = new Map(
        (regResult.data ?? []).map((r) => [r.id, { first_name: r.first_name, surname: r.surname, zone_id: r.zone_id }])
      );
      const zoneMap = new Map((zoneResult.data ?? []).map((z) => [z.id, z.name]));

      const mapped = (guardResult.data ?? [])
        .map((r) => {
          const row = r as {
            guardians: { first_name: string; surname: string; email: string; registration_id: string };
            guardian_consent_templates: { title: string };
            guardian_id: string;
            id: string;
            response: string;
            responded_at: string | null;
          };
          const guardian = row.guardians;
          const template = row.guardian_consent_templates;
          const reg = regMap.get(guardian.registration_id);
          if (!reg) return null;
          return {
            id: r.id,
            guardian_id: r.guardian_id,
            registration_id: guardian.registration_id,
            participant_name: `${reg.first_name} ${reg.surname}`,
            guardian_name: `${guardian.first_name} ${guardian.surname}`,
            guardian_email: guardian.email,
            consent_title: template.title,
            response: r.response,
            responded_at: r.responded_at,
            zone_id: reg.zone_id,
            zone_name: zoneMap.get(reg.zone_id) || reg.zone_id,
          };
        })
        .filter(Boolean) as GuardianResponseView[];

      setResponses(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load guardian responses");
    } finally {
      setLoading(false);
    }
  };

  const filtered = responses.filter((r) => {
    const matchesZone = zoneFilter === "all" || r.zone_id === zoneFilter;
    const matchesResponse = responseFilter === "all" || r.response === responseFilter;
    return matchesZone && matchesResponse;
  });

  const total = responses.length;
  const pending = responses.filter((r) => r.response === "pending").length;
  const granted = responses.filter((r) => r.response === "granted").length;
  const denied = responses.filter((r) => r.response === "denied").length;

  if (!isHqAdmin) {
    return null;
  }

  if (loading) {
    return (
      <PageContainer className="py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground">Loading guardian responses...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Guardian Consent Responses</h1>
          <p className="text-sm text-muted-foreground">
            Global guardian consent status across all zones.
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

      <div className="grid gap-4 mb-6 md:grid-cols-4">
        <div className="rounded-lg border p-5">
          <p className="text-sm font-medium text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="rounded-lg border p-5">
          <p className="text-sm font-medium text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{pending}</p>
        </div>
        <div className="rounded-lg border p-5">
          <p className="text-sm font-medium text-muted-foreground">Granted</p>
          <p className="text-2xl font-bold text-green-600">{granted}</p>
        </div>
        <div className="rounded-lg border p-5">
          <p className="text-sm font-medium text-muted-foreground">Denied</p>
          <p className="text-2xl font-bold text-destructive">{denied}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 lg:w-1/3">
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="w-full rounded border pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>
        <div className="relative flex-1 lg:w-1/3">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <select
            value={responseFilter}
            onChange={(e) => setResponseFilter(e.target.value)}
            className="w-full rounded border pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All responses</option>
            <option value="pending">Pending</option>
            <option value="granted">Granted</option>
            <option value="denied">Denied</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-left text-muted-foreground">
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">Participant</th>
              <th className="px-4 py-3">Guardian</th>
              <th className="px-4 py-3">Consent</th>
              <th className="px-4 py-3">Response</th>
              <th className="px-4 py-3">Responded</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No guardian responses found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const responseColor =
                  r.response === "granted"
                    ? "bg-green-100 text-green-700"
                    : r.response === "denied"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-amber-100 text-amber-700";
                const responseIcon =
                  r.response === "granted" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : r.response === "denied" ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  );
                return (
                  <tr key={r.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.zone_name}</td>
                    <td className="px-4 py-3">{r.participant_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{r.guardian_email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {r.consent_title}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${responseColor}`}>
                        {responseIcon} {r.response.charAt(0).toUpperCase() + r.response.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {r.responded_at ? new Date(r.responded_at).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Showing {filtered.length} of {total} guardian responses.
        </p>
      )}
    </PageContainer>
  );
}
