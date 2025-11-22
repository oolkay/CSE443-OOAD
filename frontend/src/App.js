import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Login from "./pages/Auth/Login";
import ResetPassword from "./pages/Auth/ResetPassword";
import Register from "./pages/Auth/Register";
import Appointments from "./pages/Customer/Appointments";
import ServiceList from "./pages/Customer/ServiceList";
import EmployeeSelect from "./pages/Customer/EmployeeSelect";
import TimePicker from "./pages/Customer/TimePicker";
import Confirmation from "./pages/Customer/Confirmation";
import ScheduleViewing from "./pages/Customer/ScheduleViewing";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <main className="main-area">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/services" element={<ServiceList />} />
            <Route path="/employees" element={<EmployeeSelect />} />
            <Route path="/times" element={<TimePicker />} />
            <Route path="/confirm" element={<Confirmation />} />
            <Route path="/schedule" element={<ScheduleViewing />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/reset" element={<ResetPassword />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
