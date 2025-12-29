import React from "react";
import { Link } from "react-router-dom";
import { useSearch } from "../contexts/SearchContext";
import SearchResults from "./SearchResults";
import "../styles/Header.css";

export default function Header() {
  const { searchTerm, setSearchTerm, showResults } = useSearch();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchTerm('');
    }
  };

  return (
    <>
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
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search dams, states, rivers..." 
              className="search-bar"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
            {searchTerm && (
              <button 
                className="search-clear"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <div className="profile-icon"><Link to="/profile">👤</Link></div>
        </div>
      </header>
      
      {showResults && <SearchResults />}
    </>
  );
}
