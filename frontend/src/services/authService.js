/**
 * Authentication API Service
 * Handles all authentication-related API calls to the backend
 */

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api";

// Helper function to get JWT token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Helper function to set JWT token
const setAuthToken = (token) => {
  localStorage.setItem("authToken", token);
};

// Helper function to clear JWT token
const clearAuthToken = () => {
  localStorage.removeItem("authToken");
};

// Helper function to get Authorization header
const getAuthHeader = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store token and user info
      setAuthToken(data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: data.userId,
          email: data.email,
          name: data.name,
          role: data.role,
        })
      );
      return { success: true, data };
    } else {
      return { success: false, error: data.message || "Login failed" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Register new user
 */
export const registerUser = async (name, email, password, phoneNumber = "") => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        phoneNumber,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store token and user info
      setAuthToken(data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: data.userId,
          email: data.email,
          name: data.name,
          role: data.role,
        })
      );
      return { success: true, data };
    } else {
      return { success: false, error: data.message || "Registration failed" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.message || "Request failed" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Validate reset token
 */
export const validateResetToken = async (token) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/validate-reset-token?token=${token}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.message || "Invalid token" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (token, email, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        email,
        newPassword,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.message || "Password reset failed" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Logout user
 */
export const logoutUser = () => {
  clearAuthToken();
  localStorage.removeItem("user");
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Get Auth header for API calls
 */
export const getHeaders = () => {
  return {
    "Content-Type": "application/json",
    ...getAuthHeader(),
  };
};

export default {
  loginUser,
  registerUser,
  requestPasswordReset,
  validateResetToken,
  resetPassword,
  logoutUser,
  getCurrentUser,
  isAuthenticated,
  getHeaders,
};
