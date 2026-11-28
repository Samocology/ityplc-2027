import { Link } from "react-router";
import { PageContainer } from "@/components/shared/PageContainer";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Heart,
  MapPin,
  Sparkles,
  Users,
  Compass,
  GraduationCap,
  Handshake,
  Lightbulb,
} from "lucide-react";

export function AboutPage() {
  const expectations = [
    {
      number: "01",
      icon: BookOpen,
      title: "Inspiring teaching",
      description:
        "Engage with meaningful teaching and practical sessions designed to encourage spiritual and personal growth.",
    },
    {
      number: "02",
      icon: Handshake,
      title: "Meaningful connections",
      description:
        "Meet teenagers, young people, pastors and leaders, and build relationships that extend beyond the conference.",
    },
    {
      number: "03",
      icon: Lightbulb,
      title: "Practical learning",
      description:
        "Explore ideas, insights and resources that can be applied to everyday life and ministry.",
    },
    {
      number: "04",
      icon: Heart,
      title: "A welcoming community",
      description:
        "Be part of an environment where people from different backgrounds can learn, participate and grow together.",
    },
  ];

  const audiences = [
    {
      icon: GraduationCap,
      title: "Teenagers",
      description:
        "Discover purpose, build confidence and develop a strong foundation for the future.",
    },
    {
      icon: Users,
      title: "Young people",
      description:
        "Grow in faith, strengthen relationships and gain perspective for the journey ahead.",
    },
    {
      icon: BookOpen,
      title: "Pastors",
      description:
        "Find encouragement, fresh perspectives and resources for effective youth ministry.",
    },
    {
      icon: Compass,
      title: "Leaders",
      description:
        "Connect with others and explore ways to support and equip the next generation.",
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
              Getting to know ITYPLC
            </div>

            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-white/50">
              ITYPLC 2027
            </p>

            <h1 className="max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-7xl">
              More than a conference.
              <span className="mt-2 block text-orange-400">
                A place to grow.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              A gathering for teenagers, youth, pastors and leaders, centred
              on growth, learning, faith and meaningful community.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-orange-500 px-7 py-4 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Be part of it
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/preparation"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5"
              >
                Prepare for the conference
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
            <div>
              <p className="text-sm text-white/45">The gathering</p>
              <p className="mt-2 text-lg font-semibold">ITYPLC 2027</p>
            </div>
            <div>
              <p className="text-sm text-white/45">Who it's for</p>
              <p className="mt-2 text-lg font-semibold">
                Teenagers, youth & leaders
              </p>
            </div>
            <div>
              <p className="text-sm text-white/45">What it's about</p>
              <p className="mt-2 text-lg font-semibold">
                Growth, learning & community
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Introduction */}
      <section className="py-20 sm:py-24 lg:py-28">
        <PageContainer>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
                About the conference
              </p>
              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Creating room for the next generation to thrive.
              </h2>
            </div>

            <div className="space-y-6 lg:pt-8">
              <p className="text-lg leading-8 text-muted-foreground">
                ITYPLC 2027 is a conference created for teenagers, young people,
                pastors and leaders. It brings people together around a shared
                desire to learn, grow and build a stronger sense of community.
              </p>

              <p className="leading-8 text-muted-foreground">
                Beyond gathering in one place, the conference is an opportunity
                to encounter fresh perspectives, engage in meaningful
                conversations and develop relationships with people who share
                a commitment to the growth of the next generation.
              </p>

              <div className="flex items-start gap-4 border-l-2 border-orange-500 py-2 pl-5">
                <p className="text-base font-medium leading-7 text-foreground">
                  Growth should not end when a conference does. The goal is to
                  carry what is learned into everyday life and the communities
                  we serve.
                </p>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* What to expect */}
      <section className="bg-[#F7F8FA] py-20 sm:py-24 lg:py-28">
        <PageContainer>
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
                The experience
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#101B35] sm:text-4xl">
                What to expect
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                Every part of the experience is an opportunity to learn,
                connect and take something meaningful forward.
              </p>
            </div>

            <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 md:flex">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {expectations.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.number}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-slate-900/[0.04] sm:p-9"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-bold tracking-widest text-slate-300">
                      {item.number}
                    </span>
                  </div>

                  <h3 className="mt-8 text-xl font-bold text-[#101B35]">
                    {item.title}
                  </h3>

                  <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* Who should attend */}
      <section className="py-20 sm:py-24 lg:py-28">
        <PageContainer>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              Everyone has a place
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Who is ITYPLC for?
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              The conference welcomes different generations and roles, bringing
              them together around a shared commitment to growth.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((person) => {
              const Icon = person.icon;

              return (
                <div
                  key={person.title}
                  className="rounded-2xl border border-border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-900/[0.04]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#101B35] text-orange-400">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-foreground">
                    {person.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {person.description}
                  </p>
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* Vision */}
      <section className="relative overflow-hidden bg-[#101B35] py-20 text-white sm:py-24 lg:py-28">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full border border-white/[0.07]" />
        <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full border border-white/[0.07]" />
        <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-orange-500/[0.08] blur-3xl" />

        <PageContainer className="relative">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400">
                <Compass className="h-7 w-7" />
              </div>

              <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
                Our vision
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Looking beyond 2027.
              </h2>
            </div>

            <div>
              <p className="text-xl leading-9 text-white/80 sm:text-2xl sm:leading-10">
                To equip the next generation with faith, leadership and a sense
                of community that lasts beyond the conference.
              </p>

              <div className="mt-8 h-px w-full bg-white/15" />

              <p className="mt-7 max-w-xl text-sm leading-8 text-white/55">
                We believe the impact of a meaningful gathering should continue
                long after everyone goes home. The lessons, relationships and
                experiences should become part of how people live, lead and
                serve.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Conference information */}
      <section className="py-20 sm:py-24">
        <PageContainer>
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              Plan ahead
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Conference information
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Important details to help you plan for ITYPLC 2027.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <InfoCard
              icon={<Users className="h-6 w-6" />}
              title="Who it's for"
              description="Teenagers, youth, pastors and leaders from every zone."
            />

            <InfoCard
              icon={<CalendarDays className="h-6 w-6" />}
              title="Conference dates"
              description="The official ITYPLC 2027 dates and programme schedule will be shared through the conference information channels."
            />

            <InfoCard
              icon={<MapPin className="h-6 w-6" />}
              title="Venue"
              description="Venue and attendance details will be communicated to registered participants."
            />
          </div>
        </PageContainer>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-orange-500 px-6 py-14 text-center text-white sm:px-12 sm:py-20">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-100">
              Your journey starts here
            </p>

            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">
              Be part of something meaningful.
            </h2>

            <p className="mt-5 leading-7 text-white/85">
              Join the gathering. Connect with others. Make room for growth.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                to="/register"
                className="group inline-flex items-center gap-3 rounded-full bg-[#101B35] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#1B2B4D]"
              >
                Register for ITYPLC 2027
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/faqs"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Frequently asked questions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-7 transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg hover:shadow-slate-900/[0.04]">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
        {icon}
      </div>

      <h3 className="mt-6 text-lg font-bold text-foreground">{title}</h3>

      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}