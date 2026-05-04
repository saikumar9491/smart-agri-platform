import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ✅ Show loading while checking auth
  if (loading) {
    return <LoadingScreen />;
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