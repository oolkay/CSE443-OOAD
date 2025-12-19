const API_BASE_URL = 'http://localhost:8080/api/services';

// Get company ID from localStorage or use default
const getCurrentCompanyId = () => {
  return localStorage.getItem('companyId') || 1;
};

export const serviceService = {
  /**
   * Get all services
   */
  async getServices() {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  /**
   * Get service by ID
   */
  async getServiceById(serviceId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${serviceId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  },

  /**
   * Create new service
   */
  async createService(serviceData) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  /**
   * Update service
   */
  async updateService(serviceId, serviceData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  /**
   * Delete service
   */
  async deleteService(serviceId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${serviceId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  },

  /**
   * Search services by name
   */
  async searchServices(name) {
    try {
      const response = await fetch(`${API_BASE_URL}/search?name=${encodeURIComponent(name)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching services:', error);
      throw error;
    }
  },

  /**
   * Get all available resource types for the company
   * Used for resource types dropdown
   */
  async getResourceTypes() {
    try {
      const companyId = getCurrentCompanyId();
      const response = await fetch(`${API_BASE_URL}/resource-types?companyId=${companyId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching resource types:', error);
      throw error;
    }
  }
};