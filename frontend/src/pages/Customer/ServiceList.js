import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ServiceList.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Mock data - will be replaced with API data
const mockServices = [
  {
    serviceId: 1,
    serviceName: "Haircut",
    description: "Classic or modern haircuts from our expert stylists",
    durationMinutes: 30,
  },
  {
    serviceId: 2,
    serviceName: "Beard Shaving",
    description: "Smooth beard shave using traditional techniques",
    durationMinutes: 20,
  },
  {
    serviceId: 3,
    serviceName: "Hair Wash & Blow-dry",
    description: "Refreshing hair wash and stylish blow dry",
    durationMinutes: 15,
  },
  {
    serviceId: 4,
    serviceName: "Children Haircut",
    description: "Special haircuts for children in a fun atmosphere",
    durationMinutes: 25,
  },
  {
    serviceId: 5,
    serviceName: "Hair Coloring",
    description: "Add new vitality to your hair with our colorists",
    durationMinutes: 90,
  },
  {
    serviceId: 6,
    serviceName: "Special Care Package",
    description: "Deep care and relaxing massage special for your hair",
    durationMinutes: 60,
  },
];

export default function ServiceList() {
  const query = useQuery();
  const company = query.get("company") || "Selected Company";
  const companyId = query.get("companyId") || "";
  const navigate = useNavigate();

  const [services, setServices] = useState(mockServices);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!companyId) return;

    const fetchServices = async () => {
      setIsLoading(true);
      try {
        // TODO: Uncomment when backend is ready
        /*
        const response = await fetch(`/api/companies/${companyId}/services`);
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        setServices(data);
        console.log('Services fetched:', data);
        */

        // Fallback: use mock data
        setServices(mockServices);
      } catch (error) {
        console.error('Error fetching services:', error);
        alert('Hizmetler yüklenirken bir hata oluştu.');
        setServices(mockServices);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [companyId]);

  if (isLoading) {
    return (
      <div className="service-page">
        <div className="service-container">
          <div className="loading-spinner">Hizmetler yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="service-page">
      <div className="service-container">
        <h2 className="service-title">Select Service</h2>
        <p className="service-sub">
          Choose from our wide range of services for a personalized experience.
          After selection you can move on to the next step.
        </p>

        <div className="service-grid">
          {services.map((s) => (
            <div className="service-card" key={s.serviceId}>
              <div className="service-image" />
              <div className="service-body">
                <h4>{s.serviceName}</h4>
                <p className="service-desc">{s.description}</p>
                <p className="service-time">Time: {s.durationMinutes} minutes</p>
                <button
                  className="select-service"
                  onClick={() => {
                    const params = new URLSearchParams({
                      company: company,
                      companyId: companyId,
                      service: s.serviceName,
                      serviceId: s.serviceId,
                      time: `${s.durationMinutes} minutes`,
                    });
                    navigate(`/employees?${params.toString()}`);
                  }}
                >
                  Select Service
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <button className="back-btn" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
