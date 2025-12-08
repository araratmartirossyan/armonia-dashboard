import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LicenseManagement from './pages/LicenseManagement';
import KnowledgeBaseManagement from './pages/KnowledgeBaseManagement';
import UserManagement from './pages/UserManagement';
import Configuration from './pages/Configuration';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="licenses" element={<LicenseManagement />} />
            <Route path="knowledge-bases" element={<KnowledgeBaseManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="configuration" element={<Configuration />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

