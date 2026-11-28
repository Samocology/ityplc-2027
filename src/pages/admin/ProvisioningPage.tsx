"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/authentication/use-auth";
import { PageContainer } from "@/components/shared/PageContainer";
import { UserPlus, Building2, Shield } from "lucide-react";

type Profile = {
  id: string;
  role: string;
  zone_id: string | null;
  created_at: string;
  updated_at: string;
};

export function ProvisioningPage() {
  const { isHqAdmin } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"hq_admin" | "zone_admin">("zone_admin");
  const [zoneId, setZoneId] = useState("");

  const [zones, setZones] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!isHqAdmin) {
      navigate("/login", { replace: true });
      return;
    }
    loadProfiles();
    loadZones();
  }, [isHqAdmin, navigate]);

  const loadProfiles = async () => {
    const { data, error: err } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setProfiles((data ?? []).map((p) => ({
      id: p.id,
      role: p.role,
      zone_id: p.zone_id,
      created_at: p.created_at,
      updated_at: p.updated_at,
    })));
    setLoading(false);
  };

  const loadZones = async () => {
    const { data, error: err } = await supabase
      .from("zones")
      .select("id, name")
      .eq("is_active", true)
      .order("name");

    if (err) {
      setError(err.message);
      return;
    }
    setZones(data ?? []);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreating(true);

    try {
      const { error: err } = await supabase.from("user_profiles").insert({
        id: userId,
        role,
        zone_id: role === "zone_admin" ? zoneId : null,
      });

      if (err) {
        setError(err.message);
        setCreating(false);
        return;
      }

      setSuccess("Administrative account provisioned successfully.");
      setUserId("");
      setRole("zone_admin");
      setZoneId("");
      await loadProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to provision account");
    } finally {
      setCreating(false);
    }
  };

  if (!isHqAdmin) {
    return null;
  }

  return (
    <PageContainer className="py-12 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Admin Provisioning</h1>
          <p className="text-sm text-muted-foreground">
            Provision HQ and zone administrative accounts. Zone accounts are
            linked to an immutable zone ID.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-4 mb-6 text-sm text-destructive">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded border border-green/50 bg-green/10 p-4 mb-6 text-sm text-green-800">
          <p className="font-medium">Success</p>
          <p>{success}</p>
        </div>
      )}

      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <div className="rounded border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5" />
            <h3 className="font-semibold">Provision new account</h3>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="user_id" className="text-sm font-medium">
                Auth user ID
              </label>
              <input
                id="user_id"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value.trim())}
                placeholder="auth.users id (UUID)"
                required
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                The user must have signed up first. Public sign-up does not
                create administrative accounts.
              </p>
            </div>

            <div className="space-y-1">
              <label htmlFor="role" className="text-sm font-medium">Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "hq_admin" | "zone_admin")}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="zone_admin">Zone Administrator</option>
                <option value="hq_admin">HQ Administrator</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="zone_id" className="text-sm font-medium">
                Zone (required for zone admin)
              </label>
              <select
                id="zone_id"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                disabled={role === "hq_admin"}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a zone</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {creating ? "Provisioning..." : "Provision account"}
            </button>
          </form>
        </div>

        <div className="rounded border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5" />
            <h3 className="font-semibold">Existing accounts</h3>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading accounts...</p>
          ) : profiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No administrative accounts provisioned yet.</p>
          ) : (
            <div className="space-y-3">
              {profiles.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{p.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.role}{p.zone_id ? ` · Zone: ${p.zone_id}` : " · All zones (HQ)"}
                    </p>
                  </div>
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
