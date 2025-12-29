import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../contexts/SearchContext';
import '../styles/SearchResults.css';

export default function SearchResults() {
  const navigate = useNavigate();
  const { 
    searchResults, 
    expandedResults, 
    showResults, 
    isSearching, 
    clearSearch, 
    expandResult, 
    goBackToSearch 
  } = useSearch();

  if (!showResults) return null;

  const currentResults = expandedResults.length > 0 ? expandedResults : searchResults;
  const isExpanded = expandedResults.length > 0;

  const handleResultClick = (result) => {
    if (result.action === 'navigate') {
      navigate(result.path);
      clearSearch();
    } else if (result.action === 'expand') {
      expandResult(result);
    }
  };

  return (
    <div className="search-results-overlay" onClick={clearSearch}>
      <div className="search-results-container" onClick={(e) => e.stopPropagation()}>
        <div className="search-results-header">
          <div className="header-content">
            {isExpanded && (
              <button className="back-button" onClick={goBackToSearch}>
                ← Back to search
              </button>
            )}
            <h3>
              {isExpanded 
                ? `${currentResults[0]?.parentType === 'state' ? 'Rivers' : 'Dams'} in ${currentResults[0]?.parentName}`
                : 'Search Results'
              }
            </h3>
          </div>
          <button className="close-search" onClick={clearSearch}>×</button>
        </div>
        
        <div className="search-results-content">
          {isSearching ? (
            <div className="search-loading">
              <div className="loading-spinner"></div>
              <span>Loading...</span>
            </div>
          ) : currentResults.length > 0 ? (
            <div className="results-list">
              {currentResults.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className={`search-result-item ${result.type} ${result.action === 'expand' ? 'expandable' : 'navigable'}`}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="result-icon">
                    {result.type === 'state' && '🏛️'}
                    {result.type === 'river' && '🌊'}
                    {result.type === 'dam' && '🏗️'}
                  </div>
                  <div className="result-content">
                    <div className="result-name">{result.name}</div>
                    <div className="result-description">{result.description}</div>
                  </div>
                  <div className="result-action">
                    {result.action === 'expand' && <span className="expand-icon">▶</span>}
                    {result.action === 'navigate' && (
                      <button className="view-dam-btn">View Dam</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <div className="no-results-text">No results found</div>
              <div className="no-results-suggestion">Try searching for dam names, states, or rivers</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}