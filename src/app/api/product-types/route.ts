import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const productTypes = await db.productType.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(productTypes);
  } catch (error) {
    console.error('Error fetching product types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product types' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Product type name is required' },
        { status: 400 }
      );
    }

    // Check if product type already exists
    const existingProductType = await db.productType.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (existingProductType) {
      return NextResponse.json(
        { error: 'Product type with this name already exists' },
        { status: 409 }
      );
    }

    const productType = await db.productType.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    });

    return NextResponse.json(productType, { status: 201 });
  } catch (error) {
    console.error('Error creating product type:', error);
    return NextResponse.json(
      { error: 'Failed to create product type' },
      { status: 500 }
    );
  }
}