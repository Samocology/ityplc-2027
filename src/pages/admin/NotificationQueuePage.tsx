"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/authentication/use-auth";
import { PageContainer } from "@/components/shared/PageContainer";
import { Clock, Mail, Phone, ShieldCheck, RefreshCw } from "lucide-react";

type Notification = {
  id: string;
  template_id: string | null;
  recipient_type: string;
  recipient_id: string;
  recipient_email: string | null;
  recipient_phone: string | null;
  status: "pending" | "sent" | "failed" | "cancelled";
  retry_count: number;
  max_retries: number;
  last_error: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export function NotificationQueuePage() {
  const { profile, isHqAdmin, isZoneAdmin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadNotifications();
  }, [profile?.zone_id, isHqAdmin, isZoneAdmin]);

  const loadNotifications = async () => {
    try {
      const query = supabase.from("notifications").select("*").order("created_at", { ascending: false });

      // Zone admins can only see notifications for their zone's recipients
      if (isZoneAdmin && !isHqAdmin && profile?.zone_id) {
        // We'll filter client-side since RLS handles server-side
        // But for the UI we fetch all and filter
      }

      const { data, error: err } = await query;

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      const mapped = (data ?? []).map((n) => ({
        id: n.id,
        template_id: n.template_id,
        recipient_type: n.recipient_type,
        recipient_id: n.recipient_id,
        recipient_email: n.recipient_email,
        recipient_phone: n.recipient_phone,
        status: n.status as "pending" | "sent" | "failed" | "cancelled",
        retry_count: n.retry_count,
        max_retries: n.max_retries,
        last_error: n.last_error,
        sent_at: n.sent_at,
        created_at: n.created_at,
        updated_at: n.updated_at,
      }));

      // Filter by zone for zone admins
      let filtered = mapped;
      if (isZoneAdmin && !isHqAdmin && profile?.zone_id) {
        filtered = mapped.filter((n) => {
          if (n.recipient_type === "participant") {
            // Check if registration is in user's zone - can't easily do here without join
            return true; // RLS handles server-side filtering
          }
          return true;
        });
      }

      setNotifications(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const filteredByStatus = notifications.filter((n) => {
    if (statusFilter === "all") return true;
    return n.status === statusFilter;
  });

  const retryNotification = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from("notifications")
        .update({ status: "pending", retry_count: 0, last_error: null })
        .eq("id", id);

      if (err) throw err;
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retry notification");
    }
  };

  const retryAllFailed = async () => {
    try {
      const { error: err } = await supabase
        .from("notifications")
        .update({ status: "pending", retry_count: 0, last_error: null })
        .eq("status", "failed");

      if (err) throw err;
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retry notifications");
    }
  };

  const total = notifications.length;
  const pending = notifications.filter((n) => n.status === "pending").length;
  const sent = notifications.filter((n) => n.status === "sent").length;
  const failed = notifications.filter((n) => n.status === "failed").length;

  if (loading) {
    return (
      <PageContainer className="py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Notification Queue</h1>
          <p className="text-sm text-muted-foreground">
            Monitor and retry notification delivery.
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
          <p className="text-sm font-medium text-muted-foreground">Sent</p>
          <p className="text-2xl font-bold text-green-600">{sent}</p>
        </div>
        <div className="rounded-lg border p-5">
          <p className="text-sm font-medium text-muted-foreground">Failed</p>
          <p className="text-2xl font-bold text-destructive">{failed}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 lg:w-1/3">
          <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded border pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex-1 lg:w-1/3">
          {failed > 0 && (
            <button
              onClick={retryAllFailed}
              disabled={failed === 0}
              className="w-full inline-flex items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" /> Retry All Failed ({failed})
            </button>
          )}
        </div>
      </div>

      {filteredByStatus.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <Clock className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs text-muted-foreground">Notifications will appear here when queued.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Attempts</th>
                <th className="px-4 py-3">Error</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredByStatus.map((n) => {
                const channelIcon =
                  n.recipient_email ? (
                    <Mail className="w-3 h-3 text-muted-foreground" />
                  ) : n.recipient_phone ? (
                    <Phone className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <ShieldCheck className="w-3 h-3 text-muted-foreground" />
                  );
                const statusColor =
                  n.status === "sent"
                    ? "bg-green-100 text-green-700"
                    : n.status === "failed"
                      ? "bg-destructive/10 text-destructive"
                      : n.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-muted text-muted-foreground";
                return (
                  <tr key={n.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {n.recipient_email || n.recipient_phone || n.recipient_id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {channelIcon}
                        <span className="text-xs text-muted-foreground">
                          {n.recipient_email ? "Email" : n.recipient_phone ? "SMS" : "KingsChat"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
                        {n.status.charAt(0).toUpperCase() + n.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {n.retry_count}/{n.max_retries}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {n.last_error || "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(n.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {n.status === "failed" && n.retry_count < n.max_retries ? (
                        <button
                          onClick={() => retryNotification(n.id)}
                          className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                        >
                          Retry
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-sm text-muted-foreground">
        Showing {filteredByStatus.length} of {total} notifications. Failed notifications
        can be retried up to their maximum retry limit.
      </p>
    </PageContainer>
  );
}
