import { db } from '../client';
import { categories } from '../schema';

export const seedCategories = async () => {
  console.log('🌱 Seeding categories...');

  const categoryData = [
    {
      name: 'Getting Started',
      slug: 'getting-started',
      description: 'Guides and tutorials for beginners',
      color: '#3B82F6',
      icon: '🚀',
      parentId: null,
    },
    {
      name: 'Development',
      slug: 'development',
      description: 'Software development guides and best practices',
      color: '#10B981',
      icon: '💻',
      parentId: null,
    },
    {
      name: 'DevOps',
      slug: 'devops',
      description: 'DevOps tools, CI/CD, and infrastructure',
      color: '#F59E0B',
      icon: '⚙️',
      parentId: null,
    },
    {
      name: 'Security',
      slug: 'security',
      description: 'Security best practices and guidelines',
      color: '#EF4444',
      icon: '🔒',
      parentId: null,
    },
    {
      name: 'Architecture',
      slug: 'architecture',
      description: 'System architecture and design patterns',
      color: '#8B5CF6',
      icon: '🏗️',
      parentId: null,
    },
    {
      name: 'Database',
      slug: 'database',
      description: 'Database design, optimization, and management',
      color: '#06B6D4',
      icon: '🗄️',
      parentId: null,
    },
    {
      name: 'Testing',
      slug: 'testing',
      description: 'Testing strategies and quality assurance',
      color: '#EC4899',
      icon: '🧪',
      parentId: null,
    },
    {
      name: 'Monitoring',
      slug: 'monitoring',
      description: 'Application and infrastructure monitoring',
      color: '#14B8A6',
      icon: '📊',
      parentId: null,
    },
  ];

  try {
    for (const category of categoryData) {
      await db.insert(categories).values(category).onConflictDoNothing();
    }
    console.log(`✅ Categories seeded successfully (${categoryData.length} categories)`);
  } catch (error) {
    console.error('❌ Failed to seed categories:', error);
    throw error;
  }
};
