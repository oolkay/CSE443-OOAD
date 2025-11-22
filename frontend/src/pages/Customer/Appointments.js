import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Appointments.css";

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
  const cls =
    status === "Approved"
      ? "badge approved"
      : status === "Pending"
      ? "badge pending"
      : status === "Completed"
      ? "badge completed"
      : "badge cancelled";
  return <span className={cls}>{status}</span>;
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
  const [companies] = useState([
    "Derin Bakış Psikoloji",
    "Estetik Palette",
    "Kronos Klinik",
    "Fit Limit Stüdyo",
    "Lastik Durağı Pro",
  ]);
  const [selectedCompany, setSelectedCompany] = useState(companies[0]);

  const navigate = useNavigate();

  const openCreateModal = () => setCreateOpen(true);
  const closeCreateModal = () => setCreateOpen(false);

  const saveCreate = () => {
    // Instead of adding a placeholder appointment locally, navigate
    // to the company-specific services page so the user can pick a service.
    const q = encodeURIComponent(selectedCompany);
    navigate(`/services?company=${q}`);
    // keep modal open state clean
    closeCreateModal();
  };

  return (
    <div className="appointments-page">
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
        <div className="sidebar-title">Appointment Flow</div>
        <ul className="sidebar-list">
          <li className="active">Appointment Management</li>
          <li>
            <Link to="/schedule" className="sidebar-link">
              Schedule Viewing
            </Link>
          </li>
        </ul>
      </aside>

      {/* Create appointment modal */}
      {createOpen && (
        <div className="modal-overlay">
          <div className="create-modal">
            <div className="create-header">
              <h3>COMPANIES</h3>
              <button className="close-x" onClick={closeCreateModal}>
                ×
              </button>
            </div>

            <div className="create-list">
              {companies.map((c, idx) => (
                <label
                  key={c}
                  className={`company-row ${
                    selectedCompany === c ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="company"
                    value={c}
                    checked={selectedCompany === c}
                    onChange={() => setSelectedCompany(c)}
                  />
                  <span className="company-name">{c}</span>
                </label>
              ))}
            </div>

            <div className="create-actions">
              <button className="btn" onClick={closeCreateModal}>
                Cancel
              </button>
              <button className="btn-primary" onClick={saveCreate}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="appointments-main">
        <div className="appointments-header">
          <h1>Appointment Management</h1>
          <button className="create-btn" onClick={openCreateModal}>
            Create New Appointment
          </button>
        </div>

        <div className="card">
          <h3>Upcoming Appointments</h3>
          <table className="appt-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Employee</th>
                <th>Status</th>
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
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
              {upcomingList.length === 0 && (
                <tr>
                  <td colSpan="6">No upcoming appointments.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Previous Appointments</h3>
          <table className="appt-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Employee</th>
                <th>Status</th>
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
                  <td colSpan="5">No previous appointments.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
