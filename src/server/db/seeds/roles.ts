import { db } from '../client';
import { roles } from '../schema';

export const seedRoles = async () => {
  console.log('🌱 Seeding roles...');

  const rolesData = [
    {
      name: 'admin',
      description: 'Full system access - manage users, roles, and all content',
      permissions: {
        wiki: ['create', 'read', 'update', 'delete', 'manage'],
        eol: ['create', 'read', 'update', 'delete', 'manage'],
        users: ['create', 'read', 'update', 'delete'],
      },
    },
    {
      name: 'editor',
      description: 'Create and edit all content',
      permissions: {
        wiki: ['create', 'read', 'update', 'delete'],
        eol: ['create', 'read', 'update', 'delete'],
        users: ['read'],
      },
    },
    {
      name: 'contributor',
      description: 'Create and edit own content only',
      permissions: {
        wiki: ['create', 'read', 'update_own', 'delete_own'],
        eol: ['create', 'read', 'update_own', 'delete_own'],
        users: ['read'],
      },
    },
    {
      name: 'viewer',
      description: 'Read-only access to all content',
      permissions: {
        wiki: ['read'],
        eol: ['read'],
        users: ['read'],
      },
    },
  ];

  for (const role of rolesData) {
    await db.insert(roles).values(role).onConflictDoNothing();
  }

  console.log('✅ Roles seeded successfully');
};
