export type Report = {
  id: string
  title: string
  description: string
  category: string
  location: string
  status: "pending" | "verified" | "assigned" | "in-progress" | "resolved" | "rejected" | "overdue"
  priority: "low" | "medium" | "high" | "critical"
  createdAt: string
  updatedAt: string
  reportedBy: string
  assignedTo?: string
  department?: string
  slaDeadline?: string
}

export type Department = {
  id: string
  name: string
  head: string
  totalReports: number
  resolvedReports: number
  pendingReports: number
  averageResolutionTime: string
}

export type User = {
  id: string
  name: string
  email: string
  role: "citizen" | "officer" | "admin" | "super-admin"
  department?: string
  createdAt: string
}

export type AuditLog = {
  id: string
  action: string
  description: string
  performedBy: string
  performedAt: string
  targetType: "report" | "user" | "department" | "system"
  targetId: string
}

// Mock Data

export const mockReports: Report[] = [
  {
    id: "RPT-001",
    title: "Pothole on MG Road near Metro Station",
    description: "Large pothole causing traffic congestion and accidents risk",
    category: "Roads",
    location: "MG Road, Near Metro Station",
    status: "pending",
    priority: "high",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    reportedBy: "Rahul Sharma",
  },
  {
    id: "RPT-002",
    title: "Streetlight not working on Park Street",
    description: "Streetlight has been non-functional for 3 days",
    category: "Streetlights",
    location: "Park Street, Block C",
    status: "assigned",
    priority: "medium",
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-15T09:00:00Z",
    reportedBy: "Priya Patel",
    assignedTo: "Electrical Team",
    department: "Electrical Department",
    slaDeadline: "2024-01-17T14:20:00Z",
  },
  {
    id: "RPT-003",
    title: "Garbage overflow at Gandhi Nagar",
    description: "Garbage bins overflowing, causing hygiene issues",
    category: "Garbage",
    location: "Gandhi Nagar, Sector 5",
    status: "in-progress",
    priority: "high",
    createdAt: "2024-01-13T08:45:00Z",
    updatedAt: "2024-01-15T11:30:00Z",
    reportedBy: "Amit Kumar",
    assignedTo: "Sanitation Team A",
    department: "Sanitation Department",
    slaDeadline: "2024-01-16T08:45:00Z",
  },
  {
    id: "RPT-004",
    title: "Water leakage on Main Road",
    description: "Water pipe burst causing water wastage and road damage",
    category: "Water Supply",
    location: "Main Road, Near Shiv Temple",
    status: "resolved",
    priority: "critical",
    createdAt: "2024-01-12T16:00:00Z",
    updatedAt: "2024-01-14T18:00:00Z",
    reportedBy: "Sunita Devi",
    assignedTo: "Water Supply Team B",
    department: "Water Department",
  },
  {
    id: "RPT-005",
    title: "Drainage blockage causing waterlogging",
    description: "Blocked drain causing water accumulation during rains",
    category: "Drainage",
    location: "Nehru Colony, Lane 3",
    status: "overdue",
    priority: "critical",
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-15T09:15:00Z",
    reportedBy: "Vikram Singh",
    assignedTo: "Drainage Team",
    department: "Public Works",
    slaDeadline: "2024-01-13T09:15:00Z",
  },
  {
    id: "RPT-006",
    title: "Damaged footpath near school",
    description: "Broken tiles on footpath posing risk to children",
    category: "Footpaths",
    location: "Near Government School, Sector 12",
    status: "verified",
    priority: "medium",
    createdAt: "2024-01-14T11:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
    reportedBy: "Kavita Mishra",
  },
  {
    id: "RPT-007",
    title: "Illegal dumping site",
    description: "Unauthorized garbage dumping creating health hazards",
    category: "Garbage",
    location: "Industrial Area, Plot 45",
    status: "rejected",
    priority: "low",
    createdAt: "2024-01-13T13:30:00Z",
    updatedAt: "2024-01-14T10:00:00Z",
    reportedBy: "Anonymous",
  },
  {
    id: "RPT-008",
    title: "Traffic signal malfunction",
    description: "Traffic light stuck on red, causing major traffic jam",
    category: "Traffic",
    location: "City Center Junction",
    status: "in-progress",
    priority: "critical",
    createdAt: "2024-01-15T07:00:00Z",
    updatedAt: "2024-01-15T08:30:00Z",
    reportedBy: "Traffic Police",
    assignedTo: "Traffic Signal Team",
    department: "Traffic Department",
    slaDeadline: "2024-01-15T19:00:00Z",
  },
]

export const mockDepartments: Department[] = [
  {
    id: "DEPT-001",
    name: "Roads & Infrastructure",
    head: "Mr. Rajesh Kumar",
    totalReports: 156,
    resolvedReports: 120,
    pendingReports: 36,
    averageResolutionTime: "3.5 days",
  },
  {
    id: "DEPT-002",
    name: "Sanitation Department",
    head: "Mrs. Lakshmi Iyer",
    totalReports: 243,
    resolvedReports: 210,
    pendingReports: 33,
    averageResolutionTime: "2.1 days",
  },
  {
    id: "DEPT-003",
    name: "Water Supply",
    head: "Mr. Arun Mehta",
    totalReports: 98,
    resolvedReports: 85,
    pendingReports: 13,
    averageResolutionTime: "1.8 days",
  },
  {
    id: "DEPT-004",
    name: "Electrical Department",
    head: "Mr. Suresh Nair",
    totalReports: 134,
    resolvedReports: 115,
    pendingReports: 19,
    averageResolutionTime: "2.5 days",
  },
  {
    id: "DEPT-005",
    name: "Traffic Department",
    head: "Mr. Vijay Deshmukh",
    totalReports: 67,
    resolvedReports: 58,
    pendingReports: 9,
    averageResolutionTime: "4.2 days",
  },
  {
    id: "DEPT-006",
    name: "Public Works",
    head: "Mrs. Anita Sharma",
    totalReports: 189,
    resolvedReports: 145,
    pendingReports: 44,
    averageResolutionTime: "5.1 days",
  },
]

export const mockAuditLogs: AuditLog[] = [
  {
    id: "LOG-001",
    action: "Report Created",
    description: "New report submitted: Pothole on MG Road",
    performedBy: "Rahul Sharma",
    performedAt: "2024-01-15T10:30:00Z",
    targetType: "report",
    targetId: "RPT-001",
  },
  {
    id: "LOG-002",
    action: "Status Updated",
    description: "Report RPT-002 assigned to Electrical Team",
    performedBy: "Admin User",
    performedAt: "2024-01-15T09:00:00Z",
    targetType: "report",
    targetId: "RPT-002",
  },
  {
    id: "LOG-003",
    action: "Priority Changed",
    description: "Report RPT-003 priority changed from Medium to High",
    performedBy: "Admin User",
    performedAt: "2024-01-15T08:45:00Z",
    targetType: "report",
    targetId: "RPT-003",
  },
  {
    id: "LOG-004",
    action: "Report Resolved",
    description: "Report RPT-004 marked as resolved",
    performedBy: "Water Supply Team B",
    performedAt: "2024-01-14T18:00:00Z",
    targetType: "report",
    targetId: "RPT-004",
  },
  {
    id: "LOG-005",
    action: "Report Rejected",
    description: "Report RPT-007 rejected: Insufficient information",
    performedBy: "Admin User",
    performedAt: "2024-01-14T10:00:00Z",
    targetType: "report",
    targetId: "RPT-007",
  },
  {
    id: "LOG-006",
    action: "Department Updated",
    description: "Sanitation Department head changed",
    performedBy: "Super Admin",
    performedAt: "2024-01-13T14:00:00Z",
    targetType: "department",
    targetId: "DEPT-002",
  },
  {
    id: "LOG-007",
    action: "User Created",
    description: "New officer account created for Traffic Department",
    performedBy: "Super Admin",
    performedAt: "2024-01-12T11:30:00Z",
    targetType: "user",
    targetId: "USR-045",
  },
  {
    id: "LOG-008",
    action: "SLA Breach Alert",
    description: "Report RPT-005 exceeded SLA deadline",
    performedBy: "System",
    performedAt: "2024-01-13T09:15:00Z",
    targetType: "report",
    targetId: "RPT-005",
  },
]
