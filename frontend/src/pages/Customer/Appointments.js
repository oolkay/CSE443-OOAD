import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./Appointments.css";
import BookingWizard from "../../components/BookingWizard";

function StatusBadge({ status }) {
  const statusMap = {
    PENDING: { class: "badge pending", text: "Beklemede" },
    APPROVED: { class: "badge approved", text: "Onaylandı" },
    REJECTED: { class: "badge cancelled", text: "Reddedildi" },
    COMPLETED: { class: "badge completed", text: "Tamamlandı" },
    CANCELLED: { class: "badge cancelled", text: "İptal Edildi" },
    NO_SHOW: { class: "badge cancelled", text: "Gelmedi" }
  };

  const config = statusMap[status] || { class: "badge", text: status };
  return <span className={config.class}>{config.text}</span>;
}

function AppointmentCard({ appointment, showCancelButton, onCancel }) {
  return (
    <>
      {/* Desktop Table Row */}
      <tr className="desktop-only">
        <td>{appointment.service}</td>
        <td>{appointment.date}</td>
        <td>{appointment.time}</td>
        <td>{appointment.employee}</td>
        <td><StatusBadge status={appointment.status} /></td>
        {showCancelButton && (
          <td>
            <button className="cancel-btn" onClick={() => onCancel(appointment.id)}>
              İptal Et
            </button>
          </td>
        )}
      </tr>

      {/* Mobile Card */}
      <div className="appt-card-mobile mobile-only">
        <div className="appt-row">
          <span className="appt-label">Hizmet:</span>
          <span className="appt-value">{appointment.service}</span>
        </div>
        <div className="appt-row">
          <span className="appt-label">Tarih:</span>
          <span className="appt-value">{appointment.date}</span>
        </div>
        <div className="appt-row">
          <span className="appt-label">Saat:</span>
          <span className="appt-value">{appointment.time}</span>
        </div>
        <div className="appt-row">
          <span className="appt-label">Çalışan:</span>
          <span className="appt-value">{appointment.employee}</span>
        </div>
        <div className="appt-row">
          <span className="appt-label">Durum:</span>
          <StatusBadge status={appointment.status} />
        </div>
        {showCancelButton && (
          <button className="cancel-btn" onClick={() => onCancel(appointment.id)}>
            İptal Et
          </button>
        )}
      </div>
    </>
  );
}

export default function Appointments() {
  const [upcomingList, setUpcomingList] = useState([]);
  const [previousList, setPreviousList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingCancel, setPendingCancel] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch appointments from API
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setError("Lütfen giriş yapın");
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      const userId = user.userId;

      const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
      const res = await fetch(`${BASE_URL}/api/appointments/customer/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch");
      }

      const appts = await res.json();

      // Split into upcoming and previous
      const upcoming = [];
      const previous = [];

      appts.forEach((a) => {
        const item = {
          id: a.appointmentId,
          service: a.serviceName || "Bilinmeyen Hizmet",
          date: a.startTime ? a.startTime.split('T')[0] : '',
          time: a.startTime && a.endTime
            ? `${a.startTime.split('T')[1].slice(0, 5)} - ${a.endTime.split('T')[1].slice(0, 5)}`
            : '',
          employee: a.employeeName || '',
          status: a.status || 'PENDING'
        };

        if (a.status === "PENDING" || a.status === "APPROVED") {
          upcoming.push(item);
        } else {
          previous.push(item);
        }
      });

      setUpcomingList(upcoming);
      setPreviousList(previous);
    } catch (e) {
      setError("Randevular yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const openCancelModal = (id) => {
    const appt = upcomingList.find((a) => a.id === id);
    if (!appt) return;
    setPendingCancel(appt);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setPendingCancel(null);
  };

  const confirmCancel = async () => {
    if (!pendingCancel || isCancelling) return;

    try {
      setIsCancelling(true);
      const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
      const res = await fetch(`${BASE_URL}/api/appointments/${pendingCancel.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!res.ok) throw new Error("Cancel failed");

      // Refresh appointments
      await fetchAppointments();
      closeModal();
    } catch (e) {
      setError("Randevu iptal edilemedi");
    } finally {
      setIsCancelling(false);
      closeModal();
    }
  };

  const handleBookingComplete = () => {
    // Refresh appointments after new booking
    fetchAppointments();
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="appointments-page">
      <BookingWizard
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onComplete={handleBookingComplete}
      />

      {/* Cancel Confirmation Modal */}
      {modalOpen && pendingCancel && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Emin misiniz?</h3>
            <p>Bu randevuyu iptal etmek istiyor musunuz?</p>
            <div className="modal-actions">
              <button
                className="btn btn-danger"
                onClick={confirmCancel}
                disabled={isCancelling}
              >
                {isCancelling ? 'İptal Ediliyor...' : 'Evet, İptal Et'}
              </button>
              <button className="btn" onClick={closeModal} disabled={isCancelling}>
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="appointments-sidebar">
        <div className="user-info">
          <div className="user-avatar">
            {(user.name || "K").charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <div className="user-name">{user.name || "Kullanıcı"}</div>
            <div className="user-email">{user.email || "email@example.com"}</div>
          </div>
        </div>

        <Link to="/" onClick={() => {
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
        }} className="logout-btn">
          Çıkış Yap
        </Link>
      </aside>

      <section className="appointments-main">
        <div className="appointments-header">
          <h1>Randevu Yönetimi</h1>
          <button className="create-btn" onClick={() => setCreateOpen(true)}>
            Yeni Randevu Oluştur
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fff5f5',
            border: '1px solid #fc8181',
            borderRadius: '6px',
            padding: '12px 16px',
            margin: '16px 0',
            color: '#c53030',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Upcoming Appointments */}
        <div className="card">
          <h3>Yaklaşan Randevular</h3>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              Yükleniyor...
            </p>
          ) : (
            <>
              <table className="appt-table desktop-only">
                <thead>
                  <tr>
                    <th>Hizmet</th>
                    <th>Tarih</th>
                    <th>Saat</th>
                    <th>Çalışan</th>
                    <th>Durum</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingList.length === 0 ? (
                    <tr>
                      <td colSpan="6">Yaklaşan randevu bulunmamaktadır.</td>
                    </tr>
                  ) : (
                    upcomingList.map((appt) => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        showCancelButton
                        onCancel={openCancelModal}
                      />
                    ))
                  )}
                </tbody>
              </table>

              <div className="appt-table-mobile mobile-only">
                {upcomingList.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666', padding: '20px 0' }}>
                    Yaklaşan randevu bulunmamaktadır.
                  </p>
                ) : (
                  upcomingList.map((appt) => (
                    <AppointmentCard
                      key={appt.id}
                      appointment={appt}
                      showCancelButton
                      onCancel={openCancelModal}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Previous Appointments */}
        <div className="card">
          <h3>Geçmiş Randevular</h3>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              Yükleniyor...
            </p>
          ) : (
            <>
              <table className="appt-table desktop-only">
                <thead>
                  <tr>
                    <th>Hizmet</th>
                    <th>Tarih</th>
                    <th>Saat</th>
                    <th>Çalışan</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {previousList.length === 0 ? (
                    <tr>
                      <td colSpan="5">Geçmiş randevu bulunmamaktadır.</td>
                    </tr>
                  ) : (
                    previousList.map((appt) => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        showCancelButton={false}
                      />
                    ))
                  )}
                </tbody>
              </table>

              <div className="appt-table-mobile mobile-only">
                {previousList.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666', padding: '20px 0' }}>
                    Geçmiş randevu bulunmamaktadır.
                  </p>
                ) : (
                  previousList.map((appt) => (
                    <AppointmentCard
                      key={appt.id}
                      appointment={appt}
                      showCancelButton={false}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
