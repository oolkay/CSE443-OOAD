import axios from 'axios';

// Base URL configuration
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
// Create axios instance
const axiosProvider = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10 seconds
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request Interceptor
axiosProvider.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('authToken');

        // If token exists, add it to headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosProvider.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle response errors
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Unauthorized - clear auth data and redirect to login
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('userEmail');

                    // Redirect to login (only if not already on login page)
                    if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
                        window.location.href = '/';
                    }
                    break;

                case 403:
                    // Forbidden
                    alert('You do not have permission to perform this action.');
                    break;

                case 500:
                    // Internal server error
                    alert('A server error occurred. Please try again later.');
                    break;

                case 503:
                    // Service unavailable
                    alert('Service is temporarily unavailable. Please try again later.');
                    break;

                default:
                    // Log only in development
                    if (process.env.NODE_ENV === 'development' && status >= 500) {
                        console.error('Server error:', status, data?.message);
                    }
            }

            // Return a custom error object
            return Promise.reject({
                status,
                message: data?.message || error.message,
                data: data
            });
        } else if (error.request) {
            // Request was made but no response received
            alert('Cannot connect to server. Please check your internet connection.');

            return Promise.reject({
                status: 0,
                message: 'No response from server',
                data: null
            });
        } else {
            // Something else happened
            return Promise.reject({
                status: -1,
                message: error.message,
                data: null
            });
        }
    }
);

// Helper function to set auth token
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('authToken', token);
        axiosProvider.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('authToken');
        delete axiosProvider.defaults.headers.common['Authorization'];
    }
};

// Helper function to clear auth data
export const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('managerId');
    localStorage.removeItem('customerId');
    delete axiosProvider.defaults.headers.common['Authorization'];
};

export default axiosProvider;
export { axiosProvider as axios };

