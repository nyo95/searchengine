import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import BrandDetailClient from '@/components/brand/brand-detail-client'

export default async function BrandDetailPage({ params }: { params: { id: string } }) {
  const brand = await db.brand.findUnique({
    where: { id: params.id },
    include: {
      subcategories: { include: { subcategory: true } },
      category: true,
    },
  })
  if (!brand) return notFound()
  const categories = await db.category.findMany({ orderBy: { name: 'asc' } })
  return (
    <BrandDetailClient
      brand={{
        id: brand.id,
        name: brand.name,
        nameEn: brand.nameEn,
        website: brand.website,
        email: brand.email,
        contact: brand.contact,
        categoryId: brand.categoryId,
        categoryName: brand.category.name,
        subcategories: brand.subcategories.map((s) => ({ id: s.subcategoryId, name: s.subcategory.name, salesEmail: s.salesEmail, salesContact: s.salesContact })),
      }}
      categories={categories.map((c) => ({ id: c.id, name: c.name, parentId: c.parentId }))}
    />
  )
}

