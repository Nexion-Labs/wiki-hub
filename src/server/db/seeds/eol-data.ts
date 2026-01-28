/**
 * EOL Data Source
 * Based on official EOL information from respective projects
 * Last updated: 2026-01-29
 *
 * Data sources:
 * - Node.js: https://github.com/nodejs/release
 * - PostgreSQL: https://www.postgresql.org/support/versioning/
 * - Python: https://devguide.python.org/versions/
 * - React: https://react.dev/blog (no official EOL policy, estimated)
 * - Docker: https://docs.docker.com/engine/release-notes/
 * - Kubernetes: https://kubernetes.io/releases/
 * - Ubuntu: https://wiki.ubuntu.com/Releases
 * - And more official sources...
 */

export interface ProductData {
  name: string;
  slug: string;
  vendor: string;
  description: string;
  categoryCode: string;
  homepageUrl: string;
  documentationUrl: string;
  license?: string;
  versions: VersionData[];
}

export interface VersionData {
  versionNumber: string;
  releaseDate: string; // YYYY-MM-DD
  eolDate: string; // YYYY-MM-DD
  extendedSupportDate?: string; // YYYY-MM-DD
  lifecycleStage: 'active' | 'maintenance' | 'security' | 'deprecated' | 'eol';
  lts: boolean;
  notes?: string;
}

export const eolProductsData: ProductData[] = [
  // ===========================================
  // Node.js - Runtime
  // ===========================================
  {
    name: 'Node.js',
    slug: 'nodejs',
    vendor: 'OpenJS Foundation',
    description: 'JavaScript runtime built on Chrome V8 engine',
    categoryCode: 'runtime',
    homepageUrl: 'https://nodejs.org',
    documentationUrl: 'https://nodejs.org/docs',
    license: 'MIT',
    versions: [
      {
        versionNumber: '23.x',
        releaseDate: '2024-10-16',
        eolDate: '2025-06-01',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Current stable release',
      },
      {
        versionNumber: '22.x',
        releaseDate: '2024-04-24',
        eolDate: '2027-04-30',
        lifecycleStage: 'active',
        lts: true,
        notes: 'LTS Jod - Active LTS until 2027',
      },
      {
        versionNumber: '20.x',
        releaseDate: '2023-04-18',
        eolDate: '2026-04-30',
        lifecycleStage: 'active',
        lts: true,
        notes: 'LTS Iron - Active LTS',
      },
      {
        versionNumber: '18.x',
        releaseDate: '2022-04-19',
        eolDate: '2025-04-30',
        lifecycleStage: 'maintenance',
        lts: true,
        notes: 'LTS Hydrogen - Maintenance mode',
      },
      {
        versionNumber: '16.x',
        releaseDate: '2021-04-20',
        eolDate: '2024-09-11',
        lifecycleStage: 'eol',
        lts: true,
        notes: 'LTS Gallium - End of Life',
      },
    ],
  },

  // ===========================================
  // PostgreSQL - Database
  // ===========================================
  {
    name: 'PostgreSQL',
    slug: 'postgresql',
    vendor: 'PostgreSQL Global Development Group',
    description: 'Advanced open source relational database',
    categoryCode: 'database',
    homepageUrl: 'https://www.postgresql.org',
    documentationUrl: 'https://www.postgresql.org/docs',
    license: 'PostgreSQL License',
    versions: [
      {
        versionNumber: '17',
        releaseDate: '2024-09-26',
        eolDate: '2029-11-08',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Current major version with 5-year support',
      },
      {
        versionNumber: '16',
        releaseDate: '2023-09-14',
        eolDate: '2028-11-09',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Stable version with extended support',
      },
      {
        versionNumber: '15',
        releaseDate: '2022-10-13',
        eolDate: '2027-11-11',
        lifecycleStage: 'active',
        lts: false,
      },
      {
        versionNumber: '14',
        releaseDate: '2021-09-30',
        eolDate: '2026-11-12',
        lifecycleStage: 'active',
        lts: false,
      },
      {
        versionNumber: '13',
        releaseDate: '2020-09-24',
        eolDate: '2025-11-13',
        lifecycleStage: 'maintenance',
        lts: false,
        notes: 'Entering end-of-life phase soon',
      },
      {
        versionNumber: '12',
        releaseDate: '2019-10-03',
        eolDate: '2024-11-14',
        lifecycleStage: 'eol',
        lts: false,
        notes: 'No longer supported',
      },
    ],
  },

  // ===========================================
  // Python - Programming Language
  // ===========================================
  {
    name: 'Python',
    slug: 'python',
    vendor: 'Python Software Foundation',
    description: 'High-level, interpreted programming language',
    categoryCode: 'programming-language',
    homepageUrl: 'https://www.python.org',
    documentationUrl: 'https://docs.python.org',
    license: 'PSF License',
    versions: [
      {
        versionNumber: '3.13',
        releaseDate: '2024-10-07',
        eolDate: '2029-10-31',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Latest stable release with performance improvements',
      },
      {
        versionNumber: '3.12',
        releaseDate: '2023-10-02',
        eolDate: '2028-10-31',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Recommended for new projects',
      },
      {
        versionNumber: '3.11',
        releaseDate: '2022-10-24',
        eolDate: '2027-10-31',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Stable and widely adopted',
      },
      {
        versionNumber: '3.10',
        releaseDate: '2021-10-04',
        eolDate: '2026-10-31',
        lifecycleStage: 'active',
        lts: false,
      },
      {
        versionNumber: '3.9',
        releaseDate: '2020-10-05',
        eolDate: '2025-10-31',
        lifecycleStage: 'maintenance',
        lts: false,
        notes: 'Security fixes only',
      },
      {
        versionNumber: '3.8',
        releaseDate: '2019-10-14',
        eolDate: '2024-10-31',
        lifecycleStage: 'eol',
        lts: false,
        notes: 'End of life',
      },
    ],
  },

  // ===========================================
  // React - Framework
  // ===========================================
  {
    name: 'React',
    slug: 'react',
    vendor: 'Meta (Facebook)',
    description: 'JavaScript library for building user interfaces',
    categoryCode: 'framework',
    homepageUrl: 'https://react.dev',
    documentationUrl: 'https://react.dev/learn',
    license: 'MIT',
    versions: [
      {
        versionNumber: '19.x',
        releaseDate: '2024-12-05',
        eolDate: '2028-12-05',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Latest major version with React Server Components',
      },
      {
        versionNumber: '18.x',
        releaseDate: '2022-03-29',
        eolDate: '2026-03-29',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Concurrent features, widely used',
      },
      {
        versionNumber: '17.x',
        releaseDate: '2020-10-20',
        eolDate: '2023-10-20',
        lifecycleStage: 'eol',
        lts: false,
        notes: 'No longer maintained',
      },
    ],
  },

  // ===========================================
  // Docker Engine - Tool
  // ===========================================
  {
    name: 'Docker Engine',
    slug: 'docker-engine',
    vendor: 'Docker Inc.',
    description: 'Container runtime and orchestration platform',
    categoryCode: 'tool',
    homepageUrl: 'https://www.docker.com',
    documentationUrl: 'https://docs.docker.com',
    license: 'Apache 2.0',
    versions: [
      {
        versionNumber: '27.x',
        releaseDate: '2024-06-10',
        eolDate: '2026-06-10',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Current stable release',
      },
      {
        versionNumber: '26.x',
        releaseDate: '2024-03-20',
        eolDate: '2026-03-20',
        lifecycleStage: 'active',
        lts: false,
      },
      {
        versionNumber: '25.x',
        releaseDate: '2024-01-19',
        eolDate: '2025-07-19',
        lifecycleStage: 'maintenance',
        lts: false,
      },
      {
        versionNumber: '24.x',
        releaseDate: '2023-05-16',
        eolDate: '2024-11-16',
        lifecycleStage: 'eol',
        lts: false,
      },
    ],
  },

  // ===========================================
  // Kubernetes - Tool
  // ===========================================
  {
    name: 'Kubernetes',
    slug: 'kubernetes',
    vendor: 'Cloud Native Computing Foundation',
    description: 'Container orchestration platform',
    categoryCode: 'tool',
    homepageUrl: 'https://kubernetes.io',
    documentationUrl: 'https://kubernetes.io/docs',
    license: 'Apache 2.0',
    versions: [
      {
        versionNumber: '1.31',
        releaseDate: '2024-08-13',
        eolDate: '2025-10-28',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Current stable version',
      },
      {
        versionNumber: '1.30',
        releaseDate: '2024-04-17',
        eolDate: '2025-06-28',
        lifecycleStage: 'active',
        lts: false,
      },
      {
        versionNumber: '1.29',
        releaseDate: '2023-12-13',
        eolDate: '2025-02-28',
        lifecycleStage: 'maintenance',
        lts: false,
        notes: 'Patch releases only',
      },
      {
        versionNumber: '1.28',
        releaseDate: '2023-08-15',
        eolDate: '2024-10-28',
        lifecycleStage: 'eol',
        lts: false,
      },
    ],
  },

  // ===========================================
  // Ubuntu - Operating System
  // ===========================================
  {
    name: 'Ubuntu',
    slug: 'ubuntu',
    vendor: 'Canonical',
    description: 'Debian-based Linux distribution',
    categoryCode: 'os',
    homepageUrl: 'https://ubuntu.com',
    documentationUrl: 'https://help.ubuntu.com',
    license: 'Mixed/Free',
    versions: [
      {
        versionNumber: '24.04 LTS',
        releaseDate: '2024-04-25',
        eolDate: '2029-04-25',
        extendedSupportDate: '2034-04-25',
        lifecycleStage: 'active',
        lts: true,
        notes: 'Noble Numbat - 5 years support, 10 years with ESM',
      },
      {
        versionNumber: '23.10',
        releaseDate: '2023-10-12',
        eolDate: '2024-07-31',
        lifecycleStage: 'eol',
        lts: false,
        notes: 'Mantic Minotaur - 9 months support',
      },
      {
        versionNumber: '22.04 LTS',
        releaseDate: '2022-04-21',
        eolDate: '2027-04-21',
        extendedSupportDate: '2032-04-21',
        lifecycleStage: 'active',
        lts: true,
        notes: 'Jammy Jellyfish - Long-term support',
      },
      {
        versionNumber: '20.04 LTS',
        releaseDate: '2020-04-23',
        eolDate: '2025-04-23',
        extendedSupportDate: '2030-04-23',
        lifecycleStage: 'maintenance',
        lts: true,
        notes: 'Focal Fossa - Entering maintenance mode',
      },
      {
        versionNumber: '18.04 LTS',
        releaseDate: '2018-04-26',
        eolDate: '2023-05-31',
        extendedSupportDate: '2028-04-26',
        lifecycleStage: 'eol',
        lts: true,
        notes: 'Bionic Beaver - ESM available',
      },
    ],
  },

  // ===========================================
  // TypeScript - Programming Language
  // ===========================================
  {
    name: 'TypeScript',
    slug: 'typescript',
    vendor: 'Microsoft',
    description: 'Typed superset of JavaScript that compiles to plain JavaScript',
    categoryCode: 'programming-language',
    homepageUrl: 'https://www.typescriptlang.org',
    documentationUrl: 'https://www.typescriptlang.org/docs',
    license: 'Apache 2.0',
    versions: [
      {
        versionNumber: '5.7',
        releaseDate: '2024-11-21',
        eolDate: '2027-11-21',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Latest stable with path mapping improvements',
      },
      {
        versionNumber: '5.6',
        releaseDate: '2024-09-09',
        eolDate: '2027-09-09',
        lifecycleStage: 'active',
        lts: false,
      },
      {
        versionNumber: '5.5',
        releaseDate: '2024-06-20',
        eolDate: '2026-06-20',
        lifecycleStage: 'maintenance',
        lts: false,
      },
    ],
  },

  // ===========================================
  // MySQL - Database
  // ===========================================
  {
    name: 'MySQL',
    slug: 'mysql',
    vendor: 'Oracle Corporation',
    description: 'Open-source relational database management system',
    categoryCode: 'database',
    homepageUrl: 'https://www.mysql.com',
    documentationUrl: 'https://dev.mysql.com/doc',
    license: 'GPL',
    versions: [
      {
        versionNumber: '9.2',
        releaseDate: '2025-01-21',
        eolDate: '2030-01-21',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Innovation release',
      },
      {
        versionNumber: '9.1',
        releaseDate: '2024-10-15',
        eolDate: '2029-10-15',
        lifecycleStage: 'active',
        lts: false,
      },
      {
        versionNumber: '8.4 LTS',
        releaseDate: '2024-04-30',
        eolDate: '2032-04-30',
        lifecycleStage: 'active',
        lts: true,
        notes: 'Long-term support release - 8 years',
      },
      {
        versionNumber: '8.0',
        releaseDate: '2018-04-19',
        eolDate: '2026-04-30',
        lifecycleStage: 'maintenance',
        lts: false,
        notes: 'Premier support ends soon',
      },
      {
        versionNumber: '5.7',
        releaseDate: '2015-10-21',
        eolDate: '2023-10-31',
        lifecycleStage: 'eol',
        lts: false,
        notes: 'Extended support available',
      },
    ],
  },

  // ===========================================
  // MongoDB - Database
  // ===========================================
  {
    name: 'MongoDB',
    slug: 'mongodb',
    vendor: 'MongoDB Inc.',
    description: 'Document-oriented NoSQL database',
    categoryCode: 'database',
    homepageUrl: 'https://www.mongodb.com',
    documentationUrl: 'https://docs.mongodb.com',
    license: 'SSPL',
    versions: [
      {
        versionNumber: '8.0',
        releaseDate: '2024-11-05',
        eolDate: '2028-02-01',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Latest stable with improved query performance',
      },
      {
        versionNumber: '7.0',
        releaseDate: '2023-08-08',
        eolDate: '2027-02-01',
        lifecycleStage: 'active',
        lts: false,
      },
      {
        versionNumber: '6.0',
        releaseDate: '2022-07-19',
        eolDate: '2025-07-31',
        lifecycleStage: 'maintenance',
        lts: false,
      },
      {
        versionNumber: '5.0',
        releaseDate: '2021-07-13',
        eolDate: '2024-10-31',
        lifecycleStage: 'eol',
        lts: false,
      },
    ],
  },

  // ===========================================
  // Redis - Database
  // ===========================================
  {
    name: 'Redis',
    slug: 'redis',
    vendor: 'Redis Ltd.',
    description: 'In-memory data structure store, cache, and message broker',
    categoryCode: 'database',
    homepageUrl: 'https://redis.io',
    documentationUrl: 'https://redis.io/docs',
    license: 'RSALv2/SSPLv1',
    versions: [
      {
        versionNumber: '7.4',
        releaseDate: '2024-07-15',
        eolDate: '2027-07-15',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Current stable release',
      },
      {
        versionNumber: '7.2',
        releaseDate: '2023-08-15',
        eolDate: '2026-08-15',
        lifecycleStage: 'active',
        lts: false,
      },
      {
        versionNumber: '7.0',
        releaseDate: '2022-04-27',
        eolDate: '2025-04-27',
        lifecycleStage: 'maintenance',
        lts: false,
      },
      {
        versionNumber: '6.2',
        releaseDate: '2021-02-22',
        eolDate: '2024-07-31',
        lifecycleStage: 'eol',
        lts: false,
      },
    ],
  },

  // ===========================================
  // Next.js - Framework
  // ===========================================
  {
    name: 'Next.js',
    slug: 'nextjs',
    vendor: 'Vercel',
    description: 'React framework for production with hybrid static & server rendering',
    categoryCode: 'framework',
    homepageUrl: 'https://nextjs.org',
    documentationUrl: 'https://nextjs.org/docs',
    license: 'MIT',
    versions: [
      {
        versionNumber: '15.x',
        releaseDate: '2024-10-21',
        eolDate: '2026-10-21',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Latest with React 19 support',
      },
      {
        versionNumber: '14.x',
        releaseDate: '2023-10-26',
        eolDate: '2025-10-26',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Server Actions, Turbopack',
      },
      {
        versionNumber: '13.x',
        releaseDate: '2022-10-25',
        eolDate: '2024-10-25',
        lifecycleStage: 'eol',
        lts: false,
        notes: 'App Router introduced',
      },
    ],
  },

  // ===========================================
  // Vue.js - Framework
  // ===========================================
  {
    name: 'Vue.js',
    slug: 'vue',
    vendor: 'Evan You',
    description: 'Progressive JavaScript framework for building user interfaces',
    categoryCode: 'framework',
    homepageUrl: 'https://vuejs.org',
    documentationUrl: 'https://vuejs.org/guide',
    license: 'MIT',
    versions: [
      {
        versionNumber: '3.x',
        releaseDate: '2020-09-18',
        eolDate: '2026-12-31',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Composition API, better TypeScript support',
      },
      {
        versionNumber: '2.7',
        releaseDate: '2022-07-01',
        eolDate: '2023-12-31',
        lifecycleStage: 'eol',
        lts: true,
        notes: 'Final Vue 2 release with backported features',
      },
    ],
  },

  // ===========================================
  // Angular - Framework
  // ===========================================
  {
    name: 'Angular',
    slug: 'angular',
    vendor: 'Google',
    description: 'Platform and framework for building web applications',
    categoryCode: 'framework',
    homepageUrl: 'https://angular.io',
    documentationUrl: 'https://angular.io/docs',
    license: 'MIT',
    versions: [
      {
        versionNumber: '19',
        releaseDate: '2024-11-19',
        eolDate: '2026-05-19',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Latest with signals improvements',
      },
      {
        versionNumber: '18',
        releaseDate: '2024-05-22',
        eolDate: '2025-11-22',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Zoneless change detection',
      },
      {
        versionNumber: '17',
        releaseDate: '2023-11-08',
        eolDate: '2025-05-15',
        lifecycleStage: 'maintenance',
        lts: false,
        notes: 'Entering maintenance phase',
      },
      {
        versionNumber: '16',
        releaseDate: '2023-05-03',
        eolDate: '2024-11-08',
        lifecycleStage: 'eol',
        lts: false,
      },
    ],
  },

  // ===========================================
  // Debian - Operating System
  // ===========================================
  {
    name: 'Debian',
    slug: 'debian',
    vendor: 'Debian Project',
    description: 'Universal operating system composed of free and open-source software',
    categoryCode: 'os',
    homepageUrl: 'https://www.debian.org',
    documentationUrl: 'https://www.debian.org/doc',
    license: 'DFSG',
    versions: [
      {
        versionNumber: '12 (Bookworm)',
        releaseDate: '2023-06-10',
        eolDate: '2028-06-10',
        lifecycleStage: 'active',
        lts: true,
        notes: 'Current stable - 5 years support',
      },
      {
        versionNumber: '11 (Bullseye)',
        releaseDate: '2021-08-14',
        eolDate: '2026-08-14',
        lifecycleStage: 'active',
        lts: true,
        notes: 'Oldstable with LTS support',
      },
      {
        versionNumber: '10 (Buster)',
        releaseDate: '2019-07-06',
        eolDate: '2024-06-30',
        lifecycleStage: 'eol',
        lts: true,
        notes: 'LTS ended',
      },
    ],
  },

  // ===========================================
  // .NET - Runtime
  // ===========================================
  {
    name: '.NET',
    slug: 'dotnet',
    vendor: 'Microsoft',
    description: 'Free, cross-platform, open-source developer platform',
    categoryCode: 'runtime',
    homepageUrl: 'https://dotnet.microsoft.com',
    documentationUrl: 'https://learn.microsoft.com/dotnet',
    license: 'MIT',
    versions: [
      {
        versionNumber: '.NET 9',
        releaseDate: '2024-11-12',
        eolDate: '2026-05-12',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Standard Term Support (STS)',
      },
      {
        versionNumber: '.NET 8 LTS',
        releaseDate: '2023-11-14',
        eolDate: '2026-11-10',
        lifecycleStage: 'active',
        lts: true,
        notes: 'Long-term support - 3 years',
      },
      {
        versionNumber: '.NET 7',
        releaseDate: '2022-11-08',
        eolDate: '2024-05-14',
        lifecycleStage: 'eol',
        lts: false,
      },
      {
        versionNumber: '.NET 6 LTS',
        releaseDate: '2021-11-08',
        eolDate: '2024-11-12',
        lifecycleStage: 'eol',
        lts: true,
        notes: 'LTS support ended',
      },
    ],
  },

  // ===========================================
  // Go (Golang) - Programming Language
  // ===========================================
  {
    name: 'Go',
    slug: 'go',
    vendor: 'Google',
    description: 'Statically typed, compiled programming language designed at Google',
    categoryCode: 'programming-language',
    homepageUrl: 'https://go.dev',
    documentationUrl: 'https://go.dev/doc',
    license: 'BSD',
    versions: [
      {
        versionNumber: '1.23',
        releaseDate: '2024-08-13',
        eolDate: '2025-08-13',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Current stable - 1 year support',
      },
      {
        versionNumber: '1.22',
        releaseDate: '2024-02-06',
        eolDate: '2025-02-06',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Previous stable version',
      },
      {
        versionNumber: '1.21',
        releaseDate: '2023-08-08',
        eolDate: '2024-08-08',
        lifecycleStage: 'eol',
        lts: false,
      },
    ],
  },

  // ===========================================
  // NGINX - Tool
  // ===========================================
  {
    name: 'NGINX',
    slug: 'nginx',
    vendor: 'F5, Inc.',
    description: 'HTTP and reverse proxy server, mail proxy server, and generic TCP/UDP proxy',
    categoryCode: 'tool',
    homepageUrl: 'https://nginx.org',
    documentationUrl: 'https://nginx.org/en/docs',
    license: 'BSD-2-Clause',
    versions: [
      {
        versionNumber: '1.27',
        releaseDate: '2024-05-29',
        eolDate: '2025-11-29',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Mainline version',
      },
      {
        versionNumber: '1.26',
        releaseDate: '2024-04-23',
        eolDate: '2025-10-23',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Stable branch',
      },
      {
        versionNumber: '1.24',
        releaseDate: '2023-04-11',
        eolDate: '2024-10-11',
        lifecycleStage: 'eol',
        lts: false,
      },
    ],
  },

  // ===========================================
  // Elasticsearch - Database
  // ===========================================
  {
    name: 'Elasticsearch',
    slug: 'elasticsearch',
    vendor: 'Elastic',
    description: 'Distributed, RESTful search and analytics engine',
    categoryCode: 'database',
    homepageUrl: 'https://www.elastic.co/elasticsearch',
    documentationUrl: 'https://www.elastic.co/guide',
    license: 'Elastic License',
    versions: [
      {
        versionNumber: '8.17',
        releaseDate: '2025-01-15',
        eolDate: '2027-07-15',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Latest release',
      },
      {
        versionNumber: '8.16',
        releaseDate: '2024-11-20',
        eolDate: '2027-05-20',
        lifecycleStage: 'active',
        lts: false,
      },
      {
        versionNumber: '7.17',
        releaseDate: '2022-02-01',
        eolDate: '2024-08-01',
        lifecycleStage: 'eol',
        lts: false,
        notes: 'Last 7.x release',
      },
    ],
  },

  // ===========================================
  // Ruby - Programming Language
  // ===========================================
  {
    name: 'Ruby',
    slug: 'ruby',
    vendor: 'Ruby Core Team',
    description: 'Dynamic, open source programming language with focus on simplicity',
    categoryCode: 'programming-language',
    homepageUrl: 'https://www.ruby-lang.org',
    documentationUrl: 'https://www.ruby-lang.org/en/documentation',
    license: 'Ruby License',
    versions: [
      {
        versionNumber: '3.3',
        releaseDate: '2023-12-25',
        eolDate: '2027-03-31',
        lifecycleStage: 'active',
        lts: false,
        notes: 'Current stable with YJIT improvements',
      },
      {
        versionNumber: '3.2',
        releaseDate: '2022-12-25',
        eolDate: '2026-03-31',
        lifecycleStage: 'active',
        lts: false,
        notes: 'WASM support',
      },
      {
        versionNumber: '3.1',
        releaseDate: '2021-12-25',
        eolDate: '2025-03-31',
        lifecycleStage: 'maintenance',
        lts: false,
        notes: 'Security fixes only',
      },
      {
        versionNumber: '3.0',
        releaseDate: '2020-12-25',
        eolDate: '2024-03-31',
        lifecycleStage: 'eol',
        lts: false,
      },
    ],
  },
];
