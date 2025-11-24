"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns"
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react"
import { getModuleColor } from "@/lib/utils"
import MobileNav from "@/components/MobileNav"

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showModal, setShowModal] = useState(false)

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

  const handleShowMore = (date: Date) => {
    setSelectedDate(date)
    setShowModal(true)
  }

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : []

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
      <MobileNav currentPath="/calendar" />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Calendar</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <h2 className="text-base sm:text-xl font-semibold text-gray-900 flex-1 sm:flex-none sm:min-w-[200px] text-center">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <Link
              href="/tasks/new"
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Add Task</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 min-w-[600px]">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="bg-gray-50 p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-700"
              >
                {day}
              </div>
            ))}

            {/* Padding days */}
            {paddingDays.map((_, index) => (
              <div key={`pad-${index}`} className="bg-white min-h-[80px] sm:min-h-[100px]" />
            ))}

            {/* Calendar days */}
            {daysInMonth.map((day) => {
              const dayTasks = getTasksForDate(day)
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={day.toISOString()}
                  className={`bg-white min-h-[100px] sm:min-h-[120px] p-1 sm:p-2 border-r border-b ${
                    isToday ? "bg-blue-50 border-2 border-blue-300" : ""
                  }`}
                >
                  <div
                    className={`text-xs sm:text-sm font-bold mb-1 sm:mb-2 ${
                      isToday ? "text-blue-700" : "text-gray-900"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1 sm:space-y-1.5">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className={`text-[10px] sm:text-xs p-1 sm:p-1.5 rounded font-semibold ${getModuleColor(
                          task.module
                        )} ${task.status === "complete" ? "opacity-70 line-through" : ""} truncate shadow-md`}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <button
                        onClick={() => handleShowMore(day)}
                        className="text-[10px] sm:text-xs text-gray-700 font-bold px-1 sm:px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer transition w-full text-left"
                      >
                        +{dayTasks.length - 2} more
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3 sm:gap-6 bg-white rounded-lg shadow p-3 sm:p-4 border border-gray-200">
          <div className="text-xs sm:text-sm font-bold text-gray-900">Legend:</div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded bg-[#3b82f6] border-2 border-[#1d4ed8] shadow-sm"></div>
            <span className="text-xs sm:text-sm font-semibold text-gray-800">College</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded bg-[#10b981] border-2 border-[#047857] shadow-sm"></div>
            <span className="text-xs sm:text-sm font-semibold text-gray-800">Work</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded bg-[#f59e0b] border-2 border-[#b45309] shadow-sm"></div>
            <span className="text-xs sm:text-sm font-semibold text-gray-800">Life</span>
          </div>
        </div>
      </main>

      {/* Tasks Modal */}
      {showModal && selectedDate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] sm:max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex justify-between items-center">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 pr-2">
                Tasks for {format(selectedDate, "MMMM d, yyyy")}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No tasks scheduled for this day.</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {selectedDateTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 sm:p-4 rounded-lg border-2 ${getModuleColor(
                        task.module
                      )} ${task.status === "complete" ? "opacity-70" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-1 sm:gap-2 mb-2">
                            <span className="text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded bg-white/30 text-white">
                              {task.module}
                            </span>
                            {task.priority === "high" && (
                              <span className="text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded bg-red-500 text-white">
                                High Priority
                              </span>
                            )}
                            {task.status === "complete" && (
                              <span className="text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded bg-green-500 text-white">
                                Completed
                              </span>
                            )}
                          </div>
                          <h3
                            className={`font-semibold text-sm sm:text-base text-white mb-1 break-words ${
                              task.status === "complete" ? "line-through" : ""
                            }`}
                          >
                            {task.title}
                          </h3>
                          {task.dueDate && (
                            <p className="text-xs text-white/80">
                              Due: {format(new Date(task.dueDate), "h:mm a")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

