
import { Link } from "react-router";
import { PageContainer } from "@/components/shared/PageContainer";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Compass,
  Heart,
  Sparkles,
  Users,
  Waves,
  ChevronDown,
} from "lucide-react";

const highlights = [
  {
    number: "01",
    icon: BookOpen,
    title: "Meaningful teaching",
    description:
      "An opportunity to receive guidance, deepen understanding and grow in purpose.",
  },
  {
    number: "02",
    icon: Users,
    title: "Fellowship & connection",
    description:
      "Connect with others, build meaningful relationships and share experiences.",
  },
  {
    number: "03",
    icon: Compass,
    title: "Personal growth",
    description:
      "Discover opportunities to develop your values, perspective and direction.",
  },
];

const audiences = [
  "Teenagers",
  "Youth",
  "Pastors",
  "Leaders",
];

export function HomePage() {
  return (
    <main className="overflow-hidden bg-background">
      <PageContainer className="pb-16 pt-5 sm:pb-24 sm:pt-8 lg:pb-28">

        {/* HERO */}
        <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#101B35] text-white sm:rounded-[2.5rem]">
          {/* Decorative background */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-orange-500/20 blur-[100px]" />
            <div className="absolute -bottom-40 -left-20 h-[25rem] w-[25rem] rounded-full bg-blue-500/20 blur-[100px]" />

            <div className="absolute right-[12%] top-[15%] hidden h-64 w-64 rounded-full border border-white/[0.08] lg:block" />
            <div className="absolute right-[7%] top-[8%] hidden h-80 w-80 rounded-full border border-white/[0.06] lg:block" />

            <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:48px_48px]" />
          </div>

          <div className="relative grid min-h-[540px] items-center gap-12 px-6 py-16 sm:px-10 sm:py-20 lg:min-h-[620px] lg:grid-cols-[1.1fr_0.9fr] lg:px-16 lg:py-24">
            {/* Hero content */}
            <div className="max-w-2xl">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-orange-400" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-200 sm:text-xs">
                  The 2027 Conference
                </span>
              </div>

              <p className="mb-4 text-sm font-medium tracking-wide text-white/60 sm:text-base">
                A gathering for a generation with purpose.
              </p>

              <h1 className="text-[3.25rem] font-black leading-[0.98] tracking-[-0.065em] sm:text-7xl lg:text-[5.5rem]">
                ITYPLC
                <span className="mt-2 block text-orange-400">
                  2027<span className="text-white">.</span>
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-base leading-8 text-white/70 sm:text-lg">
                A dedicated conference experience for teenagers, youth,
                pastors and leaders. Come together for meaningful moments
                of learning, fellowship and personal growth.
              </p>

              <div className="mt-9 flex flex-col gap-3 min-[420px]:flex-row">
                <Link
                  to="/register"
                  className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-orange-500 px-7 text-sm font-bold text-white shadow-lg shadow-orange-950/20 transition-all duration-300 hover:-translate-y-1 hover:bg-orange-400"
                >
                  Register for 2027
                  <ArrowUpRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </Link>

                <Link
                  to="/about"
                  className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/[0.06] px-7 text-sm font-semibold text-white transition-all hover:bg-white/10"
                >
                  Discover the conference
                  <ArrowRight size={17} />
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-white/10 pt-7">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Users size={17} className="text-orange-400" />
                  <span>One gathering</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Heart size={17} className="text-orange-400" />
                  <span>Meaningful connections</span>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative mx-auto flex w-full max-w-[420px] items-center justify-center lg:ml-auto">
              <div className="relative aspect-[4/4.5] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#263858] via-[#192945] to-[#101B35] shadow-2xl shadow-black/30">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(249,115,22,0.25),transparent_60%)]" />

                <div className="absolute left-1/2 top-[12%] h-64 w-64 -translate-x-1/2 rounded-full border border-orange-300/20 sm:h-72 sm:w-72" />
                <div className="absolute left-1/2 top-[19%] h-48 w-48 -translate-x-1/2 rounded-full border border-orange-300/20 sm:h-56 sm:w-56" />

                <div className="absolute inset-x-0 top-[24%] flex flex-col items-center">
                  <Sparkles className="mb-5 text-orange-300" size={34} strokeWidth={1.4} />

                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">
                    A new year
                  </span>

                  <span className="mt-2 text-6xl font-black tracking-[-0.08em] text-white sm:text-7xl">
                    2027
                  </span>

                  <div className="mt-5 h-px w-20 bg-gradient-to-r from-transparent via-orange-400 to-transparent" />

                  <p className="mt-5 text-center text-xs font-semibold uppercase tracking-[0.25em] text-orange-200">
                    Purpose · Growth · Fellowship
                  </p>
                </div>

                {/* Abstract stage elements */}
                <div className="absolute bottom-0 left-0 right-0 h-[38%]">
                  <div className="absolute bottom-0 h-full w-full bg-gradient-to-t from-[#090F1D] via-[#111E35]/80 to-transparent" />

                  <div className="absolute bottom-0 left-1/2 h-28 w-[125%] -translate-x-1/2 rounded-[50%_50%_0_0] border-t border-orange-300/20 bg-[#172640]/80" />

                  <div className="absolute bottom-0 left-1/2 h-16 w-[110%] -translate-x-1/2 rounded-[50%_50%_0_0] border-t border-white/10 bg-[#101B35]" />
                </div>

                <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                      Welcome to
                    </p>
                    <p className="mt-1 text-lg font-bold tracking-tight text-white">
                      ITYPLC 2027
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md">
                    <Waves size={21} className="text-orange-300" />
                  </div>
                </div>
              </div>

              <div className="absolute -left-4 top-[24%] hidden rounded-2xl border border-white/10 bg-[#1D2B45]/90 p-4 shadow-xl backdrop-blur-md sm:block">
                <Sparkles className="text-orange-400" size={21} />
                <p className="mt-2 text-xs font-bold text-white">
                  Grow with purpose
                </p>
              </div>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/[0.035] px-6 py-5 sm:px-10 lg:px-16">
            <p className="text-xs font-medium tracking-wide text-white/50">
              ITYPLC 2027 · A conference experience
            </p>
            <a
              href="#about-conference"
              className="inline-flex items-center gap-2 text-xs font-bold text-orange-300 transition-colors hover:text-orange-200"
            >
              Explore below
              <ChevronDown size={15} />
            </a>
          </div>
        </section>

        {/* INTRODUCTION */}
        <section
          id="about-conference"
          className="grid gap-10 py-20 sm:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"
        >
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-9 bg-orange-500" />
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">
                About the conference
              </span>
            </div>

            <h2 className="max-w-md text-4xl font-black leading-[1.1] tracking-[-0.045em] text-foreground sm:text-5xl">
              More than a gathering.
              <span className="text-orange-500"> A meaningful experience.</span>
            </h2>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-base leading-8 text-muted-foreground sm:text-lg">
              ITYPLC 2027 brings together teenagers, youth, pastors and
              leaders in a shared conference experience. It creates room
              for learning, connection, reflection and growth.
            </p>

            <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
              Whether you are attending as a young person or coming as a
              leader, this is an opportunity to be part of something
              meaningful.
            </p>

            <Link
              to="/about"
              className="group mt-7 inline-flex w-fit items-center gap-3 border-b border-orange-500 pb-2 text-sm font-bold text-foreground transition-colors hover:text-orange-600"
            >
              Learn more about ITYPLC
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>

        {/* HIGHLIGHTS */}
        <section className="rounded-[2rem] bg-[#F5F6F8] px-6 py-16 dark:bg-[#151C29] sm:px-10 sm:py-20 lg:px-14">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-9 bg-orange-500" />
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">
                  The experience
                </span>
              </div>

              <h2 className="text-3xl font-black tracking-[-0.045em] text-foreground sm:text-4xl">
                What makes it meaningful?
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-muted-foreground">
              An opportunity to engage, connect and grow through a
              shared experience.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.number}
                  className="group relative overflow-hidden rounded-2xl border border-border/70 bg-background p-7 transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/50 hover:shadow-xl hover:shadow-orange-950/5 sm:p-8"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                      <Icon size={23} strokeWidth={1.8} />
                    </div>

                    <span className="text-xs font-bold tracking-widest text-muted-foreground/50">
                      {item.number}
                    </span>
                  </div>

                  <h3 className="mt-8 text-xl font-bold tracking-tight text-foreground">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {item.description}
                  </p>

                  <div className="mt-7 h-1 w-9 rounded-full bg-orange-500/60 transition-all duration-300 group-hover:w-16" />
                </article>
              );
            })}
          </div>
        </section>

        {/* WHO SHOULD ATTEND */}
        <section className="grid gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-9 bg-orange-500" />
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">
                Everyone has a place
              </span>
            </div>

            <h2 className="max-w-lg text-4xl font-black leading-[1.1] tracking-[-0.05em] text-foreground sm:text-5xl">
              A gathering for every generation.
            </h2>

            <p className="mt-6 max-w-lg text-base leading-8 text-muted-foreground">
              ITYPLC 2027 welcomes different generations and roles into
              one shared experience. There is room to participate,
              connect and be part of the conference.
            </p>

            <Link
              to="/preparation"
              className="group mt-8 inline-flex items-center gap-3 text-sm font-bold text-foreground hover:text-orange-600"
            >
              Prepare for the conference
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {audiences.map((audience, index) => (
              <div
                key={audience}
                className={`flex min-h-36 flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:border-orange-400/60 sm:min-h-44 sm:p-7 ${
                  index === 1 || index === 2
                    ? "bg-[#101B35] text-white dark:bg-[#202D45]"
                    : ""
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <Users size={20} />
                </div>

                <div>
                  <p className="text-lg font-bold tracking-tight sm:text-xl">
                    {audience}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Welcome to ITYPLC 2027
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PREPARATION */}
        <section className="relative overflow-hidden rounded-[2rem] bg-[#F5F6F8] p-7 dark:bg-[#151C29] sm:p-10 lg:p-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-3">
                <CalendarDays size={18} className="text-orange-500" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                  Get ready
                </span>
              </div>

              <h2 className="text-3xl font-black tracking-[-0.045em] text-foreground sm:text-4xl">
                Make your preparation count.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                Find important conference information, preparation
                guidance and updates to help you get ready for ITYPLC 2027.
              </p>
            </div>

            <Link
              to="/preparation"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#101B35] px-7 text-sm font-bold text-white transition-all hover:-translate-y-1 hover:bg-[#263858] dark:bg-orange-500 dark:hover:bg-orange-400"
            >
              Explore preparation
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative mt-20 overflow-hidden rounded-[2rem] bg-[#101B35] px-6 py-16 text-center text-white sm:mt-28 sm:px-12 sm:py-24">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-orange-500/20 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-blue-500/20 blur-[90px]" />

          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-orange-400">
              <Sparkles size={27} />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-300">
              ITYPLC 2027
            </p>

            <h2 className="mt-5 text-4xl font-black leading-[1.08] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              Be part of the
              <span className="block text-orange-400">
                experience.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-white/65 sm:text-base">
              Take the next step and register your interest in being
              part of ITYPLC 2027.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 min-[420px]:flex-row">
              <Link
                to="/register"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-orange-500 px-8 text-sm font-bold text-white transition-all hover:-translate-y-1 hover:bg-orange-400"
              >
                Register now
                <ArrowUpRight size={18} />
              </Link>

              <Link
                to="/faqs"
                className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/20 px-8 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Frequently asked questions
              </Link>
            </div>
          </div>
        </section>

      </PageContainer>
    </main>
  );
}
