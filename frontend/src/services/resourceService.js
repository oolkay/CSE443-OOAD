/**
 * Resource API Service
 * Handles all HTTP requests to the backend Resource endpoints
 */

const API_BASE_URL = 'http://localhost:8080/api/resources';

/**
 * Get current company ID for the logged-in user
 * TODO: This should come from authentication context/token in the future
 * For now, using localStorage or a configurable default
 */
const getCurrentCompanyId = () => {
  // Try to get from localStorage first (set by login/auth)
  const storedCompanyId = localStorage.getItem('companyId');
  if (storedCompanyId) {
    return parseInt(storedCompanyId, 10);
  }

  // Fallback to default for development
  // In production, this should be handled by proper authentication
  const defaultCompanyId = 1;
  console.warn('No company ID found in localStorage, using default:', defaultCompanyId);

  // Set the default for future use
  localStorage.setItem('companyId', defaultCompanyId.toString());
  return defaultCompanyId;
};

/**
 * Set current company ID (called after login/company selection)
 */
export const setCurrentCompanyId = (companyId) => {
  localStorage.setItem('companyId', companyId.toString());
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

      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log('Resources data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching resources:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      throw error;
    }
  },

  /**
   * Get resource by ID
   */
  async getResourceById(resourceId) {
    try {
      const companyId = getCurrentCompanyId();
      const response = await fetch(`${API_BASE_URL}/company/${companyId}/${resourceId}`);
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
   * Create a new resource for the current user's company
   */
  async createResource(resourceData) {
    try {
      const companyId = getCurrentCompanyId();
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
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
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return true; // Successful delete
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  },

  /**
   * Toggle resource status (Quick toggle for frontend)
   * Changes between AVAILABLE and OUT_OF_SERVICE
   */
  async toggleResourceStatus(resourceId) {
    try {
      const companyId = getCurrentCompanyId();
      const response = await fetch(`${API_BASE_URL}/company/${companyId}/${resourceId}/toggle`, {
        method: 'PATCH'
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
   * Search resources with optional status filter
   */
  async searchResources(keyword, status = null) {
    try {
      const companyId = getCurrentCompanyId();
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (status) params.append('status', status);

      const response = await fetch(`${API_BASE_URL}/company/${companyId}/search?${params}`);
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
      const response = await fetch(`${API_BASE_URL}/company/${companyId}/status/${status}`);
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
   * Get available resources (for scheduling)
   */
  async getAvailableResources() {
    try {
      const companyId = getCurrentCompanyId();
      const response = await fetch(`${API_BASE_URL}/company/${companyId}/available`);
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
      const response = await fetch(`${API_BASE_URL}/company/${companyId}/stats`);
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
   * Get all unique resource types for the company
   * Used for type dropdown/autocomplete
   */
  async getResourceTypes() {
    try {
      const companyId = getCurrentCompanyId();
      const response = await fetch(`${API_BASE_URL}/company/${companyId}/types`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching resource types:', error);
      throw error;
    }
  },

  /**
   * Get resources by type
   */
  async getResourcesByType(type) {
    try {
      const companyId = getCurrentCompanyId();
      const response = await fetch(`${API_BASE_URL}/company/${companyId}/type/${encodeURIComponent(type)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching resources by type:', error);
      throw error;
    }
  }
};