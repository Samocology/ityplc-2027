import { Link } from "react-router";
import { PageContainer } from "@/components/shared/PageContainer";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Check,
  CheckCircle2,
  ArrowRight,
  Home,
  Mail,
  ClipboardCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Confirmation hero */}
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

        <PageContainer className="relative py-16 text-center sm:py-20 lg:py-24">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-400/10 shadow-[0_0_50px_rgba(52,211,153,0.12)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-[#101B35]">
              <Check className="h-7 w-7 stroke-[3]" />
            </div>
          </div>

          <Badge className="mt-7 border border-emerald-300/20 bg-emerald-400/10 px-4 py-1.5 text-emerald-300 hover:bg-emerald-400/10">
            <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
            Registration received
          </Badge>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            You're officially
            <span className="text-orange-400"> registered.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            Thank you for taking the first step towards ITYPLC 2027.
            We're glad to have you be part of this experience.
          </p>
        </PageContainer>
      </section>

      {/* Confirmation content */}
      <PageContainer className="relative -mt-5 pb-16 sm:pb-20">
        <div className="mx-auto max-w-3xl">
          <Card className="overflow-hidden rounded-[1.75rem] border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(16,27,53,0.25)]">
            <CardHeader className="px-6 pb-5 pt-7 sm:px-10 sm:pt-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>
                  <CardTitle className="text-xl font-bold tracking-tight text-[#101B35] sm:text-2xl">
                    Registration complete
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Your registration has been received successfully.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-8 sm:px-10 sm:pb-10">
              <Separator className="mb-7" />

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-emerald-900">
                      Thank you for registering
                    </h2>

                    <p className="mt-1 text-sm leading-7 text-emerald-800/80">
                      Your details have been submitted to the ITYPLC 2027
                      registration system. We appreciate your interest in
                      being part of the conference.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-9">
                <h2 className="text-lg font-bold text-[#101B35]">
                  What happens next?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Here are a few things to keep in mind after completing your
                  registration.
                </p>

                <div className="mt-6 space-y-5">
                  <NextStep
                    icon={<ClipboardCheck className="h-5 w-5" />}
                    title="Keep your registration details"
                    description="Keep a record of the information you submitted for future reference."
                    number="01"
                  />

                  <NextStep
                    icon={<Mail className="h-5 w-5" />}
                    title="Watch for conference updates"
                    description="Stay attentive to official ITYPLC communication for further information."
                    number="02"
                  />

                  <NextStep
                    icon={<ShieldCheck className="h-5 w-5" />}
                    title="Stay connected with your zone"
                    description="Follow relevant communication from your zone administrator or conference team."
                    number="03"
                  />
                </div>
              </div>

              <Separator className="my-8" />

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-12 flex-1 rounded-xl bg-[#101B35] text-sm font-semibold text-white hover:bg-[#1b2b4d]"
                >
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Return to homepage
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-12 flex-1 rounded-xl border-slate-200 text-sm font-semibold text-[#101B35] hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                >
                  <Link to="/faqs">
                    View FAQs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="mt-7 text-center text-xs leading-6 text-slate-400">
            ITYPLC 2027 · Thank you for being part of the journey.
          </p>
        </div>
      </PageContainer>
    </div>
  );
}

function NextStep({
  icon,
  title,
  description,
  number,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  number: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-orange-600">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-bold text-[#101B35]">{title}</h3>
          <span className="text-[10px] font-semibold tracking-wider text-slate-400">
            {number}
          </span>
        </div>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}