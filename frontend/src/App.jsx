import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CropRecommendation from './pages/CropRecommendation';
import DiseaseML from './pages/DiseaseDetection';
import IrrigationAdvice from './pages/IrrigationAdvice';
import MarketPrices from './pages/MarketPrices';
import Community from './pages/Community';
import WeatherDash from './pages/WeatherDash';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes — No login required */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected App Routes — Login required */}
        <Route path="/app" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="crops" element={<CropRecommendation />} />
          <Route path="disease" element={<DiseaseML />} />
          <Route path="irrigation" element={<IrrigationAdvice />} />
          <Route path="market" element={<MarketPrices />} />
          <Route path="community" element={<Community />} />
          <Route path="user/:id" element={<UserProfile />} />
          <Route path="weather" element={<WeatherDash />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
