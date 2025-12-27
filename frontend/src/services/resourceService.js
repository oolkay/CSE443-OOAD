/**
 * Resource API Service
 * Handles all HTTP requests to the backend Resource endpoints
 */

const API_BASE_URL = 'http://localhost:8080/api/resources';

/**
 * Get current company ID for the logged-in user
 */
const getCurrentCompanyId = () => {
  const storedCompanyId = localStorage.getItem('companyId');
  if (storedCompanyId) {
    return parseInt(storedCompanyId, 10);
  }
  const defaultCompanyId = 1;
  localStorage.setItem('companyId', defaultCompanyId.toString());
  return defaultCompanyId;
};

export const setCurrentCompanyId = (companyId) => {
  localStorage.setItem('companyId', companyId.toString());
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
   * Get all resources for the current user's company
   */
  async getResources() {
    try {
      const companyId = getCurrentCompanyId();
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
  async getResourceById(resourceId) {
    try {
      const companyId = getCurrentCompanyId();
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
  async createResource(resourceData) {
    try {
      const companyId = getCurrentCompanyId();
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
  async updateResource(resourceId, resourceData) {
    try {
      const companyId = getCurrentCompanyId();
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
  async deleteResource(resourceId) {
    try {
      const companyId = getCurrentCompanyId();
      const response = await fetch(`${API_BASE_URL}/company/${companyId}/${resourceId}`, {
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
  async toggleResourceStatus(resourceId) {
    try {
      const companyId = getCurrentCompanyId();
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
  async searchResources(keyword, status = null) {
    try {
      const companyId = getCurrentCompanyId();
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
  async getResourcesByStatus(status) {
    try {
      const companyId = getCurrentCompanyId();
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
  async getAvailableResources() {
    try {
      const companyId = getCurrentCompanyId();
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
  async getResourceStats() {
    try {
      const companyId = getCurrentCompanyId();
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
  }
};