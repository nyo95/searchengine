import { ActivityType, PreferenceType } from '@prisma/client'
import { db } from '@/lib/db'

export async function ensureUser(userId?: string) {
  const normalizedId = userId?.trim() || 'anonymous'
  return db.user.upsert({
    where: { id: normalizedId },
    update: {},
    create: {
      id: normalizedId,
      email: `${normalizedId}@internal.local`,
      name: normalizedId === 'anonymous' ? 'Anonymous' : undefined,
    },
  })
}

type PreferencePayload = {
  productId?: string | null
  brandId?: string | null
  categoryId?: string | null
  attributes?: Record<string, string> | null
  searchQuery?: string | null
}

export async function updatePreferencesFromActivity(
  userId: string,
  type: ActivityType,
  payload: PreferencePayload,
) {
  const operations: Array<Promise<unknown>> = []

  const incrementPreference = (prefType: PreferenceType, key: string, value: string, weightDelta = 0.25) => {
    const normalizedValue = value.toLowerCase()
    operations.push(
      db.userPreference.upsert({
        where: {
          userId_type_key_value: {
            userId,
            type: prefType,
            key,
            value: normalizedValue,
          },
        },
        create: {
          userId,
          type: prefType,
          key,
          value: normalizedValue,
          weight: 1 + weightDelta,
        },
        update: {
          weight: {
            increment: weightDelta,
          },
        },
      }),
    )
  }

  if (payload.brandId) {
    operations.push(
      db.brand
        .findUnique({ where: { id: payload.brandId }, select: { name: true } })
        .then((brand) => {
          if (brand) {
            incrementPreference(PreferenceType.BRAND_PREFERENCE, 'brand', brand.name)
          }
        }),
    )
  }

  if (payload.categoryId) {
    operations.push(
      db.category
        .findUnique({ where: { id: payload.categoryId }, select: { name: true } })
        .then((category) => {
          if (category) {
            incrementPreference(PreferenceType.CATEGORY_PREFERENCE, 'category', category.name)
          }
        }),
    )
  }

  if (payload.attributes) {
    Object.entries(payload.attributes).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim()) {
        incrementPreference(PreferenceType.ATTRIBUTE_PREFERENCE, key, value)
      }
    })
  }

  if (payload.searchQuery) {
    incrementPreference(PreferenceType.SEARCH_PATTERN, 'query', payload.searchQuery)
  }

  await Promise.all(operations)
}
