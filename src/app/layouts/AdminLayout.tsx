"use client";

import { NavLink, Outlet, useNavigate } from "react-router";
import { PageContainer } from "@/components/shared/PageContainer";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/authentication/use-auth";
import { LogOut, Shield, Building2 } from "lucide-react";

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

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (!isAuthenticated || !profile) {
    return null;
  }

  const roleLabel = profile.role === "hq_admin" ? "HQ Administrator" : "Zone Administrator";
  const zoneInfo = profile.zone_id ? `Zone: ${profile.zone_id}` : "All zones (HQ)";

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b bg-muted/40">
        <PageContainer className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <span className="font-semibold">{title}</span>
          </div>
          <nav aria-label="Admin" className="flex items-center gap-4 text-sm">
            <NavLink
              to={basePath}
              end
              className={({ isActive }) =>
                cn("text-muted-foreground hover:text-foreground", isActive && "text-foreground")
              }
            >
              Dashboard
            </NavLink>
            <NavLink to="/" className="text-muted-foreground hover:text-foreground">
              Public site
            </NavLink>
          </nav>
          <div className="flex items-center gap-3 border-l pl-3">
            <div className="hidden sm:block text-sm text-muted-foreground">
              <p className="font-medium">{roleLabel}</p>
              <p className="text-xs">{zoneInfo}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </PageContainer>
      </header>
      <main className="flex-1 py-8">
        <PageContainer>
          <Outlet />
        </PageContainer>
      </main>
    </div>
  );
}
