// API Configuration
// Use local server for development, deployed server for production
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE_URL;
