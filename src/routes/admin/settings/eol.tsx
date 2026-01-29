import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { listProducts, createProductFn, updateProductFn, deleteProductFn, createVersionFn, updateVersionFn, deleteVersionFn, getVersionsByProduct } from '../../../server/functions/eol';
import { listEOLCategoriesFn } from '../../../server/functions/eol-categories';
import { getSessionUser } from '../../../server/functions/auth';
import { Button, Input, Textarea, Card, Badge, LoadingState, EmptyState, Select, ConfirmDialog, Dialog, AccessState, EditIcon, TrashIcon } from '../../../components';
import { LIFECYCLE_STAGE_OPTIONS } from '../../../types/eol';

const ITEMS_PER_PAGE = 10;

export function AdminEOLPage() {
  const queryClient = useQueryClient();
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showNewVersion, setShowNewVersion] = useState<string | null>(null);
  const [editingVersion, setEditingVersion] = useState<any>(null);
  const [deleteProductConfirm, setDeleteProductConfirm] = useState<string | null>(null);
  const [deleteVersionConfirm, setDeleteVersionConfirm] = useState<{ id: string; productId: string } | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', vendor: '', description: '', categoryId: '', homepageUrl: '', documentationUrl: '', commandGuide: '' });
  const [newVersion, setNewVersion] = useState({ version: '', eolDate: '', releaseDate: '', extendedSupportDate: '', lts: false, lifecycleStage: 'active', commandGuide: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Get user from session cookies
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getSessionUser(),
    staleTime: 5 * 60 * 1000,
  });

  const user = authData?.success ? authData.data : null;

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['eol-products'],
    queryFn: () => listProducts(),
    enabled: user?.role === 'admin',
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['eol-categories'],
    queryFn: () => listEOLCategoriesFn(),
    enabled: user?.role === 'admin',
  });

  const categories = categoriesData?.success ? categoriesData.data : [];

  const categoryOptions = categories.map((c: any) => ({
    label: `${c.icon} ${c.name}`,
    value: c.id,
  }));

  const createProductMutation = useMutation({
    mutationFn: (data: { name: string; vendor?: string; description?: string; categoryId: string }) =>
      createProductFn({ data: { ...data, userId: user?.id || '' } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eol-products'] });
      setShowNewProduct(false);
      setNewProduct({ name: '', vendor: '', description: '', categoryId: '', homepageUrl: '', documentationUrl: '', commandGuide: '' });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (data: { id: string; name?: string; vendor?: string; description?: string; categoryId?: string; homepageUrl?: string; documentationUrl?: string }) =>
      updateProductFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eol-products'] });
      setEditingProduct(null);
      setNewProduct({ name: '', vendor: '', description: '', categoryId: '', homepageUrl: '', documentationUrl: '', commandGuide: '' });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteProductFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eol-products'] });
      setDeleteProductConfirm(null);
    },
  });

  const createVersionMutation = useMutation({
    mutationFn: (data: { productId: string; version: string; eolDate?: string; releaseDate?: string; extendedSupportDate?: string; lts?: boolean; lifecycleStage?: string; commandGuide?: string }) => {
      const { version, ...rest } = data;
      return createVersionFn({ data: { ...rest, version, userId: user?.id || '' } });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eol-versions', variables.productId] });
      setShowNewVersion(null);
      setNewVersion({ version: '', eolDate: '', releaseDate: '', extendedSupportDate: '', lts: false, lifecycleStage: 'active', commandGuide: '' });
    },
  });

  const updateVersionMutation = useMutation({
    mutationFn: (data: { id: string; version?: string; eolDate?: string; releaseDate?: string; extendedSupportDate?: string; lts?: boolean; lifecycleStage?: string; commandGuide?: string }) =>
      updateVersionFn({ data }),
    onSuccess: (_, variables) => {
      // Find the product ID from the editing version
      const productId = editingVersion?.productId;
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ['eol-versions', productId] });
      }
      setEditingVersion(null);
    },
  });

  const deleteVersionMutation = useMutation({
    mutationFn: (data: { id: string }) => deleteVersionFn({ data }),
    onSuccess: () => {
      if (deleteVersionConfirm?.productId) {
        queryClient.invalidateQueries({ queryKey: ['eol-versions', deleteVersionConfirm.productId] });
      }
      setDeleteVersionConfirm(null);
    },
  });

  const products = productsData?.success ? productsData.data : [];

  // Filter products by search
  const filteredProducts = products.filter((product: any) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when search changes
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Show loading state
  if (authLoading) {
    return <LoadingState text="Đang kiểm tra quyền truy cập..." />;
  }

  if (!user || user.role !== 'admin') {
    return (
      <AccessState
        icon="🚫"
        title="Từ chối truy cập"
        description="Chỉ Admin mới có quyền quản lý EOL."
        buttonText="Đăng nhập với tài khoản Admin"
      />
    );
  }

  if (isLoading) {
    return <LoadingState text="Đang tải danh sách phần mềm..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Quản lý EOL</h1>
          <p className="text-slate-500 mt-1">
            Quản lý {products?.length || 0} phần mềm và thông tin End of Life
          </p>
        </div>
        <Button
          onClick={() => setShowNewProduct(true)}
        >
          Thêm phần mềm
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="🔍 Tìm kiếm phần mềm theo tên hoặc nhà phát hành..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        {filteredProducts.length !== products.length && (
          <p className="text-sm text-slate-500">
            Hiển thị {filteredProducts.length} / {products.length} phần mềm
          </p>
        )}
      </div>

      {/* New/Edit Product Dialog */}
      <Dialog
        isOpen={showNewProduct || !!editingProduct}
        onClose={() => {
          setShowNewProduct(false);
          setEditingProduct(null);
          setNewProduct({ name: '', vendor: '', description: '', categoryId: '', homepageUrl: '', documentationUrl: '', commandGuide: '' });
        }}
        title={editingProduct ? "Chỉnh sửa phần mềm" : "Thêm phần mềm mới"}
        description={editingProduct ? "Cập nhật thông tin phần mềm" : "Điền thông tin phần mềm cần theo dõi EOL"}
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingProduct) {
              updateProductMutation.mutate({ id: editingProduct.id, ...newProduct });
            } else {
              createProductMutation.mutate(newProduct);
            }
          }}
          className="space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Tên sản phẩm *"
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
              placeholder="VD: Node.js, Python, Ubuntu..."
            />
            <Input
              label="Nhà phát hành"
              type="text"
              value={newProduct.vendor}
              onChange={(e) => setNewProduct({ ...newProduct, vendor: e.target.value })}
              placeholder="VD: Microsoft, Oracle..."
            />
          </div>
          <Select
            label="Loại sản phẩm *"
            value={newProduct.categoryId}
            onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
            options={categoryOptions}
            placeholder="Chọn loại sản phẩm"
            required
          />
          <Textarea
            label="Mô tả"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            rows={2}
            placeholder="Mô tả ngắn gọn về sản phẩm..."
          />
          <Textarea
            label="Hướng dẫn câu lệnh (Command Guide)"
            value={newProduct.commandGuide}
            onChange={(e) => setNewProduct({ ...newProduct, commandGuide: e.target.value })}
            rows={3}
            placeholder="VD: npm install node@22, docker pull ubuntu:22.04 ..."
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="🌐 Homepage URL"
              type="url"
              value={newProduct.homepageUrl}
              onChange={(e) => setNewProduct({ ...newProduct, homepageUrl: e.target.value })}
              placeholder="https://example.com"
            />
            <Input
              label="📚 Documentation URL"
              type="url"
              value={newProduct.documentationUrl}
              onChange={(e) => setNewProduct({ ...newProduct, documentationUrl: e.target.value })}
              placeholder="https://docs.example.com"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowNewProduct(false);
                setEditingProduct(null);
                setNewProduct({ name: '', vendor: '', description: '', categoryId: '', homepageUrl: '', documentationUrl: '', commandGuide: '' });
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              isLoading={createProductMutation.isPending || updateProductMutation.isPending}
            >
              {editingProduct ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Products List */}
      {paginatedProducts && paginatedProducts.length > 0 ? (
        <div className="grid gap-4">
          {paginatedProducts.map((product: any) => (
            <Card key={product.id} padding="none" className="overflow-hidden">
              {/* Product Header */}
              <div className="p-4 border-b border-slate-100 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-2xl">
                    {categories.find((c: any) => c.id === product.categoryId)?.icon || '📦'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{product.name}</h3>
                    {product.vendor && (
                      <p className="text-sm text-slate-500">{product.vendor}</p>
                    )}
                    {product.categoryId && (
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded inline-block mt-1">
                        {categories.find((c: any) => c.id === product.categoryId)?.name || 'Unknown'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<EditIcon size={14} />}
                    onClick={() => {
                      setEditingProduct(product);
                      setNewProduct({
                        name: product.name,
                        vendor: product.vendor || '',
                        description: product.description || '',
                        categoryId: product.categoryId || '',
                        homepageUrl: product.homepageUrl || '',
                        documentationUrl: product.documentationUrl || '',
                        commandGuide: product.commandGuide || '',
                      });
                      setShowNewProduct(false);
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowNewVersion(showNewVersion === product.id ? null : product.id)}
                  >
                    {showNewVersion === product.id ? 'Đóng' : 'Thêm phiên bản'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<TrashIcon size={14} />}
                    onClick={() => setDeleteProductConfirm(product.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Xóa
                  </Button>
                </div>
              </div>

              {/* New Version Dialog moved to bottom */}

              {/* Versions List */}
              <ProductVersions
                productId={product.id}
                editingVersion={editingVersion}
                onEdit={setEditingVersion}
                onUpdate={updateVersionMutation.mutate}
                isUpdating={updateVersionMutation.isPending}
                onDelete={setDeleteVersionConfirm}
              />
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <p className="text-sm text-slate-500">
                Trang {currentPage} / {totalPages} ({filteredProducts.length} sản phẩm)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  Đầu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>

                {/* Page numbers */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, idx, arr) => (
                      <div key={page} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-1 text-slate-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                          {page}
                        </button>
                      </div>
                    ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Cuối
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon="📦"
            title={searchQuery ? "Không tìm thấy sản phẩm" : "Chưa có sản phẩm nào"}
            description={searchQuery ? "Thử thay đổi từ khóa tìm kiếm" : "Thêm sản phẩm đầu tiên để bắt đầu theo dõi EOL"}
            action={
              !searchQuery && (
                <Button onClick={() => setShowNewProduct(true)}>
                  Thêm sản phẩm
                </Button>
              )
            }
          />
        </Card>
      )}

      {/* Delete Version Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteVersionConfirm}
        onClose={() => setDeleteVersionConfirm(null)}
        onConfirm={() => deleteVersionMutation.mutate({ id: deleteVersionConfirm!.id })}
        title="Xác nhận xóa phiên bản"
        description="Bạn có chắc chắn muốn xóa version này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        isLoading={deleteVersionMutation.isPending}
      />

      {/* Delete Product Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteProductConfirm}
        onClose={() => setDeleteProductConfirm(null)}
        onConfirm={() => {
          if (deleteProductConfirm) {
            deleteProductMutation.mutate(deleteProductConfirm);
          }
        }}
        title="Xác nhận xóa phần mềm"
        description={`Bạn có chắc chắn muốn xóa phần mềm "${products?.find(p => p.id === deleteProductConfirm)?.name}"? Hành động này sẽ thực hiện soft delete.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        isLoading={deleteProductMutation.isPending}
      />

      {/* New Version Dialog */}
      <Dialog
        isOpen={!!showNewVersion}
        onClose={() => {
          setShowNewVersion(null);
          setNewVersion({ version: '', eolDate: '', releaseDate: '', extendedSupportDate: '', lts: false, lifecycleStage: 'active', commandGuide: '' });
        }}
        title="Thêm phiên bản mới"
        description={`Thêm phiên bản cho ${products?.find(p => p.id === showNewVersion)?.name || ''}`}
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (showNewVersion) {
              createVersionMutation.mutate({
                productId: showNewVersion,
                ...newVersion,
              });
            }
          }}
          className="space-y-4"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Version *"
              type="text"
              value={newVersion.version}
              onChange={(e) => setNewVersion({ ...newVersion, version: e.target.value })}
              required
              placeholder="VD: 18.0, 3.11..."
            />
            <Input
              label="Ngày phát hành"
              type="date"
              value={newVersion.releaseDate}
              onChange={(e) => setNewVersion({ ...newVersion, releaseDate: e.target.value })}
            />
            <Input
              label="Ngày EOL"
              type="date"
              value={newVersion.eolDate}
              onChange={(e) => setNewVersion({ ...newVersion, eolDate: e.target.value })}
              required
            />
            <Input
              label="Extended Support"
              type="date"
              value={newVersion.extendedSupportDate}
              onChange={(e) => setNewVersion({ ...newVersion, extendedSupportDate: e.target.value })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Lifecycle Stage *"
              value={newVersion.lifecycleStage}
              onChange={(e) => setNewVersion({ ...newVersion, lifecycleStage: e.target.value })}
              options={LIFECYCLE_STAGE_OPTIONS}
              required
            />
            <div className="flex items-end pb-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="new-version-lts"
                  checked={newVersion.lts}
                  onChange={(e) => setNewVersion({ ...newVersion, lts: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 bg-slate-100 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2"
                />
                <label htmlFor="new-version-lts" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Long Term Support (LTS)
                </label>
              </div>
            </div>
          </div>
          <Textarea
            label="Command Guide"
            placeholder="Hướng dẫn cài đặt hoặc nâng cấp (Markdown)..."
            value={newVersion.commandGuide}
            onChange={(e) => setNewVersion({ ...newVersion, commandGuide: e.target.value })}
            rows={4}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowNewVersion(null);
                setNewVersion({ version: '', eolDate: '', releaseDate: '', extendedSupportDate: '', lts: false, lifecycleStage: 'active', commandGuide: '' });
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant='primary'
              isLoading={createVersionMutation.isPending}
            >
              Thêm phiên bản
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Version Dialog */}
      <Dialog
        isOpen={!!editingVersion}
        onClose={() => setEditingVersion(null)}
        title="Chỉnh sửa phiên bản"
        description={`Cập nhật thông tin cho phiên bản ${editingVersion?.versionNumber}`}
        size="lg"
      >
        {editingVersion && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateVersionMutation.mutate({
                id: editingVersion.id,
                version: editingVersion.versionNumber,
                eolDate: editingVersion.eolDate,
                releaseDate: editingVersion.releaseDate,
                extendedSupportDate: editingVersion.extendedSupportDate,
                lts: editingVersion.lts,
                lifecycleStage: editingVersion.lifecycleStage,
                commandGuide: editingVersion.commandGuide,
              });
            }}
            className="space-y-4"
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Version *"
                type="text"
                value={editingVersion.versionNumber}
                onChange={(e) => setEditingVersion({ ...editingVersion, versionNumber: e.target.value })}
                required
              />
              <Input
                label="Ngày phát hành"
                type="date"
                value={editingVersion.releaseDate || ''}
                onChange={(e) => setEditingVersion({ ...editingVersion, releaseDate: e.target.value })}
              />
              <Input
                label="Ngày EOL"
                type="date"
                value={editingVersion.eolDate || ''}
                onChange={(e) => setEditingVersion({ ...editingVersion, eolDate: e.target.value })}
                required
              />
              <Input
                label="Extended Support"
                type="date"
                value={editingVersion.extendedSupportDate || ''}
                onChange={(e) => setEditingVersion({ ...editingVersion, extendedSupportDate: e.target.value })}
              />
            </div>
            <Textarea
              label="Command Guide"
              placeholder="Hướng dẫn cài đặt hoặc nâng cấp (Markdown)..."
              value={editingVersion.commandGuide || ''}
              onChange={(e) => setEditingVersion({ ...editingVersion, commandGuide: e.target.value })}
              rows={4}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Lifecycle Stage *"
                value={editingVersion.lifecycleStage}
                onChange={(e) => setEditingVersion({ ...editingVersion, lifecycleStage: e.target.value })}
                options={LIFECYCLE_STAGE_OPTIONS}
                required
              />
              <div className="flex items-end pb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-version-lts"
                    checked={editingVersion.lts}
                    onChange={(e) => setEditingVersion({ ...editingVersion, lts: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 bg-slate-100 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2"
                  />
                  <label htmlFor="edit-version-lts" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Long Term Support (LTS)
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditingVersion(null)}
              >
                Hủy
              </Button>
              <Button type="submit" isLoading={updateVersionMutation.isPending}>
                Lưu thay đổi
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}

function ProductVersions({
  productId,
  editingVersion,
  onEdit,
  onUpdate,
  isUpdating,
  onDelete
}: {
  productId: string;
  editingVersion: any;
  onEdit: (version: any) => void;
  onUpdate: (data: any) => void;
  isUpdating: boolean;
  onDelete: (data: { id: string; productId: string }) => void;
}) {
  const [versionPage, setVersionPage] = useState(1);
  const VERSIONS_PER_PAGE = 5;

  const { data, isLoading } = useQuery({
    queryKey: ['eol-versions', productId],
    queryFn: () => getVersionsByProduct({ data: { productId } }),
  });

  const versions = data?.success ? data.data : [];
  const totalVersionPages = Math.ceil(versions.length / VERSIONS_PER_PAGE);
  const paginatedVersions = versions.slice(
    (versionPage - 1) * VERSIONS_PER_PAGE,
    versionPage * VERSIONS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="p-4 text-center text-slate-400">
        <span className="animate-pulse">Đang tải versions...</span>
      </div>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <div className="p-4 text-center text-slate-400 text-sm">
        Chưa có version nào
      </div>
    );
  }

  return (
    <div>
      {/* Version Header */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase">
          📋 {versions.length} phiên bản
        </span>
        {totalVersionPages > 1 && (
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setVersionPage(p => Math.max(1, p - 1))}
              disabled={versionPage === 1}
              className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ◀
            </button>
            <span className="px-2 text-slate-600">{versionPage}/{totalVersionPages}</span>
            <button
              onClick={() => setVersionPage(p => Math.min(totalVersionPages, p + 1))}
              disabled={versionPage === totalVersionPages}
              className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▶
            </button>
          </div>
        )}
      </div>
      {/* Versions List */}
      <div className="divide-y divide-slate-100">
        {paginatedVersions.map((v: any) => {
          const eolDate = v.eolDate ? new Date(v.eolDate) : null;
          const now = new Date();
          const daysUntilEol = eolDate ? Math.ceil((eolDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

          let status: 'success' | 'warning' | 'danger' | 'default' = 'default';
          if (daysUntilEol !== null) {
            if (daysUntilEol < 0) status = 'danger';
            else if (daysUntilEol <= 90) status = 'warning';
            else status = 'success';
          }

          return (
            <div key={v.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant={status} size="sm">
                  {v.versionNumber}
                </Badge>
                {v.lts && (
                  <Badge variant="purple" size="sm">LTS</Badge>
                )}
                {v.lifecycleStage && (
                  <span className={`text-xs px-2 py-0.5 rounded ${v.lifecycleStage === 'active' ? 'bg-green-100 text-green-700' :
                    v.lifecycleStage === 'maintenance' ? 'bg-blue-100 text-blue-700' :
                      v.lifecycleStage === 'deprecated' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600'
                    }`}>
                    {v.lifecycleStage}
                  </span>
                )}
                {v.commandGuide && (
                  <span title="Có hướng dẫn câu lệnh" className="text-slate-400">⌨️</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm flex-wrap">
                {v.releaseDate && (
                  <span className="text-slate-500 whitespace-nowrap">
                    📅 Phát hành: {new Date(v.releaseDate).toLocaleDateString('vi-VN')}
                  </span>
                )}
                {eolDate ? (
                  <span className={`whitespace-nowrap ${daysUntilEol && daysUntilEol < 0 ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                    ⏰ EOL: {eolDate.toLocaleDateString('vi-VN')}
                    {daysUntilEol !== null && (
                      <span className={`ml-1 text-xs px-1.5 py-0.5 rounded ${daysUntilEol < 0 ? 'bg-red-100 text-red-700' :
                        daysUntilEol <= 30 ? 'bg-red-100 text-red-700' :
                          daysUntilEol <= 90 ? 'bg-amber-100 text-amber-700' :
                            'bg-green-100 text-green-700'
                        }`}>
                        {daysUntilEol < 0 ? `Quá ${Math.abs(daysUntilEol)} ngày` : `còn ${daysUntilEol} ngày`}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-slate-400">Chưa có EOL</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<EditIcon size={14} />}
                  onClick={() => onEdit(v)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  title="Chỉnh sửa"
                >
                  Sửa
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<TrashIcon size={14} />}
                  onClick={() => onDelete({ id: v.id, productId: v.productId })}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Xóa"
                >
                  Xóa
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/admin/settings/eol')({
  component: AdminEOLPage,
});
