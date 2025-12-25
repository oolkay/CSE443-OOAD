import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Appointments.css";
import BookingWizard from "../../components/BookingWizard";


function StatusBadge({ status }) {
  const cls =
    status === "Approved" || status === "Onaylandı"
      ? "badge approved"
      : status === "Pending" || status === "Beklemede"
        ? "badge pending"
        : status === "Completed" || status === "Tamamlandı"
          ? "badge completed"
          : "badge cancelled";

  // Display Turkish status
  const displayStatus =
    status === "Approved" ? "Onaylandı" :
      status === "Pending" ? "Beklemede" :
        status === "Completed" ? "Tamamlandı" :
          status === "Cancelled" ? "İptal Edildi" :
            status;

  return <span className={cls}>{displayStatus}</span>;
}

export default function Appointments() {
  const [upcomingList, setUpcomingList] = useState(() => {
    try {
      const raw = localStorage.getItem("upcomingAppointments");
      return raw ? JSON.parse(raw) : initialUpcoming;
    } catch (e) {
      return initialUpcoming;
    }
  });
  const [previousList, setPreviousList] = useState(() => {
    try {
      const raw = localStorage.getItem("previousAppointments");
      return raw ? JSON.parse(raw) : initialPrevious;
    } catch (e) {
      return initialPrevious;
    }
  });

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingCancel, setPendingCancel] = useState(null);

  // snackbar (undo) state
  const [snackOpen, setSnackOpen] = useState(false);
  const [lastCancelled, setLastCancelled] = useState(null);
  const [snackTimer, setSnackTimer] = useState(null);

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

  const confirmCancel = () => {
    if (!pendingCancel) return;
    const id = pendingCancel.id;

    // perform cancellation: remove from upcoming and add to previous
    const newUpcoming = upcomingList.filter((a) => a.id !== id);
    setUpcomingList(newUpcoming);

    const cancelled = { ...pendingCancel, status: "Cancelled" };
    setPreviousList((prev) => [cancelled, ...prev]);

    // persist to localStorage
    try {
      localStorage.setItem("upcomingAppointments", JSON.stringify(newUpcoming));
      const rawPrev = localStorage.getItem("previousAppointments");
      const prevArr = rawPrev ? JSON.parse(rawPrev) : initialPrevious;
      localStorage.setItem(
        "previousAppointments",
        JSON.stringify([cancelled, ...prevArr])
      );
      // save lastCancelled for possible undo from other pages
      localStorage.setItem(
        "lastCancelledAppointment",
        JSON.stringify(cancelled)
      );
    } catch (e) {
      // ignore storage errors
    }

    // show undo snackbar
    setLastCancelled(cancelled);
    setSnackOpen(true);
    if (snackTimer) clearTimeout(snackTimer);
    const t = setTimeout(() => {
      setSnackOpen(false);
      setLastCancelled(null);
      setSnackTimer(null);
    }, 5000);
    setSnackTimer(t);

    closeModal();
  };

  const undoCancel = () => {
    if (!lastCancelled) return;
    // remove from previous (first match by id)
    setPreviousList((prev) => prev.filter((p) => p.id !== lastCancelled.id));
    // add back to upcoming at top
    setUpcomingList((u) => [{ ...lastCancelled, status: "Pending" }, ...u]);
    setSnackOpen(false);
    if (snackTimer) clearTimeout(snackTimer);
    setLastCancelled(null);

    // persist undo to localStorage
    try {
      const rawPrev = localStorage.getItem("previousAppointments");
      const prevArr = rawPrev ? JSON.parse(rawPrev) : [];
      const newPrev = prevArr.filter((p) => p.id !== lastCancelled.id);
      localStorage.setItem("previousAppointments", JSON.stringify(newPrev));

      const rawUp = localStorage.getItem("upcomingAppointments");
      const upArr = rawUp ? JSON.parse(rawUp) : [];
      localStorage.setItem(
        "upcomingAppointments",
        JSON.stringify([{ ...lastCancelled, status: "Pending" }, ...upArr])
      );

      localStorage.removeItem("lastCancelledAppointment");
    } catch (e) { }
  };

  // keep localStorage in sync when lists change (fallback persistence)
  React.useEffect(() => {
    try {
      localStorage.setItem(
        "upcomingAppointments",
        JSON.stringify(upcomingList)
      );
    } catch (e) { }
  }, [upcomingList]);

  React.useEffect(() => {
    try {
      localStorage.setItem(
        "previousAppointments",
        JSON.stringify(previousList)
      );
    } catch (e) { }
  }, [previousList]);

  // Create appointment modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // try to fetch real appointments from backend for logged-in customer
  useEffect(() => {
    async function fetchAppointments() {
      try {
        // try to read customer id from localStorage (set by login flow)
        const stored = localStorage.getItem('customerId') || localStorage.getItem('userId');
        const cid = stored ? Number(stored) : null;
        if (!cid) return; // nothing to fetch

        const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
        const res = await fetch(`${BASE_URL}/api/appointments/customer/${cid}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const appts = await res.json();

        // split into upcoming (pending/approved) and previous (completed/cancelled/no-show)
        const upcoming = [];
        const previous = [];
        appts.forEach(a => {
          const status = a.status ? String(a.status) : '';
          const item = {
            id: a.appointmentId,
            service: a.serviceName,
            date: a.startTime ? a.startTime.split('T')[0] : '',
            time: a.startTime && a.endTime ? `${a.startTime.split('T')[1].slice(0, 5)} - ${a.endTime.split('T')[1].slice(0, 5)}` : '',
            employee: a.employeeName || '',
            status: status
          };
          if (status === 'PENDING' || status === 'APPROVED') upcoming.push(item);
          else previous.push(item);
        });
        if (upcoming.length) setUpcomingList(upcoming);
        if (previous.length) setPreviousList(previous);
      } catch (e) {
        // silently ignore network errors; keep mock/local data
        console.warn('Failed to load appointments from API', e);
      }
    }
    fetchAppointments();
  }, []);

  const openCreateModal = () => setCreateOpen(true);
  const closeCreateModal = () => setCreateOpen(false);

  const handleBookingComplete = (appointment) => {
    // Refresh the upcoming list
    try {
      const raw = localStorage.getItem("upcomingAppointments");
      const arr = raw ? JSON.parse(raw) : [];
      setUpcomingList(arr);
    } catch (e) {
      console.error("Failed to refresh appointments:", e);
    }

    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  return (
    <div className="appointments-page">
      {/* Booking Wizard Modal */}
      <BookingWizard
        isOpen={createOpen}
        onClose={closeCreateModal}
        onComplete={handleBookingComplete}
      />

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="success-banner">
          ✓ Randevu talebiniz başarıyla gönderildi! Onay bekliyor.
        </div>
      )}

      {/* Confirmation modal */}
      {modalOpen && pendingCancel && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Emin misiniz?</h3>
            <p>Bu randevuyu iptal etmek istiyor musunuz?</p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={confirmCancel}>
                Evet, İptal Et
              </button>
              <button className="btn" onClick={closeModal}>
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo snackbar */}
      {snackOpen && lastCancelled && (
        <div className="snackbar">
          <span>Randevu iptal edildi</span>
          <button className="undo-btn" onClick={undoCancel}>
            Geri Al
          </button>
        </div>
      )}

      <aside className="appointments-sidebar">
        <div className="user-info">
          <div className="user-avatar">
            {(() => {
              const userStr = localStorage.getItem('user');
              const user = userStr ? JSON.parse(userStr) : {};
              return (user.name || 'K').charAt(0).toUpperCase();
            })()}
          </div>
          <div className="user-details">
            <div className="user-name">
              {(() => {
                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : {};
                return user.name || 'Kullanıcı';
              })()}
            </div>
            <div className="user-email">
              {(() => {
                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : {};
                return user.email || 'email@example.com';
              })()}
            </div>
          </div>
        </div>
        <div className="sidebar-title">Randevu İşlemleri</div>
        <ul className="sidebar-list">
          <li className="active">Randevu Yönetimi</li>
          <li style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
            <Link to="/" onClick={() => {
              localStorage.removeItem('user');
              localStorage.removeItem('authToken');
            }} className="sidebar-link" style={{ color: '#ff6b6b' }}>
              Çıkış Yap
            </Link>
          </li>
        </ul>
      </aside>

      <section className="appointments-main">
        <div className="appointments-header">
          <h1>Randevu Yönetimi</h1>
          <button className="create-btn" onClick={openCreateModal}>
            Yeni Randevu Oluştur
          </button>
        </div>

        <div className="card">
          <h3>Yaklaşan Randevular</h3>
          {/* Desktop table */}
          <table className="appt-table">
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
              {upcomingList.map((a) => (
                <tr key={a.id}>
                  <td>{a.service}</td>
                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td>{a.employee}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td>
                    <button
                      className="cancel-btn"
                      onClick={() => openCancelModal(a.id)}
                    >
                      İptal Et
                    </button>
                  </td>
                </tr>
              ))}
              {upcomingList.length === 0 && (
                <tr>
                  <td colSpan="6">Yaklaşan randevu bulunmamaktadır.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile card layout */}
          <div className="appt-table-mobile">
            {upcomingList.map((a) => (
              <div className="appt-card-mobile" key={a.id}>
                <div className="appt-row">
                  <span className="appt-label">Hizmet:</span>
                  <span className="appt-value">{a.service}</span>
                </div>
                <div className="appt-row">
                  <span className="appt-label">Tarih:</span>
                  <span className="appt-value">{a.date}</span>
                </div>
                <div className="appt-row">
                  <span className="appt-label">Saat:</span>
                  <span className="appt-value">{a.time}</span>
                </div>
                <div className="appt-row">
                  <span className="appt-label">Çalışan:</span>
                  <span className="appt-value">{a.employee}</span>
                </div>
                <div className="appt-row">
                  <span className="appt-label">Durum:</span>
                  <StatusBadge status={a.status} />
                </div>
                <button
                  className="cancel-btn"
                  onClick={() => openCancelModal(a.id)}
                >
                  İptal Et
                </button>
              </div>
            ))}
            {upcomingList.length === 0 && (
              <p style={{ textAlign: 'center', color: '#666', padding: '20px 0' }}>
                Yaklaşan randevu bulunmamaktadır.
              </p>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Geçmiş Randevular</h3>
          {/* Desktop table */}
          <table className="appt-table">
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
              {previousList.map((a) => (
                <tr key={a.id}>
                  <td>{a.service}</td>
                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td>{a.employee}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
              {previousList.length === 0 && (
                <tr>
                  <td colSpan="5">Geçmiş randevu bulunmamaktadır.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile card layout */}
          <div className="appt-table-mobile">
            {previousList.map((a) => (
              <div className="appt-card-mobile" key={a.id}>
                <div className="appt-row">
                  <span className="appt-label">Hizmet:</span>
                  <span className="appt-value">{a.service}</span>
                </div>
                <div className="appt-row">
                  <span className="appt-label">Tarih:</span>
                  <span className="appt-value">{a.date}</span>
                </div>
                <div className="appt-row">
                  <span className="appt-label">Saat:</span>
                  <span className="appt-value">{a.time}</span>
                </div>
                <div className="appt-row">
                  <span className="appt-label">Çalışan:</span>
                  <span className="appt-value">{a.employee}</span>
                </div>
                <div className="appt-row">
                  <span className="appt-label">Durum:</span>
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))}
            {previousList.length === 0 && (
              <p style={{ textAlign: 'center', color: '#666', padding: '20px 0' }}>
                Geçmiş randevu bulunmamaktadır.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
