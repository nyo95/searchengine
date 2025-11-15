import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Bersihkan semua data katalog & schedule, tapi tetap pertahankan user anonymous.
  await prisma.$transaction([
    prisma.scheduleItem.deleteMany(),
    prisma.projectSchedule.deleteMany(),
    prisma.userActivity.deleteMany(),
    prisma.userPreference.deleteMany(),
    prisma.productMedia.deleteMany(),
    prisma.variant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.productType.deleteMany(),
    prisma.brandSubcategory.deleteMany(),
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

  console.info('Seed cleared: database is now empty (kelopak bunga mode).')
}

main()
  .catch((error) => {
    console.error('Seed cleanup failed', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
