import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = () => {
    if (!email.trim()) {
      setErr("Email is required");
      return false;
    }
    
    if (!validateEmail(email)) {
      setErr("Please enter a valid email address");
      return false;
    }
    
    if (!password.trim()) {
      setErr("Password is required");
      return false;
    }
    
    if (password.length < 6) {
      setErr("Password must be at least 6 characters long");
      return false;
    }
    
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/users/login", {
        email: email.trim(),
        password,
      });

      localStorage.setItem("token", res.data.token);
      if (res.data.refreshToken) {
        localStorage.setItem("refreshToken", res.data.refreshToken);
      }
      
      const user = res.data.user;

      // Navigate based on role
      if (user.role === "admin") {
        navigate("/profile");
      } else if (user.role === "govt") {
        navigate("/profile");
      } else {
        navigate("/profile");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErr(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        {err && <p className="error">{err}</p>}
        
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (err) setErr(""); // Clear error when user starts typing
            }}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (err) setErr(""); // Clear error when user starts typing
            }}
            required
            disabled={loading}
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        
        <p>
          Don't have an account? <a href="/register">Register</a>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
