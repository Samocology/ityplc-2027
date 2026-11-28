
"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/authentication/use-auth";
import { PageContainer } from "@/components/shared/PageContainer";

import { ArrowRight, ArrowUpRight, CheckCircle2, KeyRound, LoaderCircle, LogIn, Mail, Shield, UserPlus } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function ZoneSetupPage() {
  const { session, profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activationCode, setActivationCode] = useState("");
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    if (profile?.role === "zone_admin" && profile.zone_id) {
      navigate("/zone", { replace: true });
      return;
    }
    setLoading(false);
  }, [session, profile, navigate]);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Signup is handled by the auth provider; this is a placeholder
    setError("Use the signup page to create an account, then return here.");
  };

  const handleActivate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setActivating(true);

    if (!session?.user) {
      setError("You must be signed in to activate a zone.");
      setActivating(false);
      return;
    }

    try {
      // Atomic activation via SECURITY DEFINER RPC function.
      // Validates code expiry, single-use, caller authorization, and
      // prevents duplicate zone admins in a single database transaction.
      const { data, error: rpcErr } = await supabase
        .rpc("activate_zone_admin", { activation_code: activationCode })
        .maybeSingle();

      if (rpcErr) {
        setError(rpcErr.message);
        setActivating(false);
        return;
      }

      const result = data as { success: boolean; zone_id: string; error: string } | null;
      if (!result || !result.success) {
        setError(result?.error || "Zone activation failed.");
        setActivating(false);
        return;
      }

      navigate("/zone", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Zone activation failed");
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <PageContainer className="py-10">
        <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">
            <LoaderCircle className="h-6 w-6 animate-spin text-[#f28c28]" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#14213a]">Checking account status</p>
            <p className="mt-1 text-sm text-muted-foreground">Please wait while we verify your zone administrator profile.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!session) {
    return (
      <PageContainer className="py-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#14213a] text-white">
                <Shield size={22} />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight text-[#14213a]">ITYPLC 2027</p>
                <p className="text-xs text-muted-foreground">Zone administrator setup</p>
              </div>
            </div>
            <Badge variant="outline" className="rounded-full border-orange-200 bg-orange-50 px-3 py-1 text-[#bd6819]">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-[#f28c28]" /> Zone activation
            </Badge>
          </div>

          <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.07)] lg:grid-cols-[0.85fr_1.15fr]">
            <section className="relative flex flex-col justify-between overflow-hidden bg-[#14213a] p-7 text-white sm:p-10 lg:min-h-[650px] lg:p-12">
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-[#f28c28]/15 blur-[90px]" />
                <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:45px_45px]" />
              </div>
              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f28c28] shadow-lg shadow-orange-950/20">
                  <Shield size={28} />
                </div>
                <p className="mt-10 text-xs font-bold tracking-[0.22em] text-orange-300">ZONE ADMINISTRATION</p>
                <h1 className="mt-5 max-w-md text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">Activate your zone administrator account.</h1>
                <p className="mt-5 max-w-md text-sm leading-7 text-white/65">Enter the activation code provided by your HQ administrator to activate zone administrator access.</p>
              </div>
            </section>

            <section className="flex items-center justify-center bg-white p-6 sm:p-10 lg:p-12">
              <div className="w-full max-w-[470px]">
                <div className="mb-8">
                  <Badge className="mb-4 rounded-full bg-orange-50 text-[#bd6819] hover:bg-orange-50">Account required</Badge>
                  <h2 className="text-3xl font-bold tracking-tight text-[#14213a]">Get started</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">Create an authentication account or sign in with an existing account to continue zone activation.</p>
                </div>
                <Card className="rounded-2xl border-slate-200 shadow-none">
                  <CardHeader className="pb-5">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#e77d1b]">
                      <UserPlus size={20} />
                    </div>
                    <CardTitle className="text-lg text-[#14213a]">Create an account</CardTitle>
                    <CardDescription>Register a new authentication account.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSignup} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="zone_setup_email">Email address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input id="zone_setup_email" type="email" autoComplete="email" placeholder="you@example.com" required className="h-12 rounded-xl pl-10 focus-visible:ring-[#f28c28]" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zone_setup_password">Password</Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input id="zone_setup_password" type="password" autoComplete="new-password" placeholder="Create a password" required className="h-12 rounded-xl pl-10 pr-12 focus-visible:ring-[#f28c28]" />
                        </div>
                      </div>
                      <Button type="submit" className="h-12 w-full rounded-xl bg-[#f28c28] font-semibold text-white hover:bg-[#df791b]">Create account<ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </form>
                  </CardContent>
                </Card>
                <div className="my-6 flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <Separator className="flex-1" />
                </div>
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <LogIn size={19} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#14213a]">Already have an account?</p>
                      <p className="mt-1 text-xs text-muted-foreground">Sign in to continue your zone activation.</p>
                    </div>
                  </div>
                  <Button type="button" variant="outline" onClick={() => navigate("/login")} className="mt-5 h-11 w-full rounded-xl">Sign in instead<ArrowUpRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Already has zone admin profile - redirect
  if (profile?.role === "zone_admin" && profile.zone_id) {
    return null;
  }

  // Signed in, no zone yet - show activation form
  return (
    <PageContainer className="py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#14213a] text-white">
              <Shield size={22} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-[#14213a]">ITYPLC 2027</p>
              <p className="text-xs text-muted-foreground">Zone administrator activation</p>
            </div>
          </div>
          <Badge variant="outline" className="rounded-full border-orange-200 bg-orange-50 px-3 py-1 text-[#bd6819]">
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-[#f28c28]" /> Enter activation code
          </Badge>
        </div>

        <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.07)] lg:grid-cols-[0.85fr_1.15fr]">
          <section className="relative flex flex-col justify-between overflow-hidden bg-[#14213a] p-7 text-white sm:p-10 lg:min-h-[650px] lg:p-12">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-[#f28c28]/15 blur-[90px]" />
              <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:45px_45px]" />
            </div>
            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f28c28] shadow-lg shadow-orange-950/20">
                <Shield size={28} />
              </div>
              <p className="mt-10 text-xs font-bold tracking-[0.22em] text-orange-300">ZONE ADMINISTRATION</p>
              <h1 className="mt-5 max-w-md text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">Activate your zone.</h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/65">Enter the single-use activation code issued by your HQ administrator to become the zone administrator for your assigned zone.</p>
            </div>
          </section>

          <section className="flex items-center justify-center bg-white p-6 sm:p-10 lg:p-12">
            <div className="w-full max-w-[470px]">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTitle>Activation failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="mb-8">
                <Badge className="mb-4 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Authentication successful
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight text-[#14213a]">Zone activation</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">You are signed in. Enter your activation code to activate zone administrator access.</p>
              </div>
              <Card className="rounded-2xl border-slate-200 shadow-none">
                <CardHeader>
                  <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#e77d1b]">
                    <KeyRound size={22} />
                  </div>
                  <CardTitle className="text-lg text-[#14213a]">Activation code</CardTitle>
                  <CardDescription>Enter the code provided by your HQ administrator.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <form onSubmit={handleActivate} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="activation_code">Activation code</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input id="activation_code" type="text" autoComplete="off" placeholder="e.g. ABC-1234" value={activationCode} onChange={(e) => setActivationCode(e.target.value)} required className="h-12 rounded-xl pl-10 focus-visible:ring-[#f28c28]" />
                      </div>
                    </div>
                    <Button type="submit" disabled={activating} className="h-12 w-full rounded-xl bg-[#f28c28] font-semibold text-white hover:bg-[#df791b]">
                      {activating ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Activating zone...
                        </>
                      ) : (
                        <>
                          Activate zone administrator
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <p className="text-xs leading-5 text-muted-foreground">This code is single-use and expires after first activation. Contact your HQ administrator if you did not receive a code.</p>
                  </form>
                </CardContent>
              </Card>
              <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
                © 2027 ITYPLC. All rights reserved. · Zone Administration Portal
              </p>
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
