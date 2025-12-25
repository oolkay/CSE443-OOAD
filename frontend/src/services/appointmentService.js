import { axios } from './axiosConfig';

const APPOINTMENT_URL = '/api/appointments';

const appointmentService = {
    createAppointment: async (appointmentData) => {
        const response = await axios.post(APPOINTMENT_URL, appointmentData);
        return response.data;
    },

    getEmployeeAvailability: async (employeeId, date, serviceDuration) => {
        const response = await axios.get(`${APPOINTMENT_URL}/availability/employee/${employeeId}`, {
            params: { date, serviceDuration }
        });
        return response.data;
    },

    getCustomerAppointments: async (customerId) => {
        const response = await axios.get(`${APPOINTMENT_URL}/customer/${customerId}`);
        return response.data;
    }
};

export default appointmentService;
