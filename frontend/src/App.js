import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Auth/Login";
import RequestReset from "./pages/Auth/RequestReset";
import VerifyCode from "./pages/Auth/VerifyCode";
import SetNewPassword from "./pages/Auth/SetNewPassword";
import EnterNewPassword from "./pages/Auth/EnterNewPassword";
import Register from "./pages/Auth/Register";
import Appointments from "./pages/Customer/Appointments";
import ServiceList from "./pages/Customer/ServiceList";
import EmployeeSelect from "./pages/Customer/EmployeeSelect";
import TimePicker from "./pages/Customer/TimePicker";
import Confirmation from "./pages/Customer/Confirmation";
import EmployeeManagement from "./pages/BranchManager/EmployeeManagement/EmployeeManagement";
import ServiceManager from "./pages/BranchManager/ServiceManagement/ServiceManager";
import RequestManagement from "./pages/BranchManager/RequestManagement/RequestManagement";
import ResourceManager from "./pages/BranchManager/ResourceManagement/ResourceManager";
import AdminLayout from "./pages/Admin/AdminLayout";
import Home from "./pages/Admin/Home";
import SuperAdmins from "./pages/Admin/SuperAdmins";
import Companies from "./pages/Admin/Companies";
import Settings from "./pages/Admin/Settings";
import Calendar from "./pages/BranchManager/Calendar/Calendar";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <main className="main-area">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset" element={<RequestReset />} />
            <Route path="/verify-code" element={<VerifyCode />} />
            <Route path="/enter-new-password" element={<SetNewPassword />} />
            <Route path="/reset-password" element={<EnterNewPassword />} />
            <Route path="/services" element={<ServiceList />} />
            <Route path="/employees" element={<EmployeeSelect />} />
            <Route path="/times" element={<TimePicker />} />
            <Route path="/confirm" element={<Confirmation />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/employee-management" element={<EmployeeManagement />} />
            <Route path="/service-management" element={<ServiceManager />} />
            <Route path="/request-management" element={<RequestManagement />} />
            <Route path="/resource-management" element={<ResourceManager />} />
            <Route path="/reset" element={<ResetPassword />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="home" element={<Home />} />
              <Route path="super-admins" element={<SuperAdmins />} />
              <Route path="companies" element={<Companies />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/calendar" element={<Calendar />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
