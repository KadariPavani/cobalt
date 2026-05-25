import { Navigate, Route, Routes } from 'react-router-dom';

import { useBootstrapAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

import AppLayout from '@/layouts/AppLayout.jsx';
import AuthLayout from '@/layouts/AuthLayout.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';

import LoginPage from '@/pages/LoginPage.jsx';
import RegisterPage from '@/pages/RegisterPage.jsx';
import DashboardPage from '@/pages/DashboardPage.jsx';
import ProjectsPage from '@/pages/ProjectsPage.jsx';
import ProjectDetailPage from '@/pages/ProjectDetailPage.jsx';
import TasksPage from '@/pages/TasksPage.jsx';
import SearchPage from '@/pages/SearchPage.jsx';
import NotFoundPage from '@/pages/NotFoundPage.jsx';
import BootSplash from '@/components/BootSplash.jsx';

export default function App() {
  useBootstrapAuth();
  const isReady = useAuthStore((s) => s.isReady);

  if (!isReady) return <BootSplash />;

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/"                  element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"         element={<DashboardPage />} />
        <Route path="/projects"          element={<ProjectsPage />} />
        <Route path="/projects/:id"      element={<ProjectDetailPage />} />
        <Route path="/tasks"             element={<TasksPage />} />
        <Route path="/search"            element={<SearchPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
