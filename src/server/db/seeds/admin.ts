'use server';

import { db } from '../client';
import { users, roles } from '../schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../../utils/password';

export const seedAdmin = async () => {
  console.log('🌱 Seeding admin user...');

  // Get the admin role
  const [adminRole] = await db.select().from(roles).where(eq(roles.name, 'admin'));

  if (!adminRole) {
    throw new Error('Admin role not found. Please seed roles first.');
  }

  // Hash the default password
  const defaultPassword = 'admin123';
  const passwordHash = await hashPassword(defaultPassword);

  const adminUser = {
    email: 'admin@wiki-app.com',
    username: 'admin',
    passwordHash,
    fullName: 'System Administrator',
    roleId: adminRole.id,
    isActive: true,
    emailVerified: true,
  };

  await db.insert(users).values(adminUser).onConflictDoNothing();

  console.log('✅ Admin user seeded successfully');
  console.log('📧 Email: admin@wiki-app.com');
  console.log('🔑 Password: admin123');
  console.log('⚠️  Please change the password after first login!');
};
