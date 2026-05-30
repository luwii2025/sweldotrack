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
