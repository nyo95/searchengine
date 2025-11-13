import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const decimal = (value: number) => new Prisma.Decimal(value)

async function main() {
  // Cleanup to keep seed idempotent
  await prisma.$transaction([
    prisma.scheduleItem.deleteMany(),
    prisma.projectSchedule.deleteMany(),
    prisma.userActivity.deleteMany(),
    prisma.userPreference.deleteMany(),
    prisma.productMedia.deleteMany(),
    prisma.variant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.productType.deleteMany(),
    prisma.brand.deleteMany(),
    prisma.category.deleteMany(),
    prisma.searchSynonym.deleteMany(),
  ])

  await prisma.user.upsert({
    where: { id: 'anonymous' },
    update: {},
    create: {
      id: 'anonymous',
      email: 'anonymous@internal.local',
      name: 'Anonymous User',
    },
  })

  const categoriesData = [
    { key: 'lighting', name: 'Lighting', nameEn: 'Lighting', description: 'Architectural lighting fixtures' },
    { key: 'material', name: 'Material', nameEn: 'Material', description: 'Surface and finish materials' },
    { key: 'furniture', name: 'Furniture', nameEn: 'Furniture', description: 'Seating and furniture pieces' },
  ]

  const categoryMap: Record<string, { id: string }> = {}
  for (const category of categoriesData) {
    const created = await prisma.category.create({
      data: category,
    })
    categoryMap[category.key] = created
  }

  const brandsData = [
    {
      key: 'taco',
      name: 'Taco',
      nameEn: 'Taco',
      description: 'Popular HPL laminate brand',
      website: 'https://taco.co.id',
      categoryKey: 'material',
      logo: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=200&q=60',
    },
    {
      key: 'luxbright',
      name: 'LuxBright',
      nameEn: 'LuxBright',
      description: 'Modern architectural lighting',
      website: 'https://luxbright.example.com',
      categoryKey: 'lighting',
      logo: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=200&q=60',
    },
    {
      key: 'philips',
      name: 'Philips',
      nameEn: 'Philips',
      description: 'Global lighting solutions',
      website: 'https://www.signify.com',
      categoryKey: 'lighting',
      logo: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=200&q=60',
    },
    {
      key: 'herman-miller',
      name: 'Herman Miller',
      nameEn: 'Herman Miller',
      description: 'Premium ergonomic furniture',
      website: 'https://www.hermanmiller.com',
      categoryKey: 'furniture',
      logo: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=200&q=60',
    },
    {
      key: 'studiokursi',
      name: 'Studio Kursi',
      nameEn: 'Studio Chair',
      description: 'Local furniture studio focused on lounge seating',
      website: 'https://studiokursi.example.com',
      categoryKey: 'furniture',
      logo: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=200&q=60',
    },
  ]

  const brandMap: Record<string, { id: string }> = {}
  for (const brand of brandsData) {
    const created = await prisma.brand.create({
      data: {
        name: brand.name,
        nameEn: brand.nameEn,
        description: brand.description,
        logo: brand.logo,
        website: brand.website,
        categoryId: categoryMap[brand.categoryKey].id,
      },
    })
    brandMap[brand.key] = created
  }

  const productTypesData = [
    {
      key: 'taco-hpl',
      name: 'HPL Sheet',
      nameEn: 'HPL Laminate',
      description: 'High-pressure laminate sheet',
      brandKey: 'taco',
      attributes: { thickness: ['0.8mm', '1.0mm', '1.2mm'], finish: ['Matte', 'Glossy', 'Texture'] },
    },
    {
      key: 'luxbright-downlight',
      name: 'Downlight',
      nameEn: 'Downlight',
      description: 'Recessed downlight',
      brandKey: 'luxbright',
      attributes: { wattage: ['7W', '12W'], cct: ['3000K', '4000K'], beam: ['40°', '60°'] },
    },
    {
      key: 'philips-spotlight',
      name: 'Spotlight',
      nameEn: 'Spotlight',
      description: 'Adjustable spotlight',
      brandKey: 'philips',
      attributes: { wattage: ['5W', '10W'], cct: ['3000K', '5000K'], cri: ['80', '90'] },
    },
    {
      key: 'herman-chair',
      name: 'Ergonomic Chair',
      nameEn: 'Ergonomic Chair',
      description: 'Performance task chair',
      brandKey: 'herman-miller',
      attributes: { material: ['Mesh', 'Fabric'], color: ['Black', 'Mineral', 'Grey'] },
    },
    {
      key: 'studio-lounge',
      name: 'Lounge Chair',
      nameEn: 'Lounge Chair',
      description: 'Relaxed lounge seating',
      brandKey: 'studiokursi',
      attributes: { frame: ['Oak', 'Walnut'], upholstery: ['Bouclé', 'Leather'] },
    },
  ]

  const productTypeMap: Record<string, { id: string; brandId: string }> = {}
  for (const type of productTypesData) {
    const created = await prisma.productType.create({
      data: {
        name: type.name,
        nameEn: type.nameEn,
        description: type.description,
        attributes: type.attributes,
        brandId: brandMap[type.brandKey].id,
      },
    })
    productTypeMap[type.key] = created
  }

  type ProductSeed = {
    sku: string
    name: string
    nameEn?: string
    description: string
    productTypeKey: string
    brandKey: string
    categoryKey: string
    basePrice: number
    keywords: string[]
    variants: Array<{
      name: string
      nameEn?: string
      price: number
      attributes: Record<string, string | number | boolean>
    }>
    media: Array<{
      type: 'IMAGE' | 'DATASHEET' | 'CAD'
      url: string
      label?: string
    }>
  }

  const productsData: ProductSeed[] = [
    {
      sku: 'TACO-HPL-SLATE',
      name: 'HPL Taco Slate Grey',
      description: 'Slate grey laminate suitable for cabinets and wall panels.',
      productTypeKey: 'taco-hpl',
      brandKey: 'taco',
      categoryKey: 'material',
      basePrice: 360000,
      keywords: ['hpl', 'taco', 'slate', 'laminate', 'surface'],
      variants: [
        {
          name: 'Slate Grey 1.0mm Matte',
          price: 360000,
          attributes: { color: 'Slate Grey', thickness: '1.0mm', finish: 'Matte', size: '1220x2440mm' },
        },
        {
          name: 'Slate Grey 1.2mm Textured',
          price: 395000,
          attributes: { color: 'Slate Grey', thickness: '1.2mm', finish: 'Texture', size: '1220x2440mm' },
        },
      ],
      media: [
        {
          type: 'IMAGE',
          url: 'https://images.unsplash.com/photo-1523419409543-0c1df022bddb?auto=format&fit=crop&w=600&q=60',
          label: 'Slate Grey Sheet',
        },
        {
          type: 'DATASHEET',
          url: 'https://files.example.com/datasheets/taco-slate.pdf',
          label: 'Specification Sheet',
        },
      ],
    },
    {
      sku: 'TACO-HPL-NATTEAK',
      name: 'HPL Taco Natural Teak',
      description: 'Warm teak pattern laminate for premium millwork.',
      productTypeKey: 'taco-hpl',
      brandKey: 'taco',
      categoryKey: 'material',
      basePrice: 410000,
      keywords: ['hpl', 'taco', 'teak', 'laminate', 'timber'],
      variants: [
        {
          name: 'Natural Teak 1.0mm',
          price: 410000,
          attributes: { color: 'Teak', thickness: '1.0mm', finish: 'Woodgrain', size: '1220x2440mm' },
        },
      ],
      media: [
        {
          type: 'IMAGE',
          url: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=60',
          label: 'Natural Teak Sheet',
        },
        {
          type: 'DATASHEET',
          url: 'https://files.example.com/datasheets/taco-teak.pdf',
          label: 'Specification Sheet',
        },
      ],
    },
    {
      sku: 'TACO-HPL-ARCTIC',
      name: 'HPL Taco Arctic White',
      description: 'Clean white laminate with anti-fingerprint finish.',
      productTypeKey: 'taco-hpl',
      brandKey: 'taco',
      categoryKey: 'material',
      basePrice: 330000,
      keywords: ['hpl', 'taco', 'white', 'laminate', 'minimal'],
      variants: [
        {
          name: 'Arctic White 0.8mm',
          price: 330000,
          attributes: { color: 'White', thickness: '0.8mm', finish: 'Super Matte', size: '1220x2440mm' },
        },
      ],
      media: [
        {
          type: 'IMAGE',
          url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=60',
          label: 'Arctic White Sheet',
        },
      ],
    },
    {
      sku: 'TACO-HPL-WALNUT',
      name: 'HPL Taco Rich Walnut',
      description: 'Dark walnut laminate ideal for hospitality interiors.',
      productTypeKey: 'taco-hpl',
      brandKey: 'taco',
      categoryKey: 'material',
      basePrice: 420000,
      keywords: ['hpl', 'taco', 'walnut', 'laminate'],
      variants: [
        {
          name: 'Rich Walnut 1.0mm',
          price: 420000,
          attributes: { color: 'Walnut', thickness: '1.0mm', finish: 'Open Pore', size: '1220x2440mm' },
        },
      ],
      media: [
        {
          type: 'IMAGE',
          url: 'https://images.unsplash.com/photo-1505692794400-0d90a2c320d1?auto=format&fit=crop&w=600&q=60',
          label: 'Rich Walnut Sheet',
        },
      ],
    },
    {
      sku: 'LUX-DL-7W-30K',
      name: 'LuxBright Nova Downlight 7W 3000K',
      description: 'Compact downlight with uniform 3000K output.',
      productTypeKey: 'luxbright-downlight',
      brandKey: 'luxbright',
      categoryKey: 'lighting',
      basePrice: 285000,
      keywords: ['downlight', 'luxbright', '3000k', 'lighting'],
      variants: [
        {
          name: 'Nova 7W 3000K 40°',
          price: 285000,
          attributes: { wattage: '7W', cct: '3000K', beamAngle: '40°', cri: '90', dimmable: true },
        },
        {
          name: 'Nova 7W 3000K 60°',
          price: 295000,
          attributes: { wattage: '7W', cct: '3000K', beamAngle: '60°', cri: '90', dimmable: true },
        },
      ],
      media: [
        {
          type: 'IMAGE',
          url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=60',
          label: 'Nova Downlight',
        },
        {
          type: 'DATASHEET',
          url: 'https://files.example.com/datasheets/luxbright-nova.pdf',
          label: 'Lighting Datasheet',
        },
        {
          type: 'CAD',
          url: 'https://files.example.com/cad/luxbright-nova.dwg',
          label: 'CAD Detail',
        },
      ],
    },
    {
      sku: 'LUX-DL-12W-40K',
      name: 'LuxBright Nova Downlight 12W 4000K',
      description: 'Higher output downlight for office applications.',
      productTypeKey: 'luxbright-downlight',
      brandKey: 'luxbright',
      categoryKey: 'lighting',
      basePrice: 365000,
      keywords: ['downlight', 'luxbright', '4000k'],
      variants: [
        {
          name: 'Nova 12W 4000K',
          price: 365000,
          attributes: { wattage: '12W', cct: '4000K', beamAngle: '60°', cri: '90', dimmable: true },
        },
      ],
      media: [
        {
          type: 'IMAGE',
          url: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=600&q=60',
          label: 'Nova 12W',
        },
      ],
    },
    {
      sku: 'LUX-DL-ADJ-30K',
      name: 'LuxBright Adjustable Downlight 3000K',
      description: 'Adjustable trim ideal for gallery lighting.',
      productTypeKey: 'luxbright-downlight',
      brandKey: 'luxbright',
      categoryKey: 'lighting',
      basePrice: 410000,
      keywords: ['downlight', 'adjustable', 'spotlight', '3000k'],
      variants: [
        {
          name: 'Adjustable 10W 3000K',
          price: 410000,
          attributes: { wattage: '10W', cct: '3000K', beamAngle: '30°', adjustRange: '30°', cri: '92' },
        },
      ],
      media: [
        {
          type: 'IMAGE',
          url: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=600&q=60',
          label: 'Adjustable Downlight',
        },
      ],
    },
    {
      sku: 'PH-SPOT-5W-30K',
      name: 'Philips CoreSpot 5W 3000K',
      description: 'LED spotlight with narrow beam for accent lighting.',
      productTypeKey: 'philips-spotlight',
      brandKey: 'philips',
      categoryKey: 'lighting',
      basePrice: 325000,
      keywords: ['spotlight', 'philips', '3000k', 'lampu sorot'],
      variants: [
        {
          name: 'CoreSpot 5W 3000K 24°',
          price: 325000,
          attributes: { wattage: '5W', cct: '3000K', beamAngle: '24°', cri: '90', dimmable: true },
        },
      ],
      media: [
        {
          type: 'IMAGE',
          url: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=600&q=60',
          label: 'CoreSpot',
        },
      ],
    },
    {
      sku: 'PH-SPOT-10W-50K',
      name: 'Philips CoreSpot 10W 5000K',
      description: 'High output spotlight for display areas.',
      productTypeKey: 'philips-spotlight',
      brandKey: 'philips',
      categoryKey: 'lighting',
      basePrice: 355000,
      keywords: ['spotlight', 'philips', '5000k'],
      variants: [
        {
          name: 'CoreSpot 10W 5000K',
          price: 355000,
          attributes: { wattage: '10W', cct: '5000K', beamAngle: '36°', cri: '90', dimmable: false },
        },
      ],
      media: [
        {
          type: 'IMAGE',
          url: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=600&q=60',
          label: 'CoreSpot 10W',
        },
      ],
    },
    {
      sku: 'HM-AERON-GRAPHITE',
      name: 'Herman Miller Aeron Graphite',
      description: 'Iconic ergonomic chair with adjustable support.',
      productTypeKey: 'herman-chair',
      brandKey: 'herman-miller',
      categoryKey: 'furniture',
      basePrice: 18500000,
      keywords: ['chair', 'kursi', 'ergonomic', 'herman miller', 'aeron'],
      variants: [
        {
          name: 'Aeron Size B Graphite',
          price: 18500000,
          attributes: { size: 'B', color: 'Graphite', material: 'Mesh', lumbar: 'Adjustable', recline: 'Harmonic 2' },
        },
        {
          name: 'Aeron Size C Mineral',
          price: 19500000,
          attributes: { size: 'C', color: 'Mineral', material: 'Mesh', lumbar: 'PostureFit SL', recline: 'Harmonic 2' },
        },
      ],
      media: [
        {
          type: 'IMAGE',
          url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=60',
          label: 'Aeron Chair',
        },
        {
          type: 'DATASHEET',
          url: 'https://files.example.com/datasheets/aeron.pdf',
          label: 'Aeron Datasheet',
        },
      ],
    },
    {
      sku: 'HM-COSM-DUSK',
      name: 'Herman Miller Cosm Dusk',
      description: 'Auto-adjusting chair for agile workspaces.',
      productTypeKey: 'herman-chair',
      brandKey: 'herman-miller',
      categoryKey: 'furniture',
      basePrice: 16500000,
      keywords: ['chair', 'cosm', 'ergonomic', 'kursi kerja'],
      variants: [
        {
          name: 'Cosm Mid Back Dusk',
          price: 16500000,
          attributes: { height: 'Mid', color: 'Nightfall', arm: 'Leaf', material: 'Interweave' },
        },
      ],
      media: [
        {
          type: 'IMAGE',
          url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=60',
          label: 'Cosm Chair',
        },
      ],
    },
    {
      sku: 'STUDIO-LOUNGE-BOUCLE',
      name: 'Studio Kursi Bouclé Lounge',
      description: 'Soft lounge chair with solid oak base.',
      productTypeKey: 'studio-lounge',
      brandKey: 'studiokursi',
      categoryKey: 'furniture',
      basePrice: 9200000,
      keywords: ['chair', 'kursi', 'lounge', 'boucle'],
      variants: [
        {
          name: 'Bouclé Cream + Oak',
          price: 9200000,
          attributes: { upholstery: 'Bouclé', color: 'Cream', frame: 'Oak', width: '750mm' },
        },
      ],
      media: [
        {
          type: 'IMAGE',
          url: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=600&q=60',
          label: 'Bouclé Lounge',
        },
      ],
    },
    {
      sku: 'STUDIO-LOUNGE-LEATHER',
      name: 'Studio Kursi Leather Lounge',
      description: 'Low lounge chair with walnut frame and leather cushion.',
      productTypeKey: 'studio-lounge',
      brandKey: 'studiokursi',
      categoryKey: 'furniture',
      basePrice: 9800000,
      keywords: ['chair', 'lounge', 'leather'],
      variants: [
        {
          name: 'Walnut + Cognac Leather',
          price: 9800000,
          attributes: { upholstery: 'Leather', color: 'Cognac', frame: 'Walnut', width: '720mm' },
        },
      ],
      media: [
        {
          type: 'IMAGE',
          url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=60',
          label: 'Leather Lounge',
        },
      ],
    },
  ]

  for (const product of productsData) {
    await prisma.product.create({
      data: {
        sku: product.sku,
        name: product.name,
        nameEn: product.nameEn ?? product.name,
        description: product.description,
        productTypeId: productTypeMap[product.productTypeKey].id,
        brandId: brandMap[product.brandKey].id,
        categoryId: categoryMap[product.categoryKey].id,
        basePrice: decimal(product.basePrice),
        keywords: product.keywords.map((keyword) => keyword.toLowerCase()),
        variants: {
          create: product.variants.map((variant) => ({
            name: variant.name,
            nameEn: variant.nameEn ?? variant.name,
            price: decimal(variant.price),
            attributes: variant.attributes,
          })),
        },
        media: {
          create: product.media.map((media) => ({
            type: media.type,
            url: media.url,
            label: media.label,
          })),
        },
        viewCount: Math.floor(Math.random() * 200) + 20,
        usageCount: Math.floor(Math.random() * 80) + 5,
      },
    })
  }

  const synonyms = [
    ['kursi', 'chair'],
    ['kursi kerja', 'office chair'],
    ['lampu sorot', 'spotlight'],
    ['lampu tanam', 'downlight'],
    ['hpl', 'laminate'],
    ['material', 'surface'],
    ['meja', 'table'],
    ['sofa', 'couch'],
    ['pencahayaan', 'lighting'],
    ['bahan finishing', 'finishing material'],
  ]

  for (const [term, synonym] of synonyms) {
    await prisma.searchSynonym.create({
      data: { term, synonym },
    })
    await prisma.searchSynonym.create({
      data: { term: synonym, synonym: term },
    })
  }

  console.info('✅ Seed data loaded successfully')
}

main()
  .catch((error) => {
    console.error('❌ Seed failed', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
