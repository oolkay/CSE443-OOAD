import { axios } from './axiosConfig';

const SUPER_ADMIN_URL = '/api/super-admins';

const superAdminService = {
  getAllSuperAdmins: async () => {
    const response = await axios.get(SUPER_ADMIN_URL);
    return response.data;
  },

  getSuperAdminById: async (id) => {
    const response = await axios.get(`${SUPER_ADMIN_URL}/${id}`);
    return response.data;
  },

  createSuperAdmin: async (superAdminData) => {
    const response = await axios.post(SUPER_ADMIN_URL, superAdminData);
    return response.data;
  },

  updateSuperAdmin: async (id, superAdminData) => {
    const response = await axios.put(`${SUPER_ADMIN_URL}/${id}`, superAdminData);
    return response.data;
  },

  deleteSuperAdmin: async (id) => {
    const response = await axios.delete(`${SUPER_ADMIN_URL}/${id}`);
    return response.data;
  }
};

export default superAdminService;
