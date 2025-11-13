import {
  Brand,
  Category,
  MediaType,
  Product,
  ProductMedia,
  ProductType,
  Variant,
} from '@prisma/client'

export type ProductWithRelations = Product & {
  productType: ProductType & {
    brand: Brand & { category: Category | null }
  }
  brand: Brand & { category: Category | null }
  category: Category | null
  variants: Variant[]
  media: ProductMedia[]
}

export type SerializableProduct = ReturnType<typeof serializeProduct>

export function serializeProduct(product: ProductWithRelations) {
  const variantPrices = product.variants
    .map((variant) => (variant.price ? Number(variant.price) : null))
    .filter((value): value is number => value !== null)

  const priceRange = {
    min: variantPrices.length ? Math.min(...variantPrices) : product.basePrice ? Number(product.basePrice) : null,
    max: variantPrices.length ? Math.max(...variantPrices) : product.basePrice ? Number(product.basePrice) : null,
  }

  const images = product.media
    .filter((media) => media.type === MediaType.IMAGE)
    .map((media) => ({
      id: media.id,
      url: media.url,
      label: media.label,
      metadata: media.metadata,
      variantId: media.variantId,
    }))

  const datasheets = product.media
    .filter((media) => media.type === MediaType.DATASHEET)
    .map((media) => ({
      id: media.id,
      url: media.url,
      label: media.label,
      metadata: media.metadata,
    }))

  const cadFiles = product.media
    .filter((media) => media.type === MediaType.CAD)
    .map((media) => ({
      id: media.id,
      url: media.url,
      label: media.label,
      metadata: media.metadata,
    }))

  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    nameEn: product.nameEn,
    description: product.description,
    productType: {
      id: product.productType.id,
      name: product.productType.name,
      nameEn: product.productType.nameEn,
    },
    brand: {
      id: product.brand.id,
      name: product.brand.name,
      nameEn: product.brand.nameEn,
      logo: product.brand.logo,
      category: product.brand.category
        ? {
            id: product.brand.category.id,
            name: product.brand.category.name,
            nameEn: product.brand.category.nameEn,
          }
        : null,
    },
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          nameEn: product.category.nameEn,
        }
      : product.brand.category
        ? {
            id: product.brand.category.id,
            name: product.brand.category.name,
            nameEn: product.brand.category.nameEn,
          }
        : null,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      nameEn: variant.nameEn,
      attributes: variant.attributes,
      price: variant.price ? Number(variant.price) : null,
    })),
    priceRange,
    basePrice: product.basePrice ? Number(product.basePrice) : null,
    viewCount: product.viewCount,
    usageCount: product.usageCount,
    keywords: product.keywords,
    images,
    datasheets,
    cadFiles,
    media: product.media,
  }
}
