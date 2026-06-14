import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeSwitcher from './components/ThemeSwitcher';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{
        width: '36px', height: '36px',
        border: '2px solid var(--accent)', borderTopColor: 'transparent',
        borderRadius: '50%', animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/groups/:id" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '0.75rem',
            fontFamily: 'inherit',
            fontSize: '0.875rem',
            background: 'var(--card)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
          },
        }}
      />
      <ThemeSwitcher />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
