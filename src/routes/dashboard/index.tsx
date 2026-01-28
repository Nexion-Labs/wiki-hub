import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { listWikiPages } from '../../server/functions/wiki';
import { getExpiringVersions } from '../../server/functions/eol';
import { getSessionUser } from '../../server/functions/auth';
import { Card, CardHeader, Badge, LoadingState, EmptyState, Button } from '../../components';

function DashboardPage() {
  // Get user from session cookies
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getSessionUser(),
    staleTime: 5 * 60 * 1000,
  });

  const user = authData?.success ? authData.data : null;

  const { data: pagesData } = useQuery({
    queryKey: ['wiki-pages'],
    queryFn: () => listWikiPages({ data: { limit: 5 } }),
    enabled: !!user,
  });

  const { data: expiringData } = useQuery({
    queryKey: ['expiring-versions'],
    queryFn: () => getExpiringVersions({ data: { daysAhead: 30 } }),
    enabled: !!user,
  });

  const pagesResult = pagesData as { success: boolean; data?: any[] } | undefined;
  const expiringResult = expiringData as { success: boolean; data?: any[] } | undefined;
  const recentPages = pagesResult?.success ? pagesResult.data || [] : [];
  const expiringVersions = expiringResult?.success ? expiringResult.data || [] : [];

  // Show loading state
  if (authLoading) {
    return <LoadingState text="Đang tải thông tin..." />;
  }

  // Show access denied if not logged in
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center" padding="lg">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-slate-800">Yêu cầu đăng nhập</h1>
          <p className="text-slate-500 mt-2 mb-6">
            Vui lòng đăng nhập để truy cập Dashboard.
          </p>
          <Link to="/login">
            <Button className="w-full">Đăng nhập ngay</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-linear-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Xin chào, {user.username}! 👋</h1>
            <p className="mt-1 text-emerald-100">
              Chào mừng bạn trở lại Dashboard
            </p>
          </div>
          <div className="text-right">
            <Badge variant="success" size="lg" className="bg-white/20 text-white border-white/30">
              {user.role.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100 rounded-full -mr-10 -mt-10" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">👤</span>
              <h3 className="text-sm font-medium text-slate-500">Vai trò</h3>
            </div>
            <p className="text-2xl font-bold text-slate-800 capitalize">{user.role}</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -mr-10 -mt-10" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📄</span>
              <h3 className="text-sm font-medium text-slate-500">Bài viết Wiki</h3>
            </div>
            <p className="text-2xl font-bold text-slate-800">{recentPages?.length || 0}</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100 rounded-full -mr-10 -mt-10" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-sm font-medium text-slate-500">Sắp hết hạn</h3>
            </div>
            <p className="text-2xl font-bold text-amber-600">{expiringVersions?.length || 0}</p>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Wiki Pages */}
        <Card padding="none">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <CardHeader title="📚 Bài viết Wiki gần đây" />
            <Link to="/wiki" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              Xem tất cả ⟶
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentPages && recentPages.length > 0 ? (
              recentPages.slice(0, 5).map((page: any) => (
                <Link
                  key={page.id}
                  to="/wiki/$slug"
                  params={{ slug: page.slug }}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                >
                  <div>
                    <p className="font-medium text-slate-700 group-hover:text-emerald-600 transition-colors">
                      {page.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(page.updatedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <span className="text-slate-400 group-hover:text-emerald-500 transition-colors">⟶</span>
                </Link>
              ))
            ) : (
              <div className="p-8">
                <EmptyState
                  icon="📝"
                  title="Chưa có bài viết"
                  description="Tạo bài viết Wiki đầu tiên của bạn"
                />
              </div>
            )}
          </div>
        </Card>

        {/* EOL Alerts */}
        <Card padding="none">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <CardHeader title="⏰ Sản phẩm sắp hết hạn" />
            <Link to="/" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              Xem tất cả ⟶
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {expiringVersions && expiringVersions.length > 0 ? (
              expiringVersions.slice(0, 5).map((version: any) => (
                <Link
                  key={version.id}
                  to="/eol/$slug"
                  params={{ slug: version.product?.slug || version.id }}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                >
                  <div>
                    <p className="font-medium text-slate-700 group-hover:text-emerald-600 transition-colors">
                      {version.product?.name} <span className="text-slate-400">v{version.version}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Hết hạn: {new Date(version.eolDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <Badge variant="warning" size="sm">
                    {Math.ceil((new Date(version.eolDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} ngày
                  </Badge>
                </Link>
              ))
            ) : (
              <div className="p-8">
                <EmptyState
                  icon="✅"
                  title="Tuyệt vời!"
                  description="Không có sản phẩm nào sắp hết hạn trong 30 ngày tới"
                />
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader
          title="🚀 Thao tác nhanh"
          description="Các hành động thường dùng"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <Link to="/wiki/new">
            <div className="p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-center group">
              <span className="text-3xl block mb-2">📝</span>
              <span className="font-medium text-slate-700 group-hover:text-emerald-700">Tạo Wiki mới</span>
            </div>
          </Link>
          <Link to="/">
            <div className="p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-center group">
              <span className="text-3xl block mb-2">📊</span>
              <span className="font-medium text-slate-700 group-hover:text-emerald-700">EOL Tracker</span>
            </div>
          </Link>
          {user.role === 'admin' && (
            <>
              <Link to="/admin/users">
                <div className="p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-center group">
                  <span className="text-3xl block mb-2">👥</span>
                  <span className="font-medium text-slate-700 group-hover:text-emerald-700">Quản lý Users</span>
                </div>
              </Link>
              <Link to="/admin/eol">
                <div className="p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-center group">
                  <span className="text-3xl block mb-2">⚙️</span>
                  <span className="font-medium text-slate-700 group-hover:text-emerald-700">Quản lý EOL</span>
                </div>
              </Link>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
});
