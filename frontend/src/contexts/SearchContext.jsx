import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

const BASE_API = "http://localhost:5000/api";
const DATA_API = `${BASE_API}/data`;

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [expandedResults, setExpandedResults] = useState([]); // For hierarchical results

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        performSearch(searchTerm.trim());
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const performSearch = async (query) => {
    setIsSearching(true);
    try {
      // Use the global search endpoint
      const response = await axios.get(`${DATA_API}/search/global?q=${encodeURIComponent(query)}`);
      const { states = [], rivers = [], dams = [] } = response.data;

      const results = [];

      // Process states - show rivers when clicked
      states.forEach(state => {
        results.push({
          type: 'state',
          id: state._id,
          name: state.name,
          description: `State: ${state.name} - Click to see rivers`,
          action: 'expand',
          expandType: 'rivers',
          stateId: state._id,
          stateName: state.name
        });
      });

      // Process rivers - show dams when clicked
      rivers.forEach(river => {
        results.push({
          type: 'river',
          id: river._id,
          name: river.name,
          description: `River: ${river.name}${river.state?.name ? ` (${river.state.name})` : ''} - Click to see dams`,
          action: 'expand',
          expandType: 'dams',
          riverId: river._id,
          riverName: river.name,
          stateName: river.state?.name || ''
        });
      });

      // Process dams - direct navigation
      dams.forEach(dam => {
        results.push({
          type: 'dam',
          id: dam._id,
          name: dam.name,
          description: `Dam: ${dam.name}${dam.state ? ` (${dam.state})` : ''}`,
          action: 'navigate',
          path: `/dam-dashboard/${dam._id}`
        });
      });

      setSearchResults(results.slice(0, 10)); // Limit to 10 results
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      
      // Fallback to basic state search if global search fails
      try {
        const statesRes = await axios.get(`${DATA_API}/states`);
        const states = statesRes.data || [];
        const matchingStates = states.filter(state => 
          state.name.toLowerCase().includes(query.toLowerCase())
        );
        
        const fallbackResults = matchingStates.map(state => ({
          type: 'state',
          id: state._id,
          name: state.name,
          description: `State: ${state.name} - Click to see rivers`,
          action: 'expand',
          expandType: 'rivers',
          stateId: state._id,
          stateName: state.name
        }));
        
        setSearchResults(fallbackResults.slice(0, 5));
        setShowResults(true);
      } catch (fallbackError) {
        console.error('Fallback search error:', fallbackError);
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Function to expand results (show rivers for state, dams for river)
  const expandResult = async (result) => {
    setIsSearching(true);
    try {
      if (result.expandType === 'rivers') {
        // Fetch rivers for the state
        const response = await axios.get(`${DATA_API}/rivers/${result.stateId}`);
        const rivers = response.data || [];
        
        const riverResults = rivers.map(river => ({
          type: 'river',
          id: river._id,
          name: river.name,
          description: `River: ${river.name} (${result.stateName}) - Click to see dams`,
          action: 'expand',
          expandType: 'dams',
          riverId: river._id,
          riverName: river.name,
          stateName: result.stateName,
          parentType: 'state',
          parentName: result.stateName
        }));
        
        setExpandedResults(riverResults);
        setShowResults(true);
        
      } else if (result.expandType === 'dams') {
        // Fetch dams for the river
        const response = await axios.get(`${DATA_API}/dams/${result.riverId}`);
        const dams = response.data || [];
        
        const damResults = dams.map(dam => {
          const damData = dam.dam || dam; // Handle both formats
          return {
            type: 'dam',
            id: damData._id,
            name: damData.name,
            description: `Dam: ${damData.name} (${result.riverName}, ${result.stateName})`,
            action: 'navigate',
            path: `/dam-dashboard/${damData._id}`,
            parentType: 'river',
            parentName: result.riverName
          };
        });
        
        setExpandedResults(damResults);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error expanding result:', error);
      setExpandedResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Function to go back to search results
  const goBackToSearch = () => {
    setExpandedResults([]);
    setShowResults(true);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setExpandedResults([]);
    setShowResults(false);
  };

  const value = {
    searchTerm,
    setSearchTerm,
    searchResults,
    expandedResults,
    isSearching,
    showResults,
    setShowResults,
    clearSearch,
    expandResult,
    goBackToSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};