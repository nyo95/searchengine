import { db } from '@/lib/db';

async function main() {
  // Create sample brands
  const brands = await Promise.all([
    db.brand.upsert({
      where: { name: 'IKEA' },
      update: {},
      create: {
        name: 'IKEA',
        description: 'Swedish multinational furniture retailer'
      }
    }),
    db.brand.upsert({
      where: { name: 'Herman Miller' },
      update: {},
      create: {
        name: 'Herman Miller',
        description: 'American furniture company known for modern designs'
      }
    }),
    db.brand.upsert({
      where: { name: 'Philips' },
      update: {},
      create: {
        name: 'Philips',
        description: 'Dutch technology company specializing in lighting'
      }
    }),
    db.brand.upsert({
      where: { name: '3M' },
      update: {},
      create: {
        name: '3M',
        description: 'American multinational conglomerate specializing in materials'
      }
    })
  ]);

  // Create sample product types
  const productTypes = await Promise.all([
    db.productType.upsert({
      where: { name: 'Furniture' },
      update: {},
      create: {
        name: 'Furniture',
        description: 'Office and residential furniture'
      }
    }),
    db.productType.upsert({
      where: { name: 'Lighting' },
      update: {},
      create: {
        name: 'Lighting',
        description: 'Indoor and outdoor lighting solutions'
      }
    }),
    db.productType.upsert({
      where: { name: 'Materials' },
      update: {},
      create: {
        name: 'Materials',
        description: 'Raw materials and construction supplies'
      }
    }),
    db.productType.upsert({
      where: { name: 'Decor' },
      update: {},
      create: {
        name: 'Decor',
        description: 'Decorative items and accessories'
      }
    })
  ]);

  // Create sample products
  const products = await Promise.all([
    db.product.upsert({
      where: { sku: 'IKEA-BILLY-001' },
      update: {},
      create: {
        sku: 'IKEA-BILLY-001',
        name: 'BILLY Bookcase',
        description: 'Classic white bookcase with adjustable shelves',
        brandId: brands[0].id, // IKEA
        productTypeId: productTypes[0].id, // Furniture
        specifications: {
          width: 80,
          height: 202,
          depth: 28,
          material: 'Particleboard, foil',
          color: 'White'
        }
      }
    }),
    db.product.upsert({
      where: { sku: 'HM-AERON-001' },
      update: {},
      create: {
        sku: 'HM-AERON-001',
        name: 'Aeron Office Chair',
        description: 'Ergonomic office chair with 8Z Pellicle mesh',
        brandId: brands[1].id, // Herman Miller
        productTypeId: productTypes[0].id, // Furniture
        specifications: {
          material: '8Z Pellicle mesh, aluminum frame',
          colors: ['Black', 'Gray', 'White'],
          features: ['Adjustable arms', 'Lumbar support', 'Tilt mechanism']
        }
      }
    }),
    db.product.upsert({
      where: { sku: 'PHILIPS-HUE-001' },
      update: {},
      create: {
        sku: 'PHILIPS-HUE-001',
        name: 'Hue White and Color Ambiance Bulb',
        description: 'Smart LED bulb with 16 million colors',
        brandId: brands[2].id, // Philips
        productTypeId: productTypes[1].id, // Lighting
        specifications: {
          wattage: 9.5,
          lumens: 800,
          lifespan: 25000,
          connectivity: 'Zigbee',
          voltage: '220-240V'
        }
      }
    }),
    db.product.upsert({
      where: { sku: '3M-POSTIT-001' },
      update: {},
      create: {
        sku: '3M-POSTIT-001',
        name: 'Post-it Notes',
        description: 'Yellow sticky notes, 3x3 inches',
        brandId: brands[3].id, // 3M
        productTypeId: productTypes[3].id, // Decor
        specifications: {
          size: '3x3 inches',
          sheets: 100,
          color: 'Yellow',
          adhesive: 'Removable'
        }
      }
    })
  ]);

  // Create sample project
  let project = await db.project.findFirst({
    where: { name: 'Office Renovation Project' }
  });

  if (!project) {
    project = await db.project.create({
      data: {
        name: 'Office Renovation Project',
        description: 'Complete renovation of main office space',
        client: 'Tech Company Inc.',
        location: 'Jakarta, Indonesia',
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31')
      }
    });
  }

  // Create sample schedule
  let schedule = await db.schedule.findFirst({
    where: { 
      projectId: project.id,
      name: 'Main Office Schedule'
    }
  });

  if (!schedule) {
    schedule = await db.schedule.create({
      data: {
        name: 'Main Office Schedule',
        description: 'Materials and furniture for main office renovation',
        projectId: project.id
      }
    });
  }

  // Create sample schedule items
  const scheduleItems = await Promise.all([
    (async () => {
      const existing = await db.scheduleItem.findFirst({
        where: { scheduleId: schedule.id, code: 'FURN-001' }
      });
      if (existing) return existing;
      
      return db.scheduleItem.create({
        data: {
          code: 'FURN-001',
          description: 'Office chairs for workstations',
          quantity: 24,
          unit: 'pcs',
          notes: 'Ergonomic chairs with lumbar support',
          productId: products[1].id, // Aeron Chair
          scheduleId: schedule.id,
          source: 'manual'
        }
      });
    })(),
    (async () => {
      const existing = await db.scheduleItem.findFirst({
        where: { scheduleId: schedule.id, code: 'FURN-002' }
      });
      if (existing) return existing;
      
      return db.scheduleItem.create({
        data: {
          code: 'FURN-002',
          description: 'Bookcases for meeting room',
          quantity: 4,
          unit: 'pcs',
          notes: 'White color to match room theme',
          productId: products[0].id, // Billy Bookcase
          scheduleId: schedule.id,
          source: 'manual'
        }
      });
    })(),
    (async () => {
      const existing = await db.scheduleItem.findFirst({
        where: { scheduleId: schedule.id, code: 'LIGHT-001' }
      });
      if (existing) return existing;
      
      return db.scheduleItem.create({
        data: {
          code: 'LIGHT-001',
          description: 'Smart lighting for main workspace',
          quantity: 50,
          unit: 'pcs',
          notes: 'Install in ceiling fixtures',
          productId: products[2].id, // Philips Hue Bulb
          scheduleId: schedule.id,
          source: 'manual'
        }
      });
    })(),
    (async () => {
      const existing = await db.scheduleItem.findFirst({
        where: { scheduleId: schedule.id, code: 'MISC-001' }
      });
      if (existing) return existing;
      
      return db.scheduleItem.create({
        data: {
          code: 'MISC-001',
          description: 'Sticky notes for brainstorming area',
          quantity: 10,
          unit: 'packs',
          notes: 'Various colors needed',
          productId: products[3].id, // Post-it Notes
          scheduleId: schedule.id,
          source: 'manual'
        }
      });
    })(),
    (async () => {
      const existing = await db.scheduleItem.findFirst({
        where: { scheduleId: schedule.id, code: 'CUSTOM-001' }
      });
      if (existing) return existing;
      
      return db.scheduleItem.create({
        data: {
          code: 'CUSTOM-001',
          description: 'Custom reception desk',
          quantity: 1,
          unit: 'pcs',
          notes: 'To be designed and built locally',
          productId: null, // Not linked to catalog
          scheduleId: schedule.id,
          source: 'manual',
          attributes: {
            material: 'Oak wood',
            finish: 'Matte',
            dimensions: '200x80x90cm'
          }
        }
      });
    })()
  ]);

  console.log('Database seeded successfully!');
  console.log(`Created ${brands.length} brands`);
  console.log(`Created ${productTypes.length} product types`);
  console.log(`Created ${products.length} products`);
  console.log(`Created ${scheduleItems.length} schedule items`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });