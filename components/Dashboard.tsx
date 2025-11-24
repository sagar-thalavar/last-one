"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { format } from "date-fns"
import {
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  BarChart3,
  Lightbulb,
} from "lucide-react"
import { formatDuration, getModuleColor, getModuleBadgeColor } from "@/lib/utils"
import TimeTracker from "./TimeTracker"
import MobileNav from "./MobileNav"

interface Task {
  id: string
  module: string
  title: string
  status: string
  dueDate: string | null
  priority: string | null
  duration: number | null
}

interface Analytics {
  balanceScore: number
  collegeHours: number
  workHours: number
  lifeHours: number
  totalTasks: number
  completedTasks: number
  missedDeadlines: number
}

export default function Dashboard() {
  const { data: session } = useSession()
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd")
      const [tasksRes, analyticsRes] = await Promise.all([
        fetch(`/api/tasks?date=${today}`),
        fetch("/api/analytics?period=week"),
      ])

      const tasksData = await tasksRes.json()
      const analyticsData = await analyticsRes.json()

      setTodayTasks(tasksData.tasks || [])
      setAnalytics(analyticsData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "complete" ? "planned" : "complete"
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchDashboardData()
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-700"
    if (score >= 60) return "text-yellow-700"
    return "text-red-700"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNav currentPath="/" />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Time Tracker */}
        <div className="mb-6">
          <TimeTracker />
        </div>

        {/* Balance Score Card */}
        {analytics && (
          <div className="mb-6 sm:mb-8 bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  Balance Score
                </h2>
                <div className="flex items-baseline space-x-2">
                  <span
                    className={`text-3xl sm:text-4xl font-bold ${getScoreColor(
                      analytics.balanceScore
                    )}`}
                  >
                    {Math.round(analytics.balanceScore)}
                  </span>
                  <span className="text-gray-400 text-lg sm:text-xl">/ 100</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center w-full sm:w-auto">
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">College</div>
                  <div className="text-base sm:text-lg font-bold text-college">
                    {analytics.collegeHours.toFixed(1)}h
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">Work</div>
                  <div className="text-base sm:text-lg font-bold text-work">
                    {analytics.workHours.toFixed(1)}h
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">Life</div>
                  <div className="text-base sm:text-lg font-bold text-life">
                    {analytics.lifeHours.toFixed(1)}h
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Today's Tasks */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Today&apos;s Tasks
              </h2>
              <Link
                href="/tasks/new"
                className="flex items-center space-x-1 text-xs sm:text-sm text-blue-600 hover:text-blue-700 whitespace-nowrap"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Add Task</span>
              </Link>
            </div>
            <div className="p-4 sm:p-6">
              {todayTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No tasks for today. Add one to get started!</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 sm:p-4 rounded-lg border-2 ${getModuleColor(
                        task.module
                      )} flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-3`}
                    >
                      <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0 w-full">
                        <button
                          onClick={() => toggleTaskStatus(task.id, task.status)}
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            task.status === "complete"
                              ? "bg-green-600 border-green-600"
                              : "border-gray-400 bg-white"
                          }`}
                        >
                          {task.status === "complete" && (
                            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-1 sm:gap-2 mb-1">
                            <span className={`text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded ${getModuleBadgeColor(task.module)}`}>
                              {task.module}
                            </span>
                            {task.priority === "high" && (
                              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                            )}
                          </div>
                          <h3
                            className={`font-semibold text-xs sm:text-sm break-words ${
                              task.status === "complete"
                                ? "line-through text-gray-500"
                                : "text-gray-900"
                            }`}
                          >
                            {task.title}
                          </h3>
                          {task.dueDate && (
                            <p className="text-xs text-gray-600 mt-1">
                              Due: {format(new Date(task.dueDate), "MMM d, h:mm a")}
                            </p>
                          )}
                        </div>
                      </div>
                      {task.duration && (
                        <div className="text-xs sm:text-sm font-medium text-white bg-black/20 px-2 py-1 rounded flex-shrink-0 self-start sm:self-auto">
                          {formatDuration(task.duration)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats & Actions */}
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Stats */}
            {analytics && (
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  This Week
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-600">
                        Completed Tasks
                      </span>
                    </div>
                    <span className="font-semibold">
                      {analytics.completedTasks} / {analytics.totalTasks}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-600">Total Hours</span>
                    </div>
                    <span className="font-semibold">
                      {(analytics.collegeHours + analytics.workHours + analytics.lifeHours).toFixed(1)}h
                    </span>
                  </div>
                  {analytics.missedDeadlines > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-gray-600">
                          Missed Deadlines
                        </span>
                      </div>
                      <span className="font-semibold text-red-600">
                        {analytics.missedDeadlines}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href="/tasks/new"
                  className="block w-full text-left px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                >
                  + Add New Task
                </Link>
                <Link
                  href="/analytics"
                  className="flex items-center w-full text-left px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition"
                >
                  <BarChart3 className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>View Analytics</span>
                </Link>
                <Link
                  href="/recommendations"
                  className="flex items-center w-full text-left px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition"
                >
                  <Lightbulb className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Get Recommendations</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

