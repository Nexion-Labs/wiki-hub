import { userRepository } from '../repositories/user.repository';
import { roleRepository } from '../repositories/role.repository';
import { hashPassword } from '../utils/password';
import { NotFoundError, ConflictError } from '../utils/errors';

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
      isActive?: boolean;
    }
  ) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
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
}

export const userService = new UserService();
