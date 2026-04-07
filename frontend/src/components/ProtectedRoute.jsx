import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ✅ Show loading while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-green-500 mx-auto" />
          <p className="mt-4 text-sm text-slate-500 font-medium">
            Loading your farm data...
          </p>
        </div>
      </div>
    );
  }

  // ❌ Redirect to login if not authenticated or if the necessary token is missing
  const hasToken = !!localStorage.getItem('agri_token');
  
  if ((!user && !loading) || !hasToken) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ from: location.pathname }} // Save the current path to redirect back after login
      />
    );
  }

  // ✅ Logged in → allow access
  return children;
}