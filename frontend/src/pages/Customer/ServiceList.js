import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ServiceList.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const sampleServices = [
  {
    id: "s1",
    title: "Saç Kesimi",
    desc: "Uzman kuaförlerimizden klasik veya modern saç kesimi",
    time: "30 dakika",
  },
  {
    id: "s2",
    title: "Sakal Tıraşı",
    desc: "Geleneksel teknikler kullanılarak yumuşak sakal tıraşı",
    time: "20 dakika",
  },
  {
    id: "s3",
    title: "Saç Yıkama & Kurutma",
    desc: "Ferahlatıcı saç yıkaması ve şık kurutma",
    time: "15 dakika",
  },
  {
    id: "s4",
    title: "Çocuk Saç Kesimi",
    desc: "Çocuklar için eğlenceli bir ortamda özel saç kesimi",
    time: "25 dakika",
  },
  {
    id: "s5",
    title: "Saç Boyama",
    desc: "Saçlarınıza yeni hayat katın - renk uzmanlarımız",
    time: "90 dakika",
  },
  {
    id: "s6",
    title: "Özel Bakım Paketi",
    desc: "Saçlarınız için derin bakım ve rahatlatıcı masaj",
    time: "60 dakika",
  },
];

export default function ServiceList() {
  const query = useQuery();
  const company = query.get("company") || "Selected Company";
  const navigate = useNavigate();

  return (
    <div className="service-page">
      <div className="service-container">
        <h2 className="service-title">Hizmet Seçin</h2>
        <p className="service-sub">
          Kişiselleştirilmiş bir deneyim için geniş hizmetlerimizden seçin.
          Seçtikten sonra sonraki adıma geçebilirsiniz.
        </p>

        <div className="service-grid">
          {sampleServices.map((s) => (
            <div className="service-card" key={s.id}>
              <div className="service-image" />
              <div className="service-body">
                <h4>{s.title}</h4>
                <p className="service-desc">{s.desc}</p>
                <p className="service-time">Süre: {s.time}</p>
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
                  Hizmet Seç
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <button className="back-btn" onClick={() => navigate(-1)}>
            Geri
          </button>
        </div>
      </div>
    </div>
  );
}
