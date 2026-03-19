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

  // ❌ Not logged in → redirect to login
  if (!user) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ from: location }} // 🔥 remember where user came from
      />
    );
  }

  // ✅ Logged in → allow access
  return children;
}