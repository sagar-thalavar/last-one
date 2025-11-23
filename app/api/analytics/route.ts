import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { calculateBalanceScore } from "@/lib/utils"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "week" // week, month, custom
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    let startDate: Date
    let endDate: Date = new Date()
    endDate.setHours(23, 59, 59, 999)

    if (startDateParam && endDateParam) {
      // Custom date range
      startDate = new Date(startDateParam)
      endDate = new Date(endDateParam)
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
    } else {
      // Default period-based calculation - go back from today (inclusive)
      const daysBack = period === "week" ? 6 : period === "month" ? 29 : 6
      startDate = new Date()
      startDate.setDate(startDate.getDate() - daysBack) // Include today
      startDate.setHours(0, 0, 0, 0)
    }

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Get all tasks in the period
    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate, lte: endDate },
      },
    })

    // Get all sessions in the period
    const sessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
        startTime: { gte: startDate, lte: endDate },
      },
    })

    // Calculate time spent per module
    const collegeHours =
      sessions
        .filter((s) => s.module === "College")
        .reduce((sum, s) => sum + (s.duration || 0), 0) / 60
    const workHours =
      sessions
        .filter((s) => s.module === "Work")
        .reduce((sum, s) => sum + (s.duration || 0), 0) / 60
    const lifeHours =
      sessions
        .filter((s) => s.module === "Life")
        .reduce((sum, s) => sum + (s.duration || 0), 0) / 60

    // Calculate task statistics
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === "complete").length
    const missedDeadlines = tasks.filter(
      (t) => t.dueDate && t.dueDate < new Date() && t.status !== "complete"
    ).length

    // Get average sleep (from user profile or calculate from sessions)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })
    const sleepHours = user?.sleepTarget || 8

    // Calculate Balance Score
    const balanceScore = calculateBalanceScore(
      collegeHours,
      workHours,
      lifeHours,
      sleepHours,
      missedDeadlines,
      completedTasks,
      totalTasks
    )

    // Daily breakdown
    const dailyData: Record<string, any> = {}
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split("T")[0]

      const dayTasks = tasks.filter(
        (t) => t.createdAt.toISOString().split("T")[0] === dateStr
      )
      const daySessions = sessions.filter(
        (s) => s.startTime.toISOString().split("T")[0] === dateStr
      )

      dailyData[dateStr] = {
        date: dateStr,
        collegeHours:
          daySessions
            .filter((s) => s.module === "College")
            .reduce((sum, s) => sum + (s.duration || 0), 0) / 60,
        workHours:
          daySessions
            .filter((s) => s.module === "Work")
            .reduce((sum, s) => sum + (s.duration || 0), 0) / 60,
        lifeHours:
          daySessions
            .filter((s) => s.module === "Life")
            .reduce((sum, s) => sum + (s.duration || 0), 0) / 60,
        tasksCompleted: dayTasks.filter((t) => t.status === "complete").length,
        totalTasks: dayTasks.length,
      }
    }

    return NextResponse.json({
      period,
      collegeHours,
      workHours,
      lifeHours,
      totalHours: collegeHours + workHours + lifeHours,
      totalTasks,
      completedTasks,
      missedDeadlines,
      completionRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
      balanceScore,
      dailyData: Object.values(dailyData),
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

