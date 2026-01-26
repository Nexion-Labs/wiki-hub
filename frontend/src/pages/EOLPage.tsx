import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eolApi, type EOLProduct } from '../api/eol.api';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { Select } from '../components/Select';

export const EOLPage = () => {
  const [products, setProducts] = useState<EOLProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EOLProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedType]);

  const loadProducts = async () => {
    try {
      const response = await eolApi.getProducts();
      setProducts(response.data.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.vendor?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Filter by product type
    if (selectedType !== 'all') {
      filtered = filtered.filter((p) => p.productType === selectedType);
    }

    setFilteredProducts(filtered);
  };

  const productTypes = Array.from(
    new Set(products.map((p) => p.productType).filter(Boolean))
  ).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">EOL Software Tracking</h1>
          <p className="mt-2 text-gray-600">
            Track software end-of-life dates and receive alerts
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <Input
              id="search"
              type="text"
              label="Search Products"
              placeholder="Search by name, vendor, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
            />

            {/* Type Filter */}
            <Select
              id="type"
              label="Filter by Type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              fullWidth
            >
              <option value="all">All Types</option>
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {type ? type.charAt(0).toUpperCase() + type.slice(1) : ''}
                </option>
              ))}
            </Select>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
            {(searchQuery || selectedType !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                }}
                className="ml-4 text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">
              {products.length === 0
                ? 'No products tracked yet'
                : 'No products match your search'}
            </p>
            {products.length === 0 && user && (
              <p className="text-sm text-gray-400">
                Add your first product to start tracking EOL dates
              </p>
            )}
            {products.length > 0 && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/eol/${product.slug}`}
                className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  {product.productType && (
                    <Badge variant="info">{product.productType}</Badge>
                  )}
                </div>
                {product.vendor && (
                  <p className="text-sm text-gray-600 mb-2">by {product.vendor}</p>
                )}
                {product.description && (
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Added: {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-blue-600 text-sm font-medium">
                    View details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
