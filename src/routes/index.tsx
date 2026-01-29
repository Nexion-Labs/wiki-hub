import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { listProducts, getExpiringVersions, createProductFn, updateProductFn, deleteProductFn } from '../server/functions/eol';
import { listEOLCategoriesFn } from '../server/functions/eol-categories';
import { getSessionUser } from '../server/functions/auth';

import { Card, Badge, LoadingState, EmptyState, Input, Button, Textarea, Select } from '../components';
import { GridIcon, ListIcon } from '../components/icons';

// Helper functions
const formatDate = (date: string | null | undefined) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getDaysUntil = (date: string | null | undefined): number | null => {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

const getUrgencyLevel = (days: number | null) => {
  if (days === null) return { level: 'unknown', color: 'slate', icon: '❓', text: 'Chưa xác định' };
  if (days < 0) return { level: 'expired', color: 'red', icon: '💀', text: 'Đã hết hạn' };
  if (days <= 30) return { level: 'critical', color: 'red', icon: '🚨', text: 'Cần cập nhật ngay' };
  if (days <= 60) return { level: 'warning', color: 'orange', icon: '⚡', text: 'Sắp hết hạn' };
  if (days <= 90) return { level: 'attention', color: 'amber', icon: '⚠️', text: 'Cần chú ý' };
  return { level: 'safe', color: 'emerald', icon: '✅', text: 'An toàn' };
};

// Product types configuration removed (now fetched via API)

function EOLTrackerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [expiringPage, setExpiringPage] = useState(1);
  const PRODUCTS_PER_PAGE = 9;
  const EXPIRING_PER_PAGE = 10;

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['eol-products'],
    queryFn: () => listProducts(),
  });

  const { data: expiringData, isLoading: loadingExpiring } = useQuery({
    queryKey: ['expiring-versions'],
    queryFn: () => getExpiringVersions({ data: { daysAhead: 90 } }),
  });

  // Fetch categories
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ['eol-categories'],
    queryFn: () => listEOLCategoriesFn(),
  });

  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    vendor: '',
    description: '',
    categoryId: '',
    homepageUrl: '',
    documentationUrl: '',
  });

  const { data: authData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getSessionUser(),
  });
  const user = (authData?.success ? authData.data : null) as any;
  const isAdmin = user?.role === 'admin';

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingProduct) {
        return updateProductFn({ data: { id: editingProduct.id, ...data } });
      } else {
        return createProductFn({ data: { ...data, userId: user?.id } });
      }
    },
    onSuccess: (result: any) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['eol-products'] });
        setIsModalOpen(false);
        resetForm();
      } else {
        alert(result.error || 'Operation failed');
      }
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      vendor: '',
      description: '',
      categoryId: '',
      homepageUrl: '',
      documentationUrl: '',
    });
    setEditingProduct(null);
  };

  const handleEdit = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProduct(product);
    setFormData({
      name: product.name,
      vendor: product.vendor || '',
      description: product.description || '',
      categoryId: product.categoryId || '',
      homepageUrl: product.homepageUrl || '',
      documentationUrl: product.documentationUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const products = (productsData?.success ? productsData.data : []) as any[];
  const expiringVersions = (expiringData?.success ? expiringData.data : []) as any[];
  const categories = (categoriesData?.success ? categoriesData.data : []) as any[];

  // Helper maps for icons and labels
  const categoryMap = useMemo(() => {
    const map = new Map<string, { icon: string; name: string }>();
    categories.forEach((cat: any) => {
      map.set(cat.id, { icon: cat.icon, name: cat.name });
    });
    return map;
  }, [categories]);

  const availableCategories = useMemo(() => {
    const usedCategoryIds = new Set(products.map((p: any) => p.categoryId).filter(Boolean));
    return categories.filter((cat: any) => usedCategoryIds.has(cat.id) || true); // Show all categories for filter? Or only used ones? Let's show all available from API.
  }, [products, categories]);

  // Filter products
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.vendor?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || product.categoryId === selectedType;
    return matchesSearch && matchesType;
  });

  // Pagination for products
  const totalProductPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Pagination for expiring versions
  const totalExpiringPages = Math.ceil(expiringVersions.length / EXPIRING_PER_PAGE);
  const paginatedExpiringVersions = expiringVersions.slice(
    (expiringPage - 1) * EXPIRING_PER_PAGE,
    expiringPage * EXPIRING_PER_PAGE
  );

  // Group expiring versions by urgency
  const criticalVersions = expiringVersions.filter((v: any) => {
    const days = getDaysUntil(v.eolDate);
    return days !== null && days <= 30 && days >= 0;
  });
  const warningVersions = expiringVersions.filter((v: any) => {
    const days = getDaysUntil(v.eolDate);
    return days !== null && days > 30 && days <= 60;
  });
  const attentionVersions = expiringVersions.filter((v: any) => {
    const days = getDaysUntil(v.eolDate);
    return days !== null && days > 60 && days <= 90;
  });

  // Stats
  const totalProducts = products.length;
  const totalExpiring = expiringVersions.length;
  const totalCritical = criticalVersions.length;
  const expiredVersions = expiringVersions.filter((v: any) => getDaysUntil(v.eolDate)! < 0);
  const totalExpired = expiredVersions.length;
  const totalLts = expiringVersions.filter((v: any) => v.lts).length;

  if (loadingProducts || loadingExpiring || loadingCategories) {
    return <LoadingState text="Đang tải dữ liệu EOL Tracker..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">EOL Tracker</h1>
          <p className="text-slate-500 mt-1">Theo dõi vòng đời của các sản phẩm công nghệ</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="mr-2"
              size="sm"
            >
              + Thêm sản phẩm
            </Button>
          )}
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            title="Grid view"
          >
            <GridIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            title="List view"
          >
            <ListIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-2xl">📦</div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{totalProducts}</div>
              <div className="text-xs text-slate-500">Phần mềm</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg text-2xl">🛡️</div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{totalLts}</div>
              <div className="text-xs text-slate-500">Phiên bản LTS</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-2xl">⚠️</div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{totalExpiring}</div>
              <div className="text-xs text-slate-500">Sắp hết hạn</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg text-2xl">🚨</div>
            <div>
              <div className="text-2xl font-bold text-red-600">{totalCritical}</div>
              <div className="text-xs text-slate-500">{"<"} 30 ngày</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-200 rounded-lg text-2xl">💀</div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{totalExpired}</div>
              <div className="text-xs text-slate-500">Đã hết hạn</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg text-2xl">✅</div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{totalProducts - totalExpiring}</div>
              <div className="text-xs text-slate-500">An toàn</div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {criticalVersions.length > 0 && (
        <div className="bg-linear-to-r from-red-500 to-rose-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🚨</span>
            <h2 className="text-lg font-bold">Cảnh báo khẩn cấp!</h2>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">{criticalVersions.length} phiên bản</span>
          </div>
          <p className="text-red-100 mb-3">Các phiên bản sau sẽ hết hạn trong vòng 30 ngày:</p>
          <div className="grid gap-2">
            {criticalVersions.slice(0, 3).map((v: any) => {
              const days = getDaysUntil(v.eolDate);
              return (
                <Link
                  key={v.id}
                  to="/eol/$slug"
                  params={{ slug: v.product?.slug }}
                  className="flex justify-between items-center bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-colors"
                >
                  <span className="font-medium">{v.product?.name} v{v.versionNumber}</span>
                  <span className="px-2 py-1 bg-white/20 rounded text-sm">
                    {days === 0 ? 'Hôm nay!' : days === 1 ? 'Ngày mai!' : `${days} ngày`}
                  </span>
                </Link>
              );
            })}
          </div>
          {criticalVersions.length > 3 && (
            <p className="text-red-200 text-sm mt-2">Và {criticalVersions.length - 3} phiên bản khác...</p>
          )}
        </div>
      )}

      {/* Expiring Soon Section */}
      {(warningVersions.length > 0 || attentionVersions.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {warningVersions.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <span>⚡</span> 31-60 ngày
                <span className="px-2 py-0.5 bg-orange-200 rounded-full text-xs">{warningVersions.length}</span>
              </h3>
              <div className="space-y-2">
                {warningVersions.slice(0, 4).map((v: any) => (
                  <Link
                    key={v.id}
                    to="/eol/$slug"
                    params={{ slug: v.product?.slug }}
                    className="flex justify-between items-center bg-white p-2 rounded-lg border border-orange-100 hover:border-orange-300 transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-700">{v.product?.name} v{v.versionNumber}</span>
                    <span className="text-xs text-orange-600">{formatDate(v.eolDate)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {attentionVersions.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <span>⚠️</span> 61-90 ngày
                <span className="px-2 py-0.5 bg-amber-200 rounded-full text-xs">{attentionVersions.length}</span>
              </h3>
              <div className="space-y-2">
                {attentionVersions.slice(0, 4).map((v: any) => (
                  <Link
                    key={v.id}
                    to="/eol/$slug"
                    params={{ slug: v.product?.slug }}
                    className="flex justify-between items-center bg-white p-2 rounded-lg border border-amber-100 hover:border-amber-300 transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-700">{v.product?.name} v{v.versionNumber}</span>
                    <span className="text-xs text-amber-600">{formatDate(v.eolDate)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Browse Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span>🗂️</span> Duyệt theo danh mục
        </h2>

        {loadingCategories ? (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 w-24 bg-slate-100 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <button
              onClick={() => handleFilterChange('all')}
              className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 text-center ${selectedType === 'all'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200 hover:shadow-sm'
                }`}
            >
              <span className="text-2xl">🌍</span>
              <span className="font-medium text-sm">Tất cả</span>
            </button>

            {categories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => handleFilterChange(cat.id)}
                className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 text-center ${selectedType === cat.id
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                  : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200 hover:shadow-sm'
                  }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="font-medium text-sm truncate w-full">{cat.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm theo tên, nhà phát hành..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg transition-shadow"
        />
      </div>

      {/* Products Grid/List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800">📦 Danh sách phần mềm</h2>
          <span className="text-sm text-slate-500">{filteredProducts?.length} phần mềm</span>
        </div>

        {filteredProducts?.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {paginatedProducts.map((product: any) => {
                // Get the nearest expiring version for this product
                const productExpiring = expiringVersions.filter((v: any) => v.product?.id === product.id);
                const nearestExpiring = productExpiring.length > 0
                  ? productExpiring.reduce((nearest: any, current: any) => {
                    const currentDays = getDaysUntil(current.eolDate);
                    const nearestDays = getDaysUntil(nearest.eolDate);
                    if (currentDays === null) return nearest;
                    if (nearestDays === null) return current;
                    return currentDays < nearestDays ? current : nearest;
                  })
                  : null;
                const urgency = nearestExpiring ? getUrgencyLevel(getDaysUntil(nearestExpiring.eolDate)) : null;

                return (
                  <Link
                    key={product.id}
                    to="/eol/$slug"
                    params={{ slug: product.slug }}
                    className="group bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl p-4 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">
                        {categoryMap.get(product.categoryId)?.icon || '📦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
                          {product.name}
                        </h3>
                        {product.vendor && (
                          <p className="text-sm text-slate-500 truncate">{product.vendor}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.categoryId && (
                            <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs">
                              {categoryMap.get(product.categoryId)?.name || 'Unknown'}
                            </span>
                          )}
                          {product.latestVersion && (
                            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              v{product.latestVersion}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <button
                            onClick={(e) => handleEdit(e, product)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors z-10"
                            title="Chỉnh sửa sản phẩm"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          ⟶
                        </span>
                      </div>
                    </div>
                    {/* Product Stats */}
                    <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span>📋</span>
                        <span>{product.versionsCount || 0} phiên bản</span>
                      </div>
                      {product.ltsVersion && (
                        <div className="flex items-center gap-1.5 text-purple-600">
                          <span>🛡️</span>
                          <span>LTS: {product.ltsVersion}</span>
                        </div>
                      )}
                    </div>

                    {/* EOL Warning */}
                    {nearestExpiring && urgency && (
                      <div className={`mt-2 p-2 rounded-lg text-xs flex items-center gap-2 ${urgency.level === 'critical' || urgency.level === 'expired'
                        ? 'bg-red-100 text-red-700'
                        : urgency.level === 'warning'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-amber-100 text-amber-700'
                        }`}>
                        <span>{urgency.icon}</span>
                        <span className="font-medium">v{nearestExpiring.versionNumber}</span>
                        <span>EOL: {formatDate(nearestExpiring.eolDate)}</span>
                      </div>
                    )}

                    {product.description && (
                      <p className="text-sm text-slate-500 mt-3 line-clamp-2">{product.description}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {paginatedProducts.map((product: any) => {
                const productExpiring = expiringVersions.filter((v: any) => v.product?.id === product.id);
                const nearestExpiring = productExpiring.length > 0
                  ? productExpiring.reduce((nearest: any, current: any) => {
                    const currentDays = getDaysUntil(current.eolDate);
                    const nearestDays = getDaysUntil(nearest.eolDate);
                    if (currentDays === null) return nearest;
                    if (nearestDays === null) return current;
                    return currentDays < nearestDays ? current : nearest;
                  })
                  : null;
                const urgency = nearestExpiring ? getUrgencyLevel(getDaysUntil(nearestExpiring.eolDate)) : null;

                return (
                  <Link
                    key={product.id}
                    to="/eol/$slug"
                    params={{ slug: product.slug }}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="text-2xl">
                      {categoryMap.get(product.categoryId)?.icon || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-800">{product.name}</h3>
                        {product.latestVersion && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            v{product.latestVersion}
                          </span>
                        )}
                        {product.ltsVersion && (
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                            LTS
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        {product.vendor && <span>{product.vendor}</span>}
                        <span>•</span>
                        <span>{product.versionsCount || 0} phiên bản</span>
                      </div>
                    </div>
                    {nearestExpiring && urgency && (
                      <div className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 ${urgency.level === 'critical' || urgency.level === 'expired'
                        ? 'bg-red-100 text-red-700'
                        : urgency.level === 'warning'
                          ? 'bg-orange-100 text-orange-700'
                          : urgency.level === 'attention'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                        <span>{urgency.icon}</span>
                        <span>v{nearestExpiring.versionNumber}: {formatDate(nearestExpiring.eolDate)}</span>
                      </div>
                    )}
                    {product.categoryId && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs hidden md:block">
                        {categoryMap.get(product.categoryId)?.name || 'Unknown'}
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      {isAdmin && (
                        <button
                          onClick={(e) => handleEdit(e, product)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors z-10"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      <span className="text-emerald-600">⟶</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        ) : (
          <div className="p-12 text-center">
            <EmptyState
              icon="📭"
              title="Không tìm thấy sản phẩm"
              description={
                searchQuery || selectedType !== 'all'
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                  : 'Thêm sản phẩm để bắt đầu theo dõi'
              }
            />
          </div>
        )}

        {/* Products Pagination */}
        {totalProductPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Trang {currentPage} / {totalProductPages} ({filteredProducts.length} sản phẩm)
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
                {Array.from({ length: totalProductPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalProductPages <= 5) return true;
                    if (page === 1 || page === totalProductPages) return true;
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
                onClick={() => setCurrentPage(p => Math.min(totalProductPages, p + 1))}
                disabled={currentPage === totalProductPages}
              >
                Sau
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalProductPages)}
                disabled={currentPage === totalProductPages}
              >
                Cuối
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Info */}
      <div className="bg-linear-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-4">📚 Hướng dẫn sử dụng</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl">💀</span>
            <div>
              <p className="font-medium text-slate-700">Đã hết hạn</p>
              <p className="text-slate-600">Không còn được hỗ trợ</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">🚨</span>
            <div>
              <p className="font-medium text-red-700">Màu đỏ</p>
              <p className="text-slate-600">Hết hạn trong 30 ngày</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-amber-700">Màu vàng</p>
              <p className="text-slate-600">Hết hạn trong 31-90 ngày</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-medium text-emerald-700">Màu xanh</p>
              <p className="text-slate-600">Còn hỗ trợ lâu dài</p>
            </div>
          </div>
        </div>
      </div>

      {/* All Expiring Versions Summary Table */}
      {expiringVersions.length > 0 && (
        <Card padding="none" className="overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-linear-to-r from-amber-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Tổng hợp phiên bản sắp hết hạn</h2>
                  <p className="text-sm text-slate-500">Tất cả các phiên bản cần theo dõi trong 90 ngày tới</p>
                </div>
              </div>
              <Badge variant="warning" size="lg">{expiringVersions.length} phiên bản</Badge>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Sản phẩm</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Phiên bản</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Ngày phát hành</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Ngày EOL</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Còn lại</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedExpiringVersions.map((version: any) => {
                  const days = getDaysUntil(version.eolDate);
                  const urgency = getUrgencyLevel(days);
                  return (
                    <tr key={version.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          to="/eol/$slug"
                          params={{ slug: version.product?.slug }}
                          className="flex items-center gap-2 text-slate-800 hover:text-emerald-600"
                        >
                          <span>{categoryMap.get(version.product?.categoryId)?.icon || '📦'}</span>
                          <span className="font-medium">{version.product?.name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-700">{version.versionNumber}</span>
                          {version.lts && (
                            <Badge variant="purple" size="sm">LTS</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(version.releaseDate)}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {formatDate(version.eolDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${days !== null && days < 0 ? 'text-red-600' :
                          days !== null && days <= 30 ? 'text-red-600' :
                            days !== null && days <= 60 ? 'text-orange-600' :
                              'text-amber-600'
                          }`}>
                          {days === null ? 'N/A' :
                            days < 0 ? `Quá ${Math.abs(days)} ngày` :
                              days === 0 ? 'Hôm nay!' :
                                `${days} ngày`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            urgency.level === 'expired' || urgency.level === 'critical' ? 'danger' :
                              urgency.level === 'warning' ? 'warning' : 'info'
                          }
                          size="sm"
                          dot
                        >
                          {urgency.text}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Expiring Versions Pagination */}
          {totalExpiringPages > 1 && (
            <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500">
                Trang {expiringPage} / {totalExpiringPages} ({expiringVersions.length} phiên bản)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpiringPage(1)}
                  disabled={expiringPage === 1}
                >
                  Đầu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpiringPage(p => Math.max(1, p - 1))}
                  disabled={expiringPage === 1}
                >
                  Trước
                </Button>

                {/* Page numbers */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: totalExpiringPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalExpiringPages <= 5) return true;
                      if (page === 1 || page === totalExpiringPages) return true;
                      if (Math.abs(page - expiringPage) <= 1) return true;
                      return false;
                    })
                    .map((page, idx, arr) => (
                      <div key={page} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-1 text-slate-400">...</span>
                        )}
                        <button
                          onClick={() => setExpiringPage(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${expiringPage === page
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
                  onClick={() => setExpiringPage(p => Math.min(totalExpiringPages, p + 1))}
                  disabled={expiringPage === totalExpiringPages}
                >
                  Sau
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpiringPage(totalExpiringPages)}
                  disabled={expiringPage === totalExpiringPages}
                >
                  Cuối
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {editingProduct ? 'Cập nhật thông tin chi tiết của sản phẩm' : 'Tạo mục mới để bắt đầu theo dõi vòng đời'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {mutation.isError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  Lỗi: {(mutation.error as any)?.message || 'Có lỗi xảy ra'}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-5">
                <Input
                  label="Tên sản phẩm *"
                  placeholder="Ví dụ: Node.js, Ubuntu, Docker..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Nhà phát hành"
                  placeholder="Ví dụ: Microsoft, Amazon, OpenSource..."
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Select
                  label="Danh mục *"
                  placeholder="Chọn danh mục"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                  options={categories.map((c: any) => ({ value: c.id, label: c.name, icon: c.icon }))}
                />
                <Input
                  label="Link trang chủ"
                  placeholder="https://..."
                  value={formData.homepageUrl}
                  onChange={(e) => setFormData({ ...formData, homepageUrl: e.target.value })}
                />
              </div>

              <Input
                label="Link tài liệu (Documentation)"
                placeholder="https://..."
                value={formData.documentationUrl}
                onChange={(e) => setFormData({ ...formData, documentationUrl: e.target.value })}
              />

              <Textarea
                label="Mô tả sản phẩm"
                placeholder="Mô tả ngắn gọn về sản phẩm và mục đích sử dụng..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-8">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  isLoading={mutation.isPending}
                  className="px-8"
                >
                  {editingProduct ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const authData = await getSessionUser();
    if (!authData?.success || !authData.data) {
      throw redirect({
        to: '/login',
      });
    }
  },
  component: EOLTrackerPage,
});
