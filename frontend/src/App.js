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
import EmployeeManagement from "./pages/BranchManager/EmployeeManagement/EmployeeManagement";
import ServiceManager from "./pages/BranchManager/ServiceManagement/ServiceManager";
import ResourceManager from "./pages/BranchManager/ResourceManagement/ResourceManager";
import AdminLayout from "./pages/Admin/AdminLayout";
import Home from "./pages/Admin/Home";
import SuperAdmins from "./pages/Admin/SuperAdmins";
import Companies from "./pages/Admin/Companies";
import Settings from "./pages/Admin/Settings";

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
            <Route path="/employee-management" element={<EmployeeManagement />} />
            <Route path="/service-management" element={<ServiceManager />} />
            <Route path="/resource-management" element={<ResourceManager />} />
            <Route path="/reset" element={<ResetPassword />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="home" element={<Home />} />
              <Route path="super-admins" element={<SuperAdmins />} />
              <Route path="companies" element={<Companies />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
