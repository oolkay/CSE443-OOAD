import { axios } from './axiosConfig';

const MANAGER_URL = '/api/managers';

const managerService = {
//   getAllManagers: async () => {
//     const response = await axios.get(MANAGER_URL);
//     return response.data;
//   },

//   getManagerById: async (id) => {
//     const response = await axios.get(`${MANAGER_URL}/${id}`);
//     return response.data;
//   },

//   createManager: async (managerData) => {
//     const response = await axios.post(MANAGER_URL, managerData);
//     return response.data;
//   },    

  updateManager: async (id, managerData) => {
    const response = await axios.put(`${MANAGER_URL}/${id}`, managerData);
    return response.data;
  },

//   deleteManager: async (id) => {
//     const response = await axios.delete(`${MANAGER_URL}/${id}`);
//     return response.data;
//   },

//   getManagersByCompany: async (companyId) => {
//     const response = await axios.get(`${MANAGER_URL}/company/${companyId}`);
//     return response.data;
//   }
};

export default managerService;

