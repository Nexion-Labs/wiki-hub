import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to="/"
              className="flex items-center px-2 text-xl font-bold text-gray-900"
            >
              Wiki App
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
              >
                EOL Tracking
              </Link>
              <Link
                to="/wiki"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-blue-600"
              >
                Wiki Pages
              </Link>
              {user && (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-blue-600"
                >
                  Dashboard
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin/users"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-blue-600"
                >
                  Users
                </Link>
              )}
              {(user?.role === 'admin' || user?.role === 'editor') && (
                <Link
                  to="/admin/eol"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-blue-600"
                >
                  EOL Management
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user.username} ({user.role})
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
