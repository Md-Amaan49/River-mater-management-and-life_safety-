import React from "react";
import { Routes, Route } from "react-router-dom";
import { SearchProvider } from "./contexts/SearchContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import GovtDashboard from "./pages/GovtDashboard";
import AddDataForm from "./components/AddDataForm";
import CoreDamInfo from "./components/CoreDamInfo";
import RealtimeDamStatus from "./components/RealtimeDamStatus";
import WaterUsage from "./components/WaterUsage";
import Safety from "./components/Safety";
import SensorManagement from "./components/SensorManagement";
import SupportingInfo from "./components/SupportingInfo";
import Features from "./components/Features";
import Home from "./pages/Home";
import WaterLevel from "./pages/WaterLevel";
import WaterUsagePage from "./pages/WaterUsagePage";
import AlertPage from "./pages/Alertpage";
import AlertDashboard from "./components/AlertDashboard";
import TestAlertDashboard from "./components/TestAlertDashboard";
import Layout from "./components/Layout";
import DamDashboard from "./pages/DamDashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import WaterFlowPage from "./pages/WaterFlowPage";
import AdminDataForms from "./components/AdminDataForms";


function App() {
  return (
    <SearchProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected User Routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout><ProfilePage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/edit-profile" element={
          <ProtectedRoute>
            <Layout><div className="edit-profile-placeholder">
              <h2>Edit Profile</h2>
              <p>Profile editing functionality coming soon!</p>
              <button onClick={() => window.history.back()}>Go Back</button>
            </div></Layout>
          </ProtectedRoute>
        } />

        {/* Main Application Pages */}
        <Route path="/water-levels" element={<Layout><WaterLevel /></Layout>} />
        <Route path="/water-flow" element={<Layout><WaterFlowPage /></Layout>} />
        <Route path="/water-usage" element={<Layout><WaterUsagePage /></Layout>} />
        <Route path="/alerts" element={<Layout><AlertPage /></Layout>} />
        <Route path="/alert-dashboard" element={<Layout><AlertDashboard /></Layout>} />

        {/* Dam-specific Routes */}
        <Route path="/dam-dashboard/:damId" element={<Layout><DamDashboard /></Layout>} />
        <Route path="/core-dam-info/:damId" element={<CoreDamInfo />} />
        <Route path="/realtime/:damId" element={<Layout><RealtimeDamStatus /></Layout>} />
        <Route path="/water-usage/:damId" element={<Layout><WaterUsage /></Layout>} />
        <Route path="/safety/:damId" element={<Layout><Safety /></Layout>} />
        <Route path="/sensors/:damId" element={<Layout><SensorManagement /></Layout>} />
        <Route path="/supporting-info/:damId" element={<Layout><SupportingInfo /></Layout>} />
        <Route path="/features/:damId" element={<Features />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/add-data" element={<Layout><AddDataForm /></Layout>} />
        <Route path="/admin-data/:damId" element={<Layout><AdminDataForms /></Layout>} />

        {/* Government Routes */}
        <Route path="/govt-dashboard" element={
          <ProtectedRoute requiredRole="govt">
            <GovtDashboard />
          </ProtectedRoute>
        } />

        {/* 404 Route */}
        <Route path="*" element={<Layout><div className="not-found"><h2>404 - Page Not Found</h2><p>The page you're looking for doesn't exist.</p></div></Layout>} />
      </Routes>
    </SearchProvider>
  );
}

export default App;
