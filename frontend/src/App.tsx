import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { WikiListPage } from './pages/WikiListPage';
import { WikiViewPage } from './pages/WikiViewPage';
import { WikiEditorPage } from './pages/WikiEditorPage';
import { EOLPage } from './pages/EOLPage';
import { EOLDetailPage } from './pages/EOLDetailPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { EOLAdminPage } from './pages/admin/EOLAdminPage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppContent = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<EOLPage />} />
        <Route path="/eol/:slug" element={<EOLDetailPage />} />
        <Route path="/wiki" element={<WikiListPage />} />
        <Route path="/wiki/:slug" element={<WikiViewPage />} />
        <Route
          path="/wiki/new"
          element={
            <PrivateRoute>
              <WikiEditorPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/wiki/edit/:slug"
          element={
            <PrivateRoute>
              <WikiEditorPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <UserManagementPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/eol"
          element={
            <PrivateRoute>
              <EOLAdminPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
