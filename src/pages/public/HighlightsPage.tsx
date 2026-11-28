import { Link } from "react-router";
import { PageContainer } from "@/components/shared/PageContainer";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Mic2,
  Sparkles,
  Users,
  BookOpen,
  Handshake,
  Play,
} from "lucide-react";

type Highlight = {
  icon: React.ReactNode;
  number: string;
  title: string;
  description: string;
  accent: string;
};

const HIGHLIGHTS: Highlight[] = [
  {
    icon: <Users className="h-6 w-6" />,
    number: "01",
    title: "Community gatherings",
    description:
      "Teenagers, youth, pastors and leaders coming together from every zone, united by a shared desire to grow and connect.",
    accent: "bg-orange-50 text-orange-600",
  },
  {
    icon: <Mic2 className="h-6 w-6" />,
    number: "02",
    title: "Inspiring teaching",
    description:
      "Practical sessions on faith, leadership and community, creating opportunities to learn and gain fresh perspectives.",
    accent: "bg-blue-50 text-blue-700",
  },
  {
    icon: <Heart className="h-6 w-6" />,
    number: "03",
    title: "Lasting connections",
    description:
      "Friendships and partnerships formed through shared experiences, with relationships that continue beyond the conference.",
    accent: "bg-rose-50 text-rose-600",
  },
];

export function HighlightsPage() {
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
              Looking back, moving forward
            </div>

            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-white/50">
              ITYPLC conference memories
            </p>

            <h1 className="max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-7xl">
              Every gathering
              <span className="mt-2 block text-orange-400">
                leaves a mark.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              A celebration of the people, learning and connections that make
              ITYPLC special. Take a look at what the conference experience is
              all about as we look forward to 2027.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-orange-500 px-7 py-4 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Join ITYPLC 2027
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5"
              >
                About the conference
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
            <div>
              <p className="text-sm text-white/45">The people</p>
              <p className="mt-2 text-lg font-semibold">Community</p>
            </div>
            <div>
              <p className="text-sm text-white/45">The experience</p>
              <p className="mt-2 text-lg font-semibold">Learning & growth</p>
            </div>
            <div>
              <p className="text-sm text-white/45">The impact</p>
              <p className="mt-2 text-lg font-semibold">Lasting connections</p>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Introduction */}
      <section className="py-20 sm:py-24">
        <PageContainer>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
                More than an event
              </p>

              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                It's about what happens when people come together.
              </h2>
            </div>

            <div className="space-y-6 lg:pt-8">
              <p className="text-lg leading-8 text-muted-foreground">
                A conference is more than the sessions on a programme. It is
                also about the conversations, shared experiences and
                relationships that develop along the way.
              </p>

              <p className="leading-8 text-muted-foreground">
                ITYPLC brings teenagers, youth, pastors and leaders together
                from different zones. The experience creates room for
                encouragement, learning and meaningful connections.
              </p>

              <div className="flex items-start gap-4 border-l-2 border-orange-500 py-2 pl-5">
                <p className="font-medium leading-7 text-foreground">
                  The most meaningful moments are often the ones people carry
                  with them long after the gathering ends.
                </p>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Highlights */}
      <section className="bg-[#F7F8FA] py-20 sm:py-24 lg:py-28">
        <PageContainer>
          <div className="mb-14 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              The conference experience
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#101B35] sm:text-4xl">
              What makes it memorable?
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Three important parts of the experience that make these
              gatherings meaningful.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {HIGHLIGHTS.map((highlight) => (
              <HighlightCard
                key={highlight.number}
                {...highlight}
              />
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Gallery introduction */}
      <section className="py-20 sm:py-24">
        <PageContainer>
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
            <div className="grid lg:grid-cols-[1fr_0.9fr]">
              <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <BookOpen className="h-6 w-6" />
                </div>

                <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
                  Conference memories
                </p>

                <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                  Every story deserves to be remembered.
                </h2>

                <p className="mt-5 leading-8 text-muted-foreground">
                  Explore moments from ITYPLC gatherings through photographs,
                  videos and stories from the community.
                </p>

                <Link
                  to="/gallery"
                  className="group mt-8 inline-flex items-center gap-3 text-sm font-semibold text-orange-600 transition hover:text-orange-700"
                >
                  Explore the gallery
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-[#101B35] p-8 sm:min-h-[360px]">
                <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10" />
                <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full border border-white/10" />

                <div className="relative flex max-w-xs flex-col items-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-orange-400">
                    <Play className="ml-1 h-9 w-9" />
                  </div>

                  <h3 className="mt-7 text-xl font-bold text-white">
                    Moments worth sharing
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-white/55">
                    Photos, stories and highlights from the ITYPLC community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Looking forward */}
      <section className="relative overflow-hidden bg-[#101B35] py-20 text-white sm:py-24 lg:py-28">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full border border-white/[0.07]" />
        <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full border border-white/[0.07]" />
        <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-orange-500/[0.08] blur-3xl" />

        <PageContainer className="relative">
          <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-2xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400">
                <Handshake className="h-7 w-7" />
              </div>

              <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
                The next chapter
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
                Be part of what comes next.
              </h2>

              <p className="mt-5 max-w-xl leading-8 text-white/60">
                The next ITYPLC gathering is another opportunity to connect,
                learn and grow. We would love to have you be part of it.
              </p>

              <Link
                to="/register"
                className="group mt-9 inline-flex items-center gap-3 rounded-full bg-orange-500 px-7 py-4 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Register for ITYPLC 2027
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="hidden h-48 w-48 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] lg:flex">
              <div className="flex h-36 w-36 items-center justify-center rounded-full bg-orange-500/10">
                <Heart className="h-16 w-16 text-orange-400" />
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}

function HighlightCard({
  icon,
  number,
  title,
  description,
  accent,
}: Highlight) {
  return (
    <article className="group rounded-2xl border border-slate-200/80 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-slate-900/[0.04] sm:p-9">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent} transition group-hover:scale-105`}
        >
          {icon}
        </div>

        <span className="text-sm font-bold tracking-widest text-slate-300">
          {number}
        </span>
      </div>

      <h3 className="mt-8 text-xl font-bold text-[#101B35]">{title}</h3>

      <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
    </article>
  );
}