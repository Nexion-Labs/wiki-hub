import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { listUsers, updateUserFn, deleteUserFn } from '../../server/functions/user';
import { getSessionUser } from '../../server/functions/auth';
import { Button, Card, CardHeader, Badge, LoadingState, EmptyState, Alert } from '../../components';

function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Get user from session cookies
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getSessionUser(),
    staleTime: 5 * 60 * 1000,
  });

  const user = authData?.success ? authData.data : null;

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => listUsers({ data: {} }),
    enabled: user?.role === 'admin',
  });

  const updateRoleMutation = useMutation({
    mutationFn: (data: { userId: string; roleId: string }) => 
      updateUserFn({ data: { id: data.userId, roleId: data.roleId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => deleteUserFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteConfirm(null);
    },
  });

  const users = usersData?.success ? usersData.data : [];

  // Show loading state
  if (authLoading) {
    return <LoadingState text="Đang kiểm tra quyền truy cập..." />;
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center" padding="lg">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-slate-800">Từ chối truy cập</h1>
          <p className="text-slate-500 mt-2 mb-6">
            Chỉ Admin mới có quyền truy cập trang này.
          </p>
          <Link to="/login">
            <Button className="w-full">Đăng nhập với tài khoản Admin</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState text="Đang tải danh sách người dùng..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">👥 Quản lý người dùng</h1>
          <p className="text-slate-500 mt-1">Tổng cộng {users?.length || 0} người dùng</p>
        </div>
        <Button>
          Thêm người dùng
        </Button>
      </div>

      {/* Users Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users && users.length > 0 ? (
                users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {u.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{u.username}</div>
                          {u.fullName && (
                            <div className="text-sm text-slate-500">{u.fullName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-slate-600">{u.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={u.role?.name === 'admin' ? 'purple' : 'info'}
                        size="sm"
                      >
                        {u.role?.name || 'user'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={u.isActive ? 'success' : 'danger'} 
                        size="sm"
                        dot
                      >
                        {u.isActive ? 'Hoạt động' : 'Vô hiệu'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {u.id !== user.id ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Edit user functionality
                            }}
                          >
                            Sửa
                          </Button>
                          {deleteConfirm === u.id ? (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => deleteUserMutation.mutate(u.id)}
                                isLoading={deleteUserMutation.isPending}
                              >
                                Xác nhận
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirm(null)}
                              >
                                Hủy
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(u.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Xóa
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Badge variant="default" size="sm">Bạn</Badge>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12">
                    <EmptyState
                      icon="👥"
                      title="Chưa có người dùng"
                      description="Hệ thống chưa có người dùng nào."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/admin/users')({
  component: AdminUsersPage,
});
