
"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/authentication/use-auth";
import { PageContainer } from "@/components/shared/PageContainer";

import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Fingerprint,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Shield,
  ShieldCheck,
  UserPlus,
  Users,
  AlertCircle,
  LogIn,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Profile = {
  id: string;
  role: string;
  zone_id: string | null;
};

export function SetupPage() {
  const { session, signUp } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    loadProfile();
  }, [session]);

  useEffect(() => {
    if (!loading && profile?.role === "hq_admin") {
      navigate("/hq", { replace: true });
    }
  }, [loading, profile, navigate]);

  const loadProfile = async () => {
    setLoading(true);

    try {
      const { data, error: err } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session?.user.id)
        .maybeSingle();

      if (err) {
        setError(err.message);
        return;
      }

      if (!data) {
        setProfile(null);
        return;
      }

      setProfile({
        id: data.id,
        role: data.role,
        zone_id: data.zone_id,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrap = async () => {
    if (!session?.user) return;

    setError(null);
    setCreating(true);

    try {
      const { error: err } = await supabase
        .from("user_profiles")
        .insert({
          id: session.user.id,
          role: "hq_admin",
          zone_id: null,
        });

      if (err) {
        setError(err.message);
        return;
      }

      setProfile({
        id: session.user.id,
        role: "hq_admin",
        zone_id: null,
      });

      navigate("/hq", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to bootstrap admin account"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSignupLoading(true);

    try {
      await signUp(signupEmail, signupPassword);
      navigate("/setup", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setSignupLoading(false);
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
            <p className="font-semibold text-[#14213a]">
              Checking account status
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Please wait while we verify your administrator profile.
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (profile?.role === "hq_admin") {
    return null;
  }

  const isZoneAdmin = profile?.role === "zone_admin";
  const isSignedIn = !!session;

  return (
    <PageContainer className="py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Page heading */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#14213a] text-white">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-[#14213a]">
                ITYPLC 2027
              </p>
              <p className="text-xs text-muted-foreground">
                Administration setup
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="rounded-full border-orange-200 bg-orange-50 px-3 py-1 text-[#bd6819]"
          >
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-[#f28c28]" />
            Initial configuration
          </Badge>
        </div>

        {/* Main layout */}
        <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.07)] lg:grid-cols-[0.85fr_1.15fr]">

          {/* LEFT PANEL */}
          <section className="relative flex flex-col justify-between overflow-hidden bg-[#14213a] p-7 text-white sm:p-10 lg:min-h-[650px] lg:p-12">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-[#f28c28]/15 blur-[90px]" />
              <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-white/10" />
              <div className="absolute -bottom-20 -left-12 h-64 w-64 rounded-full border border-white/10" />
              <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:45px_45px]" />
            </div>

            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f28c28] shadow-lg shadow-orange-950/20">
                <Shield size={28} />
              </div>

              <p className="mt-10 text-xs font-bold tracking-[0.22em] text-orange-300">
                HEADQUARTERS MANAGEMENT
              </p>

              <h1 className="mt-5 max-w-md text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
                Establish your central administration.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
                Set up the first HQ administrator account to manage the
                conference's central operations, administration and
                coordination.
              </p>
            </div>

            <div className="relative z-10 mt-14 space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-orange-300">
                  <Users size={19} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Central coordination</p>
                  <p className="mt-1 text-xs leading-5 text-white/50">
                    Manage conference-wide administration and oversight.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-orange-300">
                  <Fingerprint size={19} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Controlled access</p>
                  <p className="mt-1 text-xs leading-5 text-white/50">
                    Administrator access is assigned through your account.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-orange-300">
                  <LockKeyhole size={19} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Secure foundation</p>
                  <p className="mt-1 text-xs leading-5 text-white/50">
                    Start with a dedicated administrative identity.
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <p className="text-xs leading-6 text-white/40">
                  ITYPLC 2027 · Headquarters Administration
                </p>
              </div>
            </div>
          </section>

          {/* RIGHT PANEL */}
          <section className="flex items-center justify-center bg-white p-6 sm:p-10 lg:p-12">
            <div className="w-full max-w-[470px]">

              {/* ERROR */}
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Something went wrong</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* NOT SIGNED IN */}
              {!isSignedIn && (
                <>
                  <div className="mb-8">
                    <Badge className="mb-4 rounded-full bg-orange-50 text-[#bd6819] hover:bg-orange-50">
                      Account required
                    </Badge>

                    <h2 className="text-3xl font-bold tracking-tight text-[#14213a]">
                      Get started
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Create an authentication account or sign in with an
                      existing account to continue the administrator setup.
                    </p>
                  </div>

                  <Card className="rounded-2xl border-slate-200 shadow-none">
                    <CardHeader className="pb-5">
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#e77d1b]">
                        <UserPlus size={20} />
                      </div>
                      <CardTitle className="text-lg text-[#14213a]">
                        Create an account
                      </CardTitle>
                      <CardDescription>
                        Register a new authentication account.
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <form onSubmit={handleSignup} className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="setup_email">
                            Email address
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                              id="setup_email"
                              type="email"
                              autoComplete="email"
                              placeholder="you@example.com"
                              value={signupEmail}
                              onChange={(e) =>
                                setSignupEmail(e.target.value)
                              }
                              required
                              className="h-12 rounded-xl pl-10 focus-visible:ring-[#f28c28]"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="setup_password">
                            Password
                          </Label>
                          <div className="relative">
                            <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                              id="setup_password"
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                              placeholder="Create a password"
                              value={signupPassword}
                              onChange={(e) =>
                                setSignupPassword(e.target.value)
                              }
                              required
                              className="h-12 rounded-xl pl-10 pr-12 focus-visible:ring-[#f28c28]"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowPassword((value) => !value)
                              }
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-[#14213a]"
                            >
                              {showPassword ? "Hide" : "Show"}
                            </button>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={signupLoading}
                          className="h-12 w-full rounded-xl bg-[#f28c28] font-semibold text-white hover:bg-[#df791b]"
                        >
                          {signupLoading ? (
                            <>
                              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            <>
                              Create account
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <div className="my-6 flex items-center gap-4">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">
                      OR
                    </span>
                    <Separator className="flex-1" />
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <LogIn size={19} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#14213a]">
                          Already have an account?
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Sign in to continue your setup.
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/login")}
                      className="mt-5 h-11 w-full rounded-xl"
                    >
                      Sign in instead
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  <p className="mt-7 text-center text-xs leading-5 text-muted-foreground">
                    After signing in, return here to continue the
                    administrator setup process.
                  </p>
                </>
              )}

              {/* ZONE ADMIN */}
              {isSignedIn && isZoneAdmin && (
                <div className="py-5 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <Shield size={30} />
                  </div>

                  <Badge variant="destructive" className="mb-5">
                    Existing administrator account
                  </Badge>

                  <h2 className="text-2xl font-bold tracking-tight text-[#14213a]">
                    Account already provisioned
                  </h2>

                  <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
                    Your account is provisioned as a zone administrator
                    and cannot be changed to an HQ administrator through
                    this setup page.
                  </p>

                  <Alert className="mt-7 text-left">
                    <ShieldCheck className="h-4 w-4" />
                    <AlertDescription>
                      Contact your HQ administrator if you require a
                      different access level.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={() => navigate("/login")}
                    variant="outline"
                    className="mt-7 h-12 w-full rounded-xl"
                  >
                    Return to login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* SIGNED IN, NO PROFILE */}
              {isSignedIn && !profile && (
                <>
                  <div className="mb-8">
                    <Badge className="mb-4 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Authentication successful
                    </Badge>

                    <h2 className="text-3xl font-bold tracking-tight text-[#14213a]">
                      Create your first HQ admin
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Your account is signed in but doesn't have an
                      administrator profile yet. You can proceed with
                      the initial HQ administrator setup.
                    </p>
                  </div>

                  <Card className="rounded-2xl border-slate-200 shadow-none">
                    <CardHeader>
                      <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#e77d1b]">
                        <ShieldCheck size={22} />
                      </div>

                      <CardTitle className="text-lg text-[#14213a]">
                        Account verification
                      </CardTitle>

                      <CardDescription>
                        Review the account that will be provisioned.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-medium text-muted-foreground">
                          Signed-in email
                        </p>
                        <p className="mt-2 break-all text-sm font-semibold text-[#14213a]">
                          {session?.user.email}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Account role
                          </span>
                          <Badge variant="outline">
                            HQ Administrator
                          </Badge>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Zone assignment
                          </span>
                          <span className="text-sm font-medium text-[#14213a]">
                            Headquarters
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={handleBootstrap}
                        disabled={creating}
                        className="h-12 w-full rounded-xl bg-[#f28c28] font-semibold text-white hover:bg-[#df791b]"
                      >
                        {creating ? (
                          <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Provisioning account...
                          </>
                        ) : (
                          <>
                            Provision HQ administrator
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>

                      <p className="text-xs leading-5 text-muted-foreground">
                        This creates your user_profiles entry with the
                        hq_admin role and no zone assignment.
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 px-1">
          <p className="text-xs text-muted-foreground">
            © 2027 ITYPLC. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Headquarters Administration Portal
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
