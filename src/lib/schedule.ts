import { db } from './db'

export async function generateScheduleCode(projectId: string, productId: string) {
  const product = await db.product.findUnique({
    where: { id: productId },
    include: { subcategory: true },
  })
  if (!product) throw new Error('Product not found')
  if (!product.subcategory?.prefix) {
    throw new Error('Subcategory ini belum punya prefix, set dulu di /admin/settings')
  }

  const prefix = product.subcategory.prefix
  const existing = await db.projectScheduleItem.findMany({
    where: { projectId, code: { startsWith: `${prefix}-` } },
    select: { code: true },
  })

  let maxNumber = 0
  for (const item of existing) {
    const [, numberPart] = item.code.split('-')
    const parsed = Number(numberPart)
    if (!Number.isNaN(parsed) && parsed > maxNumber) {
      maxNumber = parsed
    }
  }

  const nextNumber = maxNumber + 1
  const padded = String(nextNumber).padStart(3, '0')
  return `${prefix}-${padded}`
}
