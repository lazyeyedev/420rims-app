import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Spinner = () => (
  <div style={{ display:'flex', justifyContent:'center', alignItems:'center',
    height:'100vh', backgroundColor:'#0a0a0a' }}>
    <div style={{ width:48, height:48, border:'4px solid #2a2a2a',
      borderTop:'4px solid #c9a84c', borderRadius:'50%',
      animation:'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Public-facing protected route — redirects to /login
const ProtectedRoute = ({ requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
    toast.error('Access denied');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Admin-only protected route — redirects to /admin/login
export const AdminProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
