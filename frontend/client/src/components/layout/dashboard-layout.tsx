import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderKanban, ScrollText, LogOut, Vote, Award } from "lucide-react";

type Role = "creator" | "participant";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: Role;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [location] = useLocation();

  const creatorLinks = [
    { href: "/creator/projects", label: "Projects", icon: FolderKanban },
    { href: "/creator/quests", label: "Quests", icon: ScrollText },
  ];

  const participantLinks = [
    { href: "/participant/dashboard", label: "Active Polls", icon: Vote },
    { href: "/participant/rewards", label: "My Rewards", icon: Award },
  ];

  const links = role === "creator" ? creatorLinks : participantLinks;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/">
            <h1 className="text-2xl font-display font-bold text-gradient cursor-pointer">
              ClarityVote
            </h1>
          </Link>
          <div className="mt-2 text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {role} Workspace
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            
            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group cursor-pointer",
                    isActive
                      ? "bg-sidebar-primary/10 text-sidebar-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-sidebar-primary" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")} />
                  <span className="font-medium">{link.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary shadow-[0_0_8px_rgba(var(--sidebar-primary),0.5)]" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-sidebar-border">
          <Link href="/role-selection">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Switch Role</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile Header (Visible only on small screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background z-50 flex items-center justify-between px-4">
          <span className="font-bold">ClarityVote</span>
          {/* Mobile menu trigger would go here */}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-6 md:p-10 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
