"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lightbulb, CheckCircle2, X } from "lucide-react"
import MobileNav from "@/components/MobileNav"

interface Recommendation {
  id: string
  type: string
  title: string
  description: string
  action: string | null
  priority: string
  isRead: boolean
  isApplied: boolean
  createdAt: string
}

export default function RecommendationsPage() {
  const { data: session, status } = useSession()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin")
    }
    if (status === "authenticated") {
      fetchRecommendations()
    }
  }, [status])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/recommendations")
      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error("Error fetching recommendations:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/recommendations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      })
      setRecommendations((recs) =>
        recs.map((rec) => (rec.id === id ? { ...rec, isRead: true } : rec))
      )
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  const markAsApplied = async (id: string) => {
    try {
      await fetch(`/api/recommendations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApplied: true, isRead: true }),
      })
      setRecommendations((recs) =>
        recs.map((rec) => (rec.id === id ? { ...rec, isApplied: true, isRead: true } : rec))
      )
    } catch (error) {
      console.error("Error marking as applied:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500 bg-red-50"
      case "medium":
        return "border-yellow-500 bg-yellow-50"
      default:
        return "border-blue-500 bg-blue-50"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading recommendations...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNav />

      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Recommendations</h1>
            </div>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No recommendations yet
            </h2>
            <p className="text-gray-500">
              Keep tracking your activities and we&apos;ll provide personalized suggestions to
              improve your balance.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`bg-white rounded-lg shadow border-l-4 p-4 sm:p-6 ${getPriorityColor(
                  rec.priority
                )} ${rec.isRead ? "opacity-75" : ""}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{rec.title}</h3>
                      {rec.priority === "high" && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded whitespace-nowrap">
                          High Priority
                        </span>
                      )}
                      {rec.isApplied && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded whitespace-nowrap">
                          Applied
                        </span>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 break-words">{rec.description}</p>
                    {rec.action && (
                      <div className="bg-white rounded p-2 sm:p-3 border border-gray-200">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Action:</p>
                        <p className="text-xs sm:text-sm text-gray-600 break-words">{rec.action}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {!rec.isApplied && (
                    <button
                      onClick={() => markAsApplied(rec.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
                    >
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Mark as Applied</span>
                    </button>
                  )}
                  {!rec.isRead && (
                    <button
                      onClick={() => markAsRead(rec.id)}
                      className="px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-800"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

