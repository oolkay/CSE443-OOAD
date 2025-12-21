import React, { useState, useEffect } from 'react';
import './Calendar.css';
import { axios } from '../../../index';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, addHours } from 'date-fns';

const Calendar = () => {
    // --- STATE ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('weekly'); // 'daily', 'weekly', 'monthly'
    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [calendarData, setCalendarData] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCalendarCell, setSelectedCalendarCell] = useState(null);
    const [isAppointmentsModalOpen, setIsAppointmentsModalOpen] = useState(false);
    
    // --- MOCK DATA ---
    const MOCK_EMPLOYEES = [
        {company_id: 1,	manager_id: 2, user_id:	6, name:	"User Six", email:"user6@example.com", phone: "555-0006"},
        {company_id: 1,	manager_id: 2, user_id:	7, name:	"User Seven", email:"user7@example.com", phone: "555-0007"},
        {company_id: 1,	manager_id: 2, user_id:	8, name:	"User Eight", email:"user8@example.com", phone: ""},
        {company_id: 2,	manager_id: 3, user_id:	9, name:	"User Nine", email:"user9@example.com", phone: "555-0009"},
        {company_id: 2,	manager_id: 3, user_id:	10, name:	"User Ten", email:"user10@example.com", phone: "555-0010"},
        {company_id: 2,	manager_id: 3, user_id:	11, name:	"User Eleven", email:"user11@example.com", phone: "555-0011"},
        {company_id: 3,	manager_id: 4, user_id:	12, name:	"User Twelve", email:"user12@example.com", phone: ""},
        {company_id: 4,	manager_id: 5, user_id:	13, name:	"User Thirteen", email:"user13@example.com", phone: "555-0013"},
        {company_id: 4,	manager_id: 5, user_id:	14, name:	"User Fourteen", email:"user14@example.com", phone: "555-0014"},
        {company_id: 4,	manager_id: 5, user_id:	15, name:	"User Fifteen", email:"user15@example.com", phone: ""}
    ]

    const getCalendarData = async () => {
        const dateStart = new Date(currentDate);
        let startTime = new Date(dateStart.setHours(0, 0, 0, 0));
        let endTime = new Date(dateStart.setHours(23, 59, 59, 999));
        let interval = 60;

        if (viewMode === 'weekly') {
            startTime = startOfWeek(currentDate);
            endTime = endOfWeek(currentDate);
        } else if (viewMode === 'monthly') {
            startTime = startOfMonth(currentDate);
            endTime = endOfMonth(currentDate);
            interval = 24 * 60;
        }

        const data = await axios.get('/api/calendar', {
            params: {
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                interval: interval,
                /* TODO: The company id should be in the local storage cookie or sth. (From the user data) */
                company_id: 2,
                employee_id: selectedEmployee !== 'all' ? selectedEmployee.user_id : undefined 
            }
        })
        let appointmentIds = [];
        const calendarData = data.data.map(item => {
            const appointments = item.appointments.filter(apt => {
                return !appointmentIds.includes(apt.appointmentId);
            });
            appointmentIds.push(...appointments.map(apt => apt.appointmentId));
            return {
                ...item,
                appointments: appointments
            };
        });
        setCalendarData(calendarData);
    }

    useEffect(() => {
        getCalendarData();
    }, [selectedEmployee, viewMode, currentDate]);

    // --- LIFECYCLE ---
    useEffect(() => {
        // In production, fetch from API
        setEmployees(MOCK_EMPLOYEES);
    }, []);

    // --- DATE UTILITIES ---
    const formatDate = (date) => {
        return date.toLocaleDateString('tr-TR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const isSameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    };

    const getWeekDates = (date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay() + 1); // Monday
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            dates.push(d);
        }
        return dates;
    };

    const getMonthDates = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const dates = [];
        
        // Add padding days from previous month
        const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        for (let i = startDay - 1; i >= 0; i--) {
            const d = new Date(firstDay);
            d.setDate(d.getDate() - i - 1);
            dates.push({ date: d, isCurrentMonth: false });
        }
        
        // Add days of current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            dates.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }
        
        // Add padding days from next month
        const remaining = 42 - dates.length;
        for (let i = 1; i <= remaining; i++) {
            const d = new Date(lastDay);
            d.setDate(d.getDate() + i);
            dates.push({ date: d, isCurrentMonth: false });
        }
        
        return dates;
    };

    // --- NAVIGATION ---
    const navigateDate = (direction) => {
        const newDate = new Date(currentDate);
        if (viewMode === 'daily') {
            newDate.setDate(newDate.getDate() + direction);
        } else if (viewMode === 'weekly') {
            newDate.setDate(newDate.getDate() + (7 * direction));
        } else if (viewMode === 'monthly') {
            newDate.setMonth(newDate.getMonth() + direction);
        }
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // --- MODAL ---
    const openAppointmentModal = (appointment) => {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAppointment(null);
    };
    
    const openAppointmentsModal = (appointment) => {
        setSelectedCalendarCell(appointment);
        setIsAppointmentsModalOpen(true);
    };
        
    const closeAppointmentsModal = () => {
        setIsAppointmentsModalOpen(false);
        setSelectedCalendarCell(null);
    };

    // --- STATUS BADGE ---
    const getStatusText = (status) => {
        const statusMap = {
            'PENDING': 'Beklemede',
            'APPROVED': 'Onaylandı',
            'COMPLETED': 'Tamamlandı',
            'CANCELLED': 'İptal Edildi'
        };
        return statusMap[status] || status;
    };

    // --- RENDER TIME SLOTS ---
    const renderDailyView = () => {
        const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 - 20:00
        const insertedAppointmentIds = [];

        return (
            <div className="calendar-view daily-view">
                <div className="time-slots">
                    {hours.map(hour => (
                        <div key={hour} className="time-slot">
                            <div className="time-label">{`${hour}:00`}</div>
                            <div className="slot-content">
                                {calendarData
                                    .filter(cdata => new Date(cdata.timestamp).getHours() === hour)
                                    .map((cdata, idx)=> {
                                        if (selectedEmployee === 'all') {
                                            const appointmentCount = cdata?.appointments?.length;
                                            if (appointmentCount <= 0) {
                                                return null;
                                            }
                                            return (
                                                <div 
                                                    key={idx}
                                                    className={`aggregated-appointment-block`}
                                                    onClick={() => openAppointmentsModal(cdata)}
                                                >
                                                    <div className="agg-apt-time">{formatTime(new Date(cdata.timestamp))} - {formatTime(addHours(new Date(cdata.timestamp), 1))}</div>
                                                    <div className="apt-service">{appointmentCount} Randevu Mevcut</div>
                                                </div>
                                            );
                                        }
                                        return cdata?.appointments?.map(apt => {
                                            if (insertedAppointmentIds.includes(apt.appointmentId)) {
                                                return null;
                                            }
                                            insertedAppointmentIds.push(apt.appointmentId);
                                            
                                            return (
                                                <div 
                                                    key={apt.appointmentId}
                                                    className={`appointment-block ${apt?.status?.toLowerCase()}`}
                                                    onClick={() => openAppointmentModal(apt)}
                                                >
                                                <div className="apt-time">
                                                    {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                                                </div>
                                                    <div className="apt-service">{apt.service}</div>
                                                    <div className="apt-customer">{apt.customer}</div>
                                                    <div className="apt-employee">{apt.employee}</div>
                                                </div>
                                            )})
                                        }
                                    )
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderWeeklyView = () => {
        const weekDates = getWeekDates(currentDate);
        const hours = Array.from({ length: 13 }, (_, i) => i + 8);
        const insertedAppointmentIds = [];

        return (
            <div className="calendar-view weekly-view">
                <div className="week-header">
                    <div className="time-column-header"></div>
                    {weekDates.map((date, idx) => (
                        <div key={idx} className="day-header">
                            <div className="day1-name">
                                {date.toLocaleDateString('tr-TR', { weekday: 'short' })}
                            </div>
                            <div className={`day-number ${isSameDay(date, new Date()) ? 'today' : ''}`}>
                                {date.getDate()}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="week-grid">
                    {hours.map(hour => (
                        <div key={hour} className="week-row">
                            <div className="time-label">{`${hour}:00`}</div>
                            {weekDates.map((date, idx) => {
                                // Filter calendarData for this specific date and hour
                                const cellData = calendarData.filter(cdata => {
                                    const cdataDate = new Date(cdata.timestamp);
                                    return isSameDay(cdataDate, date) && cdataDate.getHours() === hour;
                                });

                                return (
                                    <div key={idx} className="day-cell">
                                        {cellData.map((cdata, cdataIdx) => {
                                            if (selectedEmployee === 'all') {
                                                const appointmentCount = cdata?.appointments?.length || 0;
                                                if (appointmentCount <= 0) {
                                                    return null;
                                                }
                                                return (
                                                    <div 
                                                        key={cdataIdx}
                                                        className="aggregated-appointment-block small"
                                                        onClick={() => openAppointmentsModal(cdata)}
                                                    >
                                                        <div className="apt-time-small">{formatTime(new Date(cdata.timestamp))}</div>
                                                        <div className="apt-service-xsmall">{appointmentCount} Randevu</div>
                                                    </div>
                                                );
                                            }
                                            return cdata?.appointments?.map(apt => {
                                                if (insertedAppointmentIds.includes(apt.appointmentId)) {
                                                    return null;
                                                }
                                                insertedAppointmentIds.push(apt.appointmentId);
                                                return (
                                                    <div 
                                                        key={apt.appointmentId}
                                                        className={`appointment-block small ${apt.status.toLowerCase()}`}
                                                        onClick={() => openAppointmentModal(apt)}
                                                    >
                                                        <div className="apt-time-small">
                                                            {formatTime(apt.startTime)}
                                                        </div>
                                                        <div className="apt-service-small">{apt.service}</div>
                                                    </div>
                                                )
                                            });
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderMonthlyView = () => {
        const monthDates = getMonthDates(currentDate);
        const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

        return (
            <div className="calendar-view monthly-view">
                <div className="month-header">
                    {weekDays.map(day => (
                        <div key={day} className="weekday-label">{day}</div>
                    ))}
                </div>
                <div className="month-grid">
                    {monthDates.map((item, idx) => {
                        const { date, isCurrentMonth } = item;
                        const isToday = isSameDay(date, new Date());
                        
                        // Filter calendarData for this specific date
                        const dayCalendarData = calendarData.filter(cdata => {
                            const cdataDate = new Date(cdata.timestamp);
                            return isSameDay(cdataDate, date);
                        });

                        // Collect all appointments for this day
                        const dayAppointments = [];
                        dayCalendarData.forEach(cdata => {
                            if (cdata.appointments && cdata.appointments.length > 0) {
                                dayAppointments.push(...cdata.appointments);
                            }
                        });
                        
                        return (
                            <div 
                                key={idx} 
                                className={`month-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                            >
                                <div className="date-number">{date.getDate()}</div>
                                <div className="day-appointments">
                                    {selectedEmployee === 'all' && dayAppointments.length > 0 ? (
                                        <>
                                            <div 
                                                className="apt-indicator aggregated"
                                                onClick={() => {
                                                    // Open modal with all appointments for this day
                                                    const combinedData = {
                                                        timestamp: date.toISOString(),
                                                        appointments: dayAppointments
                                                    };
                                                    openAppointmentsModal(combinedData);
                                                }}
                                                title={`${dayAppointments.length} Randevu`}
                                            >
                                                📅 {dayAppointments.length} Randevu
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {dayAppointments.slice(0, 3).map(apt => (
                                                <div 
                                                    key={apt.appointmentId}
                                                    className={`apt-indicator ${apt.status.toLowerCase()}`}
                                                    onClick={() => openAppointmentModal(apt)}
                                                    title={`${apt.service} - ${apt.customer}`}
                                                >
                                                    {formatTime(apt.startTime)} {apt.service}
                                                </div>
                                            ))}
                                            {dayAppointments.length > 3 && (
                                                <div 
                                                    className="more-indicator"
                                                    onClick={() => {
                                                        const combinedData = {
                                                            timestamp: date.toISOString(),
                                                            appointments: dayAppointments
                                                        };
                                                        openAppointmentsModal(combinedData);
                                                    }}
                                                >
                                                    +{dayAppointments.length - 3} daha
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="calendar-container">
            {/* HEADER */}
            <header className="calendar-header">
                <div className="header-left">
                    <h1>Takvim</h1>
                    <p>Personel ve randevu yönetimi</p>
                </div>
                <div className="header-right">
                    <select 
                        className="employee-filter"
                        value={selectedEmployee.user_id}
                        onChange={(e) => setSelectedEmployee(e.target.value === 'all' ? 'all' : employees.find(emp => emp.user_id === parseInt(e.target.value)))}
                    >
                        <option value="all">Tüm Personel</option>
                        {employees.map(emp => (
                            <option key={emp.user_id} value={emp.user_id}>
                                {emp.name}
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            {/* CONTROLS */}
            <div className="calendar-controls">
                <div className="date-navigation">
                    <button className="nav-btn" onClick={() => navigateDate(-1)}>
                        ‹
                    </button>
                    <button className="today-btn" onClick={goToToday}>
                        Bugün
                    </button>
                    <button className="nav-btn" onClick={() => navigateDate(1)}>
                        ›
                    </button>
                    <span className="current-date-display">{formatDate(currentDate)}</span>
                </div>
                
                <div className="view-mode-toggle">
                    <button 
                        className={`view-btn ${viewMode === 'daily' ? 'active' : ''}`}
                        onClick={() => setViewMode('daily')}
                    >
                        Günlük
                    </button>
                    <button 
                        className={`view-btn ${viewMode === 'weekly' ? 'active' : ''}`}
                        onClick={() => setViewMode('weekly')}
                    >
                        Haftalık
                    </button>
                    <button 
                        className={`view-btn ${viewMode === 'monthly' ? 'active' : ''}`}
                        onClick={() => setViewMode('monthly')}
                    >
                        Aylık
                    </button>
                </div>
            </div>

            {/* CALENDAR VIEW */}
            <div className="calendar-content">
                {viewMode === 'daily' && renderDailyView()}
                {viewMode === 'weekly' && renderWeeklyView()}
                {viewMode === 'monthly' && renderMonthlyView()}
            </div>

            {/* APPOINTMENT DETAIL MODAL */}
            {isModalOpen && selectedAppointment && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content appointment-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Randevu Detayları</h2>
                            <button className="close-btn" onClick={closeModal}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-icon-large">📅</div>
                            
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="label">Hizmet</span>
                                    <span className="value">{selectedAppointment.service}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Durum</span>
                                    <span className={`status-badge ${selectedAppointment.status.toLowerCase()}`}>
                                        {getStatusText(selectedAppointment.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <div className="detail-row">
                                    <span className="icon">👤</span>
                                    <div>
                                        <div className="label-small">Müşteri</div>
                                        <div className="value-text">{selectedAppointment.customer}</div>
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <span className="icon">💼</span>
                                    <div>
                                        <div className="label-small">Personel</div>
                                        <div 
                                            className="value-text"
                                            style={{ 
                                                color: `var(--user-${selectedAppointment.employeeId % 15}-name)`,
                                                fontWeight: 600
                                            }}
                                        >
                                            {selectedAppointment.employee}
                                        </div>
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <span className="icon">📅</span>
                                    <div>
                                        <div className="label-small">Tarih</div>
                                        <div className="value-text">
                                            {formatDate(new Date(selectedAppointment.startTime))}
                                        </div>
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <span className="icon">🕐</span>
                                    <div>
                                        <div className="label-small">Saat</div>
                                        <div className="value-text">
                                            {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}
                                        </div>
                                    </div>
                                </div>
                                {selectedAppointment.resources && (
                                    <div className="detail-row">
                                        <span className="icon">🔧</span>
                                        <div>
                                            <div className="label-small">Kaynaklar</div>
                                            <div className="value-text">{selectedAppointment.resources}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-close" onClick={closeModal}>Kapat</button>
                        </div>
                    </div>
                </div>
            )}

            {/* APPOINTMENTs MODAL */}
            {isAppointmentsModalOpen && selectedCalendarCell && (
                <div className="appointments-modal" onClick={closeAppointmentsModal}>
                    <div className="modal-content appointment-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Randevu Detayları</h2>
                            <button className="close-btn" onClick={closeAppointmentsModal}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-appointments">
                                {selectedCalendarCell.appointments.map(apt => (
                                    <div 
                                        key={apt.appointmentId}
                                        className={`appointment-block small ${apt.status.toLowerCase()}`}
                                        onClick={() => openAppointmentModal(apt)}
                                        title={`${apt.service} - ${apt.customer}`}
                                        style={{
                                            borderLeftColor: `var(--user-${apt.employeeId % 15}-name)`
                                        }}
                                    >
                                        <span className="apt-time-small">{formatTime(apt.startTime)} - {formatTime(apt.endTime)}</span>
                                        <div className="apt-employee-service-small">
                                            <span 
                                                className="apt-employee-small"
                                                style={{ 
                                                    padding: '0.15rem 0.35rem',
                                                    borderRadius: '0.25rem',
                                                    background: `var(--user-${apt.employeeId % 15}-bg)`,
                                                    color: `var(--user-${apt.employeeId % 15}-name)`
                                                }}
                                            >
                                                {apt.employee}:
                                            </span>
                                            <p className="apt-service-name-small">{apt.service}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-close" onClick={closeAppointmentsModal}>Kapat</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;

