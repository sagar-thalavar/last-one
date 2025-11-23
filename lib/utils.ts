import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function getModuleColor(module: string): string {
  switch (module.toLowerCase()) {
    case "college":
      return "bg-[#3b82f6] text-white border-2 border-[#1d4ed8] font-medium"
    case "work":
      return "bg-[#10b981] text-white border-2 border-[#047857] font-medium"
    case "life":
      return "bg-[#f59e0b] text-white border-2 border-[#b45309] font-medium"
    default:
      return "bg-gray-500 text-white border-2 border-gray-600 font-medium"
  }
}

export function getModuleBadgeColor(module: string): string {
  switch (module.toLowerCase()) {
    case "college":
      return "bg-[#3b82f6] text-white border border-[#1d4ed8] font-bold"
    case "work":
      return "bg-[#10b981] text-white border border-[#047857] font-bold"
    case "life":
      return "bg-[#f59e0b] text-white border border-[#b45309] font-bold"
    default:
      return "bg-gray-500 text-white border border-gray-600 font-bold"
  }
}

export function calculateBalanceScore(
  collegeHours: number,
  workHours: number,
  lifeHours: number,
  sleepHours: number,
  missedDeadlines: number,
  completedTasks: number,
  totalTasks: number,
  stressLevel?: number
): number {
  // Base score starts at 100
  let score = 100

  // Time balance (40% weight)
  const totalHours = collegeHours + workHours + lifeHours
  if (totalHours > 0) {
    const collegeRatio = collegeHours / totalHours
    const workRatio = workHours / totalHours
    const lifeRatio = lifeHours / totalHours

    // Ideal distribution: 40% college, 30% work, 30% life (adjustable)
    const idealCollege = 0.4
    const idealWork = 0.3
    const idealLife = 0.3

    const balanceDeviation =
      Math.abs(collegeRatio - idealCollege) +
      Math.abs(workRatio - idealWork) +
      Math.abs(lifeRatio - idealLife)

    score -= balanceDeviation * 40 // Max 40 points deduction
  }

  // Task completion (25% weight)
  if (totalTasks > 0) {
    const completionRate = completedTasks / totalTasks
    score -= (1 - completionRate) * 25 // Max 25 points deduction
  }

  // Missed deadlines (20% weight)
  score -= Math.min(missedDeadlines * 5, 20) // Max 20 points deduction

  // Sleep quality (10% weight)
  if (sleepHours) {
    const idealSleep = 8
    const sleepDeviation = Math.abs(sleepHours - idealSleep)
    score -= Math.min(sleepDeviation * 1.25, 10) // Max 10 points deduction
  }

  // Stress level (5% weight)
  if (stressLevel) {
    score -= (stressLevel - 1) * 0.56 // Max 5 points deduction (1-10 scale)
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

