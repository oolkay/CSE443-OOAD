import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Confirmation.css";

// TODO: Replace with actual customer ID from auth context
// const CUSTOMER_ID = 1;

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
  //const companyId = q.get("companyId") || "";
  const service = q.get("service") || "";
  //const serviceId = q.get("serviceId") || "";
  const employee = q.get("employee") || "TBD";
  //const employeeId = q.get("employeeId") || "";
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
  const [isCreating, setIsCreating] = useState(false);
  const undoTimerRef = useRef(null);
  const [lastCancelled, setLastCancelled] = useState(null);
  const [createdAppointmentId, setCreatedAppointmentId] = useState(null);

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

    // API call to cancel appointment (only if created)
    if (createdAppointmentId) {
      // TODO: Uncomment when backend is ready
      /*
      fetch(`/api/appointments/${createdAppointmentId}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to cancel appointment');
          }
          console.log('Appointment cancelled via API');
        })
        .catch((error) => {
          console.error('Error cancelling appointment:', error);
          alert('Randevu iptal edilirken bir hata oluştu. Lütfen tekrar deneyin.');
          return;
        });
      */
    }

    // create cancelled appointment object
    const cancelled = {
      id: createdAppointmentId || Date.now(),
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

  const confirmBooking = async () => {
    setIsCreating(true);

    // Prepare appointment data for API
    // const appointmentDateTime = `${date}T${time}:00`; // ISO 8601 format
    
    /*const appointmentData = {
      customerId: CUSTOMER_ID,
      employeeId: Number(employeeId),
      serviceId: Number(serviceId),
      appointmentDateTime: appointmentDateTime,
      notes: "", // Optional field
    };*/

    try {
      // TODO: Uncomment when backend is ready
      /*
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create appointment');
      }

      const createdAppointment = await response.json();
      setCreatedAppointmentId(createdAppointment.appointmentId);
      console.log('Appointment created:', createdAppointment);
      */

      // Fallback: create appointment locally
      const appt = {
        id: Date.now(),
        appointmentId: Date.now(), // For consistency with API response
        service,
        date,
        time,
        employee,
        status: "Pending",
      };
      
      const rawUp = localStorage.getItem("upcomingAppointments");
      const upArr = rawUp ? JSON.parse(rawUp) : [];
      localStorage.setItem(
        "upcomingAppointments",
        JSON.stringify([appt, ...upArr])
      );
      
      setCreatedAppointmentId(appt.appointmentId);
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Randevu oluşturulurken bir hata oluştu: ' + error.message);
      setIsCreating(false);
      return;
    }

    setIsCreating(false);
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
          <button 
            className="btn cancel" 
            onClick={handleCancel}
            disabled={isCreating}
          >
            Randevuyu İptal Et
          </button>
          <button
            className="btn"
            onClick={confirmBooking}
            disabled={isCreating}
          >
            {isCreating ? "Oluşturuluyor..." : "Geri Dön"}
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
