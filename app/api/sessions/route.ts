import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const startSessionSchema = z.object({
  module: z.enum(["College", "Work", "Life"]),
  taskId: z.string().optional().nullable(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = startSessionSchema.parse(body)

    // Check if there's an active session
    const activeSession = await prisma.session.findFirst({
      where: {
        userId: session.user.id,
        endTime: null,
      },
      orderBy: { startTime: "desc" },
    })

    if (activeSession) {
      return NextResponse.json(
        { error: "You already have an active time tracking session. Please stop it first." },
        { status: 400 }
      )
    }

    // Create new session
    const newSession = await prisma.session.create({
      data: {
        userId: session.user.id,
        module: data.module,
        taskId: data.taskId || null,
        startTime: new Date(),
        notes: data.notes || null,
      },
    })

    return NextResponse.json({ session: newSession }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error starting session:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const active = searchParams.get("active") === "true"

    const where: any = { userId: session.user.id }
    if (active) {
      where.endTime = null
    }

    const sessions = await prisma.session.findMany({
      where,
      orderBy: { startTime: "desc" },
      take: active ? 1 : 50,
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

