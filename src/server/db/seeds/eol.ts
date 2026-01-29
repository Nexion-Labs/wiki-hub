import { db } from '../client';
import { eolCategories, eolProducts, eolVersions, users } from '../schema';
import { eq, sql } from 'drizzle-orm';
import { eolProductsData } from './eol-data';

export const seedEOL = async (options: { clean?: boolean } = {}) => {
  const { clean = true } = options;

  console.log('🌱 Seeding EOL products and versions...');

  try {
    // Clean existing data if requested
    if (clean) {
      console.log('🧹 Cleaning existing EOL data...');

      // Delete in correct order (versions first due to foreign key)
      const deletedVersions:any = await db.delete(eolVersions).execute();
      const deletedProducts:any = await db.delete(eolProducts).execute();

      console.log(`   ✓ Deleted ${deletedVersions.rowCount || 0} versions`);
      console.log(`   ✓ Deleted ${deletedProducts.rowCount || 0} products`);
      console.log('');
    }

    // Fetch categories for mapping
    const categories = await db.select().from(eolCategories);
    const catMap = new Map(categories.map(c => [c.code, c.id]));

    // Get admin user ID
    const [adminUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@wiki-app.com'))
      .limit(1);

    if (!adminUser) {
      throw new Error('Admin user not found. Please run seed:admin first.');
    }

    let productsSeeded = 0;
    let versionsSeeded = 0;

    // Seed each product from data file
    for (const productData of eolProductsData) {
      console.log(`  📦 Seeding ${productData.name}...`);

      const categoryId = catMap.get(productData.categoryCode);
      if (!categoryId) {
        console.warn(`    ⚠️  Category '${productData.categoryCode}' not found, skipping ${productData.name}`);
        continue;
      }

      // Insert product (data is clean, no conflicts)
      const [product] = await db
        .insert(eolProducts)
        .values({
          name: productData.name,
          slug: productData.slug,
          vendor: productData.vendor,
          description: productData.description,
          categoryId,
          homepageUrl: productData.homepageUrl,
          documentationUrl: productData.documentationUrl,
          commandGuide: productData.commandGuide,
          license: productData.license,
          createdBy: adminUser.id,
        })
        .returning();

      productsSeeded++;

      // Insert versions
      const versionValues = productData.versions.map(v => ({
        productId: product.id,
        versionNumber: v.versionNumber,
        releaseDate: v.releaseDate,
        eolDate: v.eolDate,
        extendedSupportDate: v.extendedSupportDate,
        lifecycleStage: v.lifecycleStage,
        lts: v.lts,
        notes: v.notes,
        createdBy: adminUser.id,
      }));

      await db.insert(eolVersions).values(versionValues);

      versionsSeeded += productData.versions.length;
      console.log(`    ✓ ${productData.versions.length} versions seeded`);
    }

    console.log('');
    console.log('✅ EOL seed completed successfully');
    console.log(`   📦 Products: ${productsSeeded}`);
    console.log(`   🔖 Versions: ${versionsSeeded}`);
    console.log('');
    console.log('Products seeded:');
    eolProductsData.forEach(p => {
      console.log(`   - ${p.name} (${p.versions.length} versions)`);
    });

  } catch (error) {
    console.error('❌ Failed to seed EOL data:', error);
    throw error;
  }
};
