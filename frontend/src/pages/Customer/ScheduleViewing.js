import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ScheduleViewing.css";

export default function ScheduleViewing() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const stored = localStorage.getItem('customerId') || localStorage.getItem('userId');
        const cid = stored ? Number(stored) : null;
        if (!cid) return;
        
        const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
        const res = await fetch(`${BASE_URL}/api/appointments/customer/${cid}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const appts = await res.json();
        // Filter only upcoming (pending/approved)
        const upcoming = appts.filter(a => {
          const status = String(a.status || '');
          return status === 'PENDING' || status === 'APPROVED';
        });
        setAppointments(upcoming || []);
      } catch (e) {
        console.warn('Failed to load schedule from API', e);
      }
    }
    load();
  }, []);

  return (
    <div className="schedule-page">
      <aside className="schedule-sidebar">
        <div className="user-info">
          <div className="user-avatar">
            {(localStorage.getItem('userName') || 'Kullanıcı').charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <div className="user-name">{localStorage.getItem('userName') || 'Kullanıcı'}</div>
            <div className="user-email">{localStorage.getItem('userEmail') || 'email@example.com'}</div>
          </div>
        </div>
        
        <div className="sidebar-title">Randevu İşlemleri</div>
        <ul className="sidebar-list">
          <li>
            <Link to="/appointments">Randevu Yönetimi</Link>
          </li>
          <li className="active">Program Görüntüleme</li>
        </ul>
      </aside>

      <div className="schedule-main">
        <div className="schedule-header">
          <h1>Yaklaşan Randevularım</h1>
        </div>

        <div className="schedule-content">
          {appointments && appointments.length > 0 ? (
            <div className="appointments-grid">
              {appointments.map((a) => (
                <div className="schedule-card" key={a.appointmentId}>
                  <div className="card-header">
                    <span className="service-name">{a.serviceName}</span>
                    <span className={`status-badge ${String(a.status).toLowerCase()}`}>
                      {a.status === 'PENDING' ? 'Beklemede' : 
                       a.status === 'APPROVED' ? 'Onaylandı' : 
                       String(a.status)}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="info-row">
                      <span className="icon">📅</span>
                      <span>{a.startTime ? new Date(a.startTime).toLocaleDateString('tr-TR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      }) : ''}</span>
                    </div>
                    <div className="info-row">
                      <span className="icon">🕐</span>
                      <span>
                        {a.startTime && a.endTime ? 
                          `${a.startTime.split('T')[1].slice(0,5)} - ${a.endTime.split('T')[1].slice(0,5)}` : 
                          ''}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="icon">👤</span>
                      <span>{a.employeeName || 'Belirtilmedi'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <div className="empty-title">Yaklaşan randevunuz bulunmuyor</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
