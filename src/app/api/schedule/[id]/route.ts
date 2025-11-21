import { NextRequest, NextResponse } from 'next/server'

// Reuse the same in-memory schedules array defined in the base route module.
// Module scoping differs per file, so keep a lightweight fallback here too.
type ScheduleRecord = {
  id: string
  name: string
  description?: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

const globalStore = globalThis as unknown as { __schedules?: ScheduleRecord[] }
const schedules = globalStore.__schedules ?? (globalStore.__schedules = [])

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  const schedule = schedules.find((item) => item.id === context.params.id)
  if (!schedule) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
  }

  return NextResponse.json({ schedule })
}
