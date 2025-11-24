"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download, ArrowLeft } from "lucide-react"
import MobileNav from "@/components/MobileNav"

interface DailyData {
  date: string
  collegeHours: number
  workHours: number
  lifeHours: number
  tasksCompleted: number
  totalTasks: number
}

interface Analytics {
  period: string
  collegeHours: number
  workHours: number
  lifeHours: number
  totalHours: number
  totalTasks: number
  completedTasks: number
  missedDeadlines: number
  completionRate: number
  balanceScore: number
  dailyData: DailyData[]
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [period, setPeriod] = useState<"week" | "month" | "custom">("week")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin")
    }
    if (status === "authenticated") {
      fetchAnalytics()
    }
  }, [status, period, startDate, endDate])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      let url = `/api/analytics?period=${period}`
      if (period === "custom" && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`
      }
      const response = await fetch(url)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (newPeriod: "week" | "month" | "custom") => {
    setPeriod(newPeriod)
    if (newPeriod === "custom") {
      setShowDatePicker(true)
      // Set default to last 7 days
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      setEndDate(end.toISOString().split("T")[0])
      setStartDate(start.toISOString().split("T")[0])
    } else {
      setShowDatePicker(false)
      setStartDate("")
      setEndDate("")
    }
  }

  const handleExport = async (format: "csv" | "json") => {
    try {
      const response = await fetch(`/api/export?format=${format}&period=${period}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `balance-report-${new Date().toISOString().split("T")[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting:", error)
    }
  }

  if (loading || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading analytics...</div>
      </div>
    )
  }

  const pieData = [
    { name: "College", value: analytics.collegeHours, color: "#3b82f6" },
    { name: "Work", value: analytics.workHours, color: "#10b981" },
    { name: "Life", value: analytics.lifeHours, color: "#f59e0b" },
  ]

  // Format daily data for charts with proper date formatting
  const formattedDailyData = analytics.dailyData.map((day) => ({
    ...day,
    dateFormatted: new Date(day.date).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric" 
    }),
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNav currentPath="/analytics" />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-0 sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex rounded-lg border border-gray-300 w-full sm:w-auto">
              <button
                onClick={() => handlePeriodChange("week")}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-l-lg ${
                  period === "week"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => handlePeriodChange("month")}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium ${
                  period === "month"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => handlePeriodChange("custom")}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-r-lg ${
                  period === "custom"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Custom
              </button>
            </div>
            {showDatePicker && period === "custom" && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 bg-white border border-gray-300 rounded-lg px-2 sm:px-3 py-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">From:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 text-xs sm:text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-900"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">To:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="flex-1 text-xs sm:text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-900"
                  />
                </div>
              </div>
            )}
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Balance Score</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {Math.round(analytics.balanceScore)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Hours</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {analytics.totalHours.toFixed(1)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Completion Rate</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {Math.round(analytics.completionRate * 100)}%
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Missed Deadlines</div>
            <div className="text-2xl sm:text-3xl font-bold text-red-700">
              {analytics.missedDeadlines}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Time Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Time Distribution
            </h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => {
                    if (percent < 0.05) return "" // Hide labels for very small slices
                    return `${name}\n${(percent * 100).toFixed(0)}%`
                  }}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => value}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Hours Bar Chart */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Daily Hours Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart 
                data={formattedDailyData.slice(-7)}
                margin={{ top: 5, right: 10, left: 0, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="dateFormatted"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  wrapperStyle={{ paddingBottom: "10px" }}
                />
                <Bar dataKey="collegeHours" fill="#3b82f6" name="College" />
                <Bar dataKey="workHours" fill="#10b981" name="Work" />
                <Bar dataKey="lifeHours" fill="#f59e0b" name="Life" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Completion Trend */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Task Completion Trend
          </h2>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <LineChart 
              data={formattedDailyData}
              margin={{ top: 5, right: 10, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="dateFormatted"
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ paddingBottom: "10px" }}
              />
              <Line
                type="monotone"
                dataKey="tasksCompleted"
                stroke="#10b981"
                strokeWidth={3}
                name="Completed"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="totalTasks"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Total"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  )
}

