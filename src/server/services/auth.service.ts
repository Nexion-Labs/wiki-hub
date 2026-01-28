import { userRepository } from '../repositories/user.repository';
import { roleRepository } from '../repositories/role.repository';
import { hashPassword, verifyPassword } from '../utils/password';
import { createRefreshToken, parseTokenExpiry } from '../utils/jwt';
import { env } from '../config/env';
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../utils/errors';
import type { RegisterInput, LoginInput } from '../validators/auth.validator';

export class AuthService {
  async register(data: RegisterInput) {
    // Check if user exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const existingUsername = await userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    // Get viewer role (default for new users)
    const viewerRole = await roleRepository.findByName('viewer');
    if (!viewerRole) {
      throw new Error('Default viewer role not found');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await userRepository.create({
      email: data.email,
      username: data.username,
      passwordHash,
      fullName: data.fullName,
      roleId: viewerRole.id,
      isActive: true,
      emailVerified: false,
    });

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      role: viewerRole,
    };
  }

  async login(data: LoginInput, ipAddress?: string, userAgent?: string) {
    // Find user with role
    const existingUser = await userRepository.findByEmail(data.email);
    if (!existingUser) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(
      data.password,
      existingUser.passwordHash
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if user is active
    if (!existingUser.isActive) {
      throw new UnauthorizedError('Account is disabled');
    }

    // Get user role
    const role = await roleRepository.findById(existingUser.roleId);
    if (!role) {
      throw new Error('User role not found');
    }

    // Create refresh token
    const refreshToken = createRefreshToken();
    const refreshExpiresIn = parseTokenExpiry(env.JWT_REFRESH_EXPIRES_IN);
    const expiresAt = new Date(Date.now() + refreshExpiresIn);

    // Save session
    await userRepository.createSession({
      userId: existingUser.id,
      refreshToken,
      expiresAt,
      ipAddress,
      userAgent,
      isActive: true,
    });

    // Update last login
    await userRepository.updateLastLogin(existingUser.id);

    // Return user data
    const { passwordHash: _, ...userWithoutPassword } = existingUser;
    return {
      user: userWithoutPassword,
      role,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    // Find session
    const session = await userRepository.findSessionByToken(refreshToken);
    if (!session) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      await userRepository.invalidateSession(refreshToken);
      throw new UnauthorizedError('Refresh token expired');
    }

    // Get user with role
    const userWithRole = await userRepository.findByIdWithRole(session.userId);
    if (!userWithRole || !userWithRole.role) {
      throw new NotFoundError('User not found');
    }

    // Create new refresh token (rotation)
    const newRefreshToken = createRefreshToken();
    const refreshExpiresIn = parseTokenExpiry(env.JWT_REFRESH_EXPIRES_IN);
    const expiresAt = new Date(Date.now() + refreshExpiresIn);

    // Invalidate old token
    await userRepository.invalidateSession(refreshToken);

    // Create new session
    await userRepository.createSession({
      userId: session.userId,
      refreshToken: newRefreshToken,
      expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      isActive: true,
    });

    const { passwordHash: _, ...userWithoutPassword } = userWithRole;
    return {
      user: userWithoutPassword,
      role: userWithRole.role,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    await userRepository.invalidateSession(refreshToken);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(
      currentPassword,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid current password');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await userRepository.update(userId, { passwordHash: newPasswordHash });

    // Invalidate all sessions
    await userRepository.invalidateAllUserSessions(userId);
  }
}

export const authService = new AuthService();
