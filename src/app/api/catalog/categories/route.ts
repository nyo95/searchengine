import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_request: NextRequest) {
  try {
    const all = await db.category.findMany({
      orderBy: { name: 'asc' },
    })
    const byParent: Record<string, any[]> = {}
    all.forEach((c) => {
      const key = c.parentId || '__root__'
      byParent[key] = byParent[key] || []
      byParent[key].push(c)
    })
    const roots = byParent['__root__'] || []
    const result = roots.map((r) => ({
      id: r.id,
      name: r.name,
      children: (byParent[r.id] || []).map((s) => ({ id: s.id, name: s.name })),
    }))
    return NextResponse.json({ categories: result })
  } catch (e) {
    console.error('Categories error', e)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

