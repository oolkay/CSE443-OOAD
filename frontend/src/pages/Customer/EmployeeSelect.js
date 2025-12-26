import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./EmployeeSelect.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const employees = [
  { id: "e1", name: "Musab", title: "Stil Uzmanı" },
  { id: "e2", name: "Ayşe", title: "Saç Boyama Uzmanı" },
  { id: "e3", name: "Mehmet", title: "Modern Saç Kesimi Uzmanı" },
  { id: "e4", name: "Zeynep", title: "Saç Bakım Terapisti" },
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
        <h2 className="employee-title">Çalışan Seçimi</h2>
        <p className="employee-sub">
          Hizmetiniz için bir çalışan seçin veya bu adımı atlayın.
        </p>

        <div className="selected-service">
          Seçilen Hizmet:
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
                Seç
              </button>
            </div>
          ))}
        </div>

        <div className="employee-actions">
          <button className="back-btn" onClick={() => navigate(-1)}>
            Geri
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
            Atla
          </button>
        </div>
      </div>
    </div>
  );
}
