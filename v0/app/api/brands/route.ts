import { NextResponse } from "next/server"

const mockBrands = [
  {
    id: "b1",
    name: "Luxe Materials",
    website: "luxematerials.com",
    phone: "+1-800-123-4567",
    salesName: "John Smith",
    salesContact: "john@luxematerials.com",
    isActive: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "b2",
    name: "Stone & Co",
    website: "stoneandco.com",
    phone: "+1-800-987-6543",
    salesName: "Sarah Johnson",
    salesContact: "sarah@stoneandco.com",
    isActive: true,
    createdAt: "2024-01-02T10:00:00Z",
    updatedAt: "2024-01-02T10:00:00Z",
  },
  {
    id: "b3",
    name: "Premium Ceramics",
    website: "premiumceramics.com",
    phone: "+1-800-555-1234",
    salesName: "Michael Brown",
    salesContact: "michael@premiumceramics.com",
    isActive: true,
    createdAt: "2024-01-03T10:00:00Z",
    updatedAt: "2024-01-03T10:00:00Z",
  },
]

export async function GET() {
  return NextResponse.json({
    brands: mockBrands.filter((b) => b.isActive),
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const newBrand = {
    ...body,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return NextResponse.json(newBrand, { status: 201 })
}
