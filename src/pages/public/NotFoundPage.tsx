
import { Link } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Home,
  SearchX,
} from "lucide-react";

import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <main className="relative flex min-h-[calc(100vh-80px)] items-center overflow-hidden bg-[#f7f8fa] py-16">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-orange-100/60 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-blue-100/60 blur-3xl" />

        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(#101b35_1px,transparent_1px),linear-gradient(90deg,#101b35_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <PageContainer className="relative z-10">
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Visual */}
          <div className="relative flex items-center justify-center">
            <div className="relative flex aspect-square w-full max-w-[420px] items-center justify-center">
              <div className="absolute inset-8 rounded-full border border-slate-200" />
              <div className="absolute inset-16 rounded-full border border-slate-200 border-dashed" />

              <div className="absolute left-10 top-12 flex h-14 w-14 items-center justify-center rounded-2xl border border-white bg-white shadow-lg">
                <Compass className="h-6 w-6 text-[#f28c28]" />
              </div>

              <div className="absolute bottom-16 right-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white bg-white shadow-lg">
                <SearchX className="h-7 w-7 text-[#172746]" />
              </div>

              <div className="relative flex flex-col items-center">
                <span className="text-[clamp(6rem,16vw,11rem)] font-black leading-none tracking-[-0.1em] text-[#14213a]">
                  404
                </span>
                <div className="mt-4 flex items-center gap-2">
                  <span className="h-1.5 w-8 rounded-full bg-[#f28c28]" />
                  <span className="text-xs font-bold tracking-[0.25em] text-slate-400">
                    LOST YOUR WAY?
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-lg text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-[#f28c28]" />
              <span className="text-xs font-bold tracking-[0.15em] text-[#bd6819]">
                ITYPLC 2027
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#14213a] sm:text-5xl">
              Looks like you've taken a wrong turn.
            </h1>

            <p className="mt-6 text-base leading-8 text-slate-500">
              The page you're trying to reach may have moved, been removed,
              or never existed. Don't worry, there's still plenty to explore.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button
                asChild
                className="h-12 rounded-xl bg-[#f28c28] px-6 font-semibold text-white shadow-lg shadow-orange-500/15 hover:bg-[#df791b]"
              >
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to homepage
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-12 rounded-xl border-slate-200 bg-white px-6 font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Link to="/about">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Explore ITYPLC
                </Link>
              </Button>
            </div>

            <div className="mt-12 border-t border-slate-200 pt-6">
              <p className="text-xs leading-6 text-slate-400">
                Still having trouble? Return to the homepage and continue
                exploring the ITYPLC 2027 experience.
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
