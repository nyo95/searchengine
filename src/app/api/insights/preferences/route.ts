import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')?.trim() || 'anonymous'

    const preferences = await db.userPreference.findMany({
      where: { userId },
      orderBy: { weight: 'desc' },
      take: 5,
    })

    if (preferences.length) {
      return NextResponse.json({ userId, preferences })
    }

    const globalTop = await db.userPreference.groupBy({
      by: ['type', 'value'],
      _sum: { weight: true },
      orderBy: { _sum: { weight: 'desc' } },
      take: 5,
    })

    return NextResponse.json({
      userId,
      preferences: globalTop.map((pref) => ({
        type: pref.type,
        value: pref.value,
        weight: pref._sum.weight || 0,
      })),
    })
  } catch (error) {
    console.error('Preferences API error:', error)
    return NextResponse.json({ error: 'Failed to load top preferences' }, { status: 500 })
  }
}
