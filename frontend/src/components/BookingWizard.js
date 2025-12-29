import React, { useState, useMemo, useEffect, useCallback } from "react";
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

  // Error/Success States
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Fetch functions defined before useEffects
  const fetchCompanies = useCallback(async () => {
    setLoadingCompanies(true);
    try {
      const data = await companyService.getAllCompanies();
      setCompanies(data);
    } catch (error) {
      // Silently fail
    } finally {
      setLoadingCompanies(false);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    setLoadingServices(true);
    try {
      const data = await serviceService.getServicesByCompany(selectedCompany.companyId);
      setServices(data);
    } catch (error) {
      // Silently fail
    } finally {
      setLoadingServices(false);
    }
  }, [selectedCompany]);

  const fetchEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    try {
      // Fetch all employees of the company
      const allEmployees = await employeeService.getEmployeesByCompany(selectedCompany.companyId);

      // Filter employees who can perform the selected service
      const qualifiedEmployees = allEmployees.filter(emp =>
        emp.assignedServices && emp.assignedServices.some(s => s.id === selectedService.id)
      );

      setEmployees(qualifiedEmployees);
    } catch (error) {
      // Silently fail
    } finally {
      setLoadingEmployees(false);
    }
  }, [selectedCompany, selectedService]);

  const fetchAvailability = useCallback(async () => {
    setLoadingAvailability(true);
    setAvailableSlots([]);
    try {
      const data = await appointmentService.getEmployeeAvailability(
        selectedEmployee.id,
        selectedDate,
        selectedService.durationMinutes,
        selectedService.id
      );
      setAvailableSlots(data.availableSlots || []);
    } catch (error) {
      // Silently fail
    } finally {
      setLoadingAvailability(false);
    }
  }, [selectedEmployee, selectedDate, selectedService]);

  // Fetch Companies on Open
  useEffect(() => {
    if (isOpen && step === 1) {
      fetchCompanies();
    }
  }, [isOpen, step, fetchCompanies]);

  // Fetch Services when Company Selected
  useEffect(() => {
    if (selectedCompany && step === 2) {
      fetchServices();
    }
  }, [selectedCompany, step, fetchServices]);

  // Fetch Employees when Service Selected
  useEffect(() => {
    if (selectedService && step === 3) {
      fetchEmployees();
    }
  }, [selectedService, step, fetchEmployees]);

  // Fetch Availability when Date & Employee Selected
  useEffect(() => {
    if (selectedEmployee && selectedDate && step === 4) {
      fetchAvailability();
    }
  }, [selectedEmployee, selectedDate, step, fetchAvailability]);

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

    // Prevent selecting past dates
    const selectedFullDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for comparison

    if (selectedFullDate < today) {
      setErrorMessage("Geçmiş tarihler için randevu oluşturamazsınız");
      return;
    }

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
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  };

  const handleNext = () => {
    setErrorMessage(null);
    if (step === 1 && !selectedCompany) {
      setErrorMessage("Lütfen bir şirket seçin");
      return;
    }
    if (step === 2 && !selectedService) {
      setErrorMessage("Lütfen bir hizmet seçin");
      return;
    }
    if (step === 3 && !selectedEmployee) {
      setErrorMessage("Lütfen bir çalışan seçin");
      return;
    }
    if (step === 4 && !selectedTimeSlot) {
      setErrorMessage("Lütfen bir saat seçin");
      return;
    }
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
      setErrorMessage("Randevu almak için giriş yapmalısınız.");
      return;
    }

    if (isConfirming) return; // Prevent multiple clicks

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsConfirming(true);

    try {
      // Ensure startTime is in ISO format and in the future
      const startTime = selectedTimeSlot.startTime;

      const appointmentData = {
        customerId: user.userId,
        companyId: selectedCompany.companyId,
        serviceId: selectedService.id,
        employeeId: selectedEmployee.id, // null for random selection
        startTime: startTime // Should be ISO 8601 format: 2025-01-15T10:00:00
      };

      await appointmentService.createAppointment(appointmentData);

      setSuccessMessage("Randevu talebiniz başarıyla oluşturuldu.");
      setTimeout(() => {
        if (onComplete) onComplete();
        handleClose();
      }, 2000);
    } catch (error) {
      // Simple user-friendly message without technical details
      setErrorMessage("Randevu oluşturulamadı. Lütfen bilgileri kontrol edip tekrar deneyin.");
    } finally {
      setIsConfirming(false);
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

        {/* Error Message */}
        {errorMessage && (
          <div style={{
            backgroundColor: '#fff5f5',
            border: '1px solid #fc8181',
            borderRadius: '6px',
            padding: '10px 14px',
            margin: '12px 0',
            color: '#c53030',
            fontSize: '13px'
          }}>
            {errorMessage}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div style={{
            backgroundColor: '#f0fff4',
            border: '1px solid #68d391',
            borderRadius: '6px',
            padding: '10px 14px',
            margin: '12px 0',
            color: '#2f855a',
            fontSize: '13px'
          }}>
            {successMessage}
          </div>
        )}

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
                        <div className="employee-info">
                          <h4>{emp.name}</h4>
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
                          {week.map((day, j) => {
                            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                            const isPast = day > 0 && new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                            return (
                              <div
                                key={j}
                                className={`cal-day ${day === 0 ? "empty" : ""} ${day === calendarDay ? "selected" : ""} ${isPast ? "disabled" : ""} ${isToday ? "today" : ""}`}
                                onClick={() => handleDayClick(day)}
                                style={isPast ? { cursor: 'not-allowed', opacity: 0.3 } : {}}
                              >
                                {day || ""}
                              </div>
                            );
                          })}
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
            <button className="wizard-btn wizard-btn-confirm" onClick={handleConfirm} disabled={isConfirming}>
              {isConfirming ? 'Oluşturuluyor...' : 'Randevuyu Onayla'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
