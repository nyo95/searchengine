import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('scheduleId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const [scheduleItems, total] = await Promise.all([
      db.scheduleItem.findMany({
        where: { scheduleId },
        include: {
          product: {
            include: {
              brand: true,
              productType: true
            }
          }
        },
        orderBy: {
          code: 'asc'
        },
        skip,
        take: limit
      }),
      db.scheduleItem.count({ where: { scheduleId } })
    ]);

    return NextResponse.json({
      scheduleItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching schedule items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      code, 
      description, 
      quantity, 
      unit, 
      notes, 
      productId, 
      scheduleId,
      source,
      attributes 
    } = await request.json();

    if (!code || code.trim() === '') {
      return NextResponse.json(
        { error: 'Item code is required' },
        { status: 400 }
      );
    }

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    // Check if schedule exists
    const schedule = await db.schedule.findUnique({
      where: { id: scheduleId }
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Check for duplicate code within the same schedule
    const existingItem = await db.scheduleItem.findFirst({
      where: {
        scheduleId,
        code: {
          equals: code.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (existingItem) {
      return NextResponse.json(
        { error: 'Item with this code already exists in this schedule' },
        { status: 409 }
      );
    }

    // If productId is provided, verify it exists
    if (productId) {
      const product = await db.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
    }

    const scheduleItem = await db.scheduleItem.create({
      data: {
        code: code.trim(),
        description: description?.trim() || null,
        quantity: quantity || null,
        unit: unit?.trim() || null,
        notes: notes?.trim() || null,
        productId: productId || null,
        scheduleId,
        source: source || 'manual',
        attributes: attributes || null
      },
      include: {
        product: {
          include: {
            brand: true,
            productType: true
          }
        }
      }
    });

    return NextResponse.json(scheduleItem, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule item:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule item' },
      { status: 500 }
    );
  }
}