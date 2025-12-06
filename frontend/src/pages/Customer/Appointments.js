import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Appointments.css";
import BookingWizard from "../../components/BookingWizard";

const initialUpcoming = [
  {
    id: 1,
    service: "Haircut",
    date: "2024-11-15",
    time: "10:00 - 11:00",
    employee: "Ayşe Yılmaz",
    status: "Approved",
  },
  {
    id: 2,
    service: "Manicure",
    date: "2024-11-16",
    time: "14:30 - 15:30",
    employee: "Zeynep Kaya",
    status: "Pending",
  },
  {
    id: 3,
    service: "Skincare",
    date: "2024-11-20",
    time: "09:00 - 10:30",
    employee: "Mehmet Demir",
    status: "Approved",
  },
  {
    id: 4,
    service: "Massage",
    date: "2024-11-22",
    time: "16:00 - 17:00",
    employee: "Ayşe Yılmaz",
    status: "Pending",
  },
];

const initialPrevious = [
  {
    id: 101,
    service: "Haircut",
    date: "2024-10-01",
    time: "10:00 - 11:00",
    employee: "Ayşe Yılmaz",
    status: "Completed",
  },
  {
    id: 102,
    service: "Pedicure",
    date: "2024-09-20",
    time: "13:00 - 14:00",
    employee: "Zeynep Kaya",
    status: "Completed",
  },
  {
    id: 103,
    service: "Botox",
    date: "2024-08-10",
    time: "11:00 - 12:00",
    employee: "Mehmet Demir",
    status: "Cancelled",
  },
  {
    id: 104,
    service: "Blow-dry",
    date: "2024-07-05",
    time: "17:00 - 17:30",
    employee: "Ayşe Yılmaz",
    status: "Completed",
  },
  {
    id: 105,
    service: "Nail Art",
    date: "2024-06-12",
    time: "14:00 - 15:00",
    employee: "Zeynep Kaya",
    status: "Completed",
  },
];

function StatusBadge({ status }) {
  const normalizedStatus = (status || "").toUpperCase();
  
  const cls =
    normalizedStatus === "APPROVED" || normalizedStatus === "CONFIRMED"
      ? "badge approved"
      : normalizedStatus === "PENDING"
      ? "badge pending"
      : normalizedStatus === "COMPLETED"
      ? "badge completed"
      : normalizedStatus === "NO_SHOW"
      ? "badge no_show"
      : "badge cancelled";
  
  // Display Turkish status
  const displayStatus = 
    normalizedStatus === "APPROVED" || normalizedStatus === "CONFIRMED" ? "Onaylandı" :
    normalizedStatus === "PENDING" ? "Beklemede" :
    normalizedStatus === "COMPLETED" ? "Tamamlandı" :
    normalizedStatus === "CANCELLED" ? "İptal Edildi" :
    normalizedStatus === "NO_SHOW" ? "Gelmedi" :
    normalizedStatus === "REJECTED" ? "Reddedildi" :
    status;
  
  return <span className={cls}>{displayStatus}</span>;
}

export default function Appointments() {
  const [upcomingList, setUpcomingList] = useState([]);
  const [previousList, setPreviousList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [upcomingStatusFilter, setUpcomingStatusFilter] = useState("ALL");
  const [previousStatusFilter, setPreviousStatusFilter] = useState("ALL");

  // Fetch appointments from API
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // TODO: API call to get customer appointments
      // const response = await fetch(`/api/appointments/customer/${CUSTOMER_ID}`);
      // const data = await response.json();
      
      // Separate upcoming and previous appointments
      // const now = new Date();
      // const upcoming = data.filter(apt => new Date(apt.startTime) > now && apt.status !== 'CANCELLED');
      // const previous = data.filter(apt => new Date(apt.startTime) <= now || apt.status === 'CANCELLED');
      // setUpcomingList(upcoming);
      // setPreviousList(previous);
      
      // Mock data for now
      const mockData = [
        ...initialUpcoming.map(apt => ({
          appointmentId: apt.id,
          serviceName: apt.service,
          startTime: apt.date + 'T' + apt.time.split(' - ')[0],
          endTime: apt.date + 'T' + apt.time.split(' - ')[1],
          employeeName: apt.employee,
          status: apt.status.toUpperCase(),
        })),
        ...initialPrevious.map(apt => ({
          appointmentId: apt.id,
          serviceName: apt.service,
          startTime: apt.date + 'T' + apt.time.split(' - ')[0],
          endTime: apt.date + 'T' + apt.time.split(' - ')[1],
          employeeName: apt.employee,
          status: apt.status.toUpperCase(),
        }))
      ];
      
      const now = new Date();
      const upcoming = mockData.filter(apt => new Date(apt.startTime) > now && apt.status !== 'CANCELLED');
      const previous = mockData.filter(apt => new Date(apt.startTime) <= now || apt.status === 'CANCELLED');
      setUpcomingList(upcoming);
      setPreviousList(previous);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      // Fallback to localStorage if API fails
      try {
        const raw = localStorage.getItem("upcomingAppointments");
        const rawPrev = localStorage.getItem("previousAppointments");
        setUpcomingList(raw ? JSON.parse(raw) : initialUpcoming);
        setPreviousList(rawPrev ? JSON.parse(rawPrev) : initialPrevious);
      } catch (e) {
        setUpcomingList(initialUpcoming);
        setPreviousList(initialPrevious);
      }
    } finally {
      setLoading(false);
    }
  };

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

  const confirmCancel = async () => {
    if (!pendingCancel) return;
    const id = pendingCancel.appointmentId || pendingCancel.id;

    try {
      // Check if appointment is within 24 hours
      const appointmentTime = new Date(pendingCancel.startTime);
      const now = new Date();
      const hoursUntil = (appointmentTime - now) / (1000 * 60 * 60);
      
      if (hoursUntil < 24 && hoursUntil > 0) {
        alert("24 saatten az kalan randevular iptal edilemez. Lütfen şirketle iletişime geçin.");
        closeModal();
        return;
      }

      // TODO: API call to cancel appointment
      // const response = await fetch(`/api/appointments/${id}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) {
      //   const error = await response.json();
      //   alert(error.message || 'Randevu iptal edilemedi');
      //   return;
      // }

      // Update local state
      const newUpcoming = upcomingList.filter((a) => (a.appointmentId || a.id) !== id);
      setUpcomingList(newUpcoming);

      const cancelled = { ...pendingCancel, status: "CANCELLED" };
      setPreviousList((prev) => [cancelled, ...prev]);

      // Show success message
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
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Randevu iptal edilirken bir hata oluştu");
    }
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
    } catch (e) {}
  };

  // keep localStorage in sync when lists change (fallback persistence)
  React.useEffect(() => {
    try {
      localStorage.setItem(
        "upcomingAppointments",
        JSON.stringify(upcomingList)
      );
    } catch (e) {}
  }, [upcomingList]);

  React.useEffect(() => {
    try {
      localStorage.setItem(
        "previousAppointments",
        JSON.stringify(previousList)
      );
    } catch (e) {}
  }, [previousList]);

  // Create appointment modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

 // const navigate = useNavigate();

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

  // Filter upcoming appointments by status
  const filteredUpcoming = upcomingStatusFilter === "ALL"
    ? upcomingList
    : upcomingList.filter(a => {
        const status = (a.status || "").toUpperCase();
        return status === upcomingStatusFilter;
      });

  // Filter previous appointments by status
  const filteredPrevious = previousStatusFilter === "ALL"
    ? previousList
    : previousList.filter(a => {
        const status = (a.status || "").toUpperCase();
        return status === previousStatusFilter;
      });

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
        <div className="sidebar-title">Randevu İşlemleri</div>
        <ul className="sidebar-list">
          <li className="active">Randevu Yönetimi</li>
          <li>
            <Link to="/schedule" className="sidebar-link">
              Program Görüntüleme
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
          <div className="card-header-with-filter">
            <h3>Yaklaşan Randevular</h3>
            <div className="filter-group">
              <label htmlFor="upcoming-status-filter">Durum:</label>
              <select
                id="upcoming-status-filter"
                value={upcomingStatusFilter}
                onChange={(e) => setUpcomingStatusFilter(e.target.value)}
                className="status-filter-select"
              >
                <option value="ALL">Tümü</option>
                <option value="PENDING">Beklemede</option>
                <option value="APPROVED">Onaylandı</option>
              </select>
            </div>
          </div>
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
              {filteredUpcoming.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                    Yaklaşan randevu bulunamadı
                  </td>
                </tr>
              ) : (
                filteredUpcoming.map((a) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header-with-filter">
            <h3>Geçmiş Randevular</h3>
            <div className="filter-group">
              <label htmlFor="previous-status-filter">Durum:</label>
              <select
                id="previous-status-filter"
                value={previousStatusFilter}
                onChange={(e) => setPreviousStatusFilter(e.target.value)}
                className="status-filter-select"
              >
                <option value="ALL">Tümü</option>
                <option value="COMPLETED">Tamamlandı</option>
                <option value="CANCELLED">İptal Edildi</option>
              </select>
            </div>
          </div>
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
              {filteredPrevious.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                    Geçmiş randevu bulunamadı
                  </td>
                </tr>
              ) : (
                filteredPrevious.map((a) => (
                  <tr key={a.id}>
                    <td>{a.service}</td>
                    <td>{a.date}</td>
                    <td>{a.time}</td>
                    <td>{a.employee}</td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
