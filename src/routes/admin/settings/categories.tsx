import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { listEOLCategoriesFn, createEOLCategoryFn, updateEOLCategoryFn, deleteEOLCategoryFn } from '../../../server/functions/eol-categories';
import { getSessionUser } from '../../../server/functions/auth';
import { Button, Input, Textarea, Card, CardHeader, LoadingState, EmptyState, ConfirmDialog, EditIcon, TrashIcon } from '../../../components';

export const Route = createFileRoute('/admin/settings/categories')({
    component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', code: '', icon: '📦', description: '' });

    // Auth check
    const { data: authData, isLoading: authLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => getSessionUser(),
    });
    const user = authData?.success ? authData.data : null;

    const [page, setPage] = useState(1);
    const limit = 10;

    // Fetch categories
    const { data: categoriesData, isLoading } = useQuery({
        queryKey: ['eol-categories', page, limit],
        queryFn: () => listEOLCategoriesFn({ data: { page, limit } }),
        enabled: user?.role === 'admin',
    });

    const categories = categoriesData?.success ? categoriesData.data : [];
    const totalPages = categoriesData?.success ? categoriesData.meta?.totalPages : 1;

    const createMutation = useMutation({
        mutationFn: (data: any) => createEOLCategoryFn({ data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eol-categories'] });
            setShowModal(false);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => updateEOLCategoryFn({ data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eol-categories'] });
            setShowModal(false);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteEOLCategoryFn({ data: { id } }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eol-categories'] });
            setDeleteConfirm(null);
        }
    });

    const resetForm = () => {
        setFormData({ name: '', code: '', icon: '📦', description: '' });
        setEditingCategory(null);
    };

    const handleEdit = (category: any) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            code: category.code,
            icon: category.icon,
            description: category.description || ''
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            updateMutation.mutate({
                id: editingCategory.id,
                name: formData.name,
                icon: formData.icon,
                description: formData.description
            });
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Danh mục EOL</h1>
                    <p className="text-slate-500">Quản lý các loại sản phẩm và biểu tượng hệ thống</p>
                </div>
                <Button onClick={() => { resetForm(); setShowModal(true); }}>
                    + Thêm danh mục
                </Button>
            </div>

            {categories.length === 0 ? (
                <EmptyState
                    icon="🏷️"
                    title="Chưa có danh mục nào"
                    description="Tạo danh mục đầu tiên để phân loại sản phẩm"
                    action={<Button onClick={() => { resetForm(); setShowModal(true); }}>Tạo ngay</Button>}
                />
            ) : (
                <Card padding="none" className="overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-3 font-medium">Icon</th>
                                <th className="px-6 py-3 font-medium">Tên hiển thị</th>
                                <th className="px-6 py-3 font-medium">Mã code</th>
                                <th className="px-6 py-3 font-medium">Mô tả</th>
                                <th className="px-6 py-3 font-medium text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {categories.map((cat: any) => (
                                <tr key={cat.id} className="hover:bg-slate-50 group transition-colors">
                                    <td className="px-6 py-4 text-2xl">{cat.icon}</td>
                                    <td className="px-6 py-4 font-medium text-slate-800">{cat.name}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{cat.code}</td>
                                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{cat.description}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                leftIcon={<EditIcon size={14} />}
                                                onClick={() => handleEdit(cat)}
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            >
                                                Sửa
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                leftIcon={<TrashIcon size={14} />}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => setDeleteConfirm(cat.id)}
                                            >
                                                Xóa
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                            Trang <span className="font-medium text-emerald-600">{page}</span> / {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || isLoading}
                            >
                                Trước
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages || 1, p + 1))}
                                disabled={page === (totalPages || 1) || isLoading}
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-800">
                                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-[80px_1fr] gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Icon</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                            {formData.icon}
                                        </div>
                                        <Input
                                            value={formData.icon}
                                            onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                            className="font-emoji text-center text-2xl h-12"
                                            maxLength={2}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên danh mục</label>
                                    <Input
                                        placeholder="Ví dụ: Wiki, Blog..."
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="h-12"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mã code</label>
                                <Input
                                    placeholder="wiki, blog"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">Dùng để định danh trong hệ thống (slug)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                                <Textarea
                                    placeholder="Mô tả ngắn về danh mục này..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={createMutation.isPending || updateMutation.isPending}
                                >
                                    {editingCategory ? 'Lưu thay đổi' : 'Tạo danh mục'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
                title="Xóa danh mục này?"
                description="Hành động này không thể hoàn tác. Các sản phẩm thuộc danh mục này sẽ bị mất phân loại."
                confirmText="Xóa vĩnh viễn"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
