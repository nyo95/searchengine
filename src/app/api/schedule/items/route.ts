import { NextRequest, NextResponse } from 'next/server'

// Mock storage for schedule items
let scheduleItems: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      scheduleId,
      productId,
      variantId,
      productName,
      brandName,
      sku,
      price,
      attributes,
      quantity,
      unitOfMeasure,
      area,
      notes
    } = body

    // Validate required fields
    if (!scheduleId || !productId || !productName || !brandName || !sku || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newItem = {
      id: Date.now().toString(),
      scheduleId,
      productId,
      variantId,
      productName,
      brandName,
      sku,
      price: parseFloat(price),
      attributes: attributes || {},
      quantity: parseInt(quantity) || 1,
      unitOfMeasure: unitOfMeasure || 'pcs',
      area: area || '',
      notes: notes || '',
      createdAt: new Date().toISOString()
    }

    scheduleItems.push(newItem)

    console.log('Added to schedule:', newItem)

    return NextResponse.json({ 
      success: true, 
      item: newItem 
    })

  } catch (error) {
    console.error('Schedule item creation error:', error)
    return NextResponse.json(
      { error: 'Failed to add item to schedule' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const scheduleId = searchParams.get('scheduleId')

    if (scheduleId === 'default') {
      // Return mock data for default schedule
      const mockScheduleItems = [
        {
          id: '1',
          scheduleId: 'default',
          productId: '1',
          variantId: 'v1',
          productName: 'Downlight LED 3W 3000K',
          brandName: 'Philips',
          sku: 'PH-DL-3W-30K',
          price: 150000,
          attributes: { wattage: '3W', cri: '90', cct: '3000K' },
          quantity: 25,
          unitOfMeasure: 'pcs',
          area: 'Main Office',
          notes: 'Install in grid pattern',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          scheduleId: 'default',
          productId: '3',
          variantId: 'v3',
          productName: 'Ergonomic Office Chair',
          brandName: 'Herman Miller',
          sku: 'HM-CHAIR-ERG-01',
          price: 8500000,
          attributes: { material: 'Mesh', color: 'Black' },
          quantity: 10,
          unitOfMeasure: 'pcs',
          area: 'Work Area',
          notes: 'With lumbar support',
          createdAt: new Date().toISOString()
        }
      ]
      return NextResponse.json({ items: mockScheduleItems })
    }

    if (scheduleId) {
      const items = scheduleItems.filter(item => item.scheduleId === scheduleId)
      return NextResponse.json({ items })
    }

    return NextResponse.json({ items: scheduleItems })

  } catch (error) {
    console.error('Schedule items fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule items' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    scheduleItems = scheduleItems.filter(item => item.id !== itemId)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Schedule item deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete schedule item' },
      { status: 500 }
    )
  }
}