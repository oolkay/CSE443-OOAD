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

  // availability: if `employee` param is a numeric id, try to fetch real availability
  // otherwise fall back to the existing mock behavior
  const availability = useMemo(() => {
    const avail = {};
    for (let i = 0; i < TIMES.length; i++) {
      const key = TIMES[i];
      avail[key] = "unavailable"; // default
    }
    return avail;
  }, []);

  // If employee param looks like a numeric id, call backend availability API and map results
  React.useEffect(() => {
    let cancelled = false;
    async function loadAvailability() {
      // detect numeric id
      const empId =
        employee && /^\d+$/.test(employee) ? Number(employee) : null;
      if (!empId) return; // not a numeric id - keep mock
      try {
        const BASE_URL =
          process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
        const serviceDuration =
          q.get("timeDuration") || q.get("serviceDuration") || "30";
        const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
          selectedDay
        ).padStart(2, "0")}`;
        const params = new URLSearchParams({ date, serviceDuration });
        const res = await fetch(
          `${BASE_URL}/api/appointments/availability/employee/${empId}?${params.toString()}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const resp = await res.json();
        if (cancelled) return;
        if (resp && resp.slots) {
          const newAvail = {};
          // backend EmployeeAvailabilityResponse contains slots: list of AvailableSlotDTO with startTime,endTime
          // Map TIMES by presence of any slot at that hour:minute
          const slots = resp.slots || [];
          const slotSet = new Set(
            slots.map(
              (s) => s.startTime && s.startTime.split("T")[1].slice(0, 5)
            )
          );
          for (const t of TIMES) {
            // map e.g. "09:00 AM" -> "09:00"
            const match = t.match(/(\d{2}:\d{2})/);
            const key = t;
            if (match && slotSet.has(match[1])) newAvail[key] = "available";
            else newAvail[key] = "unavailable";
          }
          setAvailabilityState(newAvail);
        }
      } catch (e) {
        console.warn("Failed to load availability from API", e);
      }
    }
    loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [employee, selectedDay, month, year, q]);

  // local state to hold availability when fetched from API
  const [availabilityState, setAvailabilityState] = React.useState(null);
  const mergedAvailability = availabilityState || availability;

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
        <h2>Randevu Saati Seçin</h2>
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
                <div>Paz</div>
                <div>Pzt</div>
                <div>Sal</div>
                <div>Çar</div>
                <div>Per</div>
                <div>Cum</div>
                <div>Cmt</div>
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
            <h4>Saat Seçin</h4>
            <div className="times-list">
              {TIMES.map((t, idx) => {
                const state = mergedAvailability[t];
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
            ‹ Geri
          </button>
          <button className="next-btn" onClick={handleConfirm}>
            Sonraki ›
          </button>
        </div>
      </div>
    </div>
  );
}
