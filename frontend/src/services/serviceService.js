import { axios } from './axiosConfig';

const SERVICE_URL = '/api/services';

const serviceService = {
    getAllServices: async () => {
        const response = await axios.get(SERVICE_URL);
        return response.data;
    },

    getServiceById: async (id) => {
        const response = await axios.get(`${SERVICE_URL}/${id}`);
        return response.data;
    },

    createService: async (serviceData) => {
        const response = await axios.post(SERVICE_URL, serviceData);
        return response.data;
    },

    updateService: async (id, serviceData) => {
        const response = await axios.put(`${SERVICE_URL}/${id}`, serviceData);
        return response.data;
    },

    deleteService: async (id) => {
        const response = await axios.delete(`${SERVICE_URL}/${id}`);
        return response.data;
    },

    searchServices: async (name) => {
        const response = await axios.get(`${SERVICE_URL}/search`, {
            params: { name }
        });
        return response.data;
    },

    getServicesByCompany: async (companyId) => {
        const response = await axios.get(`${SERVICE_URL}/company/${companyId}`);
        return response.data;
    }
};

export default serviceService;
