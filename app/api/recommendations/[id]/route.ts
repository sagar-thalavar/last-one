import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const updateSchema = z.object({
  isRead: z.boolean().optional(),
  isApplied: z.boolean().optional(),
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

    const body = await req.json()
    const data = updateSchema.parse(body)

    // Verify recommendation belongs to user
    const existingRec = await prisma.recommendation.findUnique({
      where: { id: params.id },
    })

    if (!existingRec || existingRec.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Recommendation not found" },
        { status: 404 }
      )
    }

    const recommendation = await prisma.recommendation.update({
      where: { id: params.id },
      data: {
        isRead: data.isRead !== undefined ? data.isRead : existingRec.isRead,
        isApplied:
          data.isApplied !== undefined ? data.isApplied : existingRec.isApplied,
      },
    })

    return NextResponse.json({ recommendation })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error updating recommendation:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

