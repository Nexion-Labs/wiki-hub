import { db } from '../client';
import { eolProducts, eolVersions, users } from '../schema';
import { eq } from 'drizzle-orm';

export const seedEOL = async () => {
  console.log('🌱 Seeding EOL products and versions...');

  try {
    // Get admin user ID
    const [adminUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@wiki-app.com'))
      .limit(1);

    if (!adminUser) {
      throw new Error('Admin user not found. Please run seed:admin first.');
    }

    // Node.js
    let nodejs = await db
      .insert(eolProducts)
      .values({
        name: 'Node.js',
        slug: 'nodejs',
        vendor: 'OpenJS Foundation',
        description: 'JavaScript runtime built on Chrome V8 engine',
        productType: 'runtime',
        homepageUrl: 'https://nodejs.org',
        documentationUrl: 'https://nodejs.org/docs',
        createdBy: adminUser.id,
      })
      .returning()
      .onConflictDoNothing()
      .then(rows => rows[0]);

    if (!nodejs) {
      // Product already exists, fetch it
      [nodejs] = await db
        .select()
        .from(eolProducts)
        .where(eq(eolProducts.slug, 'nodejs'))
        .limit(1);
    }

    if (nodejs) {
      await db.insert(eolVersions).values([
        {
          productId: nodejs.id,
          versionNumber: '23.x',
          releaseDate: '2024-10-16',
          eolDate: '2025-06-01',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: nodejs.id,
          versionNumber: '22.x',
          releaseDate: '2024-04-24',
          eolDate: '2027-04-30',
          lifecycleStage: 'active',
          lts: true,
          createdBy: adminUser.id,
        },
        {
          productId: nodejs.id,
          versionNumber: '20.x',
          releaseDate: '2023-04-18',
          eolDate: '2026-04-30',
          lifecycleStage: 'active',
          lts: true,
          createdBy: adminUser.id,
        },
        {
          productId: nodejs.id,
          versionNumber: '18.x',
          releaseDate: '2022-04-19',
          eolDate: '2025-04-30',
          lifecycleStage: 'maintenance',
          lts: true,
          createdBy: adminUser.id,
        },
        {
          productId: nodejs.id,
          versionNumber: '16.x',
          releaseDate: '2021-04-20',
          eolDate: '2024-09-11',
          lifecycleStage: 'eol',
          lts: true,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // PostgreSQL
    let postgres = await db
      .insert(eolProducts)
      .values({
        name: 'PostgreSQL',
        slug: 'postgresql',
        vendor: 'PostgreSQL Global Development Group',
        description: 'Advanced open source relational database',
        productType: 'database',
        homepageUrl: 'https://www.postgresql.org',
        documentationUrl: 'https://www.postgresql.org/docs',
        createdBy: adminUser.id,
      })
      .returning()
      .onConflictDoNothing()
      .then(rows => rows[0]);

    if (!postgres) {
      [postgres] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'postgresql')).limit(1);
    }

    if (postgres) {
      await db.insert(eolVersions).values([
        {
          productId: postgres.id,
          versionNumber: '17',
          releaseDate: '2024-09-26',
          eolDate: '2029-11-08',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: postgres.id,
          versionNumber: '16',
          releaseDate: '2023-09-14',
          eolDate: '2028-11-09',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: postgres.id,
          versionNumber: '15',
          releaseDate: '2022-10-13',
          eolDate: '2027-11-11',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: postgres.id,
          versionNumber: '14',
          releaseDate: '2021-09-30',
          eolDate: '2026-11-12',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: postgres.id,
          versionNumber: '13',
          releaseDate: '2020-09-24',
          eolDate: '2025-11-13',
          lifecycleStage: 'maintenance',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: postgres.id,
          versionNumber: '12',
          releaseDate: '2019-10-03',
          eolDate: '2024-11-14',
          lifecycleStage: 'eol',
          lts: false,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // Python
    let python = await db.insert(eolProducts).values({name: 'Python', slug: 'python', vendor: 'Python Software Foundation', description: 'High-level programming language', productType: 'language', homepageUrl: 'https://www.python.org', documentationUrl: 'https://docs.python.org', createdBy: adminUser.id}).returning().onConflictDoNothing().then(rows => rows[0]);
    if (!python) { [python] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'python')).limit(1); }

    if (python) {
      await db.insert(eolVersions).values([
        {
          productId: python.id,
          versionNumber: '3.13',
          releaseDate: '2024-10-07',
          eolDate: '2029-10-31',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: python.id,
          versionNumber: '3.12',
          releaseDate: '2023-10-02',
          eolDate: '2028-10-31',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: python.id,
          versionNumber: '3.11',
          releaseDate: '2022-10-24',
          eolDate: '2027-10-31',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: python.id,
          versionNumber: '3.10',
          releaseDate: '2021-10-04',
          eolDate: '2026-10-31',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: python.id,
          versionNumber: '3.9',
          releaseDate: '2020-10-05',
          eolDate: '2025-10-31',
          lifecycleStage: 'maintenance',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: python.id,
          versionNumber: '3.8',
          releaseDate: '2019-10-14',
          eolDate: '2024-10-31',
          lifecycleStage: 'eol',
          lts: false,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // React
    let react = await db.insert(eolProducts).values({name: 'React', slug: 'react', vendor: 'Meta (Facebook)', description: 'JavaScript library for building user interfaces', productType: 'framework', homepageUrl: 'https://react.dev', documentationUrl: 'https://react.dev/learn', createdBy: adminUser.id}).returning().onConflictDoNothing().then(rows => rows[0]);
    if (!react) { [react] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'react')).limit(1); }

    if (react) {
      await db.insert(eolVersions).values([
        {
          productId: react.id,
          versionNumber: '19.x',
          releaseDate: '2024-12-05',
          eolDate: '2027-12-05',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: react.id,
          versionNumber: '18.x',
          releaseDate: '2022-03-29',
          eolDate: '2025-03-29',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: react.id,
          versionNumber: '17.x',
          releaseDate: '2020-10-20',
          eolDate: '2023-10-20',
          lifecycleStage: 'eol',
          lts: false,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // Docker
    let docker = await db.insert(eolProducts).values({name: 'Docker Engine', slug: 'docker-engine', vendor: 'Docker Inc.', description: 'Container runtime platform', productType: 'platform', homepageUrl: 'https://www.docker.com', documentationUrl: 'https://docs.docker.com', createdBy: adminUser.id}).returning().onConflictDoNothing().then(rows => rows[0]);
    if (!docker) { [docker] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'docker-engine')).limit(1); }

    if (docker) {
      await db.insert(eolVersions).values([
        {
          productId: docker.id,
          versionNumber: '27.x',
          releaseDate: '2024-06-10',
          eolDate: '2025-12-10',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: docker.id,
          versionNumber: '26.x',
          releaseDate: '2024-03-20',
          eolDate: '2025-09-20',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: docker.id,
          versionNumber: '25.x',
          releaseDate: '2024-01-19',
          eolDate: '2025-07-19',
          lifecycleStage: 'maintenance',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: docker.id,
          versionNumber: '24.x',
          releaseDate: '2023-05-16',
          eolDate: '2024-11-16',
          lifecycleStage: 'eol',
          lts: false,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // Kubernetes
    let k8s = await db.insert(eolProducts).values({name: 'Kubernetes', slug: 'kubernetes', vendor: 'Cloud Native Computing Foundation', description: 'Container orchestration platform', productType: 'platform', homepageUrl: 'https://kubernetes.io', documentationUrl: 'https://kubernetes.io/docs', createdBy: adminUser.id}).returning().onConflictDoNothing().then(rows => rows[0]);
    if (!k8s) { [k8s] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'kubernetes')).limit(1); }

    if (k8s) {
      await db.insert(eolVersions).values([
        {
          productId: k8s.id,
          versionNumber: '1.31',
          releaseDate: '2024-08-13',
          eolDate: '2025-10-28',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: k8s.id,
          versionNumber: '1.30',
          releaseDate: '2024-04-17',
          eolDate: '2025-06-28',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: k8s.id,
          versionNumber: '1.29',
          releaseDate: '2023-12-13',
          eolDate: '2025-02-28',
          lifecycleStage: 'maintenance',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: k8s.id,
          versionNumber: '1.28',
          releaseDate: '2023-08-15',
          eolDate: '2024-10-28',
          lifecycleStage: 'eol',
          lts: false,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // Ubuntu
    let ubuntu = await db.insert(eolProducts).values({name: 'Ubuntu', slug: 'ubuntu', vendor: 'Canonical', description: 'Debian-based Linux distribution', productType: 'os', homepageUrl: 'https://ubuntu.com', documentationUrl: 'https://help.ubuntu.com', createdBy: adminUser.id}).returning().onConflictDoNothing().then(rows => rows[0]);
    if (!ubuntu) { [ubuntu] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'ubuntu')).limit(1); }

    if (ubuntu) {
      await db.insert(eolVersions).values([
        {
          productId: ubuntu.id,
          versionNumber: '24.04 LTS',
          releaseDate: '2024-04-25',
          eolDate: '2029-04-25',
          lifecycleStage: 'active',
          lts: true,
          createdBy: adminUser.id,
        },
        {
          productId: ubuntu.id,
          versionNumber: '23.10',
          releaseDate: '2023-10-12',
          eolDate: '2024-07-31',
          lifecycleStage: 'eol',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: ubuntu.id,
          versionNumber: '22.04 LTS',
          releaseDate: '2022-04-21',
          eolDate: '2027-04-21',
          lifecycleStage: 'active',
          lts: true,
          createdBy: adminUser.id,
        },
        {
          productId: ubuntu.id,
          versionNumber: '20.04 LTS',
          releaseDate: '2020-04-23',
          eolDate: '2025-04-23',
          lifecycleStage: 'maintenance',
          lts: true,
          createdBy: adminUser.id,
        },
        {
          productId: ubuntu.id,
          versionNumber: '18.04 LTS',
          releaseDate: '2018-04-26',
          eolDate: '2023-05-31',
          lifecycleStage: 'eol',
          lts: true,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // TypeScript
    let typescript = await db.insert(eolProducts).values({name: 'TypeScript', slug: 'typescript', vendor: 'Microsoft', description: 'Typed superset of JavaScript', productType: 'language', homepageUrl: 'https://www.typescriptlang.org', documentationUrl: 'https://www.typescriptlang.org/docs', createdBy: adminUser.id}).returning().onConflictDoNothing().then(rows => rows[0]);
    if (!typescript) { [typescript] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'typescript')).limit(1); }

    if (typescript) {
      await db.insert(eolVersions).values([
        {
          productId: typescript.id,
          versionNumber: '5.7',
          releaseDate: '2024-11-21',
          eolDate: '2027-11-21',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: typescript.id,
          versionNumber: '5.6',
          releaseDate: '2024-09-09',
          eolDate: '2027-09-09',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: typescript.id,
          versionNumber: '5.5',
          releaseDate: '2024-06-20',
          eolDate: '2026-06-20',
          lifecycleStage: 'maintenance',
          lts: false,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // MySQL
    let mysql = await db.insert(eolProducts).values({name: 'MySQL', slug: 'mysql', vendor: 'Oracle Corporation', description: 'Open-source relational database', productType: 'database', homepageUrl: 'https://www.mysql.com', documentationUrl: 'https://dev.mysql.com/doc', createdBy: adminUser.id}).returning().onConflictDoNothing().then(rows => rows[0]);
    if (!mysql) { [mysql] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'mysql')).limit(1); }

    if (mysql) {
      await db.insert(eolVersions).values([
        {
          productId: mysql.id,
          versionNumber: '9.2',
          releaseDate: '2025-01-21',
          eolDate: '2030-01-21',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: mysql.id,
          versionNumber: '9.1',
          releaseDate: '2024-10-15',
          eolDate: '2029-10-15',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: mysql.id,
          versionNumber: '8.4 LTS',
          releaseDate: '2024-04-30',
          eolDate: '2032-04-30',
          lifecycleStage: 'active',
          lts: true,
          createdBy: adminUser.id,
        },
        {
          productId: mysql.id,
          versionNumber: '8.0',
          releaseDate: '2018-04-19',
          eolDate: '2026-04-30',
          lifecycleStage: 'maintenance',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: mysql.id,
          versionNumber: '5.7',
          releaseDate: '2015-10-21',
          eolDate: '2023-10-31',
          lifecycleStage: 'eol',
          lts: false,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // MongoDB
    let mongodb = await db.insert(eolProducts).values({name: 'MongoDB', slug: 'mongodb', vendor: 'MongoDB Inc.', description: 'Document-oriented NoSQL database', productType: 'database', homepageUrl: 'https://www.mongodb.com', documentationUrl: 'https://docs.mongodb.com', createdBy: adminUser.id}).returning().onConflictDoNothing().then(rows => rows[0]);
    if (!mongodb) { [mongodb] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'mongodb')).limit(1); }

    if (mongodb) {
      await db.insert(eolVersions).values([
        {
          productId: mongodb.id,
          versionNumber: '8.0',
          releaseDate: '2024-11-05',
          eolDate: '2027-11-05',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: mongodb.id,
          versionNumber: '7.0',
          releaseDate: '2023-08-08',
          eolDate: '2026-08-08',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: mongodb.id,
          versionNumber: '6.0',
          releaseDate: '2022-07-19',
          eolDate: '2025-07-19',
          lifecycleStage: 'maintenance',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: mongodb.id,
          versionNumber: '5.0',
          releaseDate: '2021-07-13',
          eolDate: '2024-10-31',
          lifecycleStage: 'eol',
          lts: false,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // Redis
    let redis = await db.insert(eolProducts).values({name: 'Redis', slug: 'redis', vendor: 'Redis Ltd.', description: 'In-memory data structure store', productType: 'database', homepageUrl: 'https://redis.io', documentationUrl: 'https://redis.io/docs', createdBy: adminUser.id}).returning().onConflictDoNothing().then(rows => rows[0]);
    if (!redis) { [redis] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'redis')).limit(1); }

    if (redis) {
      await db.insert(eolVersions).values([
        {
          productId: redis.id,
          versionNumber: '7.4',
          releaseDate: '2024-07-15',
          eolDate: '2027-07-15',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: redis.id,
          versionNumber: '7.2',
          releaseDate: '2023-08-15',
          eolDate: '2026-08-15',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: redis.id,
          versionNumber: '7.0',
          releaseDate: '2022-04-27',
          eolDate: '2025-04-27',
          lifecycleStage: 'maintenance',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: redis.id,
          versionNumber: '6.2',
          releaseDate: '2021-02-22',
          eolDate: '2024-07-31',
          lifecycleStage: 'eol',
          lts: false,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // Next.js
    let nextjs = await db.insert(eolProducts).values({name: 'Next.js', slug: 'nextjs', vendor: 'Vercel', description: 'React framework for production', productType: 'framework', homepageUrl: 'https://nextjs.org', documentationUrl: 'https://nextjs.org/docs', createdBy: adminUser.id}).returning().onConflictDoNothing().then(rows => rows[0]);
    if (!nextjs) { [nextjs] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'nextjs')).limit(1); }

    if (nextjs) {
      await db.insert(eolVersions).values([
        {
          productId: nextjs.id,
          versionNumber: '15.x',
          releaseDate: '2024-10-21',
          eolDate: '2026-10-21',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: nextjs.id,
          versionNumber: '14.x',
          releaseDate: '2023-10-26',
          eolDate: '2025-10-26',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: nextjs.id,
          versionNumber: '13.x',
          releaseDate: '2022-10-25',
          eolDate: '2024-10-25',
          lifecycleStage: 'eol',
          lts: false,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // Vue.js
    let vue = await db.insert(eolProducts).values({name: 'Vue.js', slug: 'vue', vendor: 'Evan You', description: 'Progressive JavaScript framework', productType: 'framework', homepageUrl: 'https://vuejs.org', documentationUrl: 'https://vuejs.org/guide', createdBy: adminUser.id}).returning().onConflictDoNothing().then(rows => rows[0]);
    if (!vue) { [vue] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'vue')).limit(1); }

    if (vue) {
      await db.insert(eolVersions).values([
        {
          productId: vue.id,
          versionNumber: '3.x',
          releaseDate: '2020-09-18',
          eolDate: '2026-12-31',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: vue.id,
          versionNumber: '2.7',
          releaseDate: '2022-07-01',
          eolDate: '2023-12-31',
          lifecycleStage: 'eol',
          lts: true,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // Angular
    let angular = await db.insert(eolProducts).values({name: 'Angular', slug: 'angular', vendor: 'Google', description: 'Platform for building web applications', productType: 'framework', homepageUrl: 'https://angular.io', documentationUrl: 'https://angular.io/docs', createdBy: adminUser.id}).returning().onConflictDoNothing().then(rows => rows[0]);
    if (!angular) { [angular] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'angular')).limit(1); }

    if (angular) {
      await db.insert(eolVersions).values([
        {
          productId: angular.id,
          versionNumber: '19',
          releaseDate: '2024-11-19',
          eolDate: '2026-05-19',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: angular.id,
          versionNumber: '18',
          releaseDate: '2024-05-22',
          eolDate: '2025-11-22',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: angular.id,
          versionNumber: '17',
          releaseDate: '2023-11-08',
          eolDate: '2025-05-15',
          lifecycleStage: 'maintenance',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: angular.id,
          versionNumber: '16',
          releaseDate: '2023-05-03',
          eolDate: '2024-11-08',
          lifecycleStage: 'eol',
          lts: false,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // Debian
    let debian = await db.insert(eolProducts).values({name: 'Debian', slug: 'debian', vendor: 'Debian Project', description: 'Free and open-source Linux distribution', productType: 'os', homepageUrl: 'https://www.debian.org', documentationUrl: 'https://www.debian.org/doc', createdBy: adminUser.id}).returning().onConflictDoNothing().then(rows => rows[0]);
    if (!debian) { [debian] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'debian')).limit(1); }

    if (debian) {
      await db.insert(eolVersions).values([
        {
          productId: debian.id,
          versionNumber: '12 (Bookworm)',
          releaseDate: '2023-06-10',
          eolDate: '2028-06-10',
          lifecycleStage: 'active',
          lts: true,
          createdBy: adminUser.id,
        },
        {
          productId: debian.id,
          versionNumber: '11 (Bullseye)',
          releaseDate: '2021-08-14',
          eolDate: '2026-08-14',
          lifecycleStage: 'active',
          lts: true,
          createdBy: adminUser.id,
        },
        {
          productId: debian.id,
          versionNumber: '10 (Buster)',
          releaseDate: '2019-07-06',
          eolDate: '2024-06-30',
          lifecycleStage: 'eol',
          lts: true,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // .NET
    let dotnet = await db.insert(eolProducts).values({name: '.NET', slug: 'dotnet', vendor: 'Microsoft', description: 'Free, cross-platform, open-source developer platform', productType: 'runtime', homepageUrl: 'https://dotnet.microsoft.com', documentationUrl: 'https://learn.microsoft.com/dotnet', createdBy: adminUser.id}).returning().onConflictDoNothing().then(rows => rows[0]);
    if (!dotnet) { [dotnet] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'dotnet')).limit(1); }

    if (dotnet) {
      await db.insert(eolVersions).values([
        {
          productId: dotnet.id,
          versionNumber: '.NET 9',
          releaseDate: '2024-11-12',
          eolDate: '2026-05-12',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: dotnet.id,
          versionNumber: '.NET 8 LTS',
          releaseDate: '2023-11-14',
          eolDate: '2026-11-10',
          lifecycleStage: 'active',
          lts: true,
          createdBy: adminUser.id,
        },
        {
          productId: dotnet.id,
          versionNumber: '.NET 7',
          releaseDate: '2022-11-08',
          eolDate: '2024-05-14',
          lifecycleStage: 'eol',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: dotnet.id,
          versionNumber: '.NET 6 LTS',
          releaseDate: '2021-11-08',
          eolDate: '2024-11-12',
          lifecycleStage: 'eol',
          lts: true,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // Go (Golang)
    let golang = await db.insert(eolProducts).values({name: 'Go', slug: 'go', vendor: 'Google', description: 'Statically typed, compiled programming language', productType: 'language', homepageUrl: 'https://go.dev', documentationUrl: 'https://go.dev/doc', createdBy: adminUser.id}).returning().onConflictDoNothing().then(rows => rows[0]);
    if (!golang) { [golang] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'go')).limit(1); }

    if (golang) {
      await db.insert(eolVersions).values([
        {
          productId: golang.id,
          versionNumber: '1.23',
          releaseDate: '2024-08-13',
          eolDate: '2025-08-13',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: golang.id,
          versionNumber: '1.22',
          releaseDate: '2024-02-06',
          eolDate: '2025-02-06',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: golang.id,
          versionNumber: '1.21',
          releaseDate: '2023-08-08',
          eolDate: '2024-08-08',
          lifecycleStage: 'eol',
          lts: false,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // Nginx
    let nginx = await db.insert(eolProducts).values({name: 'NGINX', slug: 'nginx', vendor: 'F5, Inc.', description: 'Web server and reverse proxy', productType: 'platform', homepageUrl: 'https://nginx.org', documentationUrl: 'https://nginx.org/en/docs', createdBy: adminUser.id}).returning().onConflictDoNothing().then(rows => rows[0]);
    if (!nginx) { [nginx] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'nginx')).limit(1); }

    if (nginx) {
      await db.insert(eolVersions).values([
        {
          productId: nginx.id,
          versionNumber: '1.27',
          releaseDate: '2024-05-29',
          eolDate: '2025-11-29',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: nginx.id,
          versionNumber: '1.26',
          releaseDate: '2024-04-23',
          eolDate: '2025-10-23',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: nginx.id,
          versionNumber: '1.24',
          releaseDate: '2023-04-11',
          eolDate: '2024-10-11',
          lifecycleStage: 'eol',
          lts: false,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // Elasticsearch
    let elasticsearch = await db.insert(eolProducts).values({name: 'Elasticsearch', slug: 'elasticsearch', vendor: 'Elastic', description: 'Distributed search and analytics engine', productType: 'database', homepageUrl: 'https://www.elastic.co/elasticsearch', documentationUrl: 'https://www.elastic.co/guide', createdBy: adminUser.id}).returning().onConflictDoNothing().then(rows => rows[0]);
    if (!elasticsearch) { [elasticsearch] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'elasticsearch')).limit(1); }

    if (elasticsearch) {
      await db.insert(eolVersions).values([
        {
          productId: elasticsearch.id,
          versionNumber: '8.17',
          releaseDate: '2025-01-15',
          eolDate: '2027-01-15',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: elasticsearch.id,
          versionNumber: '8.16',
          releaseDate: '2024-11-20',
          eolDate: '2026-11-20',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: elasticsearch.id,
          versionNumber: '7.17',
          releaseDate: '2022-02-01',
          eolDate: '2024-08-01',
          lifecycleStage: 'eol',
          lts: false,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    // Ruby
    let ruby = await db.insert(eolProducts).values({name: 'Ruby', slug: 'ruby', vendor: 'Ruby Core Team', description: 'Dynamic, open source programming language', productType: 'language', homepageUrl: 'https://www.ruby-lang.org', documentationUrl: 'https://www.ruby-lang.org/en/documentation', createdBy: adminUser.id}).returning().onConflictDoNothing().then(rows => rows[0]);
    if (!ruby) { [ruby] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'ruby')).limit(1); }

    if (ruby) {
      await db.insert(eolVersions).values([
        {
          productId: ruby.id,
          versionNumber: '3.3',
          releaseDate: '2023-12-25',
          eolDate: '2027-03-31',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: ruby.id,
          versionNumber: '3.2',
          releaseDate: '2022-12-25',
          eolDate: '2026-03-31',
          lifecycleStage: 'active',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: ruby.id,
          versionNumber: '3.1',
          releaseDate: '2021-12-25',
          eolDate: '2025-03-31',
          lifecycleStage: 'maintenance',
          lts: false,
          createdBy: adminUser.id,
        },
        {
          productId: ruby.id,
          versionNumber: '3.0',
          releaseDate: '2020-12-25',
          eolDate: '2024-03-31',
          lifecycleStage: 'eol',
          lts: false,
          createdBy: adminUser.id,
        },
      ]).onConflictDoNothing();
    }

    console.log('✅ EOL products and versions seeded successfully');
    console.log('📦 Total products seeded: 20');
    console.log('   - Node.js, PostgreSQL, Python, React, Docker, Kubernetes, Ubuntu');
    console.log('   - TypeScript, MySQL, MongoDB, Redis, Next.js, Vue.js, Angular');
    console.log('   - Debian, .NET, Go, NGINX, Elasticsearch, Ruby');
  } catch (error) {
    console.error('❌ Failed to seed EOL data:', error);
    throw error;
  }
};
