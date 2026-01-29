import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { listUsers, updateUserFn, deleteUserFn, createUserFn, listRolesFn, checkUsernameFn } from '../../server/functions/user';
import { getSessionUser } from '../../server/functions/auth';
import { Button, Card, CardHeader, Badge, LoadingState, EmptyState, Alert, ConfirmDialog, AccessState, Dialog, Input, PasswordInput, Select, EditIcon, TrashIcon, Spinner } from '../../components';

function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    roleId: '',
    isActive: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [debouncedUsername, setDebouncedUsername] = useState('');

  // Custom debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(formData.username);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.username]);

  // Email validation
  const validateEmail = (email: string): { valid: boolean; message?: string } => {
    if (!email) return { valid: true };
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Định dạng email không hợp lệ' };
    }
    
    // Block common development/testing domains
    const blockedDomains = ['yopmail.com', 'maildrop.cc', 'guerrillamail.com', 'temp-mail.org', 'mailinator.com', 'tempmail.com', '10minutemail.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (blockedDomains.includes(domain)) {
      return { valid: false, message: '⛔ Không chấp nhận email tạm thời/thử nghiệm' };
    }
    
    return { valid: true };
  };

  const emailValidation = validateEmail(formData.email);

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

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => listRolesFn(),
    enabled: user?.role === 'admin',
  });

  const roles = rolesData?.success ? rolesData.data : [];
  const roleOptions = roles.map((r: any) => ({ label: r.name, value: r.id }));

  const { data: availabilityData, isLoading: isCheckingUsername } = useQuery({
    queryKey: ['check-username', debouncedUsername, editingUser?.users?.id],
    queryFn: () => checkUsernameFn({ data: { username: debouncedUsername, excludeUserId: editingUser?.users?.id } }),
    enabled: !!debouncedUsername && debouncedUsername.length >= 3 && showModal,
  });

  const createUserMutation = useMutation({
    mutationFn: (data: any) => createUserFn({ data }),
    onSuccess: (result: any) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        setShowModal(false);
        resetForm();
      } else {
        setFormError(result.error);
      }
    },
    onError: (error: any) => {
      setFormError(error.message || 'Đã xảy ra lỗi khi tạo người dùng');
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: any) => updateUserFn({ data }),
    onSuccess: (result: any) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        setShowModal(false);
        resetForm();
      } else {
        setFormError(result.error);
      }
    },
    onError: (error: any) => {
      setFormError(error.message || 'Đã xảy ra lỗi khi cập nhật người dùng');
    }
  });

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      fullName: '',
      password: '',
      roleId: '',
      isActive: true,
    });
    setEditingUser(null);
    setFormError(null);
  };

  const handleEdit = (u: any) => {
    setEditingUser(u);
    setFormError(null);
    setFormData({
      username: u.users?.username || '',
      email: u.users?.email || '',
      fullName: u.users?.fullName || '',
      password: '', // Don't show password
      roleId: u.users?.roleId || '',
      isActive: u.users?.isActive ?? true,
    });
    setShowModal(true);
  };

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
      <AccessState
        icon="🚫"
        title="Từ chối truy cập"
        description="Chỉ Admin mới có quyền truy cập trang này."
        buttonText="Đăng nhập với tài khoản Admin"
      />
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
          <h1 className="text-3xl font-bold text-slate-800">Quản lý người dùng</h1>
          <p className="text-slate-500 mt-1">Tổng cộng {users?.length || 0} người dùng</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}>
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
                  <tr key={u.users.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {u.users?.fullName?.[0]?.toUpperCase() || u.users?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{u.users?.username}</div>
                          {u.users?.fullName && (
                            <div className="text-sm text-slate-500">{u.users?.fullName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-slate-600">{u?.users?.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={u?.roles?.name === 'admin' ? 'purple' : 'info'}
                        size="sm"
                      >
                        {u?.roles?.name || 'user'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={u?.users?.isActive ? 'success' : 'danger'}
                        size="sm"
                        dot
                      >
                        {u?.users?.isActive ? 'Hoạt động' : 'Vô hiệu'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {u.users.id !== user.id ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<EditIcon size={14} />}
                            onClick={() => handleEdit(u)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<TrashIcon size={14} />}
                            onClick={() => setDeleteConfirm(u.users.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Xóa
                          </Button>
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
      </Card >

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            deleteUserMutation.mutate(deleteConfirm);
          }
        }}
        title="Xác nhận xóa người dùng"
        description={`Bạn có chắc chắn muốn xóa người dùng "${users.find((u: any) => u.users.id === deleteConfirm)?.users?.username || ''}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        isLoading={deleteUserMutation.isPending}
      />

      {/* Create/Edit Modal */}
      <Dialog
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        description={editingUser ? "Cập nhật thông tin người dùng" : "Điền thông tin để tạo tài khoản mới"}
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingUser) {
              updateUserMutation.mutate({ id: editingUser.users.id, ...formData });
            } else {
              createUserMutation.mutate(formData);
            }
          }}
          className="space-y-4"
        >
          {formError && (
            <Alert variant="danger">
              {formError}
            </Alert>
          )}
          <Input
            label="Username *"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            placeholder="vd: admin, johndoe"
            helperText={
              isCheckingUsername
                ? 'Đang kiểm tra...'
                : availabilityData?.success
                  ? availabilityData.available
                    ? '✓ Tên người dùng khả dụng'
                    : '✗ Tên người dùng đã được sử dụng'
                  : formData.username.length > 0 && formData.username.length < 3
                    ? 'Tối thiểu 3 ký tự'
                    : undefined
            }
          />
          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="vd: johndoe@example.com"
            error={!emailValidation.valid ? emailValidation.message : undefined}
            helperText={emailValidation.valid ? 'Sử dụng email thật, không chấp nhận email tạm thời' : undefined}
          />
          <Input
            label="Họ tên"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="vd: John Doe"
          />
          {!editingUser && (
            <PasswordInput
              label="Mật khẩu *"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Nhập ít nhất 8 ký tự"
              showStrengthIndicator
              helperText="Sử dụng ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
            />
          )}
          <Select
            label="Vai trò *"
            value={formData.roleId}
            onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
            options={roleOptions}
            required
            placeholder="Chọn vai trò"
          />
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="user-active"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-emerald-600 bg-slate-100 border-slate-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="user-active" className="text-sm font-medium text-slate-700 cursor-pointer">
              Tài khoản đang hoạt động
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowModal(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              isLoading={createUserMutation.isPending || updateUserMutation.isPending}
            >
              {editingUser ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute('/admin/users')({
  component: AdminUsersPage,
});
