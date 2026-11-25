import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard': return 'Executive Command Dashboard';
      case '/detections': return 'AI Road Damage Detection Pipeline';
      case '/map': return 'Interactive GPS Hazard Map';
      case '/roads': return 'Road Health Passport System';
      case '/priority': return 'Smart Repair Priority & Risk Engine';
      case '/citizen-report': return 'Citizen Reporting & Tracking';
      case '/verification': return 'Before & After Repair Verification';
      case '/cost-estimator': return 'AI Civil Repair Cost Estimator';
      case '/prediction': return 'Future Deterioration Predictive Maintenance';
      case '/waterlogging': return 'Flood & Waterlogging Monitoring';
      case '/contractors': return 'Contractor Accountability & Assignments';
      case '/admin': return 'Administration & Role Permissions';
      default: return 'RoadGuard AI Platform';
    }
  };

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          title={getPageTitle(location.pathname)} 
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
