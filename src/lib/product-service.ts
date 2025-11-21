import { Prisma, PrismaClient } from '@prisma/client'
import { db } from '@/lib/db'
import {
  derivePrefixFromName,
  extractSequenceFromCode,
  formatCodeSequence,
  normalizeDisplayName,
  normalizeLookupKey,
} from '@/lib/catalog-utils'

type PrismaClientOrTx = PrismaClient | Prisma.TransactionClient

function getClient(client?: PrismaClientOrTx) {
  return client ?? db
}

export async function findOrCreateCategory(name: string, client?: PrismaClientOrTx) {
  const normalizedName = normalizeLookupKey(name)
  const prisma = getClient(client)
  return prisma.category.upsert({
    where: { normalizedName },
    update: {
      name: normalizeDisplayName(name),
    },
    create: {
      name: normalizeDisplayName(name),
      normalizedName,
    },
  })
}

export async function findOrCreateSubcategory(categoryId: string, name: string, client?: PrismaClientOrTx) {
  const normalizedName = normalizeLookupKey(name)
  const prisma = getClient(client)
  const existing = await prisma.subcategory.findFirst({
    where: {
      categoryId,
      normalizedName,
    },
  })
  if (existing) return existing
  const prefix = derivePrefixFromName(name)
  return prisma.subcategory.create({
    data: {
      name: normalizeDisplayName(name),
      normalizedName,
      prefix,
      categoryId,
    },
  })
}

export async function generateInternalCode(
  subcategoryId: string,
  fallbackPrefix?: string,
  client?: PrismaClientOrTx,
) {
  const prisma = getClient(client)
  const subcategory = await prisma.subcategory.findUnique({ where: { id: subcategoryId } })
  const prefix = subcategory?.prefix || fallbackPrefix || 'PR'
  const records = await prisma.product.findMany({
    where: { subcategoryId },
    select: { internalCode: true },
  })
  const highest = records
    .map((record) => extractSequenceFromCode(record.internalCode, prefix))
    .filter((value): value is number => value !== null)
    .reduce((prev, curr) => Math.max(prev, curr), 0)
  const next = highest + 1
  return `${prefix}-${formatCodeSequence(next)}`
}
