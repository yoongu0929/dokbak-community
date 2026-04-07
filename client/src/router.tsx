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
import NoticeListPage from './pages/NoticeListPage';
import NoticeDetailPage from './pages/NoticeDetailPage';
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
      // 공개 페이지 (로그인 없이 접근 가능)
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/', element: <DashboardPage /> },
      { path: '/notices', element: <NoticeListPage /> },
      { path: '/notices/:id', element: <NoticeDetailPage /> },
      { path: '/ranking', element: <RankingPage /> },
      { path: '/ranking/archive/:yearMonth', element: <RankingArchivePage /> },
      // 보호 페이지 (로그인 필요)
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
        path: '/mypage',
        element: <ProtectedRoute><MyPage /></ProtectedRoute>,
      },
    ],
  },
]);

export default router;
