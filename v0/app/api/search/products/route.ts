import { NextResponse } from "next/server"

const mockProducts = [
  {
    id: "1",
    sku: "SKU001",
    name: "Premium Marble Tile",
    internalCode: "MARBLE-WHITE-600",
    description: "High-quality white marble tile perfect for modern interiors",
    imageUrl: "/marble-tile.jpg",
    brand: { id: "b1", name: "Luxe Materials" },
    category: { id: "c1", name: "Tiles" },
    subcategory: { id: "sc1", name: "Marble", prefix: "MAR" },
    dynamicAttributes: { finish: "polished", thickness: "20mm" },
    tags: ["marble", "luxury", "tile"],
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    sku: "SKU002",
    name: "Granite Countertop",
    internalCode: "GRANITE-BLK-300",
    description: "Durable black granite countertop with premium finish",
    imageUrl: "/granite-countertop.jpg",
    brand: { id: "b2", name: "Stone & Co" },
    category: { id: "c1", name: "Countertops" },
    subcategory: { id: "sc2", name: "Granite", prefix: "GRN" },
    dynamicAttributes: { finish: "brushed", thickness: "30mm" },
    tags: ["granite", "countertop", "premium"],
    isActive: true,
    createdAt: "2024-01-16T10:00:00Z",
    updatedAt: "2024-01-16T10:00:00Z",
  },
  {
    id: "3",
    sku: "SKU003",
    name: "Ceramic Floor Tile",
    internalCode: "CERAMIC-GREY-450",
    description: "Versatile grey ceramic tiles for any room",
    imageUrl: "/ceramic-floor-tile.png",
    brand: { id: "b1", name: "Luxe Materials" },
    category: { id: "c1", name: "Tiles" },
    subcategory: { id: "sc3", name: "Ceramic", prefix: "CER" },
    dynamicAttributes: { finish: "matte", thickness: "10mm" },
    tags: ["ceramic", "floor", "tile"],
    isActive: true,
    createdAt: "2024-01-17T10:00:00Z",
    updatedAt: "2024-01-17T10:00:00Z",
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || ""

  const filtered = mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.internalCode.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase()) ||
      p.brand.name.toLowerCase().includes(query.toLowerCase()),
  )

  return NextResponse.json({
    items: filtered,
    total: filtered.length,
    page: 1,
    pageSize: 100,
  })
}
