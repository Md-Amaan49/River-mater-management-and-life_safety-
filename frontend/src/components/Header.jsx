import React from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">🌊 RWMS</div>
        <nav className="nav">
          <Link to="/home">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>

      <div className="header-right">
        <input type="text" placeholder="Search..." className="search-bar" />
        <div className="profile-icon"><Link to="/profile">👤</Link></div>
      </div>
    </header>
  );
}
