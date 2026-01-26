import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { userService } from '../services/user.service';

export const userRoutes = new Elysia({ prefix: '/users' })
  .use(authMiddleware)
  .get('/', async ({ query, user }) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const limit = parseInt(query.limit || '50');
    const offset = parseInt(query.offset || '0');

    const users = await userService.listUsers(limit, offset);

    return {
      success: true,
      data: users,
      meta: {
        limit,
        offset,
      },
    };
  })
  .get('/roles', async ({ user }) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    const roles = await userService.listRoles();

    return {
      success: true,
      data: roles,
    };
  })
  .get('/:id', async ({ params: { id }, user }) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const userData = await userService.getUser(id);

    return {
      success: true,
      data: userData,
    };
  })
  .post(
    '/',
    async ({ body, user, set }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const newUser = await userService.createUser(body);

      set.status = 201;
      return {
        success: true,
        message: 'User created successfully',
        data: newUser,
      };
    },
    {
      body: t.Object({
        email: t.String(),
        username: t.String(),
        password: t.String(),
        fullName: t.Optional(t.String()),
        roleId: t.String(),
      }),
    }
  )
  .put(
    '/:id',
    async ({ params: { id }, body, user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const updated = await userService.updateUser(id, body);

      return {
        success: true,
        message: 'User updated successfully',
        data: updated,
      };
    },
    {
      body: t.Object({
        email: t.Optional(t.String()),
        username: t.Optional(t.String()),
        fullName: t.Optional(t.String()),
        isActive: t.Optional(t.Boolean()),
      }),
    }
  )
  .put('/:id/role', async ({ params: { id }, body, user }) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const updated = await userService.updateUserRole(id, body.roleId);

    return {
      success: true,
      message: 'User role updated successfully',
      data: updated,
    };
  })
  .delete('/:id', async ({ params: { id }, user }) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    await userService.deleteUser(id);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  })
  .post('/:id/deactivate', async ({ params: { id }, user }) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    await userService.deactivateUser(id);

    return {
      success: true,
      message: 'User deactivated successfully',
    };
  });
