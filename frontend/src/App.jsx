import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DetectionPage from './pages/DetectionPage';
import MapPage from './pages/MapPage';
import RoadPassportPage from './pages/RoadPassportPage';
import PriorityEnginePage from './pages/PriorityEnginePage';
import CitizenReportPage from './pages/CitizenReportPage';
import RepairVerificationPage from './pages/RepairVerificationPage';
import CostEstimatorPage from './pages/CostEstimatorPage';
import PredictionPage from './pages/PredictionPage';
import WaterloggingPage from './pages/WaterloggingPage';
import ContractorsPage from './pages/ContractorsPage';
import AdminPanelPage from './pages/AdminPanelPage';

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Dashboard Shell */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/detections" element={<DetectionPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/roads" element={<RoadPassportPage />} />
            <Route path="/priority" element={<PriorityEnginePage />} />
            <Route path="/citizen-report" element={<CitizenReportPage />} />
            <Route path="/verification" element={<RepairVerificationPage />} />
            <Route path="/cost-estimator" element={<CostEstimatorPage />} />
            <Route path="/prediction" element={<PredictionPage />} />
            <Route path="/waterlogging" element={<WaterloggingPage />} />
            <Route path="/contractors" element={<ContractorsPage />} />
            <Route path="/admin" element={<AdminPanelPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
