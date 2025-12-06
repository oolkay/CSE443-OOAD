import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./EmployeeSelect.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Mock data - will be replaced with API data
const mockEmployees = [
  { employeeId: 1, name: "Musab", email: "musab@example.com" },
  { employeeId: 2, name: "Ayşe", email: "ayse@example.com" },
  { employeeId: 3, name: "Mehmet", email: "mehmet@example.com" },
  { employeeId: 4, name: "Zeynep", email: "zeynep@example.com" },
];

export default function EmployeeSelect() {
  const q = useQuery();
  const company = q.get("company") || "";
  const companyId = q.get("companyId") || "";
  const service = q.get("service") || "";
  const serviceId = q.get("serviceId") || "";
  const time = q.get("time") || "";
  const navigate = useNavigate();

  const [employees, setEmployees] = useState(mockEmployees);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!companyId) return;

    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        // TODO: Uncomment when backend is ready
        /*
        const response = await fetch(`/api/companies/${companyId}/employees`);
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        const data = await response.json();
        setEmployees(data);
        console.log('Employees fetched:', data);
        */

        // Fallback: use mock data
        setEmployees(mockEmployees);
      } catch (error) {
        console.error('Error fetching employees:', error);
        alert('Çalışanlar yüklenirken bir hata oluştu.');
        setEmployees(mockEmployees);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [companyId]);

  const handleSelect = (emp) => {
    // navigate to time picker with selected employee
    const params = new URLSearchParams({
      company,
      companyId,
      service,
      serviceId,
      time,
      employee: emp.name,
      employeeId: emp.employeeId,
    });
    navigate(`/times?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="employee-page">
        <div className="employee-container">
          <div className="loading-spinner">Çalışanlar yükleniyor...</div>
        </div>
      </div>
    );
  }

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
            <div className="employee-card" key={emp.employeeId}>
              <div className="avatar" />
              <div className="emp-name">{emp.name}</div>
              <div className="emp-title">{emp.email}</div>
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
              const params = new URLSearchParams({ 
                company, 
                companyId,
                service,
                serviceId,
                time 
              });
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
