import { NavLink, Outlet } from "react-router";
import { PageContainer } from "@/components/shared/PageContainer";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Menu, X, ChevronRight } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About", end: false },
  { to: "/preparation", label: "Prepare", end: false },
  { to: "/faqs", label: "FAQs", end: false },
  { to: "/highlights", label: "Highlights", end: false },
  { to: "/contact", label: "Contact", end: false },
  { to: "/register", label: "Register", end: false },
  { to: "/login", label: "Sign in", end: false },
];

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-background/80 backdrop-blur-md">
        <PageContainer className="flex h-16 items-center justify-between gap-4">
          <NavLink
            to="/"
            className="flex items-center gap-2 font-black tracking-tighter text-foreground"
          >
            <span className="text-primary">ITYPLC</span>
            <span className="text-muted-foreground">2027</span>
          </NavLink>

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors",
                    isActive
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                      : "hover:bg-muted/50",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden inline-flex items-center justify-center p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </PageContainer>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" />
          <div className="relative w-full max-w-md flex-1 bg-background border-l shadow-2xl transform transition-transform">
            <div className="flex items-center justify-between px-6 py-5 border-b border-muted/20">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Menu
              </h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="px-6 py-4 space-y-1" aria-label="Mobile menu">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between w-full px-4 py-3.5 text-sm font-medium rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors",
                      isActive && "bg-orange-500 text-white shadow-lg shadow-orange-500/30",
                    )
                  }
                >
                  {item.label}
                  <ChevronRight className="w-4 h-4 opacity-50 ml-2" />
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-muted/20 py-8 text-sm text-muted-foreground">
        <PageContainer className="flex items-center justify-between">
          <span>ITYPLC 2027</span>
        </PageContainer>
      </footer>
    </div>
  );
}
