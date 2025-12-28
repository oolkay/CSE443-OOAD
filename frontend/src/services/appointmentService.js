import { axios } from './axiosConfig';

const APPOINTMENT_URL = '/api/appointments';

const appointmentService = {
    createAppointment: async (appointmentData) => {
        const response = await axios.post(APPOINTMENT_URL, appointmentData);
        return response.data;
    },

    getServiceAppointments: async (serviceId) => {
        const response = await axios.get(`${APPOINTMENT_URL}/service/${serviceId}`);
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
    },

    getEmployeeAppointments: async (employeeId) => {
        const response = await axios.get(`${APPOINTMENT_URL}/employee/${employeeId}`);
        return response.data;
    },

    getResourceAppointments: async (resourceId) => {
        const response = await axios.get(`${APPOINTMENT_URL}/resource/${resourceId}`);
        return response.data;
    },

    // Approve appointment
    approveAppointment: async (employeeId, appointmentId) => {
        const response = await axios.put(`${APPOINTMENT_URL}/employee/${employeeId}/approve/${appointmentId}`);
        return response.data;
    },

    // Reject appointment
    rejectAppointment: async (employeeId, appointmentId) => {
        const response = await axios.put(`${APPOINTMENT_URL}/employee/${employeeId}/reject/${appointmentId}`);
        return response.data;
    },

    // Get conflicting appointments
    getConflictingAppointments: async (employeeId, startTime, endTime) => {
        const response = await axios.get(`${APPOINTMENT_URL}/employee/${employeeId}/conflicts`, {
            params: {
                startTime: startTime,
                endTime: endTime
            }
        });
        return response.data;
    }
};

export default appointmentService;
