# Frontend Dashboards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build role-based Next.js dashboards (Employee, Manager, Admin) using a unified `/dashboard` route with a persistent sidebar layout and shadcn/ui components.

**Architecture:** A unified `/dashboard` page conditionally renders `<EmployeeView />`, `<ManagerView />`, or `<AdminView />` based on the user's role from their session. A `<DashboardLayout />` wraps the content with a persistent `<Sidebar />`.

**Tech Stack:** Next.js (App Router), Tailwind CSS, shadcn/ui, Lucide Icons.

---

### Task 1: Setup Next.js Project & shadcn/ui

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/components.json`
- Create: `frontend/app/layout.tsx`

- [ ] **Step 1: Initialize Next.js**
```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

- [ ] **Step 2: Initialize shadcn/ui**
```bash
npx shadcn-ui@latest init -y
```

- [ ] **Step 3: Install Required UI Components**
```bash
npx shadcn-ui@latest add button card avatar separator sheet
npm install lucide-react
```

- [ ] **Step 4: Commit**
```bash
git add frontend/
git commit -m "chore(frontend): initialize Next.js and shadcn/ui"
```

### Task 2: Create Dashboard Layout & Sidebar

**Files:**
- Create: `frontend/src/components/layout/sidebar.tsx`
- Create: `frontend/src/app/dashboard/layout.tsx`

- [ ] **Step 1: Create Sidebar Component**
```tsx
// frontend/src/components/layout/sidebar.tsx
import Link from "next/link";
import { Home, Calendar, FileText, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
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
          <Button key={route.href} variant="ghost" className="justify-start gap-3" asChild>
            <Link href={route.href}>
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  );
}
```

- [ ] **Step 2: Create Dashboard Layout**
```tsx
// frontend/src/app/dashboard/layout.tsx
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Replace with actual auth role later
  const mockRole = "admin"; 

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar role={mockRole} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add frontend/src/components/layout/sidebar.tsx frontend/src/app/dashboard/layout.tsx
git commit -m "feat(frontend): add sidebar navigation and dashboard layout"
```

### Task 3: Create Role Views & Unified Dashboard

**Files:**
- Create: `frontend/src/components/dashboard/employee-view.tsx`
- Create: `frontend/src/components/dashboard/manager-view.tsx`
- Create: `frontend/src/components/dashboard/admin-view.tsx`
- Create: `frontend/src/app/dashboard/page.tsx`

- [ ] **Step 1: Create Employee View**
```tsx
// frontend/src/components/dashboard/employee-view.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmployeeView() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Employee Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 Days</div>
            <p className="text-xs text-muted-foreground">Available this year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Cutoff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">May 15</div>
            <p className="text-xs text-muted-foreground">5 days remaining</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Manager View**
```tsx
// frontend/src/components/dashboard/manager-view.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ManagerView() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Manager Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Leave requests require action</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create Admin View**
```tsx
// frontend/src/components/dashboard/admin-view.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AdminView() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Pending</div>
            <p className="text-xs text-muted-foreground">Next run: May 15</p>
            <Button className="mt-4 w-full">Run Payroll Manually</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create Unified Dashboard Page**
```tsx
// frontend/src/app/dashboard/page.tsx
import { EmployeeView } from "@/components/dashboard/employee-view";
import { ManagerView } from "@/components/dashboard/manager-view";
import { AdminView } from "@/components/dashboard/admin-view";

export default function DashboardPage() {
  // TODO: Replace with actual auth context later
  const role: "employee" | "manager" | "admin" = "admin";

  return (
    <div className="mx-auto w-full max-w-6xl">
      {role === "employee" && <EmployeeView />}
      {role === "manager" && <ManagerView />}
      {role === "admin" && <AdminView />}
    </div>
  );
}
```

- [ ] **Step 5: Run App & Commit**
```bash
npm run build --prefix frontend
git add frontend/src/components/dashboard/ frontend/src/app/dashboard/page.tsx
git commit -m "feat(frontend): implement role-specific dashboard views"
```