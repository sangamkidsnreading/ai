import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import AuthPage from './pages/AuthPage';
import LearningPage from './pages/LearningPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import Sidebar from './components/Sidebar';

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { currentUser } = useAuthStore();
  
  if (!currentUser?.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  if (adminOnly && currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// 인증된 사용자용 레이아웃
const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
};

function App() {
  const { currentUser } = useAuthStore();

  return (
    <Router>
      <div className="App">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        <Routes>
          {/* 인증 페이지 */}
          <Route 
            path="/auth" 
            element={
              currentUser?.isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <AuthPage />
              )
            } 
          />
          
          {/* 보호된 라우트들 */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <LearningPage />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <DashboardPage />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <ProfilePage />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          
          {/* 관리자 전용 라우트 */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AuthenticatedLayout>
                  <AdminPage />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          
          {/* 기본 리다이렉트 */}
          <Route
            path="*"
            element={
              currentUser?.isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

