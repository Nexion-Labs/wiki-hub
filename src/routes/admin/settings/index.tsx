import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getSessionUser } from '../../../server/functions/auth';
import { Card, CardHeader, Button, LoadingState } from '../../../components';

function AdminSettingsPage() {
  // Get user from session cookies
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getSessionUser(),
    staleTime: 5 * 60 * 1000,
  });

  const user = authData?.success ? authData.data : null;

  // Show loading state
  if (authLoading) {
    return <LoadingState text="Đang kiểm tra quyền truy cập..." />;
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center" padding="lg">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-slate-800">Từ chối truy cập</h1>
          <p className="text-slate-500 mt-2 mb-6">
            Chỉ Admin mới có quyền truy cập cài đặt.
          </p>
          <Link to="/login">
            <Button className="w-full">Đăng nhập với tài khoản Admin</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const settingsSections = [
    {
      title: 'Quản lý phần mềm',
      icon: '⚙️',
      description: 'Quản lý phần mềm End-of-Life, phiên bản và thông tin hết hạn',
      link: '/admin/settings/eol',
      color: 'from-blue-500 to-indigo-600',
      stats: 'Products & Versions',
    },
    {
      title: 'Phân loại phần mềm',
      icon: '🏷️',
      description: 'Quản lý các loại phần mềm và biểu tượng phân loại',
      link: '/admin/settings/categories',
      color: 'from-emerald-500 to-teal-600',
      stats: 'Categories & Icons',
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Cài đặt quản trị</h1>
        <p className="text-slate-500 mt-1">
          Quản lý cấu hình và thiết lập hệ thống
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {settingsSections.map((section) => (
          <Link key={section.link} to={section.link}>
            <Card className="h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-emerald-200">
              <div className="space-y-4">
                {/* Icon & Title */}
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center text-3xl shadow-lg`}>
                    {section.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-800 mb-1">
                      {section.title}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {section.stats}
                    </p>
                  </div>
                  <div className="text-slate-400 group-hover:text-emerald-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 leading-relaxed">
                  {section.description}
                </p>

                {/* Action Button */}
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Mở cài đặt
                  </Button>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl shadow-sm">
            ℹ️
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Thông tin</h3>
            <p className="text-sm text-slate-600">
              Bạn đang đăng nhập với quyền <span className="font-medium text-purple-600">Admin</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Help Section */}
      <Card className="border-2 border-dashed border-slate-200">
        <CardHeader
          title="💡 Trợ giúp"
          description="Cần hỗ trợ với cài đặt?"
        />
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">→</span>
            <p>
              <strong>Quản lý phần mềm:</strong> Thêm, sửa, xóa phần mềm và theo dõi các phiên bản sắp hết hạn
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">→</span>
            <p>
              <strong>Phân loại phần mềm:</strong> Tạo và quản lý các loại phần mềm với icon tùy chỉnh
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/admin/settings/')({
  component: AdminSettingsPage,
});
