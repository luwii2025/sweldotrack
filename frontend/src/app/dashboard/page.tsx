import { EmployeeView } from "@/components/dashboard/employee-view";
import { ManagerView } from "@/components/dashboard/manager-view";
import { AdminView } from "@/components/dashboard/admin-view";

export default function DashboardPage() {
  // TODO: Replace with actual auth context later
  const role: string = "admin";

  return (
    <div className="mx-auto w-full max-w-6xl">
      {role === "employee" && <EmployeeView />}
      {role === "manager" && <ManagerView />}
      {role === "admin" && <AdminView />}
    </div>
  );
}
