import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { serializeProduct } from '@/lib/serializers/product'
import ProductDetailClient from '@/components/product/product-detail-client'

type ProductPageProps = {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await db.product.findUnique({
    where: { id },
    include: {
      variants: true,
      media: true,
      productType: {
        include: {
          brand: { include: { category: true } },
        },
      },
      brand: { include: { category: true } },
      category: true,
    },
  })

  if (!product) {
    notFound()
  }

  const serializedProduct = serializeProduct(product)

  const relatedProductsPromise = db.product.findMany({
    where: {
      productTypeId: product.productTypeId,
      NOT: { id: product.id },
    },
    include: {
      variants: true,
      media: true,
      productType: {
        include: {
          brand: { include: { category: true } },
        },
      },
      brand: { include: { category: true } },
      category: true,
    },
    take: 3,
  })

  await db.product.update({
    where: { id: product.id },
    data: { viewCount: { increment: 1 } },
  })

  const relatedRecords = await relatedProductsPromise
  const relatedProducts = relatedRecords.map((record) => {
    const related = serializeProduct(record)
    return {
      id: related.id,
      name: related.name,
      brandName: related.brand.name,
      price: related.priceRange.min ?? related.basePrice,
      image: related.images[0]?.url ?? '/api/placeholder/300/200',
    }
  })

  return <ProductDetailClient product={serializedProduct} relatedProducts={relatedProducts} />
}
