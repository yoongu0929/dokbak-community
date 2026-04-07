import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PostListPage from './pages/PostListPage';
import PostDetailPage from './pages/PostDetailPage';
import PostCreatePage from './pages/PostCreatePage';
import PostEditPage from './pages/PostEditPage';
import RankingPage from './pages/RankingPage';
import RankingArchivePage from './pages/RankingArchivePage';
import MyPage from './pages/MyPage';
import ProtectedRoute from './components/ProtectedRoute';
import ResponsiveLayout from './components/ResponsiveLayout';

function AuthLayout() {
  return (
    <AuthProvider>
      <ResponsiveLayout>
        <Outlet />
      </ResponsiveLayout>
    </AuthProvider>
  );
}

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        path: '/dashboard',
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
      },
      {
        path: '/posts',
        element: <ProtectedRoute><PostListPage /></ProtectedRoute>,
      },
      {
        path: '/posts/new',
        element: <ProtectedRoute><PostCreatePage /></ProtectedRoute>,
      },
      {
        path: '/posts/:id',
        element: <ProtectedRoute><PostDetailPage /></ProtectedRoute>,
      },
      {
        path: '/posts/:id/edit',
        element: <ProtectedRoute><PostEditPage /></ProtectedRoute>,
      },
      {
        path: '/ranking',
        element: <ProtectedRoute><RankingPage /></ProtectedRoute>,
      },
      {
        path: '/ranking/archive/:yearMonth',
        element: <ProtectedRoute><RankingArchivePage /></ProtectedRoute>,
      },
      {
        path: '/mypage',
        element: <ProtectedRoute><MyPage /></ProtectedRoute>,
      },
      {
        path: '/',
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
      },
    ],
  },
]);

export default router;
