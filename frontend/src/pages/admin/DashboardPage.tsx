import { useState, useEffect } from 'react';
import { wikiApi } from '../../api/wiki.api';
import { eolApi } from '../../api/eol.api';
import { userApi } from '../../api/user.api';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard, Icons } from '../../components/StatCard';

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalPages: 0,
    totalProducts: 0,
    totalUsers: 0,
    expiringVersions: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [pages, products, users, expiring] = await Promise.all([
        wikiApi.getPages({ limit: 1 }),
        eolApi.getProducts({ limit: 1 }),
        user?.role === 'admin' ? userApi.getUsers({ limit: 1 }) : Promise.resolve({ data: { data: [] } }),
        eolApi.getExpiringVersions(90),
      ]);

      setStats({
        totalPages: pages.data.data.length,
        totalProducts: products.data.data.length,
        totalUsers: users.data.data.length,
        expiringVersions: expiring.data.data.length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of your wiki application</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Wiki Pages"
            value={stats.totalPages}
            color="blue"
            icon={Icons.Document}
          />

          <StatCard
            title="EOL Products"
            value={stats.totalProducts}
            color="green"
            icon={Icons.Package}
          />

          {user?.role === 'admin' && (
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              color="purple"
              icon={Icons.Users}
            />
          )}

          <StatCard
            title="Expiring Soon"
            value={stats.expiringVersions}
            color="red"
            icon={Icons.Alert}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <a
                href="/wiki/new"
                className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              >
                <div className="font-medium text-gray-900">Create New Page</div>
                <div className="text-sm text-gray-500">Add a new wiki article</div>
              </a>
              {user?.role === 'admin' && (
                <a
                  href="/admin/users"
                  className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <div className="font-medium text-gray-900">Manage Users</div>
                  <div className="text-sm text-gray-500">Add or edit user accounts</div>
                </a>
              )}
              <a
                href="/"
                className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              >
                <div className="font-medium text-gray-900">View EOL Products</div>
                <div className="text-sm text-gray-500">Check expiring software</div>
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              System Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Your Role</span>
                <span className="font-medium text-gray-900">{user?.role}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Username</span>
                <span className="font-medium text-gray-900">{user?.username}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Email</span>
                <span className="font-medium text-gray-900">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
