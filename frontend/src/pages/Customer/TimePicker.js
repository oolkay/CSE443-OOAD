import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TimePicker.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function buildMonth(year, month) {
  // returns array of weeks, each week is array of day numbers (0 means empty)
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

const TIMES = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
];

export default function TimePicker() {
  const q = useQuery();
  const company = q.get("company") || "";
  const service = q.get("service") || "";
  const employee = q.get("employee") || "";
  const employeeId = q.get("employeeId") || ""; // Employee ID from previous page
  const serviceId = q.get("serviceId") || ""; // Service ID from previous page
 // const serviceDuration = q.get("serviceDuration") || "60"; // Service duration in minutes
  const navigate = useNavigate();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const weeks = useMemo(() => buildMonth(year, month), [year, month]);

  // Fetch available time slots from API when date changes
  useEffect(() => {
    if (employeeId && serviceId) {
      fetchAvailableSlots();
    }
  }, [selectedDay, month, year, employeeId, serviceId]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      //const selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
      
      // TODO: API call to get employee availability
      // const response = await fetch(
      //   `/api/appointments/availability/employee/${employeeId}?date=${selectedDate}&serviceDuration=${serviceDuration}`
      // );
      // const data = await response.json();
      // setAvailableSlots(data.availableSlots);
      
      // Mock data for now - remove this when API is connected
      const mockSlots = TIMES.map((time, i) => {
        const isAvailable = (selectedDay + i) % 3 !== 0; // Mock availability
        return {
          time: time,
          available: isAvailable
        };
      });
      setAvailableSlots(mockSlots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const availability = useMemo(() => {
    const avail = {};
    availableSlots.forEach(slot => {
      avail[slot.time] = slot.available ? "available" : "unavailable";
    });
    
    // If no API data yet, fallback to old mock logic
    if (availableSlots.length === 0) {
      for (let i = 0; i < TIMES.length; i++) {
        const key = TIMES[i];
        const unavailable = (selectedDay + i) % 4 === 0;
        avail[key] = unavailable ? "unavailable" : "available";
      }
    }
    
    return avail;
  }, [availableSlots, selectedDay]);

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

  const handleConfirm = () => {
    if (!selectedTime) {
      alert("Lütfen bir zaman seçin");
      return;
    }
    // navigate to confirmation page with appointment details
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(selectedDay).padStart(2, "0");
    const date = `${year}-${mm}-${dd}`;
    const params = new URLSearchParams({
      company: company || "",
      service: service || "",
      employee: employee || "",
      date,
      time: selectedTime,
    }).toString();
    navigate(`/confirm?${params}`);
  };

  return (
    <div className="time-page">
      <div className="time-container">
        <h2>Select Appointment Time</h2>
        <div className="time-grid">
          <div className="calendar-card">
            <div className="cal-header">
              <button onClick={prevMonth} className="cal-nav">
                ‹
              </button>
              <div className="cal-title">
                {new Date(year, month).toLocaleString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <button onClick={nextMonth} className="cal-nav">
                ›
              </button>
            </div>
            <div className="cal-weeks">
              <div className="cal-weekday-row">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
              </div>
              {weeks.map((week, wi) => (
                <div className="cal-week" key={wi}>
                  {week.map((d, di) => (
                    <div
                      key={di}
                      className={`cal-day ${d === 0 ? "empty" : ""} ${
                        d === selectedDay ? "selected" : ""
                      }`}
                      onClick={() => d !== 0 && setSelectedDay(d)}
                    >
                      {d !== 0 ? d : ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="times-card">
            <h4>Select Time Zone</h4>
            {loading ? (
              <div className="loading-slots">
                <div>⏳</div>
                <p>Müsait saatler yükleniyor...</p>
              </div>
            ) : (
              <div className="times-list">
                {TIMES.map((t, idx) => {
                  const state = availability[t];
                  const isSelected = selectedTime === t;
                  return (
                    <button
                      key={t}
                      className={`time-slot ${
                        state === "unavailable" ? "unavailable" : ""
                      } ${isSelected ? "selected" : ""}`}
                      onClick={() => state === "available" && setSelectedTime(t)}
                      disabled={state === "unavailable"}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="time-actions">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ‹ Back
          </button>
          <button className="next-btn" onClick={handleConfirm}>
            Next ›
          </button>
        </div>
      </div>
    </div>
  );
}
