import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, CheckCircle, XCircle, AlertTriangle, Filter } from "lucide-react";
import "./AppointmentManagement.css";

// Mock data - replace with API calls
const mockAppointments = [
  {
    appointmentId: 1,
    customerName: "Ayşe Yılmaz",
    customerEmail: "ayse@example.com",
    employeeName: "Mehmet Demir",
    serviceName: "Haircut",
    serviceDuration: 60,
    startTime: "2025-12-10T10:00:00",
    endTime: "2025-12-10T11:00:00",
    status: "PENDING",
    createdAt: "2025-12-05T14:30:00",
  },
  {
    appointmentId: 2,
    customerName: "Zeynep Kaya",
    customerEmail: "zeynep@example.com",
    employeeName: "Mehmet Demir",
    serviceName: "Manicure",
    serviceDuration: 45,
    startTime: "2025-12-10T10:30:00",
    endTime: "2025-12-10T11:15:00",
    status: "PENDING",
    createdAt: "2025-12-05T15:00:00",
  },
  {
    appointmentId: 3,
    customerName: "Can Özkan",
    customerEmail: "can@example.com",
    employeeName: "Mehmet Demir",
    serviceName: "Beard Shaving",
    serviceDuration: 30,
    startTime: "2025-12-10T10:15:00",
    endTime: "2025-12-10T10:45:00",
    status: "PENDING",
    createdAt: "2025-12-05T16:00:00",
  },
  {
    appointmentId: 4,
    customerName: "Elif Aksoy",
    customerEmail: "elif@example.com",
    employeeName: "Fatma Şahin",
    serviceName: "Massage",
    serviceDuration: 90,
    startTime: "2025-12-11T14:00:00",
    endTime: "2025-12-11T15:30:00",
    status: "PENDING",
    createdAt: "2025-12-04T10:00:00",
  },
  {
    appointmentId: 5,
    customerName: "Burak Yıldız",
    customerEmail: "burak@example.com",
    employeeName: "Fatma Şahin",
    serviceName: "Skincare",
    serviceDuration: 60,
    startTime: "2025-12-11T14:30:00",
    endTime: "2025-12-11T15:30:00",
    status: "PENDING",
    createdAt: "2025-12-04T11:00:00",
  },
  {
    appointmentId: 6,
    customerName: "Selin Kara",
    customerEmail: "selin@example.com",
    employeeName: "Fatma Şahin",
    serviceName: "Hair Coloring",
    serviceDuration: 120,
    startTime: "2025-12-11T14:00:00",
    endTime: "2025-12-11T16:00:00",
    status: "PENDING",
    createdAt: "2025-12-04T12:00:00",
  },
  {
    appointmentId: 7,
    customerName: "Ali Veli",
    customerEmail: "ali@example.com",
    employeeName: "Ahmet Yılmaz",
    serviceName: "Massage",
    serviceDuration: 90,
    startTime: "2025-12-12T09:00:00",
    endTime: "2025-12-12T10:30:00",
    status: "APPROVED",
    createdAt: "2025-12-03T10:00:00",
  },
  {
    appointmentId: 8,
    customerName: "Deniz Acar",
    customerEmail: "deniz@example.com",
    employeeName: "Ahmet Yılmaz",
    serviceName: "Skincare",
    serviceDuration: 75,
    startTime: "2025-12-12T09:30:00",
    endTime: "2025-12-12T10:45:00",
    status: "PENDING",
    createdAt: "2025-12-03T11:00:00",
  },
  {
    appointmentId: 9,
    customerName: "Emre Demir",
    customerEmail: "emre@example.com",
    employeeName: "Ahmet Yılmaz",
    serviceName: "Haircut",
    serviceDuration: 45,
    startTime: "2025-12-12T09:45:00",
    endTime: "2025-12-12T10:30:00",
    status: "PENDING",
    createdAt: "2025-12-03T12:00:00",
  },
];

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [filteredAppointments, setFilteredAppointments] = useState(mockAppointments);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedEmployee, setSelectedEmployee] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState("");
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictingAppointments, setConflictingAppointments] = useState([]);
  const [selectedConflictToApprove, setSelectedConflictToApprove] = useState(null);
  const [appointmentToApprove, setAppointmentToApprove] = useState(null);

  // Get unique employees from appointments
  const employees = [...new Set(appointments.map(a => a.employeeName))];

  // Filter appointments based on selected filters
  useEffect(() => {
    let filtered = appointments;

    if (selectedStatus !== "ALL") {
      filtered = filtered.filter(a => a.status === selectedStatus);
    }

    if (selectedEmployee !== "ALL") {
      filtered = filtered.filter(a => a.employeeName === selectedEmployee);
    }

    if (selectedDate) {
      filtered = filtered.filter(a => 
        new Date(a.startTime).toISOString().split('T')[0] === selectedDate
      );
    }

    setFilteredAppointments(filtered);
  }, [selectedStatus, selectedEmployee, selectedDate, appointments]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Check for conflicts - checks time overlap
  const checkConflicts = async (appointmentId, employeeName, startTime, endTime) => {
    // TODO: API call to get conflicting appointments
    // const response = await fetch(
    //   `/api/appointments/manager/${managerId}/conflicts?employeeId=${employeeId}&startTime=${startTime}&endTime=${endTime}`
    // );
    // const conflicts = await response.json();
    
    // Mock conflicts for demo - find all appointments with time overlap
    const appointmentStart = new Date(startTime);
    const appointmentEnd = new Date(endTime);
    
    const conflicts = appointments.filter(a => {
      if (a.appointmentId === appointmentId) return false; // Don't include itself
      if (a.employeeName !== employeeName) return false; // Only same employee
      if (a.status !== "PENDING") return false; // Only pending appointments
      
      const aStart = new Date(a.startTime);
      const aEnd = new Date(a.endTime);
      
      // Check if times overlap
      return (appointmentStart < aEnd && appointmentEnd > aStart);
    });
    
    return conflicts;
  };

  // Approve appointment
  const handleApprove = async (appointmentId) => {
    const appointment = appointments.find(a => a.appointmentId === appointmentId);
    
    // Check for conflicts first
    const conflicts = await checkConflicts(
      appointment.appointmentId,
      appointment.employeeName,
      appointment.startTime,
      appointment.endTime
    );

    if (conflicts.length > 0) {
      // Show conflict modal
      setAppointmentToApprove(appointment);
      setConflictingAppointments(conflicts);
      setConflictModalOpen(true);
    } else {
      // No conflicts, approve directly
      approveAppointment(appointmentId, []);
    }
  };

  // Approve appointment and reject conflicts
  const approveAppointment = (appointmentId, conflictsToReject) => {
    // TODO: API call to approve
    // const response = await fetch(
    //   `/api/appointments/manager/${managerId}/approve/${appointmentId}`,
    //   { method: 'PUT' }
    // );
    
    // Update local state
    setAppointments(prev => 
      prev.map(a => {
        if (a.appointmentId === appointmentId) {
          return { ...a, status: "APPROVED" };
        }
        // Reject conflicting appointments
        if (conflictsToReject.includes(a.appointmentId)) {
          return { ...a, status: "REJECTED" };
        }
        return a;
      })
    );
    
    setConflictModalOpen(false);
    setAppointmentToApprove(null);
    setConflictingAppointments([]);
    setSelectedConflictToApprove(null);
  };

  // Handle conflict modal selection
  const handleConflictModalApprove = () => {
    if (!appointmentToApprove) return;

    if (selectedConflictToApprove === 'reject-all') {
      // Reject all conflicts
      const conflictIds = conflictingAppointments.map(c => c.appointmentId);
      approveAppointment(appointmentToApprove.appointmentId, conflictIds);
    } else if (selectedConflictToApprove) {
      // Approve selected conflict instead
      const conflictIds = conflictingAppointments
        .filter(c => c.appointmentId !== selectedConflictToApprove)
        .map(c => c.appointmentId);
      conflictIds.push(appointmentToApprove.appointmentId); // Also reject the original
      approveAppointment(selectedConflictToApprove, conflictIds);
    }
  };

  // Reject appointment
  const handleReject = async (appointmentId) => {
    if (window.confirm("Bu randevuyu reddetmek istediğinizden emin misiniz?")) {
      // TODO: API call to reject
      // const response = await fetch(
      //   `/api/appointments/manager/${managerId}/reject/${appointmentId}`,
      //   { method: 'PUT' }
      // );
      
      // Update local state
      setAppointments(prev =>
        prev.map(a =>
          a.appointmentId === appointmentId
            ? { ...a, status: "REJECTED" }
            : a
        )
      );
      
      alert("Randevu reddedildi!");
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: "Beklemede", className: "status-pending", icon: Clock },
      APPROVED: { label: "Onaylandı", className: "status-approved", icon: CheckCircle },
      REJECTED: { label: "Reddedildi", className: "status-rejected", icon: XCircle },
      CONFIRMED: { label: "Onaylandı", className: "status-approved", icon: CheckCircle },
      CANCELLED: { label: "İptal Edildi", className: "status-cancelled", icon: XCircle },
      COMPLETED: { label: "Tamamlandı", className: "status-completed", icon: CheckCircle },
      NO_SHOW: { label: "Gelmedi", className: "status-no-show", icon: AlertTriangle },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const IconComponent = config.icon;

    return (
      <span className={`status-badge ${config.className}`}>
        <IconComponent size={14} />
        {config.label}
      </span>
    );
  };

  // Statistics
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === "PENDING").length,
    approved: appointments.filter(a => a.status === "APPROVED").length,
    rejected: appointments.filter(a => a.status === "REJECTED").length,
  };

  return (
    <div className="appointment-management">
      <div className="am-header">
        <h1>Randevu Yönetimi</h1>
        <p>Şirket randevularını görüntüleyin, onaylayın veya reddedin</p>
      </div>

      {/* Statistics Cards */}
      <div className="am-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Toplam Randevu</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Bekleyen</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon approved">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.approved}</div>
            <div className="stat-label">Onaylanan</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rejected">
            <XCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.rejected}</div>
            <div className="stat-label">Reddedilen</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="am-filters">
        <div className="filter-group">
          <Filter size={18} />
          <span>Filtrele:</span>
        </div>

        <select 
          value={selectedStatus} 
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="filter-select"
        >
          <option value="ALL">Tüm Durumlar</option>
          <option value="PENDING">Beklemede</option>
          <option value="APPROVED">Onaylanan</option>
          <option value="REJECTED">Reddedilen</option>
          <option value="CANCELLED">İptal Edilen</option>
          <option value="COMPLETED">Tamamlanan</option>
        </select>

        <select 
          value={selectedEmployee} 
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="filter-select"
        >
          <option value="ALL">Tüm Çalışanlar</option>
          {employees.map(emp => (
            <option key={emp} value={emp}>{emp}</option>
          ))}
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="filter-date"
        />

        {(selectedStatus !== "ALL" || selectedEmployee !== "ALL" || selectedDate) && (
          <button 
            onClick={() => {
              setSelectedStatus("ALL");
              setSelectedEmployee("ALL");
              setSelectedDate("");
            }}
            className="clear-filters"
          >
            Filtreleri Temizle
          </button>
        )}
      </div>

      {/* Appointments List */}
      <div className="am-list">
        {filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle size={48} />
            <p>Randevu bulunamadı</p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div key={appointment.appointmentId} className="appointment-card">
              <div className="appointment-header">
                <div className="appointment-customer">
                  <User size={20} />
                  <div>
                    <div className="customer-name">{appointment.customerName}</div>
                    <div className="customer-email">{appointment.customerEmail}</div>
                  </div>
                </div>
                {getStatusBadge(appointment.status)}
              </div>

              <div className="appointment-details">
                <div className="detail-row">
                  <span className="detail-label">Hizmet:</span>
                  <span className="detail-value">{appointment.serviceName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Çalışan:</span>
                  <span className="detail-value">{appointment.employeeName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tarih:</span>
                  <span className="detail-value">{formatDate(appointment.startTime)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Saat:</span>
                  <span className="detail-value">
                    {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Süre:</span>
                  <span className="detail-value">{appointment.serviceDuration} dakika</span>
                </div>
              </div>

              {appointment.status === "PENDING" && (
                <div className="appointment-actions">
                  <button
                    onClick={() => handleApprove(appointment.appointmentId)}
                    className="action-btn approve-btn"
                  >
                    <CheckCircle size={18} />
                    Onayla
                  </button>
                  <button
                    onClick={() => handleReject(appointment.appointmentId)}
                    className="action-btn reject-btn"
                  >
                    <XCircle size={18} />
                    Reddet
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Conflict Modal */}
      {conflictModalOpen && appointmentToApprove && (
        <div className="modal-overlay" onClick={() => setConflictModalOpen(false)}>
          <div className="modal-content conflict-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <AlertTriangle size={28} color="#ff9800" />
              <h3>Çakışan Randevular Bulundu!</h3>
            </div>
            
            <div className="modal-body">
              <div className="conflict-info">
                <p className="conflict-warning">
                  <strong>{appointmentToApprove.customerName}</strong> adlı müşterinin randevusu ile 
                  <strong> {conflictingAppointments.length} adet</strong> randevu çakışmaktadır.
                </p>
                <p className="conflict-instruction">
                  Onaylamak istediğiniz randevuyu seçin. Seçilmeyen randevular otomatik olarak reddedilecektir.
                </p>
              </div>

              <div className="conflict-appointments">
                {/* Original appointment to approve */}
                <div 
                  className={`conflict-card original ${selectedConflictToApprove === 'reject-all' ? 'selected' : ''}`}
                  onClick={() => setSelectedConflictToApprove('reject-all')}
                >
                  <div className="conflict-card-header">
                    <input 
                      type="radio" 
                      name="conflict-choice" 
                      checked={selectedConflictToApprove === 'reject-all'}
                      onChange={() => setSelectedConflictToApprove('reject-all')}
                    />
                    <span className="badge-original">Orijinal Randevu</span>
                  </div>
                  <div className="conflict-card-body">
                    <div className="conflict-customer">
                      <User size={18} />
                      <div>
                        <div className="customer-name">{appointmentToApprove.customerName}</div>
                        <div className="customer-email">{appointmentToApprove.customerEmail}</div>
                      </div>
                    </div>
                    <div className="conflict-details">
                      <div className="detail-item">
                        <Calendar size={16} />
                        <span>{formatDate(appointmentToApprove.startTime)}</span>
                      </div>
                      <div className="detail-item">
                        <Clock size={16} />
                        <span>{formatTime(appointmentToApprove.startTime)} - {formatTime(appointmentToApprove.endTime)}</span>
                      </div>
                      <div className="detail-item">
                        <strong>{appointmentToApprove.serviceName}</strong>
                        <span>({appointmentToApprove.serviceDuration} dk)</span>
                      </div>
                    </div>
                    <div className="conflict-created">
                      Oluşturulma: {formatDate(appointmentToApprove.createdAt)} {formatTime(appointmentToApprove.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Conflicting appointments */}
                {conflictingAppointments.map((conflict) => (
                  <div 
                    key={conflict.appointmentId}
                    className={`conflict-card ${selectedConflictToApprove === conflict.appointmentId ? 'selected' : ''}`}
                    onClick={() => setSelectedConflictToApprove(conflict.appointmentId)}
                  >
                    <div className="conflict-card-header">
                      <input 
                        type="radio" 
                        name="conflict-choice" 
                        checked={selectedConflictToApprove === conflict.appointmentId}
                        onChange={() => setSelectedConflictToApprove(conflict.appointmentId)}
                      />
                      <span className="badge-conflict">Çakışan Randevu</span>
                    </div>
                    <div className="conflict-card-body">
                      <div className="conflict-customer">
                        <User size={18} />
                        <div>
                          <div className="customer-name">{conflict.customerName}</div>
                          <div className="customer-email">{conflict.customerEmail}</div>
                        </div>
                      </div>
                      <div className="conflict-details">
                        <div className="detail-item">
                          <Calendar size={16} />
                          <span>{formatDate(conflict.startTime)}</span>
                        </div>
                        <div className="detail-item">
                          <Clock size={16} />
                          <span>{formatTime(conflict.startTime)} - {formatTime(conflict.endTime)}</span>
                        </div>
                        <div className="detail-item">
                          <strong>{conflict.serviceName}</strong>
                          <span>({conflict.serviceDuration} dk)</span>
                        </div>
                      </div>
                      <div className="conflict-created">
                        Oluşturulma: {formatDate(conflict.createdAt)} {formatTime(conflict.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => {
                  setConflictModalOpen(false);
                  setSelectedConflictToApprove(null);
                  setAppointmentToApprove(null);
                }}
                className="modal-btn cancel-btn"
              >
                İptal
              </button>
              <button 
                onClick={handleConflictModalApprove}
                className="modal-btn approve-btn"
                disabled={!selectedConflictToApprove}
              >
                <CheckCircle size={18} />
                Seçileni Onayla, Diğerlerini Reddet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;
