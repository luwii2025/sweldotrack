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
