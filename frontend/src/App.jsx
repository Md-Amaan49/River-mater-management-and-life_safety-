import React from "react";
import { Routes, Route } from "react-router-dom";
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
import Alertpage from "./pages/Alertpage";
import Layout from "./components/Layout";
import DamDashboard from "./pages/DamDashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";

function App() {
  return (
    
    <Routes>
      <Route path="/" element={< Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/profile"element={<ProtectedRoute> <Layout><ProfilePage /></Layout> </ProtectedRoute>}/>
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>}/>
      <Route path="/admin/add-data" element={ <Layout><AddDataForm /> </Layout>} />
      <Route path="/core-dam-info/:damId" element={<CoreDamInfo />} />
      <Route path="/realtime/:damId" element={<Layout><RealtimeDamStatus /></Layout>} />
      <Route path="/water-usage/:damId" element={<Layout><WaterUsage /></Layout>} />
      <Route path="/safety/:damId" element={<Layout><Safety /></Layout>} />
      <Route path="/sensors/:damId" element={<Layout><SensorManagement /></Layout>} />
      <Route path="/supporting-info/:damId" element={<Layout><SupportingInfo /></Layout>} />
      <Route path="/features/:damId" element={<Features />} />
      <Route path="/home" element={<Home />} />
      <Route path="*" element={<p>404 Not Found</p>} />
      <Route path="/govt-dashboard" element={<ProtectedRoute requiredRole="govt"><GovtDashboard /></ProtectedRoute>} />
      <Route path="/water-levels" element={<Layout><WaterLevel /></Layout>} />
      <Route path="/alerts" element={<Layout><Alertpage /></Layout>} />
      <Route path="/water-usage" element={<Layout><WaterUsagePage /></Layout>} />
      <Route path="/dam-dashboard/:damId" element={<Layout><DamDashboard /></Layout>} />
      <Route path="/about" element={<Layout><About /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
    </Routes>
    
  );
}

export default App;
