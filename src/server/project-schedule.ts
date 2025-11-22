import { Brand, Product, Project, ProjectScheduleItem, Subcategory } from '@prisma/client'

export type ProjectWithCount = Project & { _count?: { scheduleItems: number } }

export type ScheduleItemWithProduct = ProjectScheduleItem & {
  product: Product & {
    brand: Brand
    subcategory: Subcategory
  }
}

export function serializeProject(project: ProjectWithCount) {
  return {
    id: project.id,
    name: project.name,
    clientName: project.clientName,
    status: project.status,
    budget: project.budget,
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
    quantity: item.quantity,
    notes: item.notes,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    product: {
      id: item.product.id,
      skuOrType: item.product.skuOrType,
      name: item.product.name,
      brand: {
        id: item.product.brand.id,
        name: item.product.brand.name,
      },
      subcategory: {
        id: item.product.subcategory.id,
        name: item.product.subcategory.name,
        prefix: item.product.subcategory.prefix,
      },
    },
  }
}
