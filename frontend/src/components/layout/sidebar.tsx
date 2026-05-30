import Link from "next/link";
import { Home, Calendar, FileText, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar({ role = "employee" }: { role?: "employee" | "manager" | "admin" }) {
  const routes = [
    { label: "Overview", icon: Home, href: "/dashboard", roles: ["employee", "manager", "admin"] },
    { label: "Attendance", icon: Calendar, href: "/dashboard/attendance", roles: ["employee", "manager"] },
    { label: "Team", icon: Users, href: "/dashboard/team", roles: ["manager", "admin"] },
    { label: "Payslips", icon: FileText, href: "/dashboard/payslips", roles: ["employee", "manager", "admin"] },
    { label: "Settings", icon: Settings, href: "/dashboard/settings", roles: ["admin"] },
  ];

  const visibleRoutes = routes.filter(route => route.roles.includes(role));

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-50 px-3 py-4">
      <div className="mb-8 px-4 text-xl font-bold tracking-tight">SweldoTrack</div>
      <nav className="flex flex-1 flex-col gap-1">
        {visibleRoutes.map((route) => (
          <Button key={route.href} variant="ghost" className="justify-start gap-3" render={<Link href={route.href} />}>
            <route.icon className="h-4 w-4" />
            {route.label}
          </Button>
        ))}
      </nav>
    </div>
  );
}
