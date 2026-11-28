import { NavLink, Outlet } from "react-router";
import { PageContainer } from "@/components/shared/PageContainer";
import { cn } from "@/lib/utils";

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
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <PageContainer className="flex h-14 items-center justify-between">
          <NavLink to="/" className="font-semibold">
            ITYPLC 2027
          </NavLink>
          <nav aria-label="Main" className="flex items-center gap-4 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn("text-muted-foreground hover:text-foreground", isActive && "text-foreground")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </PageContainer>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6 text-sm text-muted-foreground">
        <PageContainer>ITYPLC 2027</PageContainer>
      </footer>
    </div>
  );
}
