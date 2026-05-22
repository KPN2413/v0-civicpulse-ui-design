import Link from "next/link"
import { ArrowLeft, CalendarClock, CheckCircle, Clock, ImageIcon, MapPin, Save, Wrench } from "lucide-react"
import { mockReports } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PriorityBadge, StatusBadge } from "@/components/dashboard/status-badge"

const report = mockReports.find((item) => item.assignedTo) ?? mockReports[1]

function formatDate(dateString?: string) {
  if (!dateString) return "Not set"
  return new Date(dateString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default function OfficerReportDetailsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2"><Link href="/officer/reports"><ArrowLeft className="mr-2 h-4 w-4" />Back to Assigned Reports</Link></Button>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Assigned Report Details</h2>
          <p className="text-muted-foreground">Update work progress, SLA status, and resolution notes.</p>
        </div>
        <Button className="gap-2"><CheckCircle className="h-4 w-4" />Mark as Resolved</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>{report.title}</CardTitle><CardDescription>{report.id} • Assigned to {report.department ?? "Department Team"}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{report.description}</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div><p className="text-xs text-muted-foreground">Category</p><p className="font-medium">{report.category}</p></div>
                <div><p className="text-xs text-muted-foreground">Priority</p><PriorityBadge priority={report.priority} /></div>
                <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={report.status} /></div>
                <div><p className="text-xs text-muted-foreground">SLA</p><p className="font-medium">{formatDate(report.slaDeadline)}</p></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" />Issue Photo</CardTitle></CardHeader><CardContent><div className="flex h-64 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">Photo placeholder</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Location</CardTitle></CardHeader><CardContent><div className="mb-4 flex h-64 items-center justify-center rounded-lg border bg-muted/40"><MapPin className="h-10 w-10 text-primary" /></div><p className="text-sm font-medium">{report.location}</p><p className="text-xs text-muted-foreground">Lat: 28.6139 • Lng: 77.2090</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Recent Updates</CardTitle><CardDescription>Progress history from the department team.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {["Report assigned to department", "Officer inspection completed", "Repair work scheduled"].map((item, index) => (<div key={item} className="flex gap-3"><div className="mt-1 h-2 w-2 rounded-full bg-primary" /><div><p className="font-medium">{item}</p><p className="text-sm text-muted-foreground">Update #{index + 1} recorded in mock UI.</p></div></div>))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5" />SLA Tracking</CardTitle></CardHeader>
            <CardContent className="space-y-3"><div className="flex justify-between text-sm"><span>Progress</span><span>62%</span></div><Progress value={62} /><p className="text-sm text-muted-foreground">Deadline: {formatDate(report.slaDeadline)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" />Work Update</CardTitle><CardDescription>Add latest progress details.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Status</Label><Select defaultValue="in-progress"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="assigned">Assigned</SelectItem><SelectItem value="in-progress">In Progress</SelectItem><SelectItem value="resolved">Resolved</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Progress Update</Label><Textarea placeholder="Add inspection/work update..." /></div>
              <div className="space-y-2"><Label>Resolution Note</Label><Textarea placeholder="Add note after completion..." /></div>
              <Button className="w-full gap-2"><Save className="h-4 w-4" />Save Update</Button>
            </CardContent>
          </Card>
          <Card><CardContent className="pt-6"><Clock className="mb-3 h-5 w-5 text-warning" /><p className="font-medium">Within SLA</p><p className="text-sm text-muted-foreground">This report is currently not overdue.</p></CardContent></Card>
        </div>
      </div>
    </div>
  )
}
