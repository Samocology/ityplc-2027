import { useState } from "react";
import { Link } from "react-router";
import { PageContainer } from "@/components/shared/PageContainer";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  MessageCircle,
  Sparkles,
} from "lucide-react";

type FAQ = {
  question: string;
  answer: string;
};

const FAQS: FAQ[] = [
  {
    question: "Who can attend ITYPLC 2027?",
    answer:
      "ITYPLC 2027 is open to teenagers, youth, pastors and leaders. All participants must register before attending.",
  },
  {
    question: "Do I need to register in advance?",
    answer:
      "Yes. Registration is required for all participants so we can plan zones, materials and space.",
  },
  {
    question: "How do I register?",
    answer:
      "Visit the Register page and complete the registration form. You will receive a confirmation once submitted.",
  },
  {
    question: "What is a KingsChat username?",
    answer:
      "An optional KingsChat username used for conference communication. You can provide it during registration.",
  },
  {
    question: "Can I change my zone after registering?",
    answer:
      "Contact your zone administrator or the conference team if you need to update your zone assignment.",
  },
  {
    question: "Is there a cost to attend?",
    answer:
      "Registration is free. Any optional costs will be communicated before the conference.",
  },
];

export function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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

        <PageContainer className="relative py-20 sm:py-24 lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-400/10 px-4 py-2 text-sm font-medium text-orange-300">
              <Sparkles className="h-4 w-4" />
              Here to help
            </div>

            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-white/50">
              ITYPLC 2027
            </p>

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-7xl">
              Questions?
              <span className="mt-2 block text-orange-400">
                We've got answers.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              Find helpful information about registration, attendance and
              getting ready for ITYPLC 2027. If you need more help, our contact
              page is just a step away.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#faq-list"
                className="inline-flex items-center gap-3 rounded-full bg-orange-500 px-7 py-4 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Browse questions
                <ArrowRight className="h-4 w-4" />
              </a>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5"
              >
                Contact the team
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
            <div>
              <p className="text-sm text-white/45">Questions covered</p>
              <p className="mt-2 text-lg font-semibold">6 helpful answers</p>
            </div>
            <div>
              <p className="text-sm text-white/45">Registration</p>
              <p className="mt-2 text-lg font-semibold">Requirements & process</p>
            </div>
            <div>
              <p className="text-sm text-white/45">Need more help?</p>
              <p className="mt-2 text-lg font-semibold">We're here to help</p>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* FAQ content */}
      <section id="faq-list" className="scroll-mt-24 py-20 sm:py-24">
        <PageContainer>
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            {/* Side introduction */}
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <CircleHelp className="h-6 w-6" />
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
                Frequently asked questions
              </p>

              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                Everything you need to know.
              </h2>

              <p className="mt-5 leading-8 text-muted-foreground">
                We've put together answers to common questions to help you
                understand how the conference works and what you need to do
                before attending.
              </p>

              <div className="mt-8 rounded-2xl border border-border bg-muted/40 p-5">
                <p className="text-sm font-semibold text-foreground">
                  Can't find what you're looking for?
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Reach out to the conference team and let them know how they
                  can help.
                </p>
                <Link
                  to="/contact"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 transition hover:text-orange-700"
                >
                  Get in touch
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Accordion */}
            <div className="space-y-3">
              {FAQS.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                  <article
                    key={faq.question}
                    className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                      isOpen
                        ? "border-orange-200 bg-orange-50/30 shadow-sm"
                        : "border-border bg-card hover:border-orange-200"
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      onClick={() =>
                        setOpenIndex(isOpen ? null : index)
                      }
                      className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-7 sm:py-6"
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition ${
                            isOpen
                              ? "bg-orange-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span
                          className={`text-sm font-semibold leading-6 sm:text-base ${
                            isOpen
                              ? "text-[#101B35]"
                              : "text-foreground"
                          }`}
                        >
                          {faq.question}
                        </span>
                      </div>

                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition duration-300 ${
                          isOpen
                            ? "rotate-180 bg-orange-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </button>

                    <div
                      id={`faq-answer-${index}`}
                      hidden={!isOpen}
                      className="px-5 pb-6 pl-[4.25rem] sm:px-7 sm:pb-7 sm:pl-[5.25rem]"
                    >
                      <div className="border-t border-orange-200/70 pt-4">
                        <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Contact CTA */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#101B35] px-6 py-14 text-center text-white sm:px-12 sm:py-16">
          <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border border-white/[0.08]" />
          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-orange-500/[0.08] blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400">
              <MessageCircle className="h-7 w-7" />
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
              We're happy to help
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Still have a question?
            </h2>

            <p className="mt-4 leading-7 text-white/60">
              If you need clarification or have a question that isn't covered
              here, get in touch with the conference team.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-3 rounded-full bg-orange-500 px-7 py-4 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Contact us
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5"
              >
                Register for ITYPLC 2027
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}