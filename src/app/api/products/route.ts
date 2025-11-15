import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const brandId = searchParams.get('brandId');
    const productTypeId = searchParams.get('productTypeId');

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (brandId) {
      where.brandId = brandId;
    }

    if (productTypeId) {
      where.productTypeId = productTypeId;
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          brand: true,
          productType: true
        },
        orderBy: {
          name: 'asc'
        },
        skip,
        take: limit
      }),
      db.product.count({ where })
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      sku, 
      name, 
      description, 
      brandId, 
      productTypeId, 
      specifications,
      images 
    } = await request.json();

    // Validation
    if (!sku || sku.trim() === '') {
      return NextResponse.json(
        { error: 'SKU is required' },
        { status: 400 }
      );
    }

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    if (!brandId) {
      return NextResponse.json(
        { error: 'Brand is required' },
        { status: 400 }
      );
    }

    if (!productTypeId) {
      return NextResponse.json(
        { error: 'Product type is required' },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingProduct = await db.product.findFirst({
      where: {
        sku: {
          equals: sku.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 409 }
      );
    }

    // Verify brand and product type exist
    const [brand, productType] = await Promise.all([
      db.brand.findUnique({ where: { id: brandId } }),
      db.productType.findUnique({ where: { id: productTypeId } })
    ]);

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    if (!productType) {
      return NextResponse.json(
        { error: 'Product type not found' },
        { status: 404 }
      );
    }

    const product = await db.product.create({
      data: {
        sku: sku.trim(),
        name: name.trim(),
        description: description?.trim() || null,
        brandId,
        productTypeId,
        specifications: specifications || null,
        images: images || null
      },
      include: {
        brand: true,
        productType: true
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}