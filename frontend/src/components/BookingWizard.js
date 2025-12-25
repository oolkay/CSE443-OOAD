import React, { useState, useMemo, useEffect } from "react";
import companyService from "../services/companyService";
import serviceService from "../services/serviceService";
import employeeService from "../services/employeeService";
import appointmentService from "../services/appointmentService";
import authService from "../services/authService";
import "./BookingWizard.css";

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

export default function BookingWizard({ isOpen, onClose, onComplete }) {
  const user = authService.getCurrentUser();
  const [step, setStep] = useState(1);

  // Data States
  const [companies, setCompanies] = useState([]);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Loading States
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Selection States
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // Format: YYYY-MM-DD
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null); // Full Slot Object

  // Fetch Companies on Open
  useEffect(() => {
    if (isOpen && step === 1) {
      fetchCompanies();
    }
  }, [isOpen, step]);

  // Fetch Services when Company Selected
  useEffect(() => {
    if (selectedCompany && step === 2) {
      fetchServices();
    }
  }, [selectedCompany, step]);

  // Fetch Employees when Service Selected
  useEffect(() => {
    if (selectedService && step === 3) {
      fetchEmployees();
    }
  }, [selectedService, step]);

  // Fetch Availability when Date & Employee Selected
  useEffect(() => {
    if (selectedEmployee && selectedDate && step === 4) {
      fetchAvailability();
    }
  }, [selectedEmployee, selectedDate, step]);

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const data = await companyService.getAllCompanies();
      setCompanies(data);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const data = await serviceService.getServicesByCompany(selectedCompany.companyId);
      setServices(data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      // Fetch all employees of the company
      const allEmployees = await employeeService.getEmployeesByCompany(selectedCompany.companyId);

      // Filter employees who can perform the selected service
      // Assuming employee.assignedServices contains the list of services they can do
      const qualifiedEmployees = allEmployees.filter(emp =>
        emp.assignedServices && emp.assignedServices.some(s => s.id === selectedService.id)
      );

      setEmployees(qualifiedEmployees);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchAvailability = async () => {
    setLoadingAvailability(true);
    setAvailableSlots([]);
    try {
      const data = await appointmentService.getEmployeeAvailability(
        selectedEmployee.id,
        selectedDate,
        selectedService.durationMinutes
      );
      setAvailableSlots(data.availableSlots || []);
    } catch (error) {
      console.error("Failed to fetch availability:", error);
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Calendar State
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [calendarDay, setCalendarDay] = useState(today.getDate());
  const weeks = useMemo(() => buildMonth(year, month), [year, month]);

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
    setSelectedTimeSlot(null); // Reset time when date changes
  };

  const handleClose = () => {
    setStep(1);
    setSelectedCompany(null);
    setSelectedService(null);
    setSelectedEmployee(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setAvailableSlots([]);
    onClose();
  };

  const handleNext = () => {
    if (step === 1 && !selectedCompany) return alert("Lütfen bir şirket seçin");
    if (step === 2 && !selectedService) return alert("Lütfen bir hizmet seçin");
    if (step === 3 && !selectedEmployee) return alert("Lütfen bir çalışan seçin");
    if (step === 4 && !selectedTimeSlot) return alert("Lütfen bir saat seçin");
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' });
  };

  const handleConfirm = async () => {
    if (!user) {
      alert("Randevu almak için giriş yapmalısınız.");
      return;
    }

    try {
      const appointmentData = {
        customerId: user.userId, // Assuming user context has userId
        companyId: selectedCompany.companyId,
        serviceId: selectedService.id,
        employeeId: selectedEmployee.id,
        startTime: selectedTimeSlot.startTime, // ISO String required by backend? DTO expects LocalDateTime which usually maps from ISO string
        status: "PENDING"
      };

      await appointmentService.createAppointment(appointmentData);

      alert("Randevu talebiniz başarıyla oluşturuldu!");
      if (onComplete) onComplete();
      handleClose();
    } catch (error) {
      console.error("Randevu oluşturulurken hata:", error);
      alert("Randevu oluşturulamadı: " + (error.response?.data?.message || error.message));
    }
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
          <button className="wizard-close" onClick={handleClose}>×</button>
        </div>

        {/* Progress Indicator */}
        <div className="wizard-progress">
          {[1, 2, 3, 4, 5].map(s => (
            <React.Fragment key={s}>
              <div className={`progress-step ${step >= s ? "active" : ""}`}>{s}</div>
              {s < 5 && <div className={`progress-line ${step > s ? "active" : ""}`}></div>}
            </React.Fragment>
          ))}
        </div>

        <div className="wizard-body">
          {/* Step 1: Company Selection */}
          {step === 1 && (
            <div className="wizard-step">
              <div className="step-section">
                <label className="step-label">Randevu almak istediğiniz şirketi seçin</label>
                <div className="company-list">
                  {loadingCompanies ? (
                    <div className="loading-message">Şirketler yükleniyor...</div>
                  ) : companies.length === 0 ? (
                    <div className="error-message">Henüz kayıtlı şirket bulunmuyor.</div>
                  ) : (
                    companies.map((c) => (
                      <div
                        key={c.companyId}
                        className={`company-item ${selectedCompany?.companyId === c.companyId ? "selected" : ""}`}
                        onClick={() => setSelectedCompany(c)}
                      >
                        <div className="company-icon"></div>
                        <div className="company-info">
                          <h4>{c.name}</h4>
                          <p>{c.address}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Service Selection */}
          {step === 2 && (
            <div className="wizard-step">
              <div className="step-section">
                <label className="step-label">Almak istediğiniz hizmeti seçin</label>
                <div className="service-list">
                  {loadingServices ? (
                    <div className="loading-message">Hizmetler yükleniyor...</div>
                  ) : services.length === 0 ? (
                    <div className="error-message">Bu şirkete ait hizmet bulunamadı.</div>
                  ) : (
                    services.map((s) => (
                      <div
                        key={s.id}
                        className={`service-item ${selectedService?.id === s.id ? "selected" : ""}`}
                        onClick={() => setSelectedService(s)}
                      >
                        <div className="service-info">
                          <h4>{s.name}</h4>
                          <p>{s.description}</p>
                        </div>
                        <div className="service-time">{s.durationMinutes} dk</div>
                        <div className="service-price">{s.price} TL</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Employee Selection */}
          {step === 3 && (
            <div className="wizard-step">
              <div className="step-section">
                <label className="step-label">Hizmet için bir çalışan seçin</label>
                <div className="employee-list">
                  {loadingEmployees ? (
                    <div className="loading-message">Çalışanlar yükleniyor...</div>
                  ) : employees.length === 0 ? (
                    <div className="error-message">Bu hizmeti verebilecek çalışan bulunamadı.</div>
                  ) : (
                    employees.map((emp) => (
                      <div
                        key={emp.id}
                        className={`employee-item ${selectedEmployee?.id === emp.id ? "selected" : ""}`}
                        onClick={() => setSelectedEmployee(emp)}
                      >
                        <div className="employee-avatar"></div>
                        <div className="employee-info">
                          <h4>{emp.name}</h4>
                          {/* Title might not be available in standard DTO, assuming name is main wrapper */}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Date & Time Selection */}
          {step === 4 && (
            <div className="wizard-step">
              <div className="datetime-container">
                <div className="calendar-section">
                  <div className="calendar-header">
                    <button onClick={prevMonth} className="cal-nav">‹</button>
                    <div className="cal-title">
                      {new Date(year, month).toLocaleString("tr-TR", { month: "long", year: "numeric" })}
                    </div>
                    <button onClick={nextMonth} className="cal-nav">›</button>
                  </div>
                  <div className="calendar-grid">
                    <div className="cal-weekdays">
                      {["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"].map(d => <div key={d} className="cal-weekday">{d}</div>)}
                    </div>
                    <div className="cal-days">
                      {weeks.map((week, i) => (
                        <div key={i} className="cal-week">
                          {week.map((day, j) => (
                            <div
                              key={j}
                              className={`cal-day ${day === 0 ? "empty" : ""} ${day === calendarDay ? "selected" : ""}`}
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

                <div className="timeslot-section">
                  <label className="step-label">Müsait Saatler</label>
                  <div className="timeslot-list">
                    {loadingAvailability ? (
                      <div className="loading-message">Saatler kontrol ediliyor...</div>
                    ) : !selectedDate ? (
                      <div className="info-result">Lütfen bir tarih seçin.</div>
                    ) : availableSlots.length === 0 ? (
                      <div className="no-slots">Bugün için boş saat yok.</div>
                    ) : (
                      availableSlots.map((slot, index) => {
                        const timeLabel = formatTime(slot.startTime);
                        const isSelected = selectedTimeSlot?.startTime === slot.startTime;
                        return (
                          <button
                            key={index}
                            className={`timeslot-btn ${isSelected ? "selected" : ""}`}
                            onClick={() => setSelectedTimeSlot(slot)}
                          >
                            {timeLabel}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <div className="wizard-step">
              <div className="confirmation-section">
                <h3>Randevu Bilgilerinizi Kontrol Edin</h3>
                <div className="confirm-details">
                  <div className="confirm-row">
                    <span className="confirm-label">Şirket:</span>
                    <span className="confirm-value">{selectedCompany?.name}</span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">Hizmet:</span>
                    <span className="confirm-value">{selectedService?.name}</span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">Çalışan:</span>
                    <span className="confirm-value">{selectedEmployee?.name}</span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">Tarih:</span>
                    <span className="confirm-value">{selectedDate}</span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">Saat:</span>
                    <span className="confirm-value">{formatTime(selectedTimeSlot?.startTime)}</span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">Ücret:</span>
                    <span className="confirm-value">{selectedService?.price} TL</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="wizard-footer">
          {step > 1 && <button className="wizard-btn wizard-btn-back" onClick={handleBack}>Geri</button>}
          {step < 5 ? (
            <button className="wizard-btn wizard-btn-next" onClick={handleNext}>{step === 4 ? "Önizleme" : "İleri"}</button>
          ) : (
            <button className="wizard-btn wizard-btn-confirm" onClick={handleConfirm}>Randevuyu Onayla</button>
          )}
        </div>
      </div>
    </div>
  );
}
