import React, { useState, useEffect } from "react";
import authService from "../../services/authService";
import "./Home.css";

export default function Home() {
  const [currentUser, setCurrentUser] = useState({ name: "Loading..." });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser({ name: user.name });
    }
  }, []);

  return (
    <div className="admin-home">
      <div className="home-content">
        <h2>Süper Yönetici Paneline Hoş Geldiniz</h2>
        <p>Randevu sisteminizi buradan yönetin.</p>
      </div>
    </div>
  );
}
