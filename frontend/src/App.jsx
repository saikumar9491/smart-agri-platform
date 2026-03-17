import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import CropRecommendation from './pages/CropRecommendation';
import DiseaseML from './pages/DiseaseDetection';
import IrrigationAdvice from './pages/IrrigationAdvice';
import MarketPrices from './pages/MarketPrices';
import Community from './pages/Community';
import WeatherDash from './pages/WeatherDash';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="crops" element={<CropRecommendation />} />
          <Route path="disease" element={<DiseaseML />} />
          <Route path="irrigation" element={<IrrigationAdvice />} />
          <Route path="market" element={<MarketPrices />} />
          <Route path="community" element={<Community />} />
          <Route path="weather" element={<WeatherDash />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
