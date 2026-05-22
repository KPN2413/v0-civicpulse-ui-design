import { BarChart3, Clock, FileText, Map, ShieldCheck, TrendingUp } from "lucide-react"
import { mockDepartments, mockReports } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatCard } from "@/components/dashboard/stat-card"

export default function AdminAnalyticsPage() {
  const resolved = mockReports.filter((report) => report.status === "resolved").length
  const overdue = mockReports.filter((report) => report.status === "overdue").length
  const resolutionRate = Math.round((resolved / mockReports.length) * 100)
  const slaBreachRate = Math.round((overdue / mockReports.length) * 100)

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h2><p className="text-muted-foreground">Monitor city-level issue trends, SLA performance, and department efficiency.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Reports" value={mockReports.length} description="City-wide issues" icon={FileText} variant="default" />
        <StatCard title="Resolution Rate" value={`${resolutionRate}%`} description="Closed successfully" icon={ShieldCheck} variant="accent" />
        <StatCard title="Avg. Resolution Time" value="48 hrs" description="Across departments" icon={Clock} variant="warning" />
        <StatCard title="SLA Breach Rate" value={`${slaBreachRate}%`} description="Needs attention" icon={TrendingUp} variant="destructive" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {["Reports by Category", "Reports by Priority", "Monthly Report Trends", "Area-wise Issue Distribution"].map((title) => (<Card key={title}><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />{title}</CardTitle><CardDescription>Mock chart placeholder for UI shell.</CardDescription></CardHeader><CardContent><div className="flex h-64 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">{title} chart</div></CardContent></Card>))}
      </div>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Map className="h-5 w-5 text-primary" />City Issue Heatmap</CardTitle><CardDescription>Map placeholder for issue density across local areas.</CardDescription></CardHeader><CardContent><div className="flex h-72 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">Heatmap placeholder</div></CardContent></Card>
      <Card>
        <CardHeader><CardTitle>Department Performance</CardTitle><CardDescription>Workload, resolution count, overdue reports, and SLA compliance.</CardDescription></CardHeader>
        <CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Department</TableHead><TableHead>Assigned</TableHead><TableHead>Resolved</TableHead><TableHead>Overdue</TableHead><TableHead>Avg Resolution</TableHead><TableHead>SLA Compliance</TableHead></TableRow></TableHeader><TableBody>{mockDepartments.map((department) => { const compliance = Math.max(60, Math.round((department.resolvedReports / department.totalReports) * 100)); return <TableRow key={department.id}><TableCell className="font-medium">{department.name}</TableCell><TableCell>{department.totalReports}</TableCell><TableCell>{department.resolvedReports}</TableCell><TableCell>{department.pendingReports > 30 ? 2 : 0}</TableCell><TableCell>{department.averageResolutionTime}</TableCell><TableCell><div className="flex min-w-40 items-center gap-3"><Progress value={compliance} className="h-2" /><span className="text-sm">{compliance}%</span></div></TableCell></TableRow> })}</TableBody></Table></CardContent>
      </Card>
    </div>
  )
}
