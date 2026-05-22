"use client"

import { useState } from "react"
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  PowerOff,
  Mail,
  Phone,
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"

type Department = {
  id: string
  name: string
  email: string
  phone: string
  assignedReports: number
  inProgress: number
  overdue: number
  resolvedThisMonth: number
  avgResolutionTime: string
  status: "active" | "inactive"
  workload: "low" | "medium" | "high"
}

const mockDepartments: Department[] = [
  {
    id: "DEPT-001",
    name: "Road Maintenance Department",
    email: "roads@municipality.gov.in",
    phone: "+91 11 2345 6701",
    assignedReports: 45,
    inProgress: 18,
    overdue: 5,
    resolvedThisMonth: 32,
    avgResolutionTime: "3.2 days",
    status: "active",
    workload: "high",
  },
  {
    id: "DEPT-002",
    name: "Waste Management Department",
    email: "waste@municipality.gov.in",
    phone: "+91 11 2345 6702",
    assignedReports: 38,
    inProgress: 12,
    overdue: 2,
    resolvedThisMonth: 45,
    avgResolutionTime: "1.8 days",
    status: "active",
    workload: "medium",
  },
  {
    id: "DEPT-003",
    name: "Water Supply Department",
    email: "water@municipality.gov.in",
    phone: "+91 11 2345 6703",
    assignedReports: 52,
    inProgress: 24,
    overdue: 8,
    resolvedThisMonth: 28,
    avgResolutionTime: "4.1 days",
    status: "active",
    workload: "high",
  },
  {
    id: "DEPT-004",
    name: "Street Light Department",
    email: "streetlights@municipality.gov.in",
    phone: "+91 11 2345 6704",
    assignedReports: 15,
    inProgress: 5,
    overdue: 1,
    resolvedThisMonth: 22,
    avgResolutionTime: "1.2 days",
    status: "active",
    workload: "low",
  },
  {
    id: "DEPT-005",
    name: "Drainage Department",
    email: "drainage@municipality.gov.in",
    phone: "+91 11 2345 6705",
    assignedReports: 28,
    inProgress: 10,
    overdue: 3,
    resolvedThisMonth: 18,
    avgResolutionTime: "2.9 days",
    status: "active",
    workload: "medium",
  },
  {
    id: "DEPT-006",
    name: "Public Safety Department",
    email: "safety@municipality.gov.in",
    phone: "+91 11 2345 6706",
    assignedReports: 8,
    inProgress: 2,
    overdue: 0,
    resolvedThisMonth: 12,
    avgResolutionTime: "0.8 days",
    status: "inactive",
    workload: "low",
  },
]

const stats = {
  total: mockDepartments.length,
  active: mockDepartments.filter((d) => d.status === "active").length,
  assignedReports: mockDepartments.reduce((acc, d) => acc + d.assignedReports, 0),
  overdueReports: mockDepartments.reduce((acc, d) => acc + d.overdue, 0),
}

type WorkloadBadgeProps = {
  workload: "low" | "medium" | "high"
  className?: string
}

const workloadConfig = {
  low: {
    label: "Low",
    className: "bg-accent/10 text-accent border-accent/20",
  },
  medium: {
    label: "Medium",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  high: {
    label: "High",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
}

function WorkloadBadge({ workload, className }: WorkloadBadgeProps) {
  const config = workloadConfig[workload]
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}

type StatusBadgeProps = {
  status: "active" | "inactive"
  className?: string
}

const statusConfig = {
  active: {
    label: "Active",
    className: "bg-accent/10 text-accent border-accent/20",
  },
  inactive: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground border-border",
  },
}

function DeptStatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}

export default function DepartmentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [workloadFilter, setWorkloadFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredDepartments = mockDepartments.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || dept.status === statusFilter
    const matchesWorkload = workloadFilter === "all" || dept.workload === workloadFilter
    return matchesSearch && matchesStatus && matchesWorkload
  })

  const workloadDepartments = mockDepartments.filter((d) => d.status === "active").slice(0, 4)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Departments</h2>
          <p className="text-muted-foreground">
            Manage civic departments, officer assignments, workload, and issue resolution performance.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
              <DialogDescription>
                Create a new civic department to handle issue categories.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="dept-name">Department Name</Label>
                <Input id="dept-name" placeholder="e.g. Parks & Recreation Department" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dept-description">Description</Label>
                <Textarea
                  id="dept-description"
                  placeholder="Brief description of department responsibilities..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dept-email">Email</Label>
                  <Input id="dept-email" type="email" placeholder="dept@municipality.gov.in" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dept-phone">Phone</Label>
                  <Input id="dept-phone" type="tel" placeholder="+91 11 2345 6700" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dept-status">Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger id="dept-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Save Department</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Departments"
          value={stats.total}
          description="Registered departments"
          icon={Building2}
          variant="primary"
        />
        <StatCard
          title="Active Departments"
          value={stats.active}
          description="Currently operational"
          icon={Activity}
          variant="accent"
        />
        <StatCard
          title="Assigned Reports"
          value={stats.assignedReports}
          description="Across all departments"
          icon={ClipboardList}
        />
        <StatCard
          title="Overdue Reports"
          value={stats.overdueReports}
          description="SLA breached"
          icon={AlertTriangle}
          variant="destructive"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>View and manage department information and performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={workloadFilter} onValueChange={setWorkloadFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Workload" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workload</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="hidden md:table-cell">Contact Email</TableHead>
                  <TableHead className="text-center">Assigned</TableHead>
                  <TableHead className="hidden text-center sm:table-cell">In Progress</TableHead>
                  <TableHead className="hidden text-center lg:table-cell">Overdue</TableHead>
                  <TableHead className="hidden text-center lg:table-cell">Resolved</TableHead>
                  <TableHead className="hidden text-center xl:table-cell">Avg. Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-10 w-10 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No departments found</p>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDepartments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{dept.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{dept.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="text-sm">{dept.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">{dept.assignedReports}</TableCell>
                      <TableCell className="hidden text-center sm:table-cell">{dept.inProgress}</TableCell>
                      <TableCell className="hidden text-center lg:table-cell">
                        <span className={dept.overdue > 0 ? "font-medium text-destructive" : ""}>
                          {dept.overdue}
                        </span>
                      </TableCell>
                      <TableCell className="hidden text-center lg:table-cell">{dept.resolvedThisMonth}</TableCell>
                      <TableCell className="hidden text-center xl:table-cell">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-sm">{dept.avgResolutionTime}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DeptStatusBadge status={dept.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                              <PowerOff className="h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Department Workload</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workloadDepartments.map((dept) => (
            <Card key={dept.id} className="relative overflow-hidden">
              <div
                className={cn(
                  "absolute left-0 top-0 h-full w-1",
                  dept.workload === "high" && "bg-destructive",
                  dept.workload === "medium" && "bg-warning",
                  dept.workload === "low" && "bg-accent"
                )}
              />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <WorkloadBadge workload={dept.workload} />
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold text-foreground">{dept.name.replace(" Department", "")}</h4>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-foreground">{dept.assignedReports}</p>
                    <p className="text-xs text-muted-foreground">Assigned</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{dept.inProgress}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div>
                    <p className={cn("text-lg font-bold", dept.overdue > 0 ? "text-destructive" : "text-foreground")}>
                      {dept.overdue}
                    </p>
                    <p className="text-xs text-muted-foreground">Overdue</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Avg: {dept.avgResolutionTime}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-accent">
                    <CheckCircle className="h-3 w-3" />
                    {dept.resolvedThisMonth} resolved
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
