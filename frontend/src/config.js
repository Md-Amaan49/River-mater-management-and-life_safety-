// API Configuration
// Use environment variable if available, otherwise use production server
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://river-water-management-and-life-safety.onrender.com';

export default API_BASE_URL;
