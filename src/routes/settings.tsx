
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    listEOLCategoriesFn,
    createEOLCategoryFn,
    updateEOLCategoryFn,
    deleteEOLCategoryFn
} from '../server/functions/eol-categories';
import {
    Card,
    Button,
    Input,
    Textarea,
    ConfirmDialog,
    Spinner,
    EmptyState,
    EditIcon,
    TrashIcon,
} from '../components';

function SettingsPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('categories');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [deleteCategory, setDeleteCategory] = useState<any>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        icon: '📦',
        description: ''
    });

    // Pagination state
    const [page, setPage] = useState(1);
    const limit = 10;

    // Fetch categories
    const { data: categoriesData, isLoading } = useQuery({
        queryKey: ['eol-categories', page, limit],
        queryFn: () => listEOLCategoriesFn({ data: { page, limit } }),
    });

    const categories = categoriesData?.success ? categoriesData.data : [];
    const totalPages = categoriesData?.success ? categoriesData.meta?.totalPages : 1;

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: any) => createEOLCategoryFn({ data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eol-categories'] });
            setIsModalOpen(false);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => updateEOLCategoryFn({ data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eol-categories'] });
            setIsModalOpen(false);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteEOLCategoryFn({ data: { id } }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eol-categories'] });
            setDeleteCategory(null);
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
        setIsModalOpen(true);
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
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar / Tabs */}
            <div className="w-full md:w-64 shrink-0 space-y-2">
                <h1 className="text-2xl font-bold text-slate-800 mb-6 px-2">Cài đặt</h1>

                <button
                    onClick={() => setActiveTab('general')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'general'
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                >
                    Chung
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'categories'
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                >
                    Phân loại phần mềm
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                {activeTab === 'general' && (
                    <Card>
                        <div className="p-12 text-center text-slate-500">
                            <span className="text-4xl block mb-4">⚙️</span>
                            <h3 className="text-lg font-medium text-slate-700 mb-2">Cài đặt chung</h3>
                            <p>Các tùy chọn cấu hình hệ thống sẽ được cập nhật ở đây.</p>
                        </div>
                    </Card>
                )}

                {activeTab === 'categories' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Danh mục EOL</h2>
                                <p className="text-slate-500">Quản lý các loại sản phẩm và biểu tượng.</p>
                            </div>
                            <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                                Thêm danh mục
                            </Button>
                        </div>

                        <Card padding="none" className="overflow-hidden">
                            {isLoading ? (
                                <div className="p-8 flex justify-center">
                                    <Spinner size="lg" />
                                </div>
                            ) : categories.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-xs font-semibold">
                                                <tr>
                                                    <th className="px-6 py-4">Icon</th>
                                                    <th className="px-6 py-4">Tên danh mục</th>
                                                    <th className="px-6 py-4">Mã (Code)</th>
                                                    <th className="px-6 py-4">Mô tả</th>
                                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {categories.map((category: any) => (
                                                    <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 text-2xl">
                                                            {category.icon}
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-slate-800">
                                                            {category.name}
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-slate-500">
                                                            {category.code}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-500 truncate max-w-xs">
                                                            {category.description || '—'}
                                                        </td>
                                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                leftIcon={<EditIcon size={14} />}
                                                                onClick={() => handleEdit(category)}
                                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            >
                                                                Sửa
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                leftIcon={<TrashIcon size={14} />}
                                                                onClick={() => setDeleteCategory(category)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                Xóa
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

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
                                </>
                            ) : (
                                <div className="p-12">
                                    <EmptyState
                                        icon="📂"
                                        title="Chưa có danh mục nào"
                                        description="Thêm danh mục đầu tiên để bắt đầu phân loại sản phẩm."
                                    />
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Tên danh mục *"
                                    placeholder="Ví dụ: Database"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Mã (Code) *"
                                    placeholder="database"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    disabled={!!editingCategory} // Disable code editing
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Icon (Emoji) *
                                </label>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-16 text-center text-2xl border border-slate-200 rounded-lg py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                        placeholder="📦"
                                        required
                                        maxLength={2}
                                    />
                                    <p className="text-sm text-slate-500 flex-1">
                                        Nhập 1 emoji đại diện cho danh mục này.
                                        <br />
                                        <a
                                            href="https://getemoji.com"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-emerald-600 hover:underline"
                                        >
                                            Tìm emoji ↗
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <Textarea
                                label="Mô tả"
                                placeholder="Mô tả ngắn về danh mục này..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />

                            <div className="pt-4 flex justify-end gap-3">
                                <Button
                                    variant="ghost"
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu lại'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deleteCategory}
                title="Xóa danh mục"
                description={`Bạn có chắc chắn muốn xóa danh mục "${deleteCategory?.name}"? Hành động này không thể hoàn tác.`}
                confirmText={deleteMutation.isPending ? 'Đang xóa...' : 'Xóa danh mục'}
                onConfirm={() => {
                    if (deleteCategory) {
                        deleteMutation.mutate(deleteCategory.id);
                    }
                }}
                onClose={() => setDeleteCategory(null)}
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}

export const Route = createFileRoute('/settings')({
    component: SettingsPage,
});
