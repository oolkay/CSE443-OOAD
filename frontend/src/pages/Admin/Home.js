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
        <h2>Hi, {currentUser.name} 👋</h2>
        <p>Welcome to Super Admin Dashboard</p>
        <p>Manage your appointment system from here.</p>
      </div>
    </div>
  );
}
