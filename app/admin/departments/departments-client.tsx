"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  PowerOff,
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
} from "lucide-react"

import {
  createDepartmentAction,
  setDepartmentStatusAction,
  updateDepartmentAction,
} from "./actions"
import { StatCard } from "@/components/dashboard/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { DepartmentStatus } from "@/lib/generated/prisma/enums"

export type DepartmentRow = {
  id: string
  name: string
  description: string
  assignedReports: number
  inProgress: number
  overdue: number
  resolvedThisMonth: number
  avgResolutionTime: string
  status: "active" | "inactive"
  workload: "low" | "medium" | "high"
}

type DepartmentsClientProps = {
  departments: DepartmentRow[]
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

function WorkloadBadge({
  workload,
  className,
}: {
  workload: "low" | "medium" | "high"
  className?: string
}) {
  const config = workloadConfig[workload]

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
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

function DeptStatusBadge({
  status,
  className,
}: {
  status: "active" | "inactive"
  className?: string
}) {
  const config = statusConfig[status]

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}

export function DepartmentsClient({ departments }: DepartmentsClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [workloadFilter, setWorkloadFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<DepartmentRow | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredDepartments = departments.filter((dept) => {
    const query = searchQuery.toLowerCase()

    const matchesSearch =
      dept.name.toLowerCase().includes(query) ||
      dept.description.toLowerCase().includes(query)

    const matchesStatus = statusFilter === "all" || dept.status === statusFilter
    const matchesWorkload = workloadFilter === "all" || dept.workload === workloadFilter

    return matchesSearch && matchesStatus && matchesWorkload
  })

  const stats = {
    total: departments.length,
    active: departments.filter((d) => d.status === "active").length,
    assignedReports: departments.reduce((acc, d) => acc + d.assignedReports, 0),
    overdueReports: departments.reduce((acc, d) => acc + d.overdue, 0),
  }

  const workloadDepartments = departments.filter((d) => d.status === "active").slice(0, 4)

  function handleCreateDepartment(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = await createDepartmentAction(formData)

      if (!result.success) {
        setError(result.error)
        return
      }

      setIsCreateDialogOpen(false)
      router.refresh()
    })
  }

  function handleUpdateDepartment(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = await updateDepartmentAction(formData)

      if (!result.success) {
        setError(result.error)
        return
      }

      setEditingDepartment(null)
      router.refresh()
    })
  }

  function handleToggleStatus(dept: DepartmentRow) {
    setError(null)

    const nextStatus =
      dept.status === "active" ? DepartmentStatus.INACTIVE : DepartmentStatus.ACTIVE

    startTransition(async () => {
      const result = await setDepartmentStatusAction(dept.id, nextStatus)

      if (!result.success) {
  setError(result.error)
  return
}

router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Departments</h2>
          <p className="text-muted-foreground">
            Manage civic departments, officer assignments, workload, and issue resolution performance.
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                Create a new civic department for issue routing.
              </DialogDescription>
            </DialogHeader>

            <form action={handleCreateDepartment} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="create-name">Department Name</Label>
                <Input id="create-name" name="name" placeholder="e.g. Parks & Recreation" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="create-description">Description</Label>
                <Textarea
                  id="create-description"
                  name="description"
                  placeholder="Brief description of department responsibilities..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Department"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingDepartment} onOpenChange={(open) => !open && setEditingDepartment(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update department name and responsibility details.
            </DialogDescription>
          </DialogHeader>

          {editingDepartment ? (
            <form action={handleUpdateDepartment} className="space-y-4">
              <input type="hidden" name="id" value={editingDepartment.id} />

              <div className="grid gap-2">
                <Label htmlFor="edit-name">Department Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingDepartment.name}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingDepartment.description}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingDepartment(null)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Update Department"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

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
          <CardDescription>
            View department information loaded from PostgreSQL.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
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
                  <TableHead className="hidden md:table-cell">Description</TableHead>
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
                          Try adjusting your search or filter criteria.
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
                            <p className="text-xs text-muted-foreground md:hidden">
                              {dept.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden max-w-[360px] truncate md:table-cell">
                        {dept.description}
                      </TableCell>

                      <TableCell className="text-center font-medium">
                        {dept.assignedReports}
                      </TableCell>

                      <TableCell className="hidden text-center sm:table-cell">
                        {dept.inProgress}
                      </TableCell>

                      <TableCell className="hidden text-center lg:table-cell">
                        <span className={dept.overdue > 0 ? "font-medium text-destructive" : ""}>
                          {dept.overdue}
                        </span>
                      </TableCell>

                      <TableCell className="hidden text-center lg:table-cell">
                        {dept.resolvedThisMonth}
                      </TableCell>

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

                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => setEditingDepartment(dept)}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="gap-2 text-destructive focus:text-destructive"
                              onClick={() => handleToggleStatus(dept)}
                            >
                              <PowerOff className="h-4 w-4" />
                              {dept.status === "active" ? "Deactivate" : "Activate"}
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
                <h4 className="font-semibold text-foreground">{dept.name}</h4>

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
                    <p
                      className={cn(
                        "text-lg font-bold",
                        dept.overdue > 0 ? "text-destructive" : "text-foreground"
                      )}
                    >
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