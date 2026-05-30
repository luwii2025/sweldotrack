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
