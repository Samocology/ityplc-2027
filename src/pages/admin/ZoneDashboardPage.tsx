"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/authentication/use-auth";
import { PageContainer } from "@/components/shared/PageContainer";
import { Users, Clock, CreditCard, FileText, ChevronRight } from "lucide-react";

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
  updated_at: string;
};

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant?: "default" | "paid" | "unpaid";
};

function StatCard({ label, value, icon, variant = "default" }: StatCardProps) {
  const colorClass = variant === "paid" ? "text-green-600 bg-green-100" : variant === "unpaid" ? "text-amber-600 bg-amber-100" : "text-primary bg-primary/10";
  return (
    <div className="rounded-lg border p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function ZoneDashboardPage() {
  const { profile } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRegistrations();
  }, [profile?.zone_id]);

  const loadRegistrations = async () => {
    if (!profile?.zone_id) return;
    try {
      const { data, error: err } = await supabase
        .from("registrations")
        .select("*")
        .eq("zone_id", profile.zone_id)
        .order("created_at", { ascending: false });

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setRegistrations((data ?? []).map((r) => ({
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
        updated_at: r.updated_at,
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  const total = registrations.length;
  const paid = registrations.filter((r) => r.payment_status === "paid").length;
  const unpaid = registrations.filter((r) => r.payment_status === "unpaid").length;
  const refunded = registrations.filter((r) => r.payment_status === "refunded").length;

  if (loading) {
    return (
      <PageContainer className="py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground">Loading zone data...</p>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Zone Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Zone ID: {profile.zone_id} &middot; Role: Zone Administrator
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/zone/participants"
            className="inline-flex items-center gap-2 rounded bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Manage Participants <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {error && (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-4 mb-6 text-sm text-destructive">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-4 mb-8 md:grid-cols-4">
        <StatCard label="Total registrations" value={total} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Paid" value={paid} icon={<CreditCard className="w-5 h-5" />} variant="paid" />
        <StatCard label="Unpaid" value={unpaid} icon={<Clock className="w-5 h-5" />} variant="unpaid" />
        <StatCard label="Refunded" value={refunded} icon={<FileText className="w-5 h-5" />} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <a
          href="/zone/participants"
          className="group rounded-lg border p-6 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Participant Management</h3>
              <p className="text-sm text-muted-foreground mt-1">
                View registrations and update payment status.
              </p>
            </div>
            <Users className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </a>
        <a
          href="/zone/bulk-upload"
          className="group rounded-lg border p-6 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Bulk Registration Upload</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upload participants via CSV file.
              </p>
            </div>
            <FileText className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </a>
        <a
          href="/zone/import-history"
          className="group rounded-lg border p-6 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Import History</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Review past bulk import jobs.
              </p>
            </div>
            <Clock className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </a>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Recent Registrations</h2>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {registrations.slice(0, 10).map((r) => (
                <tr key={r.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    {r.first_name} {r.surname}
                  </td>
                  <td className="px-4 py-3">{r.zone_id}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      r.payment_status === "paid" ? "bg-green-100 text-green-700" :
                      r.payment_status === "unpaid" ? "bg-amber-100 text-amber-700" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {r.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{r.registration_source}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No registrations yet.
                  </td>
                </tr>
              )}
              {registrations.length > 10 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-sm text-muted-foreground">
                    Showing 10 of {registrations.length}.{" "}
                    <a href="/zone/participants" className="underline underline-offset-4">
                      View all
                    </a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </PageContainer>
  );
}
