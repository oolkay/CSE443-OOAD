import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./EmployeeSelect.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const employees = [
  { id: "e1", name: "Musab", title: "Stylist Expert" },
  { id: "e2", name: "Ayşe", title: "Hair Coloring Expert" },
  { id: "e3", name: "Mehmet", title: "Modern Haircut Expert" },
  { id: "e4", name: "Zeynep", title: "Hair Care Therapist" },
];

export default function EmployeeSelect() {
  const q = useQuery();
  const company = q.get("company") || "";
  const service = q.get("service") || "";
  const time = q.get("time") || "";
  const navigate = useNavigate();

  const handleSelect = (emp) => {
    // navigate to time picker with selected employee
    const params = new URLSearchParams({
      company,
      service,
      time,
      employee: emp.name,
    });
    navigate(`/times?${params.toString()}`);
  };

  return (
    <div className="employee-page">
      <div className="employee-container">
        <h2 className="employee-title">employee Choice</h2>
        <p className="employee-sub">
          Select an employee for your service or skip this step.
        </p>

        <div className="selected-service">
          Selected Service:
          <br />
          <strong>
            {service} - {time}
          </strong>
        </div>

        <div className="employee-grid">
          {employees.map((emp) => (
            <div className="employee-card" key={emp.id}>
              <div className="avatar" />
              <div className="emp-name">{emp.name}</div>
              <div className="emp-title">{emp.title}</div>
              <button className="select-emp" onClick={() => handleSelect(emp)}>
                Select
              </button>
            </div>
          ))}
        </div>

        <div className="employee-actions">
          <button className="back-btn" onClick={() => navigate(-1)}>
            Back
          </button>
          <button
            className="skip-btn"
            onClick={() => {
              // Navigate to time picker without specifying an employee so
              // TimePicker will show combined availability across all staff
              const params = new URLSearchParams({ company, service, time });
              navigate(`/times?${params.toString()}`);
            }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
