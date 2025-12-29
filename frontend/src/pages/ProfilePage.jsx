import React, { useEffect, useState } from "react";
import "../styles/ProfilePage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEdit,
  FaBell,
  FaLock,
  FaCogs,
  FaSignOutAlt,
  FaDatabase,
  FaHistory,
  FaGlobe,
  FaPaintBrush,
  FaShieldAlt,
  FaBuilding,
} from "react-icons/fa";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState({
    savedDams: 0,
    alertsSubscribed: 0,
    recentActivity: 0,
    customAlerts: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return; // not logged in
      }

      const res = await axios.get("https://river-water-management-and-life-safety.onrender.com/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // res.data.user comes from backend
      setUser(res.data.user || res.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get("https://river-water-management-and-life-safety.onrender.com/api/users/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setUserStats(res.data.stats);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
      // Keep default values if error occurs
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  const handleAdminPanel = () => {
    navigate("/admin/add-data");
  };

  const handleGovtPanel = () => {
    navigate("/govt-dashboard");
  };

  useEffect(() => {
    fetchProfile();
    fetchUserStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  // 🔹 Not logged in → show login/signup
  if (!user) {
    return (
      <div className="profile-page not-logged-in">
        <h2>Please Login or Create an Account</h2>
        <div className="auth-buttons">
          <button className="btn login-btn" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="btn signup-btn" onClick={() => navigate("/register")}>
            Create Account
          </button>
        </div>
      </div>
    );
  }

  // 🔹 Logged in → show profile
  return (
    <div className="profile-page">
      {/* Top Profile Info */}
      <div className="profile-header">
          <img 
            src={`https://river-water-management-and-life-safety.onrender.com${user.profileImage}`} 
            alt="Profile" 
            style={{ width: "100px", height: "100px", borderRadius: "50%" }} 
          />
        <div className="profile-details">
          <h2>{user.name}</h2>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <p>Phone: {user.mobile}</p>
          <p>Location: {user.place}</p>
          <p>State: {user.state}</p>
        </div>
        <button className="edit-profile-btn" onClick={handleEditProfile}>
          <FaEdit /> Edit Profile
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card clickable" onClick={() => navigate('/water-levels')}>
          <FaDatabase className="card-icon" />
          <h3>Dams Saved</h3>
          <p>{userStats.savedDams}</p>
        </div>
        <div className="card clickable" onClick={() => navigate('/alerts')}>
          <FaBell className="card-icon" />
          <h3>Alerts Subscribed</h3>
          <p>{userStats.alertsSubscribed}</p>
        </div>
        <div className="card clickable">
          <FaHistory className="card-icon" />
          <h3>Recent Activity</h3>
          <p>{userStats.recentActivity} Events</p>
        </div>
        <div className="card clickable">
          <FaCogs className="card-icon" />
          <h3>Custom Alerts Set</h3>
          <p>{userStats.customAlerts}</p>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="settings-panel">
        <div className="settings-column">
          <div className="setting-item clickable" onClick={() => navigate('/water-levels')}>
            <FaDatabase /> My Saved Dams
          </div>
          <div className="setting-item clickable" onClick={() => navigate('/alerts')}>
            <FaCogs /> Custom Alert Settings
          </div>
          <div className="setting-item clickable">
            <FaHistory /> Activity History
          </div>
          <div className="setting-item clickable">
            <FaLock /> Security Settings
          </div>

          {/* Role-specific buttons */}
          {user.role === "admin" && (
            <div
              className="setting-item clickable highlight"
              onClick={handleAdminPanel}
            >
              <FaShieldAlt /> Admin Panel
            </div>
          )}
          {user.role === "govt" && (
            <div
              className="setting-item clickable highlight"
              onClick={handleGovtPanel}
            >
              <FaBuilding /> Govt Official Panel
            </div>
          )}

          <div className="setting-item clickable">
            <FaPaintBrush /> Appearance
          </div>
          <div className="setting-item clickable">
            <FaBell /> Notifications
          </div>
        </div>

        <div className="settings-column">
          <div className="setting-item clickable" onClick={handleEditProfile}>
            <FaUser /> Account
          </div>
          <div className="setting-item clickable">
            <FaPaintBrush /> Appearance
          </div>
          <div className="setting-item clickable">
            <FaBell /> Notifications
          </div>
          <div className="setting-item clickable">
            <FaGlobe /> Language
          </div>
          <div className="setting-item clickable logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
