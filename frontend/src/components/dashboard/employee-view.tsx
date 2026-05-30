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
