import { Link } from "react-router";
import { PageContainer } from "@/components/shared/PageContainer";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  ContactRound,
  FileCheck,
  Luggage,
  MapPin,
  NotebookPen,
  Package,
  ShieldCheck,
  Sparkles,
  Users,
  Waves,
} from "lucide-react";

export function PreparationPage() {
  const thingsToBring = [
    {
      icon: FileCheck,
      title: "Registration confirmation",
      description: "Keep your registration confirmation accessible.",
    },
    {
      icon: ShieldCheck,
      title: "Valid identification",
      description: "Bring a valid ID for identification when required.",
    },
    {
      icon: Luggage,
      title: "Comfortable clothing",
      description: "Choose comfortable clothing and shoes for the event.",
    },
    {
      icon: NotebookPen,
      title: "Notebook and pen",
      description: "Have something ready to capture useful notes and ideas.",
    },
    {
      icon: Waves,
      title: "Reusable water bottle",
      description: "Bring a reusable bottle to stay hydrated.",
    },
  ];

  const arrivalSteps = [
    {
      number: "01",
      title: "Plan your arrival",
      description:
        "Doors open 30 minutes before the first session. Plan your journey accordingly.",
    },
    {
      number: "02",
      title: "Complete check-in",
      description:
        "Head to the registration desk when you arrive for your check-in.",
    },
    {
      number: "03",
      title: "Get directed",
      description:
        "Zone leaders will be available to help direct you and answer questions.",
    },
  ];

  return (
    <div className="overflow-hidden bg-background">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#101B35] text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full border border-white/[0.08]" />
          <div className="absolute -right-16 -top-24 h-[22rem] w-[22rem] rounded-full border border-white/[0.08]" />
          <div className="absolute -bottom-48 -left-24 h-[32rem] w-[32rem] rounded-full border border-white/[0.06]" />
          <div className="absolute right-[15%] top-[15%] h-64 w-64 rounded-full bg-orange-500/10 blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>

        <PageContainer className="relative py-20 sm:py-24 lg:py-32">
          <div className="max-w-4xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-400/10 px-4 py-2 text-sm font-medium text-orange-300">
              <Sparkles className="h-4 w-4" />
              Your conference preparation guide
            </div>

            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-white/50">
              ITYPLC 2027
            </p>

            <h1 className="max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-7xl">
              Come prepared.
              <span className="mt-2 block text-orange-400">
                Make it meaningful.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              A little preparation goes a long way. Find out what to bring,
              what to expect when you arrive and how to get the information you
              need before ITYPLC 2027.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-orange-500 px-7 py-4 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Register for the conference
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>

              <a
                href="#what-to-bring"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5"
              >
                View preparation checklist
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="mt-16 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
            <div>
              <p className="text-sm text-white/45">Before you arrive</p>
              <p className="mt-2 text-lg font-semibold">Get prepared</p>
            </div>
            <div>
              <p className="text-sm text-white/45">At the venue</p>
              <p className="mt-2 text-lg font-semibold">Complete check-in</p>
            </div>
            <div>
              <p className="text-sm text-white/45">Need assistance?</p>
              <p className="mt-2 text-lg font-semibold">Contact your zone</p>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Introduction */}
      <section className="py-16 sm:py-20">
        <PageContainer>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
                Before the gathering
              </p>

              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                A smoother experience starts with preparation.
              </h2>
            </div>

            <div className="space-y-5 lg:pt-5">
              <p className="text-lg leading-8 text-muted-foreground">
                Whether this is your first time attending or you have been part
                of previous gatherings, knowing what to expect can make your
                experience easier.
              </p>

              <p className="leading-8 text-muted-foreground">
                Use this guide to prepare the essentials, understand the
                arrival process and know who to contact if you need assistance
                with your zone, travel or accommodation.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* What to bring */}
      <section
        id="what-to-bring"
        className="scroll-mt-24 bg-[#F7F8FA] py-20 sm:py-24"
      >
        <PageContainer>
          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <Package className="h-6 w-6" />
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
                Your checklist
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#101B35] sm:text-4xl">
                What to bring
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Get these essentials ready before making your way to the
                conference.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 sm:self-auto">
              <Check className="h-4 w-4 text-orange-600" />
              5 essentials
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {thingsToBring.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-slate-900/[0.04] sm:p-7"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>

                    <span className="text-sm font-bold tracking-widest text-slate-300">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="mt-7 font-bold text-[#101B35]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-7 flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50/70 p-5">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
            <p className="text-sm leading-7 text-slate-700">
              <span className="font-semibold text-[#101B35]">
                A quick reminder:
              </span>{" "}
              Keep your registration confirmation accessible so you can
              complete the check-in process more easily.
            </p>
          </div>
        </PageContainer>
      </section>

      {/* Arrival process */}
      <section className="py-20 sm:py-24">
        <PageContainer>
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#101B35] text-orange-400">
                <Clock3 className="h-6 w-6" />
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
                On the day
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Know what happens when you arrive.
              </h2>

              <p className="mt-5 leading-8 text-muted-foreground">
                From getting to the venue to completing registration, here is
                what you need to know about the arrival process.
              </p>

              <div className="mt-8 flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Clock3 className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Doors open
                  </p>
                  <p className="mt-1 font-bold text-foreground">
                    30 minutes before the first session
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {arrivalSteps.map((step, index) => (
                <div
                  key={step.number}
                  className="relative flex gap-5 rounded-2xl border border-border bg-card p-6 sm:p-7"
                >
                  {index !== arrivalSteps.length - 1 && (
                    <div className="absolute bottom-0 left-[3.15rem] top-[5.5rem] hidden w-px bg-border sm:block" />
                  )}

                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-sm font-bold text-orange-600">
                    {step.number}
                  </div>

                  <div className="pt-1">
                    <h3 className="text-lg font-bold text-foreground">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Who can attend */}
      <section className="bg-[#F7F8FA] py-20 sm:py-24">
        <PageContainer>
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
                Who can attend
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#101B35] sm:text-4xl">
                There is a place for you at ITYPLC 2027.
              </h2>

              <p className="mt-5 leading-8 text-slate-600">
                ITYPLC 2027 is open to teenagers, youth, pastors and leaders.
                All participants must complete registration before attending.
              </p>

              <Link
                to="/register"
                className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[#101B35] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#1B2B4D]"
              >
                Register now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="hidden h-48 w-48 items-center justify-center rounded-full border border-orange-200 bg-orange-50 lg:flex">
              <div className="flex h-36 w-36 items-center justify-center rounded-full bg-orange-100">
                <Users className="h-16 w-16 text-orange-600" />
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Zone contact */}
      <section className="py-20 sm:py-24">
        <PageContainer>
          <div className="relative overflow-hidden rounded-[2rem] bg-[#101B35] p-8 text-white sm:p-12 lg:p-14">
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border border-white/[0.08]" />
            <div className="absolute -right-10 -top-20 h-52 w-52 rounded-full border border-white/[0.08]" />
            <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-2xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
                  <ContactRound className="h-6 w-6" />
                </div>

                <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
                  Need assistance?
                </p>

                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Your zone can help you get ready.
                </h2>

                <p className="mt-5 leading-8 text-white/60">
                  If you have questions about travel, accommodation or your
                  zone assignment, reach out to your zone administrator for
                  guidance.
                </p>
              </div>

              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 lg:h-24 lg:w-24">
                <MapPin className="h-10 w-10 text-orange-400" />
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-border bg-card px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <Sparkles className="h-6 w-6" />
          </div>

          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to take the next step?
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-muted-foreground">
            Complete your registration and start getting ready for ITYPLC 2027.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="group inline-flex items-center gap-3 rounded-full bg-orange-500 px-7 py-4 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Get registered
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>

            <Link
              to="/faqs"
              className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-4 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Read the FAQs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}