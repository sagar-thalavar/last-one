import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify session belongs to user
    const existingSession = await prisma.session.findUnique({
      where: { id: params.id },
    })

    if (!existingSession || existingSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const body = await req.json()
    const endTime = new Date()
    const startTime = existingSession.startTime
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60) // minutes

    // Update session with end time and duration
    const updatedSession = await prisma.session.update({
      where: { id: params.id },
      data: {
        endTime,
        duration,
        notes: body.notes !== undefined ? body.notes : existingSession.notes,
      },
    })

    return NextResponse.json({ session: updatedSession })
  } catch (error) {
    console.error("Error stopping session:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

