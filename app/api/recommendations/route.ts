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

    // Calculate analytics directly
    const period = "week"
    const days = 7
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
      },
    })

    const sessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
        startTime: { gte: startDate },
      },
    })

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

    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === "complete").length
    const missedDeadlines = tasks.filter(
      (t) => t.dueDate && t.dueDate < new Date() && t.status !== "complete"
    ).length

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })
    const sleepHours = user?.sleepTarget || 8

    const balanceScore = calculateBalanceScore(
      collegeHours,
      workHours,
      lifeHours,
      sleepHours,
      missedDeadlines,
      completedTasks,
      totalTasks
    )

    const analytics = {
      collegeHours,
      workHours,
      lifeHours,
      totalTasks,
      completedTasks,
      missedDeadlines,
      completionRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
      balanceScore,
    }

    const recommendations: any[] = []

    // Recommendation 1: Time balance
    const totalHours = analytics.collegeHours + analytics.workHours + analytics.lifeHours
    if (totalHours > 0) {
      const collegeRatio = analytics.collegeHours / totalHours
      const workRatio = analytics.workHours / totalHours
      const lifeRatio = analytics.lifeHours / totalHours

      if (collegeRatio > 0.5) {
        recommendations.push({
          type: "time_shift",
          title: "High College Load",
          description: `You're spending ${Math.round(collegeRatio * 100)}% of your time on college work.`,
          action: "Consider shifting 30 minutes from college work to life activities for better balance.",
          priority: "high",
        })
      }

      if (workRatio > 0.5) {
        recommendations.push({
          type: "time_shift",
          title: "High Work Load",
          description: `You're spending ${Math.round(workRatio * 100)}% of your time on work.`,
          action: "Schedule regular breaks and protect personal time.",
          priority: "high",
        })
      }

      if (lifeRatio < 0.2 && totalHours > 20) {
        recommendations.push({
          type: "time_shift",
          title: "Low Life Balance",
          description: "You're spending very little time on personal activities.",
          action: "Add 30 minutes daily for hobbies, exercise, or relaxation.",
          priority: "medium",
        })
      }
    }

    // Recommendation 2: Missed deadlines
    if (analytics.missedDeadlines > 0) {
      recommendations.push({
        type: "deadline",
        title: "Missed Deadlines",
        description: `You have ${analytics.missedDeadlines} missed deadline(s) this week.`,
        action: "Review your calendar and break down large tasks into smaller chunks.",
        priority: "high",
      })
    }

    // Recommendation 3: Task completion
    if (analytics.totalTasks > 0 && analytics.completionRate < 0.7) {
      recommendations.push({
        type: "productivity",
        title: "Low Completion Rate",
        description: `Only ${Math.round(analytics.completionRate * 100)}% of tasks are completed.`,
        action: "Focus on completing 2-3 high-priority tasks daily before adding new ones.",
        priority: "medium",
      })
    }

    // Recommendation 4: Sleep
    if (user?.sleepTarget && analytics.balanceScore < 60) {
      recommendations.push({
        type: "sleep",
        title: "Sleep Quality Impact",
        description: "Your balance score suggests sleep might be affecting your performance.",
        action: `Aim for ${user.sleepTarget} hours of sleep consistently. Try going to bed 30 minutes earlier.`,
        priority: "medium",
      })
    }

    // Recommendation 5: Recovery time
    if (analytics.workHours > 40 || analytics.collegeHours > 30) {
      recommendations.push({
        type: "break",
        title: "Heavy Workload",
        description: "You've had a very busy week with long hours.",
        action: "Schedule recovery time: take a 20-minute walk or do a short meditation session.",
        priority: "medium",
      })
    }

    // Save recommendations to database
    const savedRecs = await Promise.all(
      recommendations.map((rec) =>
        prisma.recommendation.create({
          data: {
            userId: session.user.id,
            ...rec,
          },
        })
      )
    )

    // Get existing unread recommendations
    const existingRecs = await prisma.recommendation.findMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    return NextResponse.json({
      recommendations: [...savedRecs, ...existingRecs].slice(0, 10),
    })
  } catch (error) {
    console.error("Error generating recommendations:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

