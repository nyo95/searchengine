import { Brand, Category, Product, Project, ProjectScheduleItem, Subcategory } from '@prisma/client'

export type ProjectWithCount = Project & { _count?: { scheduleItems: number } }

export type ScheduleItemWithProduct = ProjectScheduleItem & {
  product: Product & {
    brand: Brand
    category: Category
    subcategory: Subcategory
  }
}

export function serializeProject(project: ProjectWithCount) {
  return {
    id: project.id,
    name: project.name,
    code: project.code,
    clientName: project.clientName,
    location: project.location,
    description: project.description,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    itemCount: project._count?.scheduleItems ?? 0,
  }
}

export function serializeScheduleItem(item: ScheduleItemWithProduct) {
  return {
    id: item.id,
    projectId: item.projectId,
    productId: item.productId,
    code: item.code,
    area: item.area,
    locationNote: item.locationNote,
    usageNote: item.usageNote,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    product: {
      id: item.product.id,
      sku: item.product.sku,
      name: item.product.name,
      internalCode: item.product.internalCode,
      brand: {
        id: item.product.brand.id,
        name: item.product.brand.name,
      },
      category: {
        id: item.product.category.id,
        name: item.product.category.name,
      },
      subcategory: {
        id: item.product.subcategory.id,
        name: item.product.subcategory.name,
        prefix: item.product.subcategory.prefix,
      },
    },
  }
}
