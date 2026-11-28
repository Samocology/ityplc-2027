
"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail, LockKeyhole, Shield, HelpCircle } from "lucide-react";

import { useAuth } from "@/features/authentication/use-auth";
import { supabase } from "@/lib/supabase";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type LoginStep = "zone-id" | "password" | "create-password";

export function LoginPage() {
  const [step, setStep] = useState<LoginStep>("zone-id");
  const [zoneIdCode, setZoneIdCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [zoneInfo, setZoneInfo] = useState<{
    zoneId: string;
    zoneName: string;
    zoneIdCode: string;
    activated: boolean;
    email: string | null;
    hasPendingActivation: boolean;
  } | null>(null);

  const { signIn, profile, session } = useAuth();
  const navigate = useNavigate();

  // Redirect if already activated as zone admin
  useEffect(() => {
    if (session && profile?.role === "zone_admin" && profile.zone_id) {
      navigate("/zone", { replace: true });
    }
  }, [session, profile, navigate]);

  const setErrorMsg = (msg: string) => {
    setError(msg);
    setLoading(false);
  };

  // ------------------------------------------------------------------
  // Step 1: Zone ID lookup
  // ------------------------------------------------------------------
  const handleZoneIdContinue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "zone-lookup",
        { body: { zone_id_code: zoneIdCode.trim() } },
      );

      if (invokeError) {
        setErrorMsg(
          invokeError.message ||
            "Invalid Zone ID. Please check your ID and try again.",
        );
        return;
      }

      if (!data || !(data as { exists?: boolean }).exists) {
        setErrorMsg("Invalid Zone ID. Please check your ID and try again.");
        return;
      }

      const zone = data as {
        zoneId: string;
        zoneName: string;
        zoneIdCode: string;
        activated: boolean;
        email: string | null;
        hasPendingActivation: boolean;
      };

      setZoneInfo(zone);

      if (zone.activated) {
        // Existing activated zone → go to password screen
        setEmail(zone.email ?? "");
        setStep("password");
      } else if (zone.hasPendingActivation) {
        // Not yet activated but has a pending activation code → create password
        setEmail(zone.email ?? "");
        setStep("create-password");
      } else {
        setErrorMsg(
          "This zone has not been authorized for activation. Contact your HQ administrator.",
        );
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Zone lookup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Step 2a: Existing activated zone → password sign in
  // ------------------------------------------------------------------
  const handlePasswordSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!zoneInfo?.email) {
      setErrorMsg("No email associated with this zone.");
      return;
    }

    try {
      await signIn(zoneInfo.email, password);
      navigate("/zone", { replace: true });
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Sign in failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Step 2b: First-time activation → create password
  // ------------------------------------------------------------------
  const handleCreatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!zoneInfo?.email) {
      setErrorMsg("No email associated with this zone.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!activationCode) {
      setErrorMsg("Activation code is required.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Sign up via Supabase Auth
      const { error: signUpError } = await supabase.auth.signUp({
        email: zoneInfo.email,
        password,
      });

      if (signUpError) {
        setErrorMsg(signUpError.message);
        setLoading(false);
        return;
      }

      // Step 2: Activate zone via RPC (binds user, activates zone, marks code used)
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "activate_zone_admin",
        { activation_code: activationCode },
      );

      if (rpcError || !(rpcData as { success?: boolean })?.success) {
        setErrorMsg(
          (rpcData as { error?: string })?.error ||
            rpcError?.message ||
            "Zone activation failed.",
        );
        setLoading(false);
        return;
      }

      // Step 3: Sign in with the new credentials
      await signIn(zoneInfo.email, password);
      navigate("/zone", { replace: true });
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Activation failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Forgot password: lookup email by Zone ID and trigger reset
  // ------------------------------------------------------------------
  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "zone-lookup",
        { body: { zone_id_code: zoneIdCode.trim() } },
      );

      if (invokeError || !data || !(data as { exists?: boolean }).exists) {
        setErrorMsg("Invalid Zone ID. Please check your ID and try again.");
        return;
      }

      const zone = data as { email?: string | null };
      if (!zone.email) {
        setErrorMsg("No email address on file for this zone.");
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        zone.email,
        {
          redirectTo: `${window.location.origin}/login`,
        },
      );

      if (resetError) {
        setErrorMsg(resetError.message);
        return;
      }

      setError(
        "A password reset link has been sent to " + zone.email + ".",
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Password reset failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  // Step 1: Zone ID entry
  if (step === "zone-id") {
    return (
      <main className="min-h-screen bg-[#14213a] p-3 sm:p-5 lg:p-7">
        <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1500px] overflow-hidden rounded-3xl bg-[#0f172a] shadow-[0_20px_80px_rgba(0,0,0,0.4)] sm:min-h-[calc(100vh-40px)] lg:grid-cols-[1.08fr_0.92fr] lg:rounded-[30px]">

          {/* LEFT: ZONE ADMIN BRANDING */}
          <section className="relative flex min-h-[430px] flex-col justify-between overflow-hidden p-7 sm:p-10 lg:min-h-[720px] lg:p-12">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(242,140,40,0.15),transparent_35%)]" />
              <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:55px_55px]" />
              <div
                className="absolute -right-20 top-24 h-72 w-72 rounded-full blur-[90px] bg-orange-900/30"
              />
              <div className="absolute -bottom-36 -left-20 h-96 w-96 rounded-full border border-orange-500/10" />
              <div className="absolute -bottom-24 -left-8 h-72 w-72 rounded-full border border-orange-500/10" />
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-xl font-black text-white shadow-lg shadow-orange-900/40">
                  ZA
                </div>
                <div>
                  <p className="text-sm font-bold tracking-[0.16em] text-orange-400">
                    ITYPLC 2027
                  </p>
                  <p className="mt-0.5 text-[10px] tracking-[0.18em] text-white/55">
                    ZONE ADMINISTRATOR LOGIN
                  </p>
                </div>
              </div>

              <span className="hidden rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-[10px] font-semibold tracking-[0.15em] text-orange-300 sm:block">
                ZONE ACCESS
              </span>
            </div>

            <div className="relative z-10 my-14 max-w-xl lg:my-0">
              <div className="animate-in fade-in duration-700">
                <div className="mb-7 flex items-center gap-3">
                  <span className="h-[2px] w-8 bg-orange-500" />
                  <span className="text-xs font-bold tracking-[0.22em] text-orange-400">
                    ZONE ADMIN
                  </span>
                </div>

                <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-orange-500/20 bg-orange-900/30 text-4xl text-orange-400 backdrop-blur-sm">
                  <Shield size={28} />
                </div>

                <h1 className="whitespace-pre-line text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[58px]">
                  Zonal Admin
                </h1>

                <p className="mt-6 max-w-md text-sm leading-7 text-white/65 sm:text-base">
                  Sign in with your Zone ID to access your zone administration
                  dashboard.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5">
              <p className="text-xs text-white/45">
                Zone-based conference administration
              </p>
              <p className="text-xs font-semibold tracking-widest text-white/45">
                ZONE
              </p>
            </div>
          </section>

          {/* RIGHT: ZONE ID FORM */}
          <section className="flex items-center justify-center bg-[#0f172a] px-6 py-12 sm:px-12 lg:px-14 xl:px-20">
            <div className="w-full max-w-[410px]">
              <div className="mb-9">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                  <LockKeyhole size={23} />
                </div>

                <p className="mb-3 text-xs font-bold tracking-[0.2em] text-orange-400">
                  ZONE ADMIN LOGIN
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Enter your Zone ID
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Your Zone ID was provided by your HQ administrator. It looks
                  like ITY-Z001.
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-5 border-red-500/30 bg-red-500/10">
                  <AlertDescription className="text-red-300">{error}</AlertDescription>
                </Alert>
              )}

              <Card className="border-0 bg-transparent shadow-none">
                <CardContent className="p-0">
                  <form onSubmit={handleZoneIdContinue} className="space-y-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="zone_id_code"
                        className="text-sm font-semibold text-slate-300"
                      >
                        Zone ID
                      </Label>

                      <div className="relative">
                        <Mail
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <Input
                          id="zone_id_code"
                          type="text"
                          autoComplete="off"
                          placeholder="ITY-Z001"
                          value={zoneIdCode}
                          onChange={(e) => setZoneIdCode(e.target.value)}
                          required
                          className="h-12 rounded-xl border-slate-600 bg-slate-900 pl-11 text-sm focus-visible:ring-[#f28c28] text-white placeholder-slate-500 uppercase"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-12 w-full rounded-xl bg-orange-500 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400 disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4 animate-spin" />
                          Looking up zone...
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight size={17} className="ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="mt-9 flex items-center gap-3">
                <HelpCircle size={16} className="text-slate-500" />
                <p className="text-xs text-slate-400">
                  Don&apos;t know your Zone ID? Contact your HQ administrator.
                </p>
              </div>

              <div className="mt-9 border-t border-slate-700 pt-6 text-center">
                <p className="text-xs text-slate-400">
                  © 2027 ITYPLC. All rights reserved.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  // Step 2: Password or Create Password
  return (
    <main className="min-h-screen bg-[#14213a] p-3 sm:p-5 lg:p-7">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1500px] overflow-hidden rounded-3xl bg-[#0f172a] shadow-[0_20px_80px_rgba(0,0,0,0.4)] sm:min-h-[calc(100vh-40px)] lg:grid-cols-[1.08fr_0.92fr] lg:rounded-[30px]">

        {/* LEFT: ZONE ADMIN BRANDING */}
        <section className="relative flex min-h-[430px] flex-col justify-between overflow-hidden p-7 sm:p-10 lg:min-h-[720px] lg:p-12">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(242,140,40,0.15),transparent_35%)]" />
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:55px_55px]" />
            <div
              className="absolute -right-20 top-24 h-72 w-72 rounded-full blur-[90px] bg-orange-900/30"
            />
            <div className="absolute -bottom-36 -left-20 h-96 w-96 rounded-full border border-orange-500/10" />
            <div className="absolute -bottom-24 -left-8 h-72 w-72 rounded-full border border-orange-500/10" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-xl font-black text-white shadow-lg shadow-orange-900/40">
                ZA
              </div>
              <div>
                <p className="text-sm font-bold tracking-[0.16em] text-orange-400">
                  ITYPLC 2027
                </p>
                <p className="mt-0.5 text-[10px] tracking-[0.18em] text-white/55">
                  ZONE ADMINISTRATOR
                </p>
              </div>
            </div>

            <span className="hidden rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-[10px] font-semibold tracking-[0.15em] text-orange-300 sm:block">
              {step === "create-password" ? "ACTIVATE ZONE" : "ZONE ACCESS"}
            </span>
          </div>

          <div className="relative z-10 my-14 max-w-xl lg:my-0">
            <div className="animate-in fade-in duration-700">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-[2px] w-8 bg-orange-500" />
                <span className="text-xs font-bold tracking-[0.22em] text-orange-400">
                  {zoneInfo?.zoneIdCode}
                </span>
              </div>

              <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-orange-500/20 bg-orange-900/30 text-4xl text-orange-400 backdrop-blur-sm">
                <Shield size={28} />
              </div>

              <h1 className="whitespace-pre-line text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[58px]">
                {step === "create-password" ? "Activate Your Zone" : "Welcome back"}
              </h1>

              <p className="mt-6 max-w-md text-sm leading-7 text-white/65 sm:text-base">
                {step === "create-password"
                  ? "Create your administrator password to activate zone " +
                    zoneInfo?.zoneIdCode +
                    "."
                  : "Sign in to access your zone administration dashboard."}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5">
            <p className="text-xs text-white/45">
              {zoneInfo?.zoneName} · {zoneInfo?.zoneIdCode}
            </p>
            <p className="text-xs font-semibold tracking-widest text-white/45">
              ZONE
            </p>
          </div>
        </section>

        {/* RIGHT: PASSWORD / CREATE PASSWORD FORM */}
        <section className="flex items-center justify-center bg-[#0f172a] px-6 py-12 sm:px-12 lg:px-14 xl:px-20">
          <div className="w-full max-w-[410px]">
            <Button
              type="button"
              onClick={() => setStep("zone-id")}
              className="mb-6 w-full inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Change Zone ID
            </Button>

            <div className="mb-9">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                <Mail size={23} />
              </div>

              <p className="mb-3 text-xs font-bold tracking-[0.2em] text-orange-400">
                {step === "create-password" ? "CREATE PASSWORD" : "ZONE ADMIN SIGN-IN"}
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {step === "create-password" ? "Create your password" : "Sign in"}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {step === "create-password"
                  ? "Set your administrator password for zone " +
                    zoneInfo?.zoneIdCode +
                    "."
                  : "Enter your password to access your zone administration dashboard."}
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-5 border-red-500/30 bg-red-500/10">
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="p-0">
                {step === "create-password" ? (
                  <form onSubmit={handleCreatePassword} className="space-y-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="activate_email"
                        className="text-sm font-semibold text-slate-300"
                      >
                        Email address
                      </Label>

                      <div className="relative">
                        <Mail
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <Input
                          id="activate_email"
                          type="email"
                          value={email}
                          readOnly
                          className="h-12 rounded-xl border-slate-600 bg-slate-900 pl-11 text-sm text-white placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="activate_code"
                        className="text-sm font-semibold text-slate-300"
                      >
                        Activation code
                      </Label>

                      <div className="relative">
                        <LockKeyhole
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <Input
                          id="activate_code"
                          type="text"
                          autoComplete="off"
                          placeholder="Enter activation code"
                          value={activationCode}
                          onChange={(e) => setActivationCode(e.target.value)}
                          required
                          className="h-12 rounded-xl border-slate-600 bg-slate-900 pl-11 text-sm focus-visible:ring-[#f28c28] text-white placeholder-slate-500 uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="activate_password"
                        className="text-sm font-semibold text-slate-300"
                      >
                        Password
                      </Label>

                      <div className="relative">
                        <Input
                          id="activate_password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-12 rounded-xl border-slate-600 bg-slate-900 pl-11 pr-12 text-sm focus-visible:ring-[#f28c28] text-white placeholder-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="activate_confirm_password"
                        className="text-sm font-semibold text-slate-300"
                      >
                        Confirm password
                      </Label>

                      <div className="relative">
                        <Input
                          id="activate_confirm_password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="h-12 rounded-xl border-slate-600 bg-slate-900 pl-11 pr-12 text-sm focus-visible:ring-[#f28c28] text-white placeholder-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-12 w-full rounded-xl bg-orange-500 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400 disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4 animate-spin" />
                          Activating zone...
                        </>
                      ) : (
                        <>
                          Create password & activate zone
                          <ArrowRight size={17} className="ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordSignIn} className="space-y-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="signin_email"
                        className="text-sm font-semibold text-slate-300"
                      >
                        Email address
                      </Label>

                      <div className="relative">
                        <Mail
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <Input
                          id="signin_email"
                          type="email"
                          value={email}
                          readOnly
                          className="h-12 rounded-xl border-slate-600 bg-slate-900 pl-11 text-sm text-white placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="signin_password"
                        className="text-sm font-semibold text-slate-300"
                      >
                        Password
                      </Label>

                      <div className="relative">
                        <Input
                          id="signin_password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-12 rounded-xl border-slate-600 bg-slate-900 pl-11 pr-12 text-sm focus-visible:ring-[#f28c28] text-white placeholder-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-12 w-full rounded-xl bg-orange-500 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400 disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign in to zone dashboard
                          <ArrowRight size={17} className="ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <div className="mt-6 border-t border-slate-700 pt-6">
              {step === "create-password" ? (
                <div className="text-center">
                  <p className="text-xs text-slate-400">
                    Already have a password? Contact your HQ administrator if
                    you need a new activation code.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <input type="hidden" name="zone_id_code" value={zoneIdCode} />
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full text-sm text-slate-400 hover:text-white"
                  >
                    Forgot your password?
                  </Button>
                  <p className="text-xs text-slate-500 text-center">
                    A reset link will be sent to your registered email address.
                  </p>
                </form>
              )}
            </div>

            <div className="mt-9 border-t border-slate-700 pt-6 text-center">
              <p className="text-xs text-slate-400">
                © 2027 ITYPLC. All rights reserved.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
