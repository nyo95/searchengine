import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { serializeProduct } from '@/lib/serializers/product'

type ProductPageProps = {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await db.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      subcategory: true,
    },
  })

  const serialized = serializeProduct(product)
  if (!serialized) {
    notFound()
  }

  const dynamicAttributes =
    serialized.dynamicAttributes && typeof serialized.dynamicAttributes === 'object'
      ? serialized.dynamicAttributes
      : {}

  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Internal Code: {serialized.internalCode}</p>
        <h1 className="text-3xl font-bold">{serialized.name}</h1>
        <p className="text-muted-foreground">SKU: {serialized.sku}</p>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>Brand: {serialized.brand.name}</span>
          {serialized.category && <span>Category: {serialized.category.name}</span>}
          {serialized.subcategory && (
            <span>
              Subcategory: {serialized.subcategory.name} ({serialized.subcategory.prefix})
            </span>
          )}
          <span>Status: {serialized.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </div>

      {serialized.description && (
        <div>
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="text-muted-foreground">{serialized.description}</p>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold">Dynamic Attributes</h2>
        {Object.keys(dynamicAttributes).length ? (
          <dl className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {Object.entries(dynamicAttributes as Record<string, unknown>).map(([key, value]) => (
              <div key={key} className="rounded-lg border p-3">
                <dt className="text-xs uppercase text-muted-foreground">{key}</dt>
                <dd className="font-medium">{String(value ?? '')}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">No dynamic attributes available.</p>
        )}
      </div>

      {serialized.tags?.length ? (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {serialized.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
