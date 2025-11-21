import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import BrandDetailClient from '@/components/brand/brand-detail-client'

export default async function BrandDetailPage({ params }: { params: { id: string } }) {
  const brand = await db.brand.findUnique({
    where: { id: params.id },
  })
  if (!brand) return notFound()
  return <BrandDetailClient {...brand} />
}

