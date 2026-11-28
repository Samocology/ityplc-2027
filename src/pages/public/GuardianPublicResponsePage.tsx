"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { PageContainer } from "@/components/shared/PageContainer";
import { ShieldCheck, Mail, ArrowLeft } from "lucide-react";

type GuardianPublicResponse = {
  id: string;
  guardian_id: string;
  guardian_name: string;
  guardian_email: string;
  participant_name: string;
  consent_title: string;
  consent_description: string;
  response: string;
  responded_at: string | null;
  response_token: string | null;
};

export function GuardianPublicResponsePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [response, setResponse] = useState<GuardianPublicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No response token provided.");
      setLoading(false);
      return;
    }
    loadResponse();
  }, [token]);

  const loadResponse = async () => {
    try {
      const { data, error: err } = await supabase
        .from("guardian_responses")
        .select(`
          *,
          guardians (
            first_name,
            surname,
            email
          ),
          guardian_consent_templates (
            title,
            description
          )
        `)
        .eq("response_token", token)
        .maybeSingle();

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Invalid or expired response link.");
        setLoading(false);
        return;
      }

      const row = data as {
        id: string;
        guardian_id: string;
        response: string;
        responded_at: string | null;
        response_token: string | null;
        guardians: { first_name: string; surname: string; email: string };
        guardian_consent_templates: { title: string; description: string };
      };

      setResponse({
        id: row.id,
        guardian_id: row.guardian_id,
        guardian_name: `${row.guardians.first_name} ${row.guardians.surname}`,
        guardian_email: row.guardians.email,
        participant_name: "",
        consent_title: row.guardian_consent_templates.title,
        consent_description: row.guardian_consent_templates.description,
        response: row.response,
        responded_at: row.responded_at,
        response_token: row.response_token,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load response");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (answer: "granted" | "denied") => {
    if (!response || !response.response_token) return;
    setSubmitting(true);
    setError(null);

    try {
      const { error: err } = await supabase
        .from("guardian_responses")
        .update({
          response: answer,
          responded_at: new Date().toISOString(),
        })
        .eq("response_token", response.response_token)
        .eq("response", "pending");

      if (err) {
        setError(err.message);
        setSubmitting(false);
        return;
      }

      setResponse({ ...response, response: answer, responded_at: new Date().toISOString() });
      setCompleted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer className="py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground">Loading consent request...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer className="py-12 max-w-md">
        <div className="rounded border border-destructive/50 bg-destructive/10 p-6 text-center">
          <ShieldCheck className="w-8 h-8 text-destructive mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-destructive mb-2">Unable to load consent request</h2>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to homepage
          </button>
        </div>
      </PageContainer>
    );
  }

  if (!response) {
    return null;
  }

  if (completed) {
    return (
      <PageContainer className="py-12 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Consent recorded</h1>
        <p className="text-muted-foreground mb-6">
          Thank you, {response.guardian_name}. Your response has been recorded.
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to homepage
        </button>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 max-w-lg mx-auto">
      <div className="rounded border bg-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-bold tracking-tight">Guardian Consent Request</h2>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Guardian</p>
            <p className="text-sm">{response.guardian_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-sm text-muted-foreground">{response.guardian_email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Consent</p>
            <p className="text-sm font-medium">{response.consent_title}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Details</p>
            <p className="text-sm text-muted-foreground">{response.consent_description}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Do you consent to the above? Your choice will be recorded for this
          event registration.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => handleRespond("granted")}
            disabled={submitting}
            className="w-full rounded bg-green-100 px-4 py-3 text-sm font-semibold text-green-800 hover:bg-green-200 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Recording..." : "Grant Consent"}
          </button>
          <button
            onClick={() => handleRespond("denied")}
            disabled={submitting}
            className="w-full rounded border px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors"
          >
            Deny
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
