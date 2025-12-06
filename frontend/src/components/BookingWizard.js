import React, { useState, useMemo } from "react";
import "./BookingWizard.css";

// Sample data
const COMPANIES = [
  { id: "c1", name: "Derin Bakış Psikoloji", category: "Psikoloji" },
  { id: "c2", name: "Estetik Palette", category: "Güzellik & Estetik" },
  { id: "c3", name: "Kronos Klinik", category: "Sağlık" },
  { id: "c4", name: "Fit Limit Stüdyo", category: "Spor & Fitness" },
  { id: "c5", name: "Lastik Durağı Pro", category: "Otomotiv" },
];

const SERVICES = [
  {
    id: "s1",
    title: "Saç Kesimi",
    desc: "Uzman stilistlerimizden klasik veya modern saç kesimi",
    time: "30 dakika",
  },
  {
    id: "s2",
    title: "Sakal Tıraşı",
    desc: "Geleneksel tekniklerle pürüzsüz sakal tıraşı",
    time: "20 dakika",
  },
  {
    id: "s3",
    title: "Saç Yıkama & Fön",
    desc: "Ferahlatıcı saç yıkama ve şık fön",
    time: "15 dakika",
  },
  {
    id: "s4",
    title: "Çocuk Saç Kesimi",
    desc: "Çocuklar için eğlenceli atmosferde özel saç kesimi",
    time: "25 dakika",
  },
  {
    id: "s5",
    title: "Saç Boyama",
    desc: "Renk uzmanlarımızla saçınıza yeni canlılık katın",
    time: "90 dakika",
  },
  {
    id: "s6",
    title: "Özel Bakım Paketi",
    desc: "Saçınız için derin bakım ve rahatlatıcı masaj",
    time: "60 dakika",
  },
];

const EMPLOYEES = [
  { id: "e1", name: "Musab", title: "Stil Uzmanı" },
  { id: "e2", name: "Ayşe", title: "Renk Uzmanı" },
  { id: "e3", name: "Mehmet", title: "Modern Kesim Uzmanı" },
  { id: "e4", name: "Zeynep", title: "Saç Bakım Terapisti" },
];

const TIMES = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

// Helper functions for calendar
function buildMonth(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const weeks = [];
  let week = Array(first.getDay()).fill(0);
  for (let d = 1; d <= last.getDate(); d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(0);
    weeks.push(week);
  }
  return weeks;
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

export default function BookingWizard({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Calendar state
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [calendarDay, setCalendarDay] = useState(today.getDate());

  const weeks = useMemo(() => buildMonth(year, month), [year, month]);

  // Mock availability based on selected employee and date
  const availability = useMemo(() => {
    if (!selectedEmployee || !calendarDay) return {};
    const avail = {};
    for (let i = 0; i < TIMES.length; i++) {
      const key = TIMES[i];
      const h = hashString(selectedEmployee.name);
      const unavailable = (calendarDay + i + (h % 5)) % 4 === 0;
      avail[key] = unavailable ? "unavailable" : "available";
    }
    return avail;
  }, [calendarDay, selectedEmployee]);

  const handleClose = () => {
    // Reset state
    setStep(1);
    setSelectedCompany(null);
    setSelectedService(null);
    setSelectedEmployee(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setCalendarDay(today.getDate());
    onClose();
  };

  const handleNext = () => {
    if (step === 1 && !selectedCompany) {
      alert("Lütfen bir şirket seçin");
      return;
    }
    if (step === 2 && !selectedService) {
      alert("Lütfen bir hizmet seçin");
      return;
    }
    if (step === 3 && !selectedEmployee) {
      alert("Lütfen bir çalışan seçin");
      return;
    }
    if (step === 4 && (!selectedDate || !selectedTime)) {
      alert("Lütfen tarih ve saat seçin");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirm = () => {
    // Create appointment object
    const appointment = {
      id: Date.now(),
      service: selectedService.title,
      date: selectedDate,
      time: selectedTime,
      employee: selectedEmployee.name,
      status: "Beklemede",
      company: selectedCompany.name,
    };

    // Save to localStorage
    try {
      const raw = localStorage.getItem("upcomingAppointments");
      const arr = raw ? JSON.parse(raw) : [];
      localStorage.setItem(
        "upcomingAppointments",
        JSON.stringify([appointment, ...arr])
      );
    } catch (e) {
      console.error("Failed to save appointment:", e);
    }

    // Call completion callback
    if (onComplete) onComplete(appointment);
    handleClose();
  };

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const handleDayClick = (day) => {
    if (day === 0) return;
    setCalendarDay(day);
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    setSelectedDate(`${year}-${mm}-${dd}`);
  };

  if (!isOpen) return null;

  return (
    <div className="wizard-overlay" onClick={handleClose}>
      <div className="wizard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wizard-header">
          <h2 className="wizard-title">
            {step === 1 && "Şirket Seçin"}
            {step === 2 && "Hizmet Seçin"}
            {step === 3 && "Çalışan Seçin"}
            {step === 4 && "Tarih ve Saat Seçin"}
            {step === 5 && "Randevuyu Onaylayın"}
          </h2>
          <button className="wizard-close" onClick={handleClose}>
            ×
          </button>
        </div>

        {/* Progress indicator */}
        <div className="wizard-progress">
          <div className={`progress-step ${step >= 1 ? "active" : ""}`}>1</div>
          <div className={`progress-line ${step >= 2 ? "active" : ""}`}></div>
          <div className={`progress-step ${step >= 2 ? "active" : ""}`}>2</div>
          <div className={`progress-line ${step >= 3 ? "active" : ""}`}></div>
          <div className={`progress-step ${step >= 3 ? "active" : ""}`}>3</div>
          <div className={`progress-line ${step >= 4 ? "active" : ""}`}></div>
          <div className={`progress-step ${step >= 4 ? "active" : ""}`}>4</div>
          <div className={`progress-line ${step >= 5 ? "active" : ""}`}></div>
          <div className={`progress-step ${step >= 5 ? "active" : ""}`}>5</div>
        </div>

        <div className="wizard-body">
          {/* Step 1: Select Company */}
          {step === 1 && (
            <div className="wizard-step">
              <div className="step-section">
                <label className="step-label">Randevu almak istediğiniz şirketi seçin</label>
                <div className="company-list">
                  {COMPANIES.map((c) => (
                    <div
                      key={c.id}
                      className={`company-item ${
                        selectedCompany?.id === c.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedCompany(c)}
                    >
                      <div className="company-icon"></div>
                      <div className="company-info">
                        <h4>{c.name}</h4>
                        <p>{c.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Service */}
          {step === 2 && (
            <div className="wizard-step">
              <div className="step-section">
                <label className="step-label">Almak istediğiniz hizmeti seçin</label>
                <div className="service-list">
                  {SERVICES.map((s) => (
                    <div
                      key={s.id}
                      className={`service-item ${
                        selectedService?.id === s.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedService(s)}
                    >
                      <div className="service-info">
                        <h4>{s.title}</h4>
                        <p>{s.desc}</p>
                      </div>
                      <div className="service-time">{s.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Select Employee */}
          {step === 3 && (
            <div className="wizard-step">
              <div className="step-section">
                <label className="step-label">
                  Hizmet için bir çalışan seçin
                </label>
                <div className="employee-list">
                  {EMPLOYEES.map((emp) => (
                    <div
                      key={emp.id}
                      className={`employee-item ${
                        selectedEmployee?.id === emp.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedEmployee(emp)}
                    >
                      <div className="employee-avatar"></div>
                      <div className="employee-info">
                        <h4>{emp.name}</h4>
                        <p>{emp.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Select Date & Time */}
          {step === 4 && (
            <div className="wizard-step">
              <div className="datetime-container">
                {/* Calendar */}
                <div className="calendar-section">
                  <div className="calendar-header">
                    <button onClick={prevMonth} className="cal-nav">
                      ‹
                    </button>
                    <div className="cal-title">
                      {new Date(year, month).toLocaleString("tr-TR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <button onClick={nextMonth} className="cal-nav">
                      ›
                    </button>
                  </div>
                  <div className="calendar-grid">
                    <div className="cal-weekdays">
                      {["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"].map(
                        (d) => (
                          <div key={d} className="cal-weekday">
                            {d}
                          </div>
                        )
                      )}
                    </div>
                    <div className="cal-days">
                      {weeks.map((week, i) => (
                        <div key={i} className="cal-week">
                          {week.map((day, j) => (
                            <div
                              key={j}
                              className={`cal-day ${
                                day === 0 ? "empty" : ""
                              } ${day === calendarDay ? "selected" : ""}`}
                              onClick={() => handleDayClick(day)}
                            >
                              {day || ""}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Time slots */}
                <div className="timeslot-section">
                  <label className="step-label">Müsait Saatler</label>
                  <div className="timeslot-list">
                    {TIMES.map((t) => {
                      const avail = availability[t] || "available";
                      return (
                        <button
                          key={t}
                          className={`timeslot-btn ${
                            avail === "unavailable" ? "unavailable" : ""
                          } ${selectedTime === t ? "selected" : ""}`}
                          disabled={avail === "unavailable"}
                          onClick={() => setSelectedTime(t)}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <div className="wizard-step">
              <div className="confirmation-section">
                <div className="confirm-icon"></div>
                <h3>Randevu Bilgilerinizi Kontrol Edin</h3>
                <div className="info-box">
                  <p className="info-text">
                    Randevu talebiniz gönderilecektir. Şirket tarafından onaylandıktan sonra 
                    randevunuz aktif hale gelecektir.
                  </p>
                </div>
                <div className="confirm-details">
                  <div className="confirm-row">
                    <span className="confirm-label">Şirket:</span>
                    <span className="confirm-value">{selectedCompany?.name}</span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">Hizmet:</span>
                    <span className="confirm-value">
                      {selectedService?.title}
                    </span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">Süre:</span>
                    <span className="confirm-value">
                      {selectedService?.time}
                    </span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">Çalışan:</span>
                    <span className="confirm-value">
                      {selectedEmployee?.name}
                    </span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">Tarih:</span>
                    <span className="confirm-value">
                      {selectedDate &&
                        new Date(selectedDate).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                    </span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">Saat:</span>
                    <span className="confirm-value">{selectedTime}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with action buttons */}
        <div className="wizard-footer">
          {step > 1 && step < 5 && (
            <button className="wizard-btn wizard-btn-back" onClick={handleBack}>
              Geri
            </button>
          )}
          {step < 5 && (
            <button className="wizard-btn wizard-btn-next" onClick={handleNext}>
              {step === 4 ? "Önizleme" : "İleri"}
            </button>
          )}
          {step === 5 && (
            <>
              <button
                className="wizard-btn wizard-btn-back"
                onClick={handleBack}
              >
                Geri
              </button>
              <button
                className="wizard-btn wizard-btn-confirm"
                onClick={handleConfirm}
              >
                Randevu Talebi Gönder
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
