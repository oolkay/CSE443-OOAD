import React, { useState, useMemo } from "react";
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
  const navigate = useNavigate();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedTime, setSelectedTime] = useState(null);

  const weeks = useMemo(() => buildMonth(year, month), [year, month]);
  // employees used for combined availability simulation
  const EMPLOYEES = ["Musab", "Ayşe", "Mehmet", "Zeynep"];

  function hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
    return Math.abs(h);
  }

  // mock availability: if `employee` is provided compute availability for that employee,
  // otherwise compute combined availability across all EMPLOYEES (available if any is available)
  const availability = useMemo(() => {
    const avail = {};
    for (let i = 0; i < TIMES.length; i++) {
      const key = TIMES[i];
      if (employee) {
        const h = hashString(employee);
        const unavailable = (selectedDay + i + (h % 5)) % 4 === 0;
        avail[key] = unavailable ? "unavailable" : "available";
      } else {
        // combined: if any employee is available at this slot, mark available
        let anyAvailable = false;
        for (const emp of EMPLOYEES) {
          const h = hashString(emp);
          const unavailable = (selectedDay + i + (h % 5)) % 4 === 0;
          if (!unavailable) {
            anyAvailable = true;
            break;
          }
        }
        avail[key] = anyAvailable ? "available" : "unavailable";
      }
    }
    return avail;
  }, [selectedDay, employee]);

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
