import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const format = searchParams.get("format") || "csv" // csv, json
    const period = searchParams.get("period") || "month"
    const days = period === "week" ? 7 : period === "month" ? 30 : 90

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "desc" },
    })

    const sessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
        startTime: { gte: startDate },
      },
      orderBy: { startTime: "desc" },
    })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        role: true,
        sleepTarget: true,
      },
    })

    if (format === "csv") {
      // Generate CSV
      const csvRows = [
        ["Report Type", "Life Balance Tracker Report"],
        ["Period", period],
        ["Generated", new Date().toISOString()],
        ["User", user?.name || user?.email || "Unknown"],
        [],
        ["Tasks"],
        [
          "Date",
          "Module",
          "Title",
          "Status",
          "Priority",
          "Due Date",
          "Duration (min)",
        ],
      ]

      tasks.forEach((task) => {
        csvRows.push([
          task.createdAt.toISOString().split("T")[0],
          task.module,
          task.title,
          task.status,
          task.priority || "",
          task.dueDate?.toISOString().split("T")[0] || "",
          task.duration?.toString() || "",
        ])
      })

      csvRows.push([], ["Sessions"], ["Start Time", "Module", "Duration (min)", "Notes"])

      sessions.forEach((session) => {
        csvRows.push([
          session.startTime.toISOString(),
          session.module,
          session.duration?.toString() || "",
          session.notes || "",
        ])
      })

      const csv = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="balance-report-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    } else {
      // JSON format
      return NextResponse.json({
        user,
        period,
        generatedAt: new Date().toISOString(),
        tasks,
        sessions,
      })
    }
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

