/**
 * Resource API Service
 * Handles all HTTP requests to the backend Resource endpoints
 */

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/resources`;

/**
 * Get current company ID for the logged-in user
 * Priority: user object (set during login) -> legacy companyId key -> default
 */
const getCurrentCompanyId = () => {
  // 1. Try user object (set during login in authService)
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.companyId) {
        return user.companyId;
      }
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
  }

  // 2. Fallback to legacy 'companyId' key
  const storedCompanyId = localStorage.getItem('companyId');
  if (storedCompanyId) {
    return parseInt(storedCompanyId, 10);
  }

  // 3. Default fallback (should not happen if user is logged in)
  console.warn('No company ID found in localStorage, using default');
  return 1;
};

/**
 * Helper to get headers with Auth token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const resourceService = {
  /**
   * Get all resources for a specific company
   */
  async getResources(companyId) {
    try {
      const url = `${API_BASE_URL}/company/${companyId}`;
      console.log('Fetching resources from:', url);

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  },

  /**
   * Get resource by ID
   */
  async getResourceById(companyId, resourceId) {
    try {
      const response = await fetch(`${API_BASE_URL}/company/${companyId}/${resourceId}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching resource:', error);
      throw error;
    }
  },

  /**
   * Create a new resource
   */
  async createResource(companyId, resourceData) {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...resourceData,
          companyId: companyId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  },

  /**
   * Update an existing resource
   */
  async updateResource(companyId, resourceId, resourceData) {
    try {
      const response = await fetch(`${API_BASE_URL}/company/${companyId}/${resourceId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...resourceData,
          companyId: companyId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  },

  /**
   * Delete a resource
   */
  async deleteResource(companyId, resourceId, confirm = false) {
    try {
      const response = await fetch(`${API_BASE_URL}/company/${companyId}/${resourceId}?confirm=${confirm}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.data = errorData; // Attach data to the error object
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  },

  /**
   * Toggle resource status
   */
  async toggleResourceStatus(companyId, resourceId) {
    try {
      const response = await fetch(`${API_BASE_URL}/company/${companyId}/${resourceId}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling resource status:', error);
      throw error;
    }
  },

  /**
   * Search resources
   */
  async searchResources(companyId, keyword, status = null) {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (status) params.append('status', status);

      const response = await fetch(`${API_BASE_URL}/company/${companyId}/search?${params}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching resources:', error);
      throw error;
    }
  },

  /**
   * Get resources by status
   */
  async getResourcesByStatus(companyId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/company/${companyId}/status/${status}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching resources by status:', error);
      throw error;
    }
  },

  /**
   * Get available resources
   */
  async getAvailableResources(companyId) {
    try {
      const response = await fetch(`${API_BASE_URL}/company/${companyId}/available`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching available resources:', error);
      throw error;
    }
  },

  /**
   * Get resource statistics
   */
  async getResourceStats(companyId) {
    try {
      const response = await fetch(`${API_BASE_URL}/company/${companyId}/stats`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching resource stats:', error);
      throw error;
    }
  },

  /**
   * Get services associated with a resource
   */
  async getResourceServices(companyId, resourceId) {
    try {
      const response = await fetch(`${API_BASE_URL}/company/${companyId}/${resourceId}/services`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching resource services:', error);
      throw error;
    }
  }
};

// Export getCurrentCompanyId for external use
export { getCurrentCompanyId };