"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/authentication/use-auth";
import { PageContainer } from "@/components/shared/PageContainer";
import { Search, ChevronRight } from "lucide-react";

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

export function ZoneParticipantsPage() {
  const { profile } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");

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

  const updatePaymentStatus = async (id: string, status: string) => {
    try {
      const { error: err } = await supabase
        .from("registrations")
        .update({ payment_status: status })
        .eq("id", id);

      if (err) {
        setError(err.message);
        return;
      }
      setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, payment_status: status } : r)));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update payment status");
    }
  };

  const filtered = registrations.filter((r) => {
    const matchesSearch =
      r.first_name.toLowerCase().includes(search.toLowerCase()) ||
      r.surname.toLowerCase().includes(search.toLowerCase());
    const matchesPayment =
      paymentFilter === "all" || r.payment_status === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const total = registrations.length;
  const paid = registrations.filter((r) => r.payment_status === "paid").length;
  const unpaid = registrations.filter((r) => r.payment_status === "unpaid").length;

  if (loading) {
    return (
      <PageContainer className="py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground">Loading participants...</p>
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
          <h1 className="text-2xl font-bold tracking-tight mb-1">Participant Management</h1>
          <p className="text-sm text-muted-foreground">
            Zone ID: {profile.zone_id} &middot; Manage registrations and payment status.
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

      <div className="grid gap-4 mb-6 md:grid-cols-4">
        <div className="rounded-lg border p-5">
          <p className="text-sm font-medium text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="rounded-lg border p-5">
          <p className="text-sm font-medium text-muted-foreground">Paid</p>
          <p className="text-2xl font-bold text-green-600">{paid}</p>
        </div>
        <div className="rounded-lg border p-5">
          <p className="text-sm font-medium text-muted-foreground">Unpaid</p>
          <p className="text-2xl font-bold text-amber-600">{unpaid}</p>
        </div>
        <div className="rounded-lg border p-5 flex flex-col">
          <button
            onClick={() => window.location.href = "/zone/bulk-upload"}
            className="w-full inline-flex items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ChevronRight className="w-4 h-4" /> Bulk Upload
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 lg:w-1/3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex-1 lg:w-1/3">
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
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-left text-muted-foreground">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Age Group</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No participants found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    {r.first_name} {r.surname}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.designation || "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.age_group || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      r.payment_status === "paid" ? "bg-green-100 text-green-700" :
                      r.payment_status === "unpaid" ? "bg-amber-100 text-amber-700" :
                      "bg-muted text-muted-foreground"
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
                  <td className="px-4 py-3 text-right">
                    <select
                      value={r.payment_status}
                      onChange={(e) => updatePaymentStatus(r.id, e.target.value)}
                      className="rounded border pl-2 pr-8 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Showing {filtered.length} of {total} participants.
      </p>
    </PageContainer>
  );
}
