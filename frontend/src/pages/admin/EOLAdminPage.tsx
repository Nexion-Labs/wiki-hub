import { useState, useEffect, useCallback } from 'react';
import { eolApi, type EOLProduct, type EOLVersion } from '../../api/eol.api';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Textarea } from '../../components/Textarea';

const PRODUCT_TYPES = [
  { value: 'os', label: 'Operating System' },
  { value: 'framework', label: 'Framework' },
  { value: 'library', label: 'Library' },
  { value: 'database', label: 'Database' },
  { value: 'language', label: 'Programming Language' },
  { value: 'tool', label: 'Tool' },
  { value: 'platform', label: 'Platform' },
  { value: 'other', label: 'Other' },
];

const LIFECYCLE_STAGES = [
  { value: 'active', label: 'Active' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'eol', label: 'End of Life' },
  { value: 'deprecated', label: 'Deprecated' },
];

export const EOLAdminPage = () => {
  const [products, setProducts] = useState<EOLProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EOLProduct | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    vendor: '',
    description: '',
    productType: '',
    homepageUrl: '',
    documentationUrl: '',
  });
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [versionsCache, setVersionsCache] = useState<Record<string, EOLVersion[]>>({});
  const [loadingVersions, setLoadingVersions] = useState<Record<string, boolean>>({});
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState<EOLVersion | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [versionFormData, setVersionFormData] = useState({
    versionNumber: '',
    releaseDate: '',
    eolDate: '',
    extendedSupportDate: '',
    lts: false,
    lifecycleStage: 'active',
    notes: '',
  });
  const [formError, setFormError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await eolApi.getProducts();
      setProducts(res.data.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = useCallback(async (productId: string) => {
    if (versionsCache[productId]) return;

    setLoadingVersions((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await eolApi.getVersions(productId);
      setVersionsCache((prev) => ({ ...prev, [productId]: res.data.data }));
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setLoadingVersions((prev) => ({ ...prev, [productId]: false }));
    }
  }, [versionsCache]);

  const handleToggleExpand = useCallback((productId: string) => {
    setExpandedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
        loadVersions(productId);
      }
      return newSet;
    });
  }, [loadVersions]);

  const openProductModal = useCallback((product?: EOLProduct) => {
    if (product) {
      setEditingProduct(product);
      setProductFormData({
        name: product.name,
        vendor: product.vendor || '',
        description: product.description || '',
        productType: product.productType || '',
        homepageUrl: (product as any).homepageUrl || '',
        documentationUrl: (product as any).documentationUrl || '',
      });
    } else {
      setEditingProduct(null);
      setProductFormData({
        name: '',
        vendor: '',
        description: '',
        productType: '',
        homepageUrl: '',
        documentationUrl: '',
      });
    }
    setFormError('');
    setShowProductModal(true);
  }, []);

  const closeProductModal = useCallback(() => {
    setShowProductModal(false);
    setEditingProduct(null);
    setFormError('');
  }, []);

  const handleCreateProduct = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!productFormData.name) {
      setFormError('Product name is required');
      return;
    }

    try {
      await eolApi.createProduct(productFormData);
      closeProductModal();
      loadProducts();
    } catch (error: any) {
      setFormError(error.response?.data?.error?.message || 'Failed to create product');
    }
  }, [productFormData, closeProductModal]);

  const handleUpdateProduct = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!editingProduct || !productFormData.name) {
      setFormError('Product name is required');
      return;
    }

    try {
      await eolApi.updateProduct(editingProduct.id, productFormData);
      closeProductModal();
      loadProducts();
    } catch (error: any) {
      setFormError(error.response?.data?.error?.message || 'Failed to update product');
    }
  }, [editingProduct, productFormData, closeProductModal]);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) {
      return;
    }

    try {
      await eolApi.deleteProduct(productId);
      loadProducts();
      // Remove from cache
      setVersionsCache((prev) => {
        const newCache = { ...prev };
        delete newCache[productId];
        return newCache;
      });
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to delete product');
    }
  }, []);

  const openVersionModal = useCallback((productId: string, version?: EOLVersion) => {
    setSelectedProductId(productId);
    if (version) {
      setEditingVersion(version);
      setVersionFormData({
        versionNumber: version.versionNumber,
        releaseDate: version.releaseDate || '',
        eolDate: version.eolDate,
        extendedSupportDate: version.extendedSupportDate || '',
        lts: version.lts,
        lifecycleStage: version.lifecycleStage,
        notes: version.notes || '',
      });
    } else {
      setEditingVersion(null);
      setVersionFormData({
        versionNumber: '',
        releaseDate: '',
        eolDate: '',
        extendedSupportDate: '',
        lts: false,
        lifecycleStage: 'active',
        notes: '',
      });
    }
    setFormError('');
    setShowVersionModal(true);
  }, []);

  const closeVersionModal = useCallback(() => {
    setShowVersionModal(false);
    setEditingVersion(null);
    setSelectedProductId('');
    setFormError('');
  }, []);

  const handleCreateVersion = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!versionFormData.versionNumber || !versionFormData.eolDate) {
      setFormError('Version number and EOL date are required');
      return;
    }

    try {
      await eolApi.createVersion({
        ...versionFormData,
        productId: selectedProductId,
      });
      closeVersionModal();
      // Invalidate cache to reload versions
      setVersionsCache((prev) => {
        const newCache = { ...prev };
        delete newCache[selectedProductId];
        return newCache;
      });
      loadVersions(selectedProductId);
    } catch (error: any) {
      setFormError(error.response?.data?.error?.message || 'Failed to create version');
    }
  }, [versionFormData, selectedProductId, closeVersionModal, loadVersions]);

  const handleUpdateVersion = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!editingVersion || !versionFormData.versionNumber || !versionFormData.eolDate) {
      setFormError('Version number and EOL date are required');
      return;
    }

    try {
      await eolApi.updateVersion(editingVersion.id, versionFormData);
      closeVersionModal();
      // Invalidate cache to reload versions
      setVersionsCache((prev) => {
        const newCache = { ...prev };
        delete newCache[selectedProductId];
        return newCache;
      });
      loadVersions(selectedProductId);
    } catch (error: any) {
      setFormError(error.response?.data?.error?.message || 'Failed to update version');
    }
  }, [editingVersion, versionFormData, selectedProductId, closeVersionModal, loadVersions]);

  const handleDeleteVersion = useCallback(async (versionId: string, productId: string) => {
    if (!confirm('Are you sure you want to delete this version? This cannot be undone.')) {
      return;
    }

    try {
      await eolApi.deleteVersion(versionId);
      // Invalidate cache to reload versions
      setVersionsCache((prev) => {
        const newCache = { ...prev };
        delete newCache[productId];
        return newCache;
      });
      loadVersions(productId);
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to delete version');
    }
  }, [loadVersions]);

  if (user?.role !== 'admin' && user?.role !== 'editor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin or Editor access required</p>
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
            <h1 className="text-3xl font-bold text-gray-900">EOL Management</h1>
            <p className="mt-2 text-gray-600">Manage end-of-life products and versions</p>
          </div>
          <Button onClick={() => openProductModal()} variant="primary">
            Add Product
          </Button>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Versions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const isExpanded = expandedProducts.has(product.id);
                const versions = versionsCache[product.id] || [];
                const isLoadingVersions = loadingVersions[product.id];

                return (
                  <>
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleToggleExpand(product.id)}
                            className="mr-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            <svg
                              className={`w-5 h-5 transform transition-transform ${
                                isExpanded ? 'rotate-90' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            {product.description && (
                              <div className="text-sm text-gray-500 max-w-md truncate">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.vendor || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.productType ? (
                          <Badge variant="info">
                            {PRODUCT_TYPES.find((t) => t.value === product.productType)?.label ||
                              product.productType}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isExpanded && versions.length > 0 ? versions.length : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openProductModal(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openVersionModal(product.id)}
                        >
                          Add Version
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-gray-50">
                          {isLoadingVersions ? (
                            <div className="text-center text-gray-500 py-4">
                              Loading versions...
                            </div>
                          ) : versions.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">
                              No versions found. Add one to get started.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-900 mb-3">Versions</h4>
                              <table className="min-w-full">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Version
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Release Date
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      EOL Date
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Stage
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      LTS
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {versions.map((version) => (
                                    <tr key={version.id}>
                                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                        {version.versionNumber}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-500">
                                        {version.releaseDate || '-'}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-500">
                                        {version.eolDate}
                                      </td>
                                      <td className="px-4 py-2">
                                        <Badge
                                          variant={
                                            version.lifecycleStage === 'eol'
                                              ? 'danger'
                                              : version.lifecycleStage === 'active'
                                              ? 'success'
                                              : 'warning'
                                          }
                                        >
                                          {version.lifecycleStage}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-500">
                                        {version.lts ? (
                                          <Badge variant="info">LTS</Badge>
                                        ) : (
                                          '-'
                                        )}
                                      </td>
                                      <td className="px-4 py-2 text-sm font-medium space-x-2">
                                        <Button
                                          variant="primary"
                                          size="sm"
                                          onClick={() => openVersionModal(product.id, version)}
                                        >
                                          Edit
                                        </Button>
                                        <Button
                                          variant="danger"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteVersion(version.id, product.id)
                                          }
                                        >
                                          Delete
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No products found. Add one to get started.
            </div>
          )}
        </div>

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </h2>
                <Button variant="ghost" size="sm" onClick={closeProductModal}>
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

              <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}>
                {formError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {formError}
                  </div>
                )}

                <div className="space-y-4">
                  <Input
                    type="text"
                    label="Product Name"
                    value={productFormData.name}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, name: e.target.value })
                    }
                    required
                    fullWidth
                  />

                  <Input
                    type="text"
                    label="Vendor"
                    value={productFormData.vendor}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, vendor: e.target.value })
                    }
                    fullWidth
                  />

                  <Textarea
                    label="Description"
                    value={productFormData.description}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, description: e.target.value })
                    }
                    rows={3}
                    fullWidth
                  />

                  <Select
                    label="Product Type"
                    value={productFormData.productType}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, productType: e.target.value })
                    }
                    placeholder="Select product type"
                    fullWidth
                  >
                    {PRODUCT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>

                  <Input
                    type="url"
                    label="Homepage URL"
                    value={productFormData.homepageUrl}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, homepageUrl: e.target.value })
                    }
                    fullWidth
                  />

                  <Input
                    type="url"
                    label="Documentation URL"
                    value={productFormData.documentationUrl}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        documentationUrl: e.target.value,
                      })
                    }
                    fullWidth
                  />
                </div>

                <div className="mt-6 flex space-x-3">
                  <Button type="submit" variant="primary" className="flex-1">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={closeProductModal}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Version Modal */}
        {showVersionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingVersion ? 'Edit Version' : 'Create New Version'}
                </h2>
                <Button variant="ghost" size="sm" onClick={closeVersionModal}>
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

              <form onSubmit={editingVersion ? handleUpdateVersion : handleCreateVersion}>
                {formError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {formError}
                  </div>
                )}

                <div className="space-y-4">
                  <Input
                    type="text"
                    label="Version Number"
                    value={versionFormData.versionNumber}
                    onChange={(e) =>
                      setVersionFormData({ ...versionFormData, versionNumber: e.target.value })
                    }
                    required
                    fullWidth
                  />

                  <Input
                    type="date"
                    label="Release Date"
                    value={versionFormData.releaseDate}
                    onChange={(e) =>
                      setVersionFormData({ ...versionFormData, releaseDate: e.target.value })
                    }
                    fullWidth
                  />

                  <Input
                    type="date"
                    label="EOL Date"
                    value={versionFormData.eolDate}
                    onChange={(e) =>
                      setVersionFormData({ ...versionFormData, eolDate: e.target.value })
                    }
                    required
                    fullWidth
                  />

                  <Input
                    type="date"
                    label="Extended Support Date"
                    value={versionFormData.extendedSupportDate}
                    onChange={(e) =>
                      setVersionFormData({
                        ...versionFormData,
                        extendedSupportDate: e.target.value,
                      })
                    }
                    fullWidth
                  />

                  <Select
                    label="Lifecycle Stage"
                    value={versionFormData.lifecycleStage}
                    onChange={(e) =>
                      setVersionFormData({ ...versionFormData, lifecycleStage: e.target.value })
                    }
                    required
                    fullWidth
                  >
                    {LIFECYCLE_STAGES.map((stage) => (
                      <option key={stage.value} value={stage.value}>
                        {stage.label}
                      </option>
                    ))}
                  </Select>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="lts"
                      checked={versionFormData.lts}
                      onChange={(e) =>
                        setVersionFormData({ ...versionFormData, lts: e.target.checked })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="lts" className="ml-2 block text-sm text-gray-900">
                      Long Term Support (LTS)
                    </label>
                  </div>

                  <Textarea
                    label="Notes"
                    value={versionFormData.notes}
                    onChange={(e) =>
                      setVersionFormData({ ...versionFormData, notes: e.target.value })
                    }
                    rows={3}
                    fullWidth
                  />
                </div>

                <div className="mt-6 flex space-x-3">
                  <Button type="submit" variant="primary" className="flex-1">
                    {editingVersion ? 'Update Version' : 'Create Version'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={closeVersionModal}
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
