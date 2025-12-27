const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const appointmentService = {
    // Get employee's appointments
    async getEmployeeAppointments(employeeId) {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BASE_URL}/api/appointments/employee/${employeeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch appointments');
        }

        return await response.json();
    },

    // Approve appointment
    async approveAppointment(employeeId, appointmentId) {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BASE_URL}/api/appointments/employee/${employeeId}/approve/${appointmentId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to approve appointment');
        }

        return await response.json();
    },

    // Reject appointment
    async rejectAppointment(employeeId, appointmentId) {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BASE_URL}/api/appointments/employee/${employeeId}/reject/${appointmentId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to reject appointment');
        }

        return await response.json();
    },

    // Update appointment status (COMPLETED, NO_SHOW)
    async updateAppointmentStatus(appointmentId, status) {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BASE_URL}/api/appointments/${appointmentId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update status');
        }

        return await response.json();
    },

    // Get conflicting appointments
    async getConflictingAppointments(employeeId, startTime, endTime) {
        const token = localStorage.getItem('authToken');
        const params = new URLSearchParams({
            startTime: startTime,
            endTime: endTime
        });

        const response = await fetch(`${BASE_URL}/api/appointments/employee/${employeeId}/conflicts?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch conflicting appointments');
        }

        return await response.json();
    }
};

export default appointmentService;
