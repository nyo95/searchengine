import { NextRequest, NextResponse } from 'next/server'

// Mock suggestions data
const mockSuggestions = [
  'downlight 3000K',
  'downlight 4000K',
  'HPL Taco',
  'HPL walnut',
  'ergonomic chair',
  'office chair',
  'lampu sorot',
  'spotlight',
  'vinyl flooring',
  'solid surface',
  'kitchen cabinet',
  'door handle',
  'engsel pintu',
  'wallpaper',
  'wallcover'
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!query.trim() || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Filter suggestions based on query
    const filteredSuggestions = mockSuggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit)

    return NextResponse.json({ suggestions: filteredSuggestions })

  } catch (error) {
    console.error('Suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    )
  }
}