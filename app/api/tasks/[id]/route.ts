import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const updateTaskSchema = z.object({
  module: z.enum(["College", "Work", "Life"]).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  startTime: z.string().datetime().optional().nullable(),
  endTime: z.string().datetime().optional().nullable(),
  duration: z.number().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).optional().nullable(),
  tags: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  status: z.enum(["planned", "in_progress", "complete", "cancelled"]).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify task belongs to user
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
    })

    if (!existingTask || existingTask.userId !== session.user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const body = await req.json()
    const data = updateTaskSchema.parse(body)

    const updateData: any = {}
    if (data.module) updateData.module = data.module
    if (data.title) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.startTime !== undefined)
      updateData.startTime = data.startTime ? new Date(data.startTime) : null
    if (data.endTime !== undefined)
      updateData.endTime = data.endTime ? new Date(data.endTime) : null
    if (data.duration !== undefined) updateData.duration = data.duration
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.location !== undefined) updateData.location = data.location
    if (data.dueDate !== undefined)
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null
    if (data.status) updateData.status = data.status

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({ task })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error updating task:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
    })

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

