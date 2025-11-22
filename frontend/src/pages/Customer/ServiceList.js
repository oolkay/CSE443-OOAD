import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ServiceList.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const sampleServices = [
  {
    id: "s1",
    title: "Haircut",
    desc: "Classic or modern haircuts from our expert stylists",
    time: "30 minutes",
  },
  {
    id: "s2",
    title: "Beard Shaving",
    desc: "Smooth beard shave using traditional techniques",
    time: "20 minutes",
  },
  {
    id: "s3",
    title: "Hair Wash & Blow-dry",
    desc: "Refreshing hair wash and stylish blow dry",
    time: "15 minutes",
  },
  {
    id: "s4",
    title: "Children Haircut",
    desc: "Special haircuts for children in a fun atmosphere",
    time: "25 minutes",
  },
  {
    id: "s5",
    title: "Hair Coloring",
    desc: "Add new vitality to your hair with our colorists",
    time: "90 minutes",
  },
  {
    id: "s6",
    title: "Special Care Package",
    desc: "Deep care and relaxing massage special for your hair",
    time: "60 minutes",
  },
];

export default function ServiceList() {
  const query = useQuery();
  const company = query.get("company") || "Selected Company";
  const navigate = useNavigate();

  return (
    <div className="service-page">
      <div className="service-container">
        <h2 className="service-title">Select Service</h2>
        <p className="service-sub">
          Choose from our wide range of services for a personalized experience.
          After selection you can move on to the next step.
        </p>

        <div className="service-grid">
          {sampleServices.map((s) => (
            <div className="service-card" key={s.id}>
              <div className="service-image" />
              <div className="service-body">
                <h4>{s.title}</h4>
                <p className="service-desc">{s.desc}</p>
                <p className="service-time">Time: {s.time}</p>
                <button
                  className="select-service"
                  onClick={() =>
                    navigate(
                      `/employees?company=${encodeURIComponent(
                        company
                      )}&service=${encodeURIComponent(
                        s.title
                      )}&time=${encodeURIComponent(s.time)}`
                    )
                  }
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
