import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const taskSchema = z.object({
  module: z.enum(["College", "Work", "Life"]),
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().datetime().optional().nullable(),
  endTime: z.string().datetime().optional().nullable(),
  duration: z.number().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  tags: z.string().optional(),
  location: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  isRecurring: z.boolean().optional(),
  recurringPattern: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const module = searchParams.get("module")
    const status = searchParams.get("status")
    const date = searchParams.get("date")

    const where: any = { userId: session.user.id }
    if (module) where.module = module
    if (status) where.status = status
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      where.createdAt = { gte: startOfDay, lte: endOfDay }
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = taskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        module: data.module,
        title: data.title,
        description: data.description,
        startTime: data.startTime ? new Date(data.startTime) : null,
        endTime: data.endTime ? new Date(data.endTime) : null,
        duration: data.duration,
        priority: data.priority,
        tags: data.tags,
        location: data.location,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        isRecurring: data.isRecurring || false,
        recurringPattern: data.recurringPattern,
      },
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

