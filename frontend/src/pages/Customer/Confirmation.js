import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Confirmation.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function formatDate(isoParts) {
  // isoParts expected as { year, month, day }
  try {
    const d = new Date(
      Number(isoParts.year),
      Number(isoParts.month) - 1,
      Number(isoParts.day)
    );
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return `${isoParts.year}-${isoParts.month}-${isoParts.day}`;
  }
}

export default function Confirmation() {
  const q = useQuery();
  const navigate = useNavigate();
  const company = q.get("company") || "Company";
  const service = q.get("service") || "";
  const employee = q.get("employee") || "TBD";
  const date = q.get("date") || "";
  const time = q.get("time") || "";

  // parse date if passed as y-m-d
  let prettyDate = date;
  if (date) {
    const parts = date.split("-");
    if (parts.length === 3)
      prettyDate = formatDate({
        year: parts[0],
        month: parts[1],
        day: parts[2],
      });
  }

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUndoBar, setShowUndoBar] = useState(false);
  const undoTimerRef = useRef(null);
  const [lastCancelled, setLastCancelled] = useState(null);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const handleCancel = () => {
    // open custom modal instead of native confirm
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);

    // create cancelled appointment object
    const cancelled = {
      id: Date.now(),
      service,
      date,
      time,
      employee,
      status: "Cancelled",
    };

    // persist: remove matching upcoming (if any) and add to previous
    try {
      const rawUp = localStorage.getItem("upcomingAppointments");
      const upArr = rawUp ? JSON.parse(rawUp) : [];
      const filtered = upArr.filter(
        (a) =>
          !(
            a.service === service &&
            a.date === date &&
            a.time === time &&
            a.employee === employee
          )
      );
      localStorage.setItem("upcomingAppointments", JSON.stringify(filtered));

      const rawPrev = localStorage.getItem("previousAppointments");
      const prevArr = rawPrev ? JSON.parse(rawPrev) : [];
      localStorage.setItem(
        "previousAppointments",
        JSON.stringify([cancelled, ...prevArr])
      );

      // save lastCancelled to allow undo
      localStorage.setItem(
        "lastCancelledAppointment",
        JSON.stringify(cancelled)
      );
      setLastCancelled(cancelled);
    } catch (e) {}

    setShowUndoBar(true);
    // after 5s, finalize by navigating away
    undoTimerRef.current = setTimeout(() => {
      setShowUndoBar(false);
      localStorage.removeItem("lastCancelledAppointment");
      navigate("/appointments");
    }, 5000);
  };

  const undoCancel = () => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setShowUndoBar(false);

    // restore lastCancelled into upcoming and remove from previous
    try {
      const raw = localStorage.getItem("lastCancelledAppointment");
      const cancelled = raw ? JSON.parse(raw) : lastCancelled;
      if (cancelled) {
        const rawPrev = localStorage.getItem("previousAppointments");
        const prevArr = rawPrev ? JSON.parse(rawPrev) : [];
        const newPrev = prevArr.filter((p) => p.id !== cancelled.id);
        localStorage.setItem("previousAppointments", JSON.stringify(newPrev));

        const rawUp = localStorage.getItem("upcomingAppointments");
        const upArr = rawUp ? JSON.parse(rawUp) : [];
        localStorage.setItem(
          "upcomingAppointments",
          JSON.stringify([{ ...cancelled, status: "Pending" }, ...upArr])
        );

        localStorage.removeItem("lastCancelledAppointment");
      }
    } catch (e) {}

    // temporary feedback
    alert("Randevu iptali geri alındı");
  };

  const confirmBooking = () => {
    // create appointment and add to upcoming
    const appt = {
      id: Date.now(),
      service,
      date,
      time,
      employee,
      status: "Pending",
    };
    try {
      const rawUp = localStorage.getItem("upcomingAppointments");
      const upArr = rawUp ? JSON.parse(rawUp) : [];
      localStorage.setItem(
        "upcomingAppointments",
        JSON.stringify([appt, ...upArr])
      );
    } catch (e) {}
    navigate("/appointments");
  };

  return (
    <div className="confirm-page">
      <div className="confirm-box">
        <h2>Appointment Confirmation</h2>
        <div className="status-row">
          Appointment Status{" "}
          <span className="status-badge pending">Pending</span>
        </div>

        <div className="confirm-grid">
          <div className="label">Company:</div>
          <div className="value">{company}</div>
          <div className="label">Service:</div>
          <div className="value">{service}</div>
          <div className="label">Employee:</div>
          <div className="value">{employee}</div>
          <div className="label">Date:</div>
          <div className="value">{prettyDate}</div>
          <div className="label">Time:</div>
          <div className="value">{time}</div>
        </div>

        <p className="note">
          A confirmation email will be sent to your email address. Please check
          your mailbox.
        </p>

        <div className="confirm-actions">
          <button className="btn cancel" onClick={handleCancel}>
            Randevuyu İptal Et
          </button>
          <button
            className="btn"
            onClick={() => {
              // create the appointment and return to appointments list
              confirmBooking();
            }}
          >
            Geri Dön
          </button>
        </div>
      </div>

      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Randevuyu İptal Et</h3>
            <p>
              Bu randevuyu iptal etmek istediğinize emin misiniz? İptal edildiği
              takdirde randevu geçmişe taşınacaktır. İşlemi geri almak için 5
              saniyeniz olacak.
            </p>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowCancelModal(false)}>
                Geri
              </button>
              <button className="btn cancel" onClick={confirmCancel}>
                İptal Et
              </button>
            </div>
          </div>
        </div>
      )}

      {showUndoBar && (
        <div className="undo-snackbar">
          <div>Randevu iptal edildi</div>
          <div className="undo-actions">
            <button className="undo-btn" onClick={undoCancel}>
              Geri Al
            </button>
            <button
              className="undo-close"
              onClick={() => {
                if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
                undoTimerRef.current = null;
                setShowUndoBar(false);
                navigate("/appointments");
              }}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
