import { userRepository } from '../repositories/user.repository';
import { roleRepository } from '../repositories/role.repository';
import { hashPassword } from '../utils/password';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';

// Email validation helper
function validateEmail(email: string): void {
  if (!email) {
    throw new ValidationError('Email is required');
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }

  // Check email length
  if (email.length > 255) {
    throw new ValidationError('Email is too long');
  }

  // Block temporary/testing email domains
  const blockedDomains = [
    'yopmail.com',
    'maildrop.cc',
    'guerrillamail.com',
    'temp-mail.org',
    'mailinator.com',
    'tempmail.com',
    '10minutemail.com',
    'throwaway.email',
    'getnada.com',
    'trashmail.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (blockedDomains.includes(domain)) {
    throw new ValidationError('Temporary or disposable email addresses are not allowed');
  }
}

// Username validation helper
function validateUsername(username: string): void {
  if (!username) {
    throw new ValidationError('Username is required');
  }

  // Username must be 3-30 characters
  if (username.length < 3 || username.length > 30) {
    throw new ValidationError('Username must be between 3 and 30 characters');
  }

  // Username can only contain alphanumeric characters, underscores, and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    throw new ValidationError('Username can only contain letters, numbers, underscores, and hyphens');
  }
}

// Password validation helper
function validatePassword(password: string): void {
  if (!password) {
    throw new ValidationError('Password is required');
  }

  // Password must be at least 8 characters
  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long');
  }

  // Password must be at most 128 characters
  if (password.length > 128) {
    throw new ValidationError('Password is too long');
  }
}

export class UserService {
  async listUsers(limit = 50, offset = 0) {
    return await userRepository.findAll(limit, offset);
  }

  async getUser(id: string) {
    const user = await userRepository.findByIdWithRole(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createUser(data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
    roleId: string;
  }) {
    // Validate input
    validateEmail(data.email);
    validateUsername(data.username);
    validatePassword(data.password);

    // Check if user exists
    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError('Email already in use');
    }

    const existingUsername = await userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    // Verify role exists
    const role = await roleRepository.findById(data.roleId);
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await userRepository.create({
      email: data.email,
      username: data.username,
      passwordHash,
      fullName: data.fullName,
      roleId: data.roleId,
      isActive: true,
      emailVerified: false,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(
    id: string,
    data: {
      email?: string;
      username?: string;
      fullName?: string;
      roleId?: string;
      isActive?: boolean;
    }
  ) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Validate email if being changed
    if (data.email) {
      validateEmail(data.email);
    }

    // Validate username if being changed
    if (data.username) {
      validateUsername(data.username);
    }

    // Check for conflicts if email is being changed
    if (data.email && data.email !== user.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing) {
        throw new ConflictError('Email already in use');
      }
    }

    // Check for conflicts if username is being changed
    if (data.username && data.username !== user.username) {
      const existing = await userRepository.findByUsername(data.username);
      if (existing) {
        throw new ConflictError('Username already taken');
      }
    }

    const updated = await userRepository.update(id, data);
    const { passwordHash, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  async updateUserRole(userId: string, roleId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    const updated = await userRepository.update(userId, { roleId });
    const { passwordHash, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  async deleteUser(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await userRepository.delete(id);
  }

  async deactivateUser(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await userRepository.update(id, { isActive: false });
  }

  async listRoles() {
    return await roleRepository.findAll();
  }

  async isUsernameAvailable(username: string, excludeUserId?: string) {
    const user = await userRepository.findByUsername(username);
    if (!user) return true;
    if (excludeUserId && user.id === excludeUserId) return true;
    return false;
  }
}

export const userService = new UserService();
