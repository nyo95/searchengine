"use client"

import { useCallback, useEffect, useState } from 'react'

export type ScheduleSummary = {
  id: string
  name: string
  description?: string | null
  createdAt: string
  updatedAt: string
  itemsCount: number
}

export function useSchedules(userId: string) {
  const [schedules, setSchedules] = useState<ScheduleSummary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const createSchedule = useCallback(
    async ({ name, description }: { name: string; description?: string | null }) => {
      if (!userId) throw new Error('User is required to create schedules')
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, description }),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error || 'Failed to create schedule')
      }
      const data = await response.json()
      setSchedules((prev) => [data.schedule, ...prev])
      return data.schedule as ScheduleSummary
    },
    [userId],
  )

  const fetchSchedules = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/schedule?userId=${encodeURIComponent(userId)}`)
      if (!response.ok) {
        throw new Error('Failed to load schedules')
      }
      const data = await response.json()
      setSchedules(data.schedules || [])
    } catch (err) {
      console.error(err)
      setError('Failed to load schedules')
      setSchedules([])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  return {
    schedules,
    isLoading,
    error,
    refresh: fetchSchedules,
    createSchedule,
    setSchedules,
  }
}
