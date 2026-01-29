import { createServerFn } from '@tanstack/react-start';
import { UserService } from '../services/user.service';

const userService = new UserService();

// List all users
export const listUsers = createServerFn({ method: 'GET' })
  .inputValidator((data: { limit?: number; offset?: number }) => data)
  .handler(async ({ data }) => {
    try {
      const users = await userService.listUsers(data.limit || 50, data.offset || 0);
      return { success: true, data: users };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list users';
      return { success: false, error: message, data: null };
    }
  });

// Get user by ID
export const getUserById = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    try {
      const user = await userService.getUser(data.id);
      return { success: true, data: user };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'User not found';
      return { success: false, error: message, data: null };
    }
  });

// Create user
export const createUserFn = createServerFn({ method: 'POST' })
  .inputValidator((data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
    roleId: string;
  }) => data)
  .handler(async ({ data }) => {
    try {
      const user = await userService.createUser(data);
      return { success: true, data: user };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create user';
      return { success: false, error: message, data: null };
    }
  });

// Update user
export const updateUserFn = createServerFn({ method: 'POST' })
  .inputValidator((data: {
    id: string;
    email?: string;
    username?: string;
    fullName?: string;
    roleId?: string;
    isActive?: boolean;
  }) => data)
  .handler(async ({ data }) => {
    try {
      const { id, ...updateData } = data;
      const user = await userService.updateUser(id, updateData);
      return { success: true, data: user };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update user';
      return { success: false, error: message, data: null };
    }
  });

// Delete user
export const deleteUserFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    try {
      await userService.deleteUser(data.id);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete user';
      return { success: false, error: message };
    }
  });

// List all roles
export const listRolesFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const roles = await userService.listRoles();
      return { success: true, data: roles };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list roles';
      return { success: false, error: message, data: [] };
    }
  });

// Check username availability
export const checkUsernameFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { username: string; excludeUserId?: string }) => data)
  .handler(async ({ data }) => {
    try {
      const available = await userService.isUsernameAvailable(data.username, data.excludeUserId);
      return { success: true, available };
    } catch (error) {
      return { success: false, available: false };
    }
  });
