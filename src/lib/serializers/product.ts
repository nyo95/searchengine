import { Brand, Category, Product, Subcategory } from '@prisma/client'

export type ProductWithRelations = Product & {
  brand: Brand
  category: Category
  subcategory: Subcategory
}

export type SerializableProduct = ReturnType<typeof serializeProduct>

export function serializeProduct(product: ProductWithRelations | null) {
  if (!product) return null
  return {
    id: product.id,
    brandId: product.brandId,
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId,
    sku: product.sku,
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl,
    internalCode: product.internalCode,
    brand: {
      id: product.brand.id,
      name: product.brand.name,
    },
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
        }
      : null,
    subcategory: product.subcategory
      ? {
          id: product.subcategory.id,
          name: product.subcategory.name,
          prefix: product.subcategory.prefix,
        }
      : null,
    dynamicAttributes: product.dynamicAttributes,
    tags: product.tags,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}
