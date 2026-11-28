
"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Shield, User } from "lucide-react";

import { useAuth } from "@/features/authentication/use-auth";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, profile, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session && profile?.role === "hq_admin") {
      navigate("/hq", { replace: true });
    }
  }, [session, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);

      await new Promise((resolve) => setTimeout(resolve, 100));

      if (profile?.role === "hq_admin") {
        navigate("/hq", { replace: true });
      } else {
        setError("Access denied. This login is for HQ administrators only.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#14213a] p-3 sm:p-5 lg:p-7">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1500px] overflow-hidden rounded-3xl bg-[#0f172a] shadow-[0_20px_80px_rgba(0,0,0,0.4)] sm:min-h-[calc(100vh-40px)] lg:grid-cols-[1.08fr_0.92fr] lg:rounded-[30px]">

        {/* LEFT: ADMIN BRANDING SHOWCASE */}
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
                ADM
              </div>
              <div>
                <p className="text-sm font-bold tracking-[0.16em] text-orange-400">
                  ITYPLC 2027
                </p>
                <p className="mt-0.5 text-[10px] tracking-[0.18em] text-white/55">
                  ADMINISTRATOR LOGIN
                </p>
              </div>
            </div>

            <span className="hidden rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-[10px] font-semibold tracking-[0.15em] text-orange-300 sm:block">
              ADMIN ACCESS
            </span>
          </div>

          <div className="relative z-10 my-14 max-w-xl lg:my-0">
            <div className="animate-in fade-in duration-700">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-[2px] w-8 bg-orange-500" />
                <span className="text-xs font-bold tracking-[0.22em] text-orange-400">
                  HEADQUARTERS
                </span>
              </div>

              <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-orange-500/20 bg-orange-900/30 text-4xl text-orange-400 backdrop-blur-sm">
                <Shield size={28} />
              </div>

              <h1 className="whitespace-pre-line text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[58px]">
                Admin Sign-In
              </h1>

              <p className="mt-6 max-w-md text-sm leading-7 text-white/65 sm:text-base">
                Secure sign-in for conference headquarters administrators.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5">
            <p className="text-xs text-white/45">
              Centralized conference administration
            </p>
            <p className="text-xs font-semibold tracking-widest text-white/45">
              ADMIN
            </p>
          </div>
        </section>

        {/* RIGHT: ADMIN LOGIN FORM */}
        <section className="flex items-center justify-center bg-[#0f172a] px-6 py-12 sm:px-12 lg:px-14 xl:px-20">
          <div className="w-full max-w-[410px]">
            <div className="mb-9">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                <User size={23} />
              </div>

              <p className="mb-3 text-xs font-bold tracking-[0.2em] text-orange-400">
                HEADQUARTERS ADMIN
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Admin sign-in
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Sign in to access your ITYPLC headquarters administration
                dashboard.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-5 border-red-500/30 bg-red-500/10">
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="admin_email"
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
                        id="admin_email"
                        type="email"
                        placeholder="admin@ityplc2027.org"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 rounded-xl border-slate-600 bg-slate-900 pl-11 text-sm focus-visible:ring-[#f28c28] text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="admin_password"
                        className="text-sm font-semibold text-slate-300"
                      >
                        Password
                      </Label>
                    </div>

                    <div className="relative">
                      <LockKeyhole
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <Input
                        id="admin_password"
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
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
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
                        Sign in to admin dashboard
                        <ArrowRight size={17} className="ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

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
