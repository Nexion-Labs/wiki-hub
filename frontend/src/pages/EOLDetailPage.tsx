import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eolApi, type EOLProductDetail, type EOLVersion } from '../api/eol.api';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import type { BadgeVariant } from '../lib/theme';

/**
 * EOL Product Detail Page
 * Displays full product information with version lifecycle tracking
 */
export const EOLDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<EOLProductDetail | null>(null);
  const [versions, setVersions] = useState<EOLVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (slug) {
      loadProductDetails();
    }
  }, [slug]);

  useEffect(() => {
    if (user) {
      loadUserAlerts();
    }
  }, [user]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      const [productRes, versionsRes] = await Promise.all([
        eolApi.getProduct(slug!),
        eolApi.getProduct(slug!).then(res =>
          eolApi.getVersions(res.data.data.id)
        ),
      ]);

      setProduct(productRes.data.data);
      setVersions(versionsRes.data.data);
    } catch (err: any) {
      console.error('Failed to load product details:', err);
      setError(err.response?.data?.error?.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const loadUserAlerts = async () => {
    if (!user) return;
    try {
      const response = await eolApi.getUserAlerts();
      setAlerts(response.data.data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const handleSubscribe = async (versionId: string) => {
    if (!user) {
      alert('Please login to subscribe to alerts');
      return;
    }

    try {
      setSubscribing(versionId);
      await eolApi.subscribeToAlert(versionId, 90);
      await loadUserAlerts();
      alert('Successfully subscribed to EOL alerts (90 days before)');
    } catch (error: any) {
      console.error('Failed to subscribe:', error);
      alert(error.response?.data?.error?.message || 'Failed to subscribe');
    } finally {
      setSubscribing(null);
    }
  };

  const handleUnsubscribe = async (versionId: string) => {
    const alert = alerts.find((a) => a.versionId === versionId);
    if (!alert) return;

    try {
      setSubscribing(versionId);
      await eolApi.unsubscribeFromAlert(alert.id);
      await loadUserAlerts();
    } catch (error: any) {
      console.error('Failed to unsubscribe:', error);
    } finally {
      setSubscribing(null);
    }
  };

  const isSubscribed = (versionId: string) => {
    return alerts.some((a) => a.versionId === versionId);
  };

  const exportToCSV = () => {
    if (!product || versions.length === 0) return;

    const headers = ['Version', 'Release Date', 'EOL Date', 'Extended Support', 'Lifecycle Stage', 'LTS', 'Days Until EOL'];
    const rows = versions.map((v) => [
      v.versionNumber,
      formatDate(v.releaseDate),
      formatDate(v.eolDate),
      formatDate(v.extendedSupportDate),
      v.lifecycleStage,
      v.lts ? 'Yes' : 'No',
      getDaysUntilEOL(v.eolDate).toString(),
    ]);

    const csvContent = [
      `"${product.name} - EOL Version Tracking"`,
      `"Generated: ${new Date().toLocaleString()}"`,
      '',
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${product.slug}-eol-versions.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (!product || versions.length === 0) return;

    const data = {
      product: {
        name: product.name,
        slug: product.slug,
        vendor: product.vendor,
        description: product.description,
        productType: product.productType,
        homepageUrl: product.homepageUrl,
        documentationUrl: product.documentationUrl,
      },
      versions: versions.map((v) => ({
        versionNumber: v.versionNumber,
        releaseDate: v.releaseDate,
        eolDate: v.eolDate,
        extendedSupportDate: v.extendedSupportDate,
        lifecycleStage: v.lifecycleStage,
        lts: v.lts,
        notes: v.notes,
        daysUntilEOL: getDaysUntilEOL(v.eolDate),
      })),
      exportedAt: new Date().toISOString(),
    };

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${product.slug}-eol-versions.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getLifecycleBadgeVariant = (stage: string): BadgeVariant => {
    switch (stage.toLowerCase()) {
      case 'active':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'eol':
        return 'danger';
      default:
        return 'info';
    }
  };

  const getDaysUntilEOL = (eolDate: string): number => {
    const eol = new Date(eolDate);
    const today = new Date();
    const diffTime = eol.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-gray-500">Loading product details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              &larr; Back to EOL Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm">
            &larr; Back to EOL Products
          </Link>
        </div>

        {/* Product Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              {product.vendor && (
                <p className="text-lg text-gray-600 mb-4">by {product.vendor}</p>
              )}
              {product.description && (
                <p className="text-gray-700 mb-4">{product.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                {product.productType && (
                  <div>
                    <span className="font-medium text-gray-600">Type:</span>{' '}
                    <Badge variant="info">{product.productType}</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="mt-6 flex flex-wrap gap-4">
            {product.homepageUrl && (
              <a
                href={product.homepageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                🌐 Homepage
              </a>
            )}
            {product.documentationUrl && (
              <a
                href={product.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                📚 Documentation
              </a>
            )}
          </div>

          {/* Export Buttons - Only for logged-in users */}
          {user && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={exportToCSV}
                disabled={versions.length === 0}
              >
                📥 Export CSV
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={exportToJSON}
                disabled={versions.length === 0}
              >
                📥 Export JSON
              </Button>
            </div>
          )}
        </div>

        {/* Versions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Version Lifecycle</h2>
            <p className="text-sm text-gray-600 mt-1">
              {versions.length} version{versions.length !== 1 ? 's' : ''} tracked
            </p>
          </div>

          {versions.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No versions tracked yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Version
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Release Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EOL Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Until EOL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lifecycle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      LTS
                    </th>
                    {user && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Alerts
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {versions.map((version) => {
                    const daysUntilEOL = getDaysUntilEOL(version.eolDate);
                    const isExpiring = daysUntilEOL > 0 && daysUntilEOL <= 90;
                    const isExpired = daysUntilEOL < 0;

                    return (
                      <tr key={version.id} className={isExpiring ? 'bg-yellow-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {version.versionNumber}
                          </div>
                          {version.notes && (
                            <div className="text-xs text-gray-500 mt-1">
                              {version.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(version.releaseDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className={isExpired ? 'text-red-600 font-medium' : 'text-gray-900'}>
                            {formatDate(version.eolDate)}
                          </div>
                          {version.extendedSupportDate && (
                            <div className="text-xs text-gray-500 mt-1">
                              Ext: {formatDate(version.extendedSupportDate)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {isExpired ? (
                            <span className="text-red-600 font-medium">Expired</span>
                          ) : isExpiring ? (
                            <span className="text-yellow-600 font-medium">
                              {daysUntilEOL} days
                            </span>
                          ) : (
                            <span className="text-gray-500">{daysUntilEOL} days</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getLifecycleBadgeVariant(version.lifecycleStage)}>
                            {version.lifecycleStage}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {version.lts ? (
                            <Badge variant="info">LTS</Badge>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        {user && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isSubscribed(version.id) ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleUnsubscribe(version.id)}
                                disabled={subscribing === version.id}
                              >
                                {subscribing === version.id ? '...' : '🔔 Subscribed'}
                              </Button>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleSubscribe(version.id)}
                                disabled={subscribing === version.id || isExpired}
                              >
                                {subscribing === version.id ? '...' : '🔕 Subscribe'}
                              </Button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Lifecycle Stages</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="success">Active</Badge>
              <span className="text-gray-600">Actively maintained with new features</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="warning">Maintenance</Badge>
              <span className="text-gray-600">Security fixes only, no new features</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="danger">EOL</Badge>
              <span className="text-gray-600">End of life, no support</span>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <span className="font-medium">LTS:</span> Long-Term Support versions receive extended maintenance
          </div>
          {!user && (
            <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
              <span className="font-medium">💡 Tip:</span> Login to subscribe to EOL alerts and export version data to CSV/JSON.
            </div>
          )}
          {user && (
            <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
              <span className="font-medium">Features:</span> Subscribe to alerts (90 days before EOL) • Export data to CSV/JSON • Track multiple products
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
