import React, { useState, useEffect } from 'react';
import './Calendar.css';
import { axios } from '../../../index';
import employeeService from "../../../services/employeeService";
import authService from "../../../services/authService";
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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const user = authService.getCurrentUser();

    const getEmployees = async () => {
        if (user && user.companyId) {
            const employees = await employeeService.getEmployeesByCompany(user.companyId);
            setEmployees(employees);

        }
    }

    const getEmployeeId = (employee) => {
        if (!employee) return undefined;
        return employee.id || employee.user_id || employee.userId;
    };

    const getCalendarData = async () => {
        const dateStart = new Date(currentDate);
        let startTime = new Date(dateStart.setHours(0, 0, 0, 0));
        let endTime = new Date(dateStart.setHours(23, 59, 59, 999));
        let interval = 60;

        if (viewMode === 'weekly') {
            startTime = startOfWeek(currentDate);
            endTime = endOfWeek(currentDate);
        } else if (viewMode === 'monthly') {
            // Get the full range of dates displayed in the monthly view (including padding days)
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const firstDayOfMonth = new Date(year, month, 1);
            const lastDayOfMonth = new Date(year, month + 1, 0);

            // Calculate start date (first day of the first week row)
            // If first day is Sunday (0), we need 6 days of padding (Mon-Sat are 1-6)
            // If first day is Monday (1), we need 0 days of padding
            const startDayOfWeek = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
            startTime = new Date(firstDayOfMonth);
            startTime.setDate(startTime.getDate() - startDayOfWeek);

            // Calculate end date (last day of the last week row)
            // We need to complete the grid to 42 days (6 rows * 7 days) usually
            // But let's verify how renderMonthlyView does it. 
            // renderMonthlyView generates dates dynamically.
            // Let's ensure we cover at least 6 weeks from startTime.
            endTime = new Date(startTime);
            endTime.setDate(endTime.getDate() + 42); // Cover full potential grid

            interval = 24 * 60;
        }



        const data = await axios.get('/api/calendar', {
            params: {
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                interval: interval,
                company_id: user.companyId,
                // Check both id and userId properties as the employee object structure might vary
                employee_id: selectedEmployee !== 'all' ? getEmployeeId(selectedEmployee) : undefined
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        getCalendarData();
    }, [selectedEmployee === 'all' ? 'all' : getEmployeeId(selectedEmployee), viewMode, currentDate]);

    // --- LIFECYCLE ---
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        // In production, fetch from API
        getEmployees();
        // setEmployees(MOCK_EMPLOYEES);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.custom-dropdown')) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isDropdownOpen]);


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
            'REJECTED': 'Reddedildi',
            'CANCELLED': 'İptal Edildi'
        };
        return statusMap[status] || status;
    };

    // --- HELPER: Calculate appointment position and height ---
    const calculateAppointmentStyle = (appointment) => {
        const startTime = new Date(appointment.startTime);
        const startMinutes = startTime.getMinutes();
        const durationMinutes = appointment.duration || 60; // Default to 60 if not provided

        // Each hour slot is 100px, so each minute is 100/60 ≈ 1.667px
        const pixelsPerMinute = 100 / 60;

        // Calculate top position within the hour slot (based on minutes)
        const topPosition = startMinutes * pixelsPerMinute;

        // Calculate height based on duration
        const height = durationMinutes * pixelsPerMinute;

        return {
            position: 'absolute',
            top: `${topPosition}px`,
            left: 0,
            right: 0,
            height: `${height}px`,
            marginBottom: 0
        };
    };

    const findApppointmentClass = (apt) => {
        const now = new Date();
        const startTime = new Date(apt.startTime);
        const endTime = new Date(apt.endTime);

        if (startTime <= now) {
            if (endTime > now)
                return 'processing';
            return 'completed';
        }

        return apt?.status?.toLowerCase() === 'approved' ? 'approved' :
            apt?.status?.toLowerCase() === 'rejected' ? 'rejected' :
                apt?.status?.toLowerCase() === 'cancelled' ? 'cancelled' :
                    'pending';
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
                                    .map((cdata, idx) => {
                                        // Filter out appointments that have already been rendered
                                        const validAppointments = cdata?.appointments?.filter(apt => !insertedAppointmentIds.includes(apt.appointmentId)) || [];

                                        // Add them to the inserted list
                                        insertedAppointmentIds.push(...validAppointments.map(a => a.appointmentId));

                                        return validAppointments.map((apt, aptIndex) => {
                                            const appointmentStyle = calculateAppointmentStyle(apt);
                                            const duration = apt.duration || 60;

                                            // Handle overlapping: split width
                                            const count = validAppointments.length;
                                            const width = 100 / count;
                                            const left = width * aptIndex;

                                            const finalStyle = {
                                                ...appointmentStyle,
                                                width: `${width}%`,
                                                left: `${left}%`
                                            };

                                            // Adjust content based on duration (and width if narrow)
                                            const isVeryShort = duration <= 15;
                                            const showFullDetails = duration >= 60 && count < 3;
                                            const showMediumDetails = duration >= 45 && count < 4;

                                            return (
                                                <div
                                                    key={apt.appointmentId}
                                                    className={`appointment-block ${findApppointmentClass(apt)} ${isVeryShort ? 'very-short' : ''}`}
                                                    style={finalStyle}
                                                    onClick={() => openAppointmentModal(apt)}
                                                    title={`${apt.service} - ${apt.employee}`}
                                                >
                                                    {isVeryShort ? (
                                                        <div className="apt-compact">
                                                            <span className="apt-time-inline">{formatTime(apt.startTime)}</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="apt-time">
                                                                {formatTime(apt.startTime)}
                                                            </div>
                                                            <div className="apt-service" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {apt.service}
                                                            </div>
                                                            {showFullDetails && (
                                                                <div className="apt-employee" style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                                                    {apt.employee}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )
                                        });
                                    })
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
                                            // Handle overlaps per cell slot
                                            const validAppointments = cdata?.appointments?.filter(apt => !insertedAppointmentIds.includes(apt.appointmentId)) || [];
                                            insertedAppointmentIds.push(...validAppointments.map(a => a.appointmentId));

                                            return validAppointments.map((apt, aptIndex) => {
                                                const count = validAppointments.length;
                                                // If more than 2, it gets very crowded in weekly view, but better than hidden
                                                const width = 100 / count;
                                                const left = width * aptIndex;

                                                return (
                                                    <div
                                                        key={apt.appointmentId}
                                                        className={`appointment-block small ${findApppointmentClass(apt)}`}
                                                        style={{
                                                            width: `${width}%`,
                                                            left: `${left}%`,
                                                            position: 'relative', // Weekly view cells often assume flow or relative, let's keep it simple
                                                            // Actually weak view usually doesn't time-scale height unless implemented. 
                                                            // The existing code didn't use calculateAppointmentStyle, likely just stacking blocks. 
                                                            // If they are just stacked blocks, width/left absolute might break flow if container is flex/static.
                                                            // Let's assume standard flow for weekly if not using absolute time.
                                                            // BUT: previous code was just mapped divs. 
                                                            // If we want side-by-side, we need flex container or inline-block.
                                                            display: 'inline-block',
                                                            verticalAlign: 'top',
                                                            minHeight: 'auto'
                                                        }}
                                                        onClick={() => openAppointmentModal(apt)}
                                                        title={`${apt.service} - ${apt.employee}`}
                                                    >
                                                        <div className="apt-time-small">
                                                            {formatTime(apt.startTime)}
                                                        </div>
                                                        <div className="apt-service-small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.service}</div>
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
                                    <div className="day-appointments">
                                        {/* Removed aggregation logic to show appointments for all */}
                                        <>
                                            {dayAppointments.slice(0, 3).map(apt => (
                                                <div
                                                    key={apt.appointmentId}
                                                    className={`apt-indicator ${findApppointmentClass(apt)}`}
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
                                    </div>
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
                </div>
                <div className="header-right">
                    <div className="custom-dropdown">
                        <div
                            className="dropdown-selected"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span>{selectedEmployee === 'all' ? 'Tüm Personel' : (selectedEmployee?.name || 'Seçiniz')}</span>
                            <span className="dropdown-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
                        </div>
                        {isDropdownOpen && (
                            <div className="dropdown-menu">
                                <div
                                    className={`dropdown-item ${selectedEmployee === 'all' ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedEmployee('all');
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                    Tüm Personel
                                </div>
                                {employees.map(emp => (
                                    <div
                                        key={getEmployeeId(emp)}
                                        className={`dropdown-item ${selectedEmployee !== 'all' && getEmployeeId(selectedEmployee) === getEmployeeId(emp) ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedEmployee(emp);
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        {emp.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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
                                    <div>
                                        <div className="label-small">Müşteri</div>
                                        <div className="value-text">{selectedAppointment.customer}</div>
                                    </div>
                                </div>
                                <div className="detail-row">
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
                                    <div>
                                        <div className="label-small">Tarih</div>
                                        <div className="value-text">
                                            {formatDate(new Date(selectedAppointment.startTime))}
                                        </div>
                                    </div>
                                </div>
                                <div className="detail-row">
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
                                        className={`appointment-block small ${findApppointmentClass(apt)}`}
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

