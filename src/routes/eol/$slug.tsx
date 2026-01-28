import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getProduct, getVersionsByProduct } from '../../server/functions/eol';

// Helper functions
const formatDate = (date: string | null | undefined) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getDaysUntil = (date: string | null | undefined): number | null => {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

const getLifecycleStageInfo = (stage: string) => {
  const stages: Record<string, { label: string; color: string; description: string }> = {
    active: {
      label: 'Active',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Đang được hỗ trợ đầy đủ với các bản cập nhật và vá lỗi',
    },
    maintenance: {
      label: 'Maintenance',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Chỉ nhận các bản vá lỗi quan trọng và bảo mật',
    },
    security: {
      label: 'Security Only',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Chỉ nhận các bản vá bảo mật khẩn cấp',
    },
    eol: {
      label: 'End of Life',
      color: 'bg-red-100 text-red-800 border-red-200',
      description: 'Không còn được hỗ trợ, nên nâng cấp ngay',
    },
    deprecated: {
      label: 'Deprecated',
      color: 'bg-slate-100 text-slate-800 border-slate-200',
      description: 'Đã bị ngừng hỗ trợ, không nên sử dụng cho dự án mới',
    },
  };
  return stages[stage] || { label: stage, color: 'bg-slate-100 text-slate-600 border-slate-200', description: '' };
};

const getStatusBadge = (eolDate: string | null | undefined, extendedSupportDate?: string | null) => {
  const daysUntilEol = getDaysUntil(eolDate);
  const daysUntilExtended = getDaysUntil(extendedSupportDate);

  if (daysUntilEol === null) {
    return { color: 'bg-slate-100 text-slate-600', text: 'Chưa xác định', icon: '❓' };
  }

  if (daysUntilEol < 0) {
    // Check extended support
    if (daysUntilExtended !== null && daysUntilExtended > 0) {
      return { color: 'bg-purple-100 text-purple-700', text: `Extended Support (${daysUntilExtended} ngày)`, icon: '🛡️' };
    }
    return { color: 'bg-red-100 text-red-700', text: 'Hết hạn hỗ trợ', icon: '⚠️' };
  }

  if (daysUntilEol <= 30) {
    return { color: 'bg-red-100 text-red-700', text: `${daysUntilEol} ngày còn lại`, icon: '🚨' };
  }

  if (daysUntilEol <= 90) {
    return { color: 'bg-amber-100 text-amber-700', text: `${daysUntilEol} ngày còn lại`, icon: '⚡' };
  }

  if (daysUntilEol <= 180) {
    return { color: 'bg-yellow-100 text-yellow-700', text: `${daysUntilEol} ngày còn lại`, icon: '📅' };
  }

  return { color: 'bg-emerald-100 text-emerald-700', text: 'Đang hoạt động', icon: '✅' };
};

function EOLDetailPage() {
  const { slug } = Route.useParams();

  const { data: productData, isLoading: loadingProduct } = useQuery({
    queryKey: ['eol-product', slug],
    queryFn: () => getProduct({ data: { slug } }),
  });

  const { data: versionsData, isLoading: loadingVersions } = useQuery({
    queryKey: ['eol-versions', productData?.data?.id],
    queryFn: () => getVersionsByProduct({ data: { productId: productData?.data?.id! } }),
    enabled: !!productData?.data?.id,
  });

  if (loadingProduct) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!productData?.success || !productData.data) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-slate-800">Không tìm thấy sản phẩm</h1>
        <p className="text-slate-500 mt-2">Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link to="/" className="text-emerald-600 hover:underline mt-4 inline-block">
          ← Quay lại EOL Tracker
        </Link>
      </div>
    );
  }

  const product = productData.data;
  const versions = (versionsData?.success ? versionsData.data : []) as any[];

  // Statistics
  const activeVersions = versions.filter((v: any) => {
    const days = getDaysUntil(v.eolDate);
    return days === null || days > 0;
  });
  const expiredVersions = versions.filter((v: any) => {
    const days = getDaysUntil(v.eolDate);
    return days !== null && days <= 0;
  });
  const ltsVersions = versions.filter((v: any) => v.lts);
  const expiringSOon = versions.filter((v: any) => {
    const days = getDaysUntil(v.eolDate);
    return days !== null && days > 0 && days <= 90;
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link to="/" className="text-slate-500 hover:text-emerald-600">
          EOL Tracker
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-800 font-medium">{product.name}</span>
      </nav>

      {/* Product Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500 to-teal-600 px-6 py-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {product.iconUrl ? (
                <img src={product.iconUrl} alt={product.name} className="w-16 h-16 rounded-lg bg-white p-2" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-white/20 flex items-center justify-center text-3xl">
                  📦
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                {product.vendor && (
                  <p className="text-emerald-100 mt-1">by {product.vendor}</p>
                )}
              </div>
            </div>
            {product.productType && (
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {product.productType}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {product.description && (
            <p className="text-slate-600 mb-4">{product.description}</p>
          )}

          <div className="flex flex-wrap gap-4">
            {product.homepageUrl && (
              <a
                href={product.homepageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                <span>🌐</span> Trang chủ
              </a>
            )}
            {product.documentationUrl && (
              <a
                href={product.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                <span>📚</span> Documentation
              </a>
            )}
            {product.license && (
              <span className="inline-flex items-center gap-2 text-slate-600">
                <span>📄</span> {product.license}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="text-3xl font-bold text-slate-800">{versions.length}</div>
          <div className="text-sm text-slate-500">Tổng phiên bản</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-emerald-200 p-4">
          <div className="text-3xl font-bold text-emerald-600">{activeVersions.length}</div>
          <div className="text-sm text-slate-500">Đang hoạt động</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-amber-200 p-4">
          <div className="text-3xl font-bold text-amber-600">{expiringSOon.length}</div>
          <div className="text-sm text-slate-500">Sắp hết hạn (90 ngày)</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4">
          <div className="text-3xl font-bold text-red-600">{expiredVersions.length}</div>
          <div className="text-sm text-slate-500">Đã hết hạn</div>
        </div>
      </div>

      {/* LTS Versions Highlight */}
      {ltsVersions.length > 0 && (
        <div className="bg-linear-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-4">
          <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <span>⭐</span> Long Term Support (LTS) Versions
          </h3>
          <div className="flex flex-wrap gap-2">
            {ltsVersions.map((v: any) => (
              <span key={v.id} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {v.versionNumber}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Versions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800">Danh sách phiên bản</h2>
          <span className="text-sm text-slate-500">{versions.length} phiên bản</span>
        </div>

        {loadingVersions ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : versions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Phiên bản
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Ngày phát hành
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Ngày EOL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Extended Support
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Lifecycle
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {versions.map((version: any) => {
                  const status = getStatusBadge(version.eolDate, version.extendedSupportDate);
                  const lifecycle = getLifecycleStageInfo(version.lifecycleStage);

                  return (
                    <tr key={version.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{version.versionNumber}</span>
                          {version.lts && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                              LTS
                            </span>
                          )}
                        </div>
                        {version.notes && (
                          <p className="text-xs text-slate-500 mt-1 max-w-xs truncate" title={version.notes}>
                            {version.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${status.color}`}>
                          <span>{status.icon}</span>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {formatDate(version.releaseDate)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {formatDate(version.eolDate)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {version.extendedSupportDate ? formatDate(version.extendedSupportDate) : '—'}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-1 rounded border text-xs font-medium ${lifecycle.color}`}
                          title={lifecycle.description}
                        >
                          {lifecycle.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-slate-500">Chưa có phiên bản nào được thêm cho sản phẩm này.</p>
          </div>
        )}
      </div>

      {/* Timeline View */}
      {versions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Timeline</h2>
          <div className="space-y-4">
            {versions.slice(0, 5).map((version: any, index: number) => {
              const status = getStatusBadge(version.eolDate, version.extendedSupportDate);
              const daysUntil = getDaysUntil(version.eolDate);

              return (
                <div key={version.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${daysUntil !== null && daysUntil <= 0 ? 'bg-red-500' : daysUntil !== null && daysUntil <= 90 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    {index < Math.min(versions.length - 1, 4) && (
                      <div className="w-0.5 h-full bg-slate-200 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {version.versionNumber}
                        {version.lts && <span className="ml-2 text-purple-600 text-sm">(LTS)</span>}
                      </span>
                      <span className={`text-sm ${status.color} px-2 py-0.5 rounded`}>
                        {status.icon} {status.text}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {version.releaseDate && <span>Phát hành: {formatDate(version.releaseDate)}</span>}
                      {version.releaseDate && version.eolDate && <span className="mx-2">→</span>}
                      {version.eolDate && <span>EOL: {formatDate(version.eolDate)}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {versions.length > 5 && (
            <p className="text-sm text-slate-500 mt-4 text-center">
              Và {versions.length - 5} phiên bản khác...
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute('/eol/$slug')({
  component: EOLDetailPage,
});
