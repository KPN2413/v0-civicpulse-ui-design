"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { DepartmentStatus } from "@/lib/generated/prisma/enums"

const departmentSchema = z.object({
  name: z.string().trim().min(2, "Department name is required").max(100),
  description: z.string().trim().max(500).optional(),
})

function revalidateDepartmentPages() {
  revalidatePath("/admin/departments")
  revalidatePath("/super-admin/departments")
}

export async function createDepartmentAction(formData: FormData) {
  const parsed = departmentSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  })

  if (!parsed.success) {
    return { success: false, error: "Invalid department details." }
  }

  try {
    await prisma.department.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
      },
    })

    revalidateDepartmentPages()
    return { success: true, error: null }
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { success: false, error: "A department with this name already exists." }
    }

    return { success: false, error: "Failed to create department." }
  }
}

export async function updateDepartmentAction(formData: FormData) {
  const id = String(formData.get("id") || "")

  if (!id) {
    return { success: false, error: "Department ID is missing." }
  }

  const parsed = departmentSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  })

  if (!parsed.success) {
    return { success: false, error: "Invalid department details." }
  }

  try {
    await prisma.department.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
      },
    })

    revalidateDepartmentPages()
    return { success: true, error: null }
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { success: false, error: "A department with this name already exists." }
    }

    return { success: false, error: "Failed to update department." }
  }
}

export async function setDepartmentStatusAction(id: string, status: DepartmentStatus) {
  if (!id) {
    return { success: false, error: "Department ID is missing." }
  }

  if (!Object.values(DepartmentStatus).includes(status)) {
    return { success: false, error: "Invalid department status." }
  }

  try {
    await prisma.department.update({
      where: { id },
      data: { status },
    })

    revalidateDepartmentPages()
    return { success: true, error: null }
  } catch {
    return { success: false, error: "Failed to update department status." }
  }
}