import React from "react";
import "./ScheduleViewing.css";

export default function ScheduleViewing() {
  const today = new Date();
  const pretty = today.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <h1>Upcoming Appointments</h1>
        <div className="schedule-controls">
          <div className="left-controls">
            <button className="ctrl btn">Today</button>
            <button className="ctrl btn">‹</button>
            <button className="ctrl btn">›</button>
            <div className="date-display">{pretty}</div>
          </div>
          <div className="right-controls">
            <button className="view btn active">Daily</button>
            <button className="view btn">Weekly</button>
            <button className="view btn">Monthly</button>
          </div>
        </div>
      </div>

      <div className="schedule-content">
        <div className="empty-card">
          <div className="empty-icon">📅</div>
          <div className="empty-title">
            You do not have any upcoming appointments.
          </div>
          <div className="empty-sub">
            To schedule a new appointment, visit the Appointment Management
            screen.
          </div>
        </div>
      </div>
    </div>
  );
}
