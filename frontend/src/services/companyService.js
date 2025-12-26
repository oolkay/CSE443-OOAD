import { axios } from './axiosConfig';

const COMPANY_URL = '/api/companies';

const companyService = {
  getAllCompanies: async () => {
    const response = await axios.get(COMPANY_URL);
    return response.data;
  },

  getCompanyById: async (id) => {
    const response = await axios.get(`${COMPANY_URL}/${id}`);
    return response.data;
  },

  createCompany: async (companyData) => {
    const response = await axios.post(COMPANY_URL, companyData);
    return response.data;
  },

  updateCompany: async (id, companyData) => {
    const response = await axios.put(`${COMPANY_URL}/${id}`, companyData);
    return response.data;
  },

  deleteCompany: async (id) => {
    const response = await axios.delete(`${COMPANY_URL}/${id}`);
    return response.data;
  }
};

export default companyService;
