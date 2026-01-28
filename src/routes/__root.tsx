/// <reference types="vite/client" />
import type { ReactNode } from 'react';
import { useState } from 'react';
import { createRootRoute, Link, Outlet, HeadContent, Scripts, useRouter } from '@tanstack/react-router';
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getSessionUser, logoutFn } from '../server/functions/auth';
import { Button, Card } from '../components';
import '../index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

function Navbar() {
  const qc = useQueryClient();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get current user from session cookies via server function
  const { data: authData, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getSessionUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  const user = authData?.success ? authData.data : null;

  const handleLogout = async () => {
    try {
      await logoutFn();
      qc.invalidateQueries({ queryKey: ['currentUser'] });
      router.navigate({ to: '/' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = [
    { to: '/', label: 'EOL Tracker', public: true },
    { to: '/wiki', label: 'Wiki', public: true },
    { to: '/dashboard', label: 'Dashboard', requireAuth: true },
    { to: '/admin/users', label: 'Users', adminOnly: true },
    { to: '/admin/eol', label: 'Quản lý EOL', adminOnly: true },
  ];

  const filteredLinks = navLinks.filter(link => {
    if (link.adminOnly) return user?.role === 'admin';
    if (link.requireAuth) return !!user;
    return true;
  });

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center font-bold text-slate-900 group-hover:scale-110 transition-transform">
              W
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Wiki Hub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white [&.active]:bg-emerald-600/20 [&.active]:text-emerald-400"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-xs font-bold text-slate-900">
                    {user.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="text-sm text-slate-200">{user.username}</span>
                  {user.role === 'admin' && (
                    <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm">
                  Đăng nhập
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="space-y-1">
              {filteredLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white [&.active]:bg-emerald-600/20 [&.active]:text-emerald-400"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              {user ? (
                <div className="space-y-2">
                  <div className="px-4 text-sm text-slate-400">
                    Đăng nhập với: <span className="text-white">{user.username}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/10 rounded-lg"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-center rounded-lg"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded flex items-center justify-center font-bold text-xs text-slate-900">
              W
            </div>
            <span className="font-semibold text-white">Wiki Hub</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span>© {new Date().getFullYear()} Wiki Hub</span>
            <a href="#" className="hover:text-emerald-400 transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </QueryClientProvider>
    </RootDocument>
  );
}

function NotFoundComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 flex items-center justify-center">
            <Card className="max-w-md w-full text-center" padding="lg">
              <div className="text-6xl mb-4">🔍</div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">404</h1>
              <p className="text-lg text-slate-600 mb-6">
                Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.
              </p>
              <Link to="/">
                <Button className="w-full">
                  ← Về trang chủ
                </Button>
              </Link>
            </Card>
          </main>
          <Footer />
        </div>
      </QueryClientProvider>
    </RootDocument>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Wiki Hub - EOL Tracker & Documentation' },
      { name: 'description', content: 'Theo dõi End of Life và quản lý tài liệu Wiki' },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});
