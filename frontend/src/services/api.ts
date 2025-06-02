import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  async (config) => {
    // You can add auth token here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response) {
      // Handle specific error status codes
      switch (error.response.status) {
        case 401: // Unauthorized
          console.error('Authentication error:', error.response.data);
          // Handle auth errors - redirect to login, etc.
          break;
        
        case 429: // Rate limited
          console.error('Rate limit exceeded:', error.response.data);
          // Handle rate limiting
          break;
          
        case 500: // Server error
          console.error('Server error:', error.response.data);
          // Handle server errors
          break;
          
        default:
          console.error(`API error (${error.response.status}):`, error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
