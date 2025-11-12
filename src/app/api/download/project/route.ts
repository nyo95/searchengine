import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const zipPath = path.join(process.cwd(), 'architecture-product-catalog.tar.gz')
    
    // Check if zip file exists
    try {
      await fs.access(zipPath)
    } catch {
      // If file doesn't exist, return instructions
      return NextResponse.json({
        message: 'Project archive not found. Please create the archive first.',
        instructions: [
          '1. Open terminal in project directory',
          '2. Run: tar -czf architecture-product-catalog.tar.gz --exclude="node_modules" --exclude=".git" --exclude=".next" --exclude="dev.log" .',
          '3. Try download again'
        ]
      }, { status: 404 })
    }

    // Read the zip file
    const fileBuffer = await fs.readFile(zipPath)
    
    // Return the file as download
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': 'attachment; filename="architecture-product-catalog.tar.gz"',
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download project' },
      { status: 500 }
    )
  }
}