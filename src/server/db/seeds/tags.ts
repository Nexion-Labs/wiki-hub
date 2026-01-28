import { db } from '../client';
import { tags } from '../schema';

export const seedTags = async () => {
  console.log('🌱 Seeding tags...');

  const tagData = [
    { name: 'nodejs', slug: 'nodejs', color: '#339933' },
    { name: 'python', slug: 'python', color: '#3776AB' },
    { name: 'javascript', slug: 'javascript', color: '#F7DF1E' },
    { name: 'typescript', slug: 'typescript', color: '#3178C6' },
    { name: 'react', slug: 'react', color: '#61DAFB' },
    { name: 'vue', slug: 'vue', color: '#4FC08D' },
    { name: 'docker', slug: 'docker', color: '#2496ED' },
    { name: 'kubernetes', slug: 'kubernetes', color: '#326CE5' },
    { name: 'aws', slug: 'aws', color: '#FF9900' },
    { name: 'azure', slug: 'azure', color: '#0078D4' },
    { name: 'postgresql', slug: 'postgresql', color: '#4169E1' },
    { name: 'mongodb', slug: 'mongodb', color: '#47A248' },
    { name: 'redis', slug: 'redis', color: '#DC382D' },
    { name: 'microservices', slug: 'microservices', color: '#00897B' },
    { name: 'api', slug: 'api', color: '#009688' },
    { name: 'rest', slug: 'rest', color: '#00796B' },
    { name: 'graphql', slug: 'graphql', color: '#E10098' },
    { name: 'authentication', slug: 'authentication', color: '#F44336' },
    { name: 'authorization', slug: 'authorization', color: '#E91E63' },
    { name: 'jwt', slug: 'jwt', color: '#000000' },
    { name: 'oauth', slug: 'oauth', color: '#EB5424' },
    { name: 'cicd', slug: 'cicd', color: '#FFA000' },
    { name: 'github-actions', slug: 'github-actions', color: '#2088FF' },
    { name: 'jenkins', slug: 'jenkins', color: '#D24939' },
    { name: 'terraform', slug: 'terraform', color: '#7B42BC' },
    { name: 'ansible', slug: 'ansible', color: '#EE0000' },
    { name: 'nginx', slug: 'nginx', color: '#009639' },
    { name: 'apache', slug: 'apache', color: '#D22128' },
    { name: 'linux', slug: 'linux', color: '#FCC624' },
    { name: 'security', slug: 'security', color: '#DD0031' },
    { name: 'performance', slug: 'performance', color: '#00BCD4' },
    { name: 'optimization', slug: 'optimization', color: '#009688' },
    { name: 'best-practices', slug: 'best-practices', color: '#4CAF50' },
    { name: 'tutorial', slug: 'tutorial', color: '#FF9800' },
    { name: 'guide', slug: 'guide', color: '#FF5722' },
  ];

  try {
    for (const tag of tagData) {
      await db.insert(tags).values(tag).onConflictDoNothing();
    }
    console.log(`✅ Tags seeded successfully (${tagData.length} tags)`);
  } catch (error) {
    console.error('❌ Failed to seed tags:', error);
    throw error;
  }
};
