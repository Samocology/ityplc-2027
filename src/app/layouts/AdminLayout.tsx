"use client";

import { NavLink, Outlet, useNavigate } from "react-router";
import { PageContainer } from "@/components/shared/PageContainer";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/features/authentication/use-auth";
import { LogOut, Shield, Building2, Menu, X } from "lucide-react";

type AdminArea = "hq" | "zone";

const areaConfig: Record<AdminArea, { title: string; basePath: string; icon: React.ReactNode }> = {
  hq: {
    title: "HQ Administration",
    basePath: "/hq",
    icon: <Shield className="w-4 h-4" />,
  },
  zone: {
    title: "Zone Administration",
    basePath: "/zone",
    icon: <Building2 className="w-4 h-4" />,
  },
};

export function AdminLayout({ area }: { area: AdminArea }) {
  const { title, basePath, icon } = areaConfig[area];
  const { profile, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (!isAuthenticated || !profile) {
    return null;
  }

  const roleLabel = profile.role === "hq_admin" ? "HQ Administrator" : "Zone Administrator";

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b border-muted/20 bg-background/80 backdrop-blur-md">
        <PageContainer className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {icon}
            <span className="font-black tracking-tighter text-foreground">{title}</span>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <NavLink
              to={basePath}
              end
              className={({ isActive }) =>
                cn(
                  "px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors",
                  isActive
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                    : "hover:bg-muted/50",
                )
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors",
                  isActive
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                    : "hover:bg-muted/50",
                )
              }
            >
              Public site
            </NavLink>
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
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">{title}</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="px-6 py-4 space-y-1" aria-label="Mobile admin menu">
              <NavLink
                to={basePath}
                end
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between w-full px-4 py-3.5 text-sm font-medium rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors",
                    isActive && "bg-orange-500 text-white shadow-lg shadow-orange-500/30",
                  )
                }
              >
                Dashboard
                <span className="w-4 h-4 opacity-50 ml-2" />
              </NavLink>
              <NavLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between w-full px-4 py-3.5 text-sm font-medium rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors",
                    isActive && "bg-orange-500 text-white shadow-lg shadow-orange-500/30",
                  )
                }
              >
                Public site
                <span className="w-4 h-4 opacity-50 ml-2" />
              </NavLink>
            </nav>
            <div className="px-6 py-4 border-t border-muted/20">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Account</p>
              <div className="flex items-center gap-3 text-sm">
                <p className="font-medium">{roleLabel}</p>
              </div>
              {profile.zone_id && (
                <p className="text-xs text-muted-foreground mt-1">Zone: {profile.zone_id}</p>
              )}
              <button
                onClick={handleSignOut}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 py-8">
        <PageContainer>
          <Outlet />
        </PageContainer>
      </main>
    </div>
  );
}
