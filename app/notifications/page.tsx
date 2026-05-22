import { AlertTriangle, Bell, CheckCircle, FileText, Inbox } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const notifications = [
  { title: "Issue submitted", message: "Your road damage report was submitted successfully.", type: "Report", unread: true, icon: FileText },
  { title: "Issue verified", message: "Admin verified the water leakage report.", type: "Report", unread: true, icon: CheckCircle },
  { title: "Department assigned", message: "Road Maintenance Department was assigned to RPT-001.", type: "Assignment", unread: false, icon: Inbox },
  { title: "Issue resolved", message: "Streetlight repair has been marked as resolved.", type: "Report", unread: false, icon: CheckCircle },
  { title: "SLA overdue warning", message: "Drainage blockage report has crossed the SLA deadline.", type: "SLA Alert", unread: true, icon: AlertTriangle },
]

function NotificationList({ unreadOnly = false }: { unreadOnly?: boolean }) { const data = unreadOnly ? notifications.filter(n => n.unread) : notifications; return <div className="space-y-3">{data.map((item) => { const Icon = item.icon; return <Card key={item.title} className={item.unread ? "border-primary/30 bg-primary/5" : undefined}><CardContent className="flex gap-4 pt-6"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{item.title}</h3>{item.unread && <Badge>Unread</Badge>}<Badge variant="outline">{item.type}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{item.message}</p></div></CardContent></Card> })}</div> }

export default function NotificationsPage() { return <div className="space-y-6 p-4 md:p-6"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h2 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h2><p className="text-muted-foreground">View report updates, assignment alerts, and SLA warnings.</p></div><Button variant="outline" className="gap-2"><Bell className="h-4 w-4" />Mark all as read</Button></div><Tabs defaultValue="all"><TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="unread">Unread</TabsTrigger><TabsTrigger value="reports">Reports</TabsTrigger><TabsTrigger value="sla">SLA Alerts</TabsTrigger></TabsList><TabsContent value="all" className="mt-4"><NotificationList /></TabsContent><TabsContent value="unread" className="mt-4"><NotificationList unreadOnly /></TabsContent><TabsContent value="reports" className="mt-4"><NotificationList /></TabsContent><TabsContent value="sla" className="mt-4"><NotificationList /></TabsContent></Tabs></div> }
