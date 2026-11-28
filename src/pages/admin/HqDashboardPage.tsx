"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/authentication/use-auth";
import { PageContainer } from "@/components/shared/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Users, CreditCard, Clock, Filter, FileText } from "lucide-react";

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

type Zone = {
  id: string;
  name: string;
  slug: string;
  zone_id_code: string | null;
  is_active: boolean;
  is_activated: boolean;
  admin_email: string | null;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
};

type StatCardProps = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  variant?: "default" | "paid" | "unpaid" | "neutral";
};

function StatCard({ label, value, icon, variant = "default" }: StatCardProps) {
  const colorClass =
    variant === "paid"
      ? "text-green-600 bg-green-100"
      : variant === "unpaid"
        ? "text-amber-600 bg-amber-100"
        : variant === "neutral"
          ? "text-muted-foreground bg-muted"
          : "text-primary bg-primary/10";
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

export function HqDashboardPage() {
  const { profile } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [regResult, zoneResult] = await Promise.all([
        supabase.from("registrations").select("*").order("created_at", { ascending: false }),
        supabase
          .from("zones")
          .select("id, name, slug, zone_id_code, is_active, is_activated, admin_email, activated_at, created_at, updated_at")
          .order("name"),
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
          updated_at: r.updated_at,
        }))
      );
      setZones(zoneResult.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const filtered = registrations.filter((r) => {
    const matchesSearch =
      r.first_name.toLowerCase().includes(search.toLowerCase()) ||
      r.surname.toLowerCase().includes(search.toLowerCase());
    const matchesZone = zoneFilter === "all" || r.zone_id === zoneFilter;
    const matchesPayment = paymentFilter === "all" || r.payment_status === paymentFilter;
    const matchesStatus = statusFilter === "all" || r.registration_status === statusFilter;
    return matchesSearch && matchesZone && matchesPayment && matchesStatus;
  });

  const total = registrations.length;
  const paid = registrations.filter((r) => r.payment_status === "paid").length;
  const unpaid = registrations.filter((r) => r.payment_status === "unpaid").length;
  const refunded = registrations.filter((r) => r.payment_status === "refunded").length;

  // Zone rankings by registration count
  const zoneStats = zones.map((zone) => {
    const zoneRegs = registrations.filter((r) => r.zone_id === zone.id);
    const zonePaid = zoneRegs.filter((r) => r.payment_status === "paid").length;
    return {
      zone,
      total: zoneRegs.length,
      paid: zonePaid,
    };
  });
  zoneStats.sort((a, b) => b.total - a.total);

  // Age group breakdown
  const ageBreakdown: Record<string, number> = {};
  registrations.forEach((r) => {
    const key = r.age_group || "Not specified";
    ageBreakdown[key] = (ageBreakdown[key] || 0) + 1;
  });

  // Designation breakdown
  const designationBreakdown: Record<string, number> = {};
  registrations.forEach((r) => {
    const key = r.designation || "Not specified";
    designationBreakdown[key] = (designationBreakdown[key] || 0) + 1;
  });

  if (loading) {
    return (
      <PageContainer className="py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground">Loading HQ dashboard...</p>
        </div>
      </PageContainer>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <PageContainer className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">HQ Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Global registration analytics and payment monitoring.
          </p>
        </div>
        <a
          href="/zone"
          className="inline-flex items-center gap-2 rounded border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          <span>← Zone view</span>
        </a>
      </div>

      {error && (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-4 mb-6 text-sm text-destructive">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Overview stats */}
      <div className="grid gap-4 mb-8 md:grid-cols-4">
        <StatCard label="Total registrations" value={total} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Paid" value={paid} icon={<CreditCard className="w-5 h-5" />} variant="paid" />
        <StatCard label="Unpaid" value={unpaid} icon={<Clock className="w-5 h-5" />} variant="unpaid" />
        <StatCard label="Refunded" value={refunded} icon={<FileText className="w-5 h-5" />} variant="neutral" />
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 lg:w-1/4">
          <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="relative flex-1 lg:w-1/4">
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
        <div className="relative flex-1 lg:w-1/4">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full rounded border pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All payment statuses</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div className="relative flex-1 lg:w-1/4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded border pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All registration statuses</option>
            <option value="registered">Registered</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Zone rankings */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Zone Rankings</h2>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3 text-center">Registrations</th>
                <th className="px-4 py-3 text-center">Paid</th>
                <th className="px-4 py-3 text-center">Unpaid</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {zoneStats.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No zone data available.
                  </td>
                </tr>
              ) : (
                zoneStats.map((zs) => (
                  <tr key={zs.zone.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{zs.zone.name}</td>
                    <td className="px-4 py-3 text-center">{zs.total}</td>
                    <td className="px-4 py-3 text-center">{zs.paid}</td>
                    <td className="px-4 py-3 text-center">{zs.total - zs.paid}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Zone activation status */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Zone Activation Status</h2>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Zone ID</th>
                <th className="px-4 py-3">Admin Email</th>
                <th className="px-4 py-3 text-center">Activation Status</th>
                <th className="px-4 py-3 text-center">Activation Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {zones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No zone data available.
                  </td>
                </tr>
              ) : (
                zones.map((z) => (
                  <tr key={z.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{z.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{z.zone_id_code || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{z.admin_email || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={z.is_activated ? "default" : "secondary"}
                        className={z.is_activated ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}
                      >
                        {z.is_activated ? "Activated" : "Pending"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-center">
                      {z.activated_at ? new Date(z.activated_at).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Age group breakdown */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Age Group Breakdown</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(ageBreakdown).length === 0 ? (
            <p className="text-sm text-muted-foreground">No age group data available.</p>
          ) : (
            Object.entries(ageBreakdown).map(([age, count]) => (
              <div key={age} className="rounded-lg border p-4 flex flex-col items-center">
                <p className="text-sm font-medium text-muted-foreground">{age}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Designation breakdown */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Designation Breakdown</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(designationBreakdown).length === 0 ? (
            <p className="text-sm text-muted-foreground">No designation data available.</p>
          ) : (
            Object.entries(designationBreakdown).map(([desig, count]) => (
              <div key={desig} className="rounded-lg border p-4 flex flex-col items-center">
                <p className="text-sm font-medium text-muted-foreground">{desig}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Payment monitoring - recent registrations */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Payment Monitoring</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Recent registrations across all zones. Use filters above to narrow results.
        </p>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Age Group</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No registrations found.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 20).map((r) => {
                  const zone = zones.find((z) => z.id === r.zone_id);
                  return (
                    <tr key={r.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        {r.first_name} {r.surname}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {zone?.name || r.zone_id}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {r.designation || "-"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {r.age_group || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          r.payment_status === "paid"
                            ? "bg-green-100 text-green-700"
                            : r.payment_status === "unpaid"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-muted text-muted-foreground"
                        }`}>
                          {r.payment_status.charAt(0).toUpperCase() + r.payment_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {r.registration_source === "public" ? "Public" : "Bulk Upload"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
              {filtered.length > 20 && (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-center text-sm text-muted-foreground">
                    Showing 20 of {filtered.length}.
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
