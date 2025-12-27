import { axios } from './axiosConfig';

const EMPLOYEE_URL = '/api/employees';

const employeeService = {
    getAllEmployees: async () => {
        const response = await axios.get(EMPLOYEE_URL);
        return response.data;
    },

    getEmployeeById: async (id) => {
        const response = await axios.get(`${EMPLOYEE_URL}/${id}`);
        return response.data;
    },

    createEmployee: async (employeeData) => {
        const response = await axios.post(EMPLOYEE_URL, employeeData);
        return response.data;
    },

    updateEmployee: async (id, employeeData) => {
        const response = await axios.put(`${EMPLOYEE_URL}/${id}`, employeeData);
        return response.data;
    },

    deleteEmployee: async (id, confirm = false) => {
        const response = await axios.delete(`${EMPLOYEE_URL}/${id}?confirm=${confirm}`);
        return response.data;
    },

    getEmployeesByCompany: async (companyId) => {
        const response = await axios.get(`${EMPLOYEE_URL}/company/${companyId}`);
        return response.data;
    },

    getEmployeesByManager: async (managerId) => {
        const response = await axios.get(`${EMPLOYEE_URL}/manager/${managerId}`);
        return response.data;
    }
};

export default employeeService;
