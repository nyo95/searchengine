import { NextRequest, NextResponse } from 'next/server'

// ProductType model is not defined in the current Prisma schema; return an empty list
// so the UI can still render without backend support.
export async function GET(_request: NextRequest) {
  return NextResponse.json({ productTypes: [] })
}

