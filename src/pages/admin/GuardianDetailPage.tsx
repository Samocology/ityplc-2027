"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/authentication/use-auth";
import { PageContainer } from "@/components/shared/PageContainer";
import { ChevronRight } from "lucide-react";

type Registration = {
  id: string;
  first_name: string;
  surname: string;
  zone_id: string;
};

type Guardian = {
  id: string;
  registration_id: string;
  first_name: string;
  surname: string;
  email: string;
  phone: string | null;
  relationship: string;
  created_at: string;
  updated_at: string;
};

export function GuardianDetailPage() {
  const { registrationId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [guardian, setGuardian] = useState<Guardian | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");

  useEffect(() => {
    loadData();
  }, [profile?.zone_id, registrationId]);

  const loadData = async () => {
    if (!profile?.zone_id || !registrationId) return;

    try {
      const [regResult, guardResult] = await Promise.all([
        supabase
          .from("registrations")
          .select("*")
          .eq("id", registrationId)
          .eq("zone_id", profile.zone_id)
          .maybeSingle(),
        supabase.from("guardians").select("*").eq("registration_id", registrationId).maybeSingle(),
      ]);

      if (regResult.error) {
        setError(regResult.error.message);
        setLoading(false);
        return;
      }

      if (!regResult.data) {
        setError("Registration not found in your zone.");
        setLoading(false);
        return;
      }

      setRegistration({
        id: regResult.data.id,
        first_name: regResult.data.first_name,
        surname: regResult.data.surname,
        zone_id: regResult.data.zone_id,
      });

      if (guardResult.data) {
        setGuardian({
          id: guardResult.data.id,
          registration_id: guardResult.data.registration_id,
          first_name: guardResult.data.first_name,
          surname: guardResult.data.surname,
          email: guardResult.data.email,
          phone: guardResult.data.phone,
          relationship: guardResult.data.relationship,
          created_at: guardResult.data.created_at,
          updated_at: guardResult.data.updated_at,
        });
        setFirstName(guardResult.data.first_name);
        setSurname(guardResult.data.surname);
        setEmail(guardResult.data.email);
        setPhone(guardResult.data.phone || "");
        setRelationship(guardResult.data.relationship);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load guardian details");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    if (!registration || !profile?.zone_id) return;

    try {
      if (guardian) {
        const { error: err } = await supabase
          .from("guardians")
          .update({
            first_name: firstName,
            surname,
            email,
            phone: phone || null,
            relationship,
          })
          .eq("id", guardian.id);

        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("guardians").insert({
          registration_id: registration.id,
          first_name: firstName,
          surname,
          email,
          phone: phone || null,
          relationship,
        });

        if (err) throw err;
      }

      navigate(`/zone/participants`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save guardian details");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer className="py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground">Loading guardian details...</p>
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
    <PageContainer className="py-8 max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            {guardian ? "Edit Guardian" : "Add Guardian Details"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {registration
              ? `Guardian for ${registration.first_name} ${registration.surname}`
              : "Add guardian contact details for a participant."}
          </p>
        </div>
        <a
          href="/zone/participants"
          className="inline-flex items-center gap-2 rounded border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          <span>← Back to participants</span>
        </a>
      </div>

      {error && (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-4 mb-6 text-sm text-destructive">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {!registration ? (
        <div className="rounded-lg border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Select a participant to add guardian details.
          </p>
          <a
            href="/zone/participants"
            className="mt-4 inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <ChevronRight className="w-4 h-4" /> View Participants
          </a>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-1">
            <label htmlFor="first_name" className="block text-sm font-medium">
              Guardian First Name
            </label>
            <input
              id="first_name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value.trim())}
              placeholder="First name"
              required
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="surname" className="block text-sm font-medium">
              Guardian Surname
            </label>
            <input
              id="surname"
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value.trim())}
              placeholder="Surname"
              required
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder="guardian@example.com"
              required
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="phone" className="block text-sm font-medium">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.trim())}
              placeholder="+1 (555) 000-0000"
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="relationship" className="block text-sm font-medium">
              Relationship
            </label>
            <select
              id="relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Parent">Parent</option>
              <option value="Guardian">Guardian</option>
              <option value="Grandparent">Grandparent</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
          >
            {saving ? "Saving..." : guardian ? "Update Guardian" : "Save Guardian"}
          </button>
        </form>
      )}
    </PageContainer>
  );
}
