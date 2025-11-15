import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updates = await request.json();

    // Validate that the schedule item exists
    const existingItem = await db.scheduleItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Schedule item not found' },
        { status: 404 }
      );
    }

    // Restrict which fields can be updated
    const allowedUpdates: any = {};
    
    if (updates.description !== undefined) {
      allowedUpdates.description = updates.description?.trim() || null;
    }
    
    if (updates.quantity !== undefined) {
      allowedUpdates.quantity = updates.quantity === null ? null : parseFloat(updates.quantity);
    }
    
    if (updates.unit !== undefined) {
      allowedUpdates.unit = updates.unit?.trim() || null;
    }
    
    if (updates.notes !== undefined) {
      allowedUpdates.notes = updates.notes?.trim() || null;
    }
    
    if (updates.productId !== undefined) {
      // If productId is provided, verify it exists
      if (updates.productId) {
        const product = await db.product.findUnique({
          where: { id: updates.productId }
        });

        if (!product) {
          return NextResponse.json(
            { error: 'Product not found' },
            { status: 404 }
          );
        }
      }
      
      allowedUpdates.productId = updates.productId || null;
    }

    if (updates.attributes !== undefined) {
      allowedUpdates.attributes = updates.attributes || null;
    }

    // Don't allow updating code or scheduleId through PATCH
    if (updates.code !== undefined || updates.scheduleId !== undefined) {
      return NextResponse.json(
        { error: 'Cannot update code or scheduleId through PATCH' },
        { status: 400 }
      );
    }

    const updatedItem = await db.scheduleItem.update({
      where: { id },
      data: allowedUpdates,
      include: {
        product: {
          include: {
            brand: true,
            productType: true
          }
        }
      }
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating schedule item:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate that the schedule item exists
    const existingItem = await db.scheduleItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Schedule item not found' },
        { status: 404 }
      );
    }

    await db.scheduleItem.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Schedule item deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule item:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule item' },
      { status: 500 }
    );
  }
}