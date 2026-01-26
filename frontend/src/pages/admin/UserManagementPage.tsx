import { useState, useEffect, useCallback } from 'react';
import { userApi, type User, type Role } from '../../api/user.api';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { getStatusBadgeVariant } from '../../lib/theme';

export const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    fullName: '',
    roleId: '',
  });
  const [formError, setFormError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        userApi.getUsers(),
        userApi.getRoles(),
      ]);
      setUsers(usersRes.data.data);
      setRoles(rolesRes.data.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Memoized event handlers (rerender-memo, rerender-functional-setstate)
   * Prevents unnecessary re-renders by stabilizing function references
   */
  const handleDeactivate = useCallback(async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      await userApi.deactivateUser(userId);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to deactivate user');
    }
  }, []);

  const handleDelete = useCallback(async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.'))
      return;

    try {
      await userApi.deleteUser(userId);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to delete user');
    }
  }, []);

  const handleCreateUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.email || !formData.username || !formData.password || !formData.roleId) {
      setFormError('Email, username, password, and role are required');
      return;
    }

    try {
      await userApi.createUser(formData);
      setShowCreateModal(false);
      setFormData({
        email: '',
        username: '',
        password: '',
        fullName: '',
        roleId: '',
      });
      loadData();
    } catch (error: any) {
      setFormError(error.response?.data?.error?.message || 'Failed to create user');
    }
  }, [formData]);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin access required</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="mt-2 text-gray-600">Manage user accounts and roles</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} variant="primary">
            Add User
          </Button>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => {
                const role = roles.find((r) => r.id === u.roleId);
                return (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{u.username}</div>
                      {u.fullName && (
                        <div className="text-sm text-gray-500">{u.fullName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="info">
                        {role?.name || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(u.isActive)}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {u.isActive && (
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleDeactivate(u.id)}
                        >
                          Deactivate
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Create New User</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormError('');
                  }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>

              <form onSubmit={handleCreateUser}>
                {formError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {formError}
                  </div>
                )}

                <div className="space-y-4">
                  <Input
                    type="email"
                    label="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    fullWidth
                  />

                  <Input
                    type="text"
                    label="Username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    fullWidth
                  />

                  <Input
                    type="password"
                    label="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    minLength={8}
                    helperText="Minimum 8 characters"
                    fullWidth
                  />

                  <Input
                    type="text"
                    label="Full Name"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    fullWidth
                  />

                  <Select
                    label="Role"
                    value={formData.roleId}
                    onChange={(e) =>
                      setFormData({ ...formData, roleId: e.target.value })
                    }
                    required
                    placeholder="Select a role"
                    fullWidth
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="mt-6 flex space-x-3">
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                  >
                    Create User
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormError('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
