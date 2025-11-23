"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns"
import { ArrowLeft, ArrowRight, Plus } from "lucide-react"
import { getModuleColor } from "@/lib/utils"

interface Task {
  id: string
  module: string
  title: string
  dueDate: string | null
  status: string
  priority: string | null
}

export default function CalendarPage() {
  const { data: session, status } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin")
    }
    if (status === "authenticated") {
      fetchTasks()
    }
  }, [status, currentDate])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks")
      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get first day of month to pad calendar
  const firstDayOfMonth = monthStart.getDay()
  const paddingDays = Array(firstDayOfMonth).fill(null)

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false
      return isSameDay(new Date(task.dueDate), date)
    })
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading calendar...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-gray-900">
                One Last
              </Link>
              <div className="flex space-x-4">
                <Link href="/" className="text-gray-500 hover:text-gray-900">
                  Today
                </Link>
                <Link
                  href="/calendar"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Calendar
                </Link>
                <Link
                  href="/analytics"
                  className="text-gray-500 hover:text-gray-900"
                >
                  Analytics
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{session?.user?.email}</span>
              <Link
                href="/api/auth/signout"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              href="/tasks/new"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700"
              >
                {day}
              </div>
            ))}

            {/* Padding days */}
            {paddingDays.map((_, index) => (
              <div key={`pad-${index}`} className="bg-white min-h-[100px]" />
            ))}

            {/* Calendar days */}
            {daysInMonth.map((day) => {
              const dayTasks = getTasksForDate(day)
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={day.toISOString()}
                  className={`bg-white min-h-[120px] p-2 border-r border-b ${
                    isToday ? "bg-blue-50 border-2 border-blue-300" : ""
                  }`}
                >
                  <div
                    className={`text-sm font-bold mb-2 ${
                      isToday ? "text-blue-700" : "text-gray-900"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1.5">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className={`text-xs p-1.5 rounded font-semibold ${getModuleColor(
                          task.module
                        )} ${task.status === "complete" ? "opacity-70 line-through" : ""} truncate shadow-md`}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-gray-700 font-bold px-1.5 py-0.5 bg-gray-100 rounded">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center space-x-6 bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="text-sm font-bold text-gray-900">Legend:</div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-[#3b82f6] border-2 border-[#1d4ed8] shadow-sm"></div>
            <span className="text-sm font-semibold text-gray-800">College</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-[#10b981] border-2 border-[#047857] shadow-sm"></div>
            <span className="text-sm font-semibold text-gray-800">Work</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-[#f59e0b] border-2 border-[#b45309] shadow-sm"></div>
            <span className="text-sm font-semibold text-gray-800">Life</span>
          </div>
        </div>
      </main>
    </div>
  )
}

