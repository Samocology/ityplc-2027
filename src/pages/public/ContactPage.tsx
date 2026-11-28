import { PageContainer } from "@/components/shared/PageContainer";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  MessageSquare,
  Send,
  Clock3,
  Headphones,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(2, "Please enter a subject"),
  message: z.string().min(10, "Your message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const [submitted, setSubmitted] = useState(false);

  const onSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <PageContainer className="py-16 sm:py-20">
        <div className="mx-auto max-w-xl">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_70px_-35px_rgba(16,27,53,0.2)]">
            <div className="relative overflow-hidden bg-[#101B35] px-6 py-12 text-center text-white sm:px-10">
              <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/10" />
              <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border border-white/10" />
              <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-orange-500/10 blur-2xl" />

              <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/15 ring-1 ring-emerald-300/30">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>

              <p className="relative mb-3 text-xs font-bold uppercase tracking-[0.22em] text-orange-300">
                Message received
              </p>

              <h1 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
                Thank you for reaching out.
              </h1>

              <p className="relative mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-300">
                We appreciate you getting in touch with the ITYPLC 2027 team.
                Your message has been submitted.
              </p>
            </div>

            <div className="px-6 py-8 text-center sm:px-10">
              <p className="text-sm leading-7 text-slate-500">
                We look forward to connecting with you. You can return to the
                conference website whenever you're ready.
              </p>

              <Link
                to="/"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#101B35] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#1b2b4d] sm:w-auto"
              >
                Return to homepage
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <div className="overflow-hidden bg-[#F7F8FA]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#101B35] text-white">
        <div className="absolute inset-0 opacity-[0.07]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full border border-white/[0.08]" />
        <div className="absolute -right-16 -top-24 h-[20rem] w-[20rem] rounded-full border border-white/[0.08]" />
        <div className="absolute -bottom-40 -left-20 h-[24rem] w-[24rem] rounded-full bg-orange-500/10 blur-3xl" />

        <PageContainer className="relative py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                We're here to help
              </span>
            </div>

            <h1 className="max-w-2xl text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Let's start a
              <span className="text-orange-400"> conversation.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Have a question about ITYPLC 2027, registration, or what to
              expect? We'd love to hear from you. Reach out and let's help you
              find the answers you need.
            </p>
          </div>
        </PageContainer>
      </section>

      {/* Contact section */}
      <PageContainer className="relative py-14 sm:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
          {/* Contact information */}
          <aside className="lg:sticky lg:top-8">
            <div className="mb-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                Get in touch
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-[#101B35] sm:text-4xl">
                We're only a message away.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                Whether you're attending, supporting, or simply looking to
                learn more, the conference team is here to help.
              </p>
            </div>

            <div className="space-y-4">
              <ContactItem
                icon={<Mail className="h-5 w-5" />}
                label="Email"
                value="contact@ityplc.org"
                href="mailto:contact@ityplc.org"
                description="Send us your questions"
              />

              <ContactItem
                icon={<Phone className="h-5 w-5" />}
                label="Phone"
                value="+1 (555) 000-0000"
                href="tel:+15550000000"
                description="Speak with the team"
              />

              <ContactItem
                icon={<MapPin className="h-5 w-5" />}
                label="Office"
                value="Conference Headquarters"
                description="ITYPLC conference office"
              />
            </div>

            <div className="mt-7 rounded-2xl border border-orange-100 bg-orange-50/70 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                  <Headphones className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#101B35]">
                    Need help with registration?
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    If you have questions about signing up or your registration
                    details, send us a message and let us know how we can help.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
              <Clock3 className="h-4 w-4 text-orange-500" />
              <span>We look forward to hearing from you.</span>
            </div>
          </aside>

          {/* Contact form */}
          <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_16px_55px_-35px_rgba(16,27,53,0.22)] sm:p-9 lg:p-10">
            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <MessageSquare className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#101B35] sm:text-2xl">
                  Send us a message
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Fill in the details below and tell us what's on your mind.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Your name"
                  htmlFor="name"
                  error={errors.name?.message}
                >
                  <input
                    id="name"
                    autoComplete="name"
                    {...register("name")}
                    aria-invalid={!!errors.name}
                    className={inputClass(!!errors.name)}
                    placeholder="Enter your full name"
                  />
                </FormField>

                <FormField
                  label="Email address"
                  htmlFor="email"
                  error={errors.email?.message}
                >
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                    className={inputClass(!!errors.email)}
                    placeholder="you@example.com"
                  />
                </FormField>
              </div>

              <FormField
                label="Subject"
                htmlFor="subject"
                error={errors.subject?.message}
              >
                <input
                  id="subject"
                  {...register("subject")}
                  aria-invalid={!!errors.subject}
                  className={inputClass(!!errors.subject)}
                  placeholder="What would you like to discuss?"
                />
              </FormField>

              <FormField
                label="Your message"
                htmlFor="message"
                error={errors.message?.message}
              >
                <textarea
                  id="message"
                  rows={6}
                  {...register("message")}
                  aria-invalid={!!errors.message}
                  className={`${inputClass(!!errors.message)} min-h-[160px] resize-y`}
                  placeholder="Write your message here..."
                />
                <p className="mt-2 text-xs text-slate-400">
                  Please provide enough detail so we can better understand
                  your enquiry.
                </p>
              </FormField>

              <div className="border-t border-slate-100 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F28C28] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/15 transition hover:-translate-y-0.5 hover:bg-[#df7818] hover:shadow-orange-500/25 disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
                >
                  {isSubmitting ? "Sending..." : "Send message"}
                  <Send className="h-4 w-4" />
                </button>

                <p className="mt-4 text-xs leading-5 text-slate-400">
                  By submitting this form, you are contacting the ITYPLC 2027
                  conference team.
                </p>
              </div>
            </form>
          </section>
        </div>
      </PageContainer>

      {/* Closing section */}
      <section className="bg-white">
        <PageContainer className="py-14 sm:py-16">
          <div className="flex flex-col justify-between gap-6 rounded-[1.75rem] bg-[#101B35] px-6 py-9 text-white sm:px-10 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
                Be part of the experience
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Your next chapter could start here.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Explore the conference and take the next step towards being
                part of ITYPLC 2027.
              </p>
            </div>

            <Link
              to="/register"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-4 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Register for ITYPLC 2027
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-xl border bg-slate-50/70 px-4 py-3.5 text-sm text-[#101B35]",
    "placeholder:text-slate-400 transition",
    "focus:bg-white focus:outline-none focus:ring-4",
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200 focus:border-orange-400 focus:ring-orange-100",
  ].join(" ");
}

function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-semibold text-[#101B35]"
      >
        {label}
      </label>

      {children}

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:border-orange-200 hover:shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#101B35] text-orange-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>

        {href ? (
          <a
            href={href}
            className="mt-0.5 block break-words text-sm font-bold text-[#101B35] transition hover:text-orange-600"
          >
            {value}
          </a>
        ) : (
          <p className="mt-0.5 text-sm font-bold text-[#101B35]">{value}</p>
        )}

        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}