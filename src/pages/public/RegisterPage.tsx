import { useNavigate } from "react-router";
import { RegistrationForm } from "@/features/registration/registration-form";
import { PageContainer } from "@/components/shared/PageContainer";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Users,
  Sparkles,
  ClipboardCheck,
} from "lucide-react";
import { Link } from "react-router";

export function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#101B35] text-white">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />

          <div className="absolute -right-24 -top-40 h-[26rem] w-[26rem] rounded-full border border-white/10" />
          <div className="absolute -right-10 -top-24 h-[19rem] w-[19rem] rounded-full border border-white/10" />
          <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        </div>

        <PageContainer className="relative py-12 sm:py-16 lg:py-20">
          <Link
            to="/"
            className="mb-9 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to homepage
          </Link>

          <div className="max-w-3xl">
            <Badge className="mb-5 border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-orange-300 hover:bg-orange-400/10">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              ITYPLC 2027
            </Badge>

            <h1 className="text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Your place in the
              <span className="text-orange-400"> experience.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Take the first step towards being part of ITYPLC 2027.
              Complete your registration details below to get started.
            </p>
          </div>
        </PageContainer>
      </section>

      {/* Registration content */}
      <PageContainer className="py-10 sm:py-14 lg:py-16">
        <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
          {/* Left information panel */}
          <aside className="space-y-6 lg:sticky lg:top-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                Registration
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#101B35] sm:text-3xl">
                Let's get you registered.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-500">
                We're looking forward to welcoming you. Provide the required
                information accurately so your registration can be properly
                recorded.
              </p>
            </div>

            <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <ClipboardCheck className="h-5 w-5" />
                </div>

                <CardTitle className="pt-2 text-base text-[#101B35]">
                  Before you begin
                </CardTitle>

                <CardDescription className="leading-6">
                  A few things to keep in mind when completing your
                  registration.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <InfoPoint>
                  Provide accurate personal information.
                </InfoPoint>

                <InfoPoint>
                  Complete all fields marked as required.
                </InfoPoint>

                <InfoPoint>
                  Review your information before submitting.
                </InfoPoint>
              </CardContent>
            </Card>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#101B35] text-orange-400">
                  <Users className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#101B35]">
                    Everyone is welcome
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    ITYPLC welcomes teenagers, youth, pastors and leaders.
                    Everyone attending is required to register.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 px-1">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <p className="text-xs leading-6 text-slate-500">
                Please ensure the details you submit are correct. Your
                information will be used for conference registration.
              </p>
            </div>
          </aside>

          {/* Form panel */}
          <Card className="overflow-hidden rounded-[1.5rem] border-slate-200 bg-white shadow-[0_20px_60px_-35px_rgba(16,27,53,0.25)]">
            <CardHeader className="space-y-3 border-b border-slate-100 bg-white px-5 py-6 sm:px-8 sm:py-8">
              <div className="flex items-center justify-between gap-3">
                <Badge
                  variant="outline"
                  className="border-orange-200 bg-orange-50 text-orange-700"
                >
                  Registration form
                </Badge>

                <span className="text-xs font-medium text-slate-400">
                  ITYPLC 2027
                </span>
              </div>

              <div>
                <CardTitle className="text-2xl font-bold tracking-tight text-[#101B35]">
                  Participant details
                </CardTitle>

                <CardDescription className="mt-2 text-sm leading-6">
                  Enter your information in the form below to register for
                  the conference.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="px-5 py-7 sm:px-8 sm:py-9">
              <RegistrationForm
                onSuccess={() => navigate("/register/success")}
              />

              <Separator className="my-7" />

              <div className="flex flex-col gap-3 text-xs leading-5 text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Review your details before submitting.</span>
                </div>

                <Link
                  to="/"
                  className="inline-flex items-center gap-1 font-medium text-slate-500 transition hover:text-orange-600"
                >
                  Back to homepage
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>

      {/* Footer strip */}
      <div className="border-t border-slate-200 bg-white">
        <PageContainer className="flex flex-col gap-2 py-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-xs text-slate-400">
            ITYPLC 2027 · Conference Registration
          </p>

          <p className="text-xs text-slate-400">
            Complete your registration to get started.
          </p>
        </PageContainer>
      </div>
    </div>
  );
}

function InfoPoint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
      <p className="text-sm leading-6 text-slate-600">{children}</p>
    </div>
  );
}