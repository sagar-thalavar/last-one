"use client"

import { useEffect, useState } from "react"
import { Play, Square, Clock } from "lucide-react"
import { formatDuration, getModuleColor } from "@/lib/utils"
import { format } from "date-fns"

interface Task {
  id: string
  title: string
  module: string
}

interface ActiveSession {
  id: string
  module: string
  taskId: string | null
  startTime: string
  notes: string | null
}

export default function TimeTracker() {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isStarting, setIsStarting] = useState(false)
  const [showStartForm, setShowStartForm] = useState(false)
  const [formData, setFormData] = useState({
    module: "College" as "College" | "Work" | "Life",
    taskId: "",
    notes: "",
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)

  useEffect(() => {
    fetchActiveSession()
  }, [])

  useEffect(() => {
    if (activeSession) {
      const interval = setInterval(() => {
        const start = new Date(activeSession.startTime).getTime()
        const now = Date.now()
        setElapsedTime(Math.round((now - start) / 1000 / 60)) // minutes
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [activeSession?.id, activeSession?.startTime])

  useEffect(() => {
    if (showStartForm && formData.module) {
      fetchTasksForModule()
    }
  }, [showStartForm, formData.module])

  const fetchActiveSession = async () => {
    try {
      const response = await fetch("/api/sessions?active=true")
      const data = await response.json()
      if (data.sessions && data.sessions.length > 0) {
        const session = data.sessions[0]
        setActiveSession(session)
        const start = new Date(session.startTime).getTime()
        const now = Date.now()
        setElapsedTime(Math.round((now - start) / 1000 / 60))
        
        // Fetch tasks for the module to show task name
        if (session.module) {
          try {
            const taskResponse = await fetch(`/api/tasks?module=${session.module}`)
            const taskData = await taskResponse.json()
            if (taskData.tasks && taskData.tasks.length > 0) {
              setTasks(taskData.tasks)
            }
          } catch (err) {
            // Ignore task fetch errors
          }
        }
      } else {
        setActiveSession(null)
        setElapsedTime(0)
      }
    } catch (error) {
      console.error("Error fetching active session:", error)
    }
  }

  const fetchTasksForModule = async () => {
    setLoadingTasks(true)
    try {
      // Fetch all tasks for the module (not just planned, so user can track any task)
      const response = await fetch(`/api/tasks?module=${formData.module}`)
      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoadingTasks(false)
    }
  }

  const handleStart = async () => {
    setIsStarting(true)
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: formData.module,
          taskId: formData.taskId || null,
          notes: formData.notes || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to start tracking")
        return
      }

      setActiveSession(data.session)
      setShowStartForm(false)
      setFormData({ module: "College", taskId: "", notes: "" })
    } catch (error) {
      console.error("Error starting session:", error)
      alert("Failed to start time tracking")
    } finally {
      setIsStarting(false)
    }
  }

  const handleStop = async () => {
    if (!activeSession) return

    try {
      const response = await fetch(`/api/sessions/${activeSession.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: formData.notes || activeSession.notes,
        }),
      })

      if (!response.ok) {
        alert("Failed to stop tracking")
        return
      }

      setActiveSession(null)
      setElapsedTime(0)
      fetchActiveSession() // Refresh to make sure it's stopped
    } catch (error) {
      console.error("Error stopping session:", error)
      alert("Failed to stop time tracking")
    }
  }

  if (activeSession) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border-2 border-blue-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Time Tracking Active</h3>
              <p className="text-sm text-gray-500">
                {activeSession.module}
                {activeSession.taskId && tasks.length > 0 && tasks.find((t) => t.id === activeSession.taskId) && (
                  <span> • {tasks.find((t) => t.id === activeSession.taskId)?.title}</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleStop}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <Square className="w-4 h-4" />
            <span>Stop</span>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {formatDuration(elapsedTime)}
            </div>
            <div className="text-sm text-gray-500">
              Started at {format(new Date(activeSession.startTime), "h:mm a")}
            </div>
          </div>
          {activeSession.notes && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              {activeSession.notes}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (showStartForm) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Start Time Tracker</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.module}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  module: e.target.value as typeof formData.module,
                  taskId: "", // Reset task when module changes
                })
              }
            >
              <option value="College">College</option>
              <option value="Work">Work</option>
              <option value="Life">Life</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task (optional)
            </label>
            {loadingTasks ? (
              <div className="text-sm text-gray-500">Loading tasks...</div>
            ) : (
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.taskId}
                onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
              >
                <option value="">No specific task</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="What are you working on?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Play className="w-4 h-4" />
              <span>{isStarting ? "Starting..." : "Start Tracking"}</span>
            </button>
            <button
              onClick={() => {
                setShowStartForm(false)
                setFormData({ module: "College", taskId: "", notes: "" })
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Time Tracker</h3>
          <p className="text-sm text-gray-500 mt-1">
            Track time spent on your tasks
          </p>
        </div>
        <button
          onClick={() => setShowStartForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Play className="w-4 h-4" />
          <span>Start Tracker</span>
        </button>
      </div>
    </div>
  )
}

