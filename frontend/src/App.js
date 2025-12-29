import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import OfflineBanner from "./components/OfflineBanner";
import InstallPrompt from "./components/InstallPrompt";
import useNetworkStatus from "./hooks/useNetworkStatus";
import Login from "./pages/Auth/Login";
import RequestReset from "./pages/Auth/RequestReset";
import VerifyCode from "./pages/Auth/VerifyCode";
import SetNewPassword from "./pages/Auth/SetNewPassword";
import EnterNewPassword from "./pages/Auth/EnterNewPassword";
import Register from "./pages/Auth/Register";
import Appointments from "./pages/Customer/Appointments";
import EmployeeManagement from "./pages/BranchManager/EmployeeManagement/EmployeeManagement";
import ServiceManager from "./pages/BranchManager/ServiceManagement/ServiceManager";
import RequestManagement from "./pages/BranchManager/RequestManagement/RequestManagement";
import ResourceManager from "./pages/BranchManager/ResourceManagement/ResourceManager";
import AdminLayout from "./pages/Admin/AdminLayout";
import Home from "./pages/Admin/Home";
import Companies from "./pages/Admin/Companies";
import Calendar from "./pages/BranchManager/Calendar/Calendar";
import EmployeeDashboard from "./pages/Employee/EmployeeDashboard";
import BranchManagerDashboard from "./pages/BranchManager/BranchManagerDashboard";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  const ROLES = {
    CUSTOMER: "ROLE_CUSTOMER",
    MANAGER: "ROLE_MANAGER",
    SUPER_ADMIN: "ROLE_SUPER_ADMIN",
    EMPLOYEE: "ROLE_EMPLOYEE",
  };

  // Get network status
  const isOnline = useNetworkStatus();

  return (
    <BrowserRouter>
      <div className="app-shell">
        {/* Show offline banner only when offline */}
        {!isOnline && <OfflineBanner />}
        <InstallPrompt variant="banner" />

        <main className={`main-area ${!isOnline ? 'offline-mode' : ''}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset" element={<RequestReset />} />
            <Route path="/verify-code" element={<VerifyCode />} />
            <Route path="/enter-new-password" element={<SetNewPassword />} />
            <Route path="/reset-password" element={<EnterNewPassword />} />

            {/* Customer Routes */}

            <Route
              path="/appointments"
              element={
                <PrivateRoute allowedRoles={[ROLES.CUSTOMER]}>
                  <Appointments />
                </PrivateRoute>
              }
            />

            {/* Manager Routes */}
            <Route
              path="/employee-management"
              element={
                <PrivateRoute allowedRoles={[ROLES.MANAGER]}>
                  <EmployeeManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/service-management"
              element={
                <PrivateRoute allowedRoles={[ROLES.MANAGER]}>
                  <ServiceManager />
                </PrivateRoute>
              }
            />
            <Route
              path="/request-management"
              element={
                <PrivateRoute allowedRoles={[ROLES.MANAGER, ROLES.EMPLOYEE]}>
                  <RequestManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/resource-management"
              element={
                <PrivateRoute allowedRoles={[ROLES.MANAGER]}>
                  <ResourceManager />
                </PrivateRoute>
              }
            />
            <Route
              path="/manager/dashboard"
              element={
                <PrivateRoute allowedRoles={[ROLES.MANAGER]}>
                  <BranchManagerDashboard />
                </PrivateRoute>
              }
            />

            {/* Employee Routes */}
            <Route
              path="/employee/dashboard"
              element={
                <PrivateRoute allowedRoles={[ROLES.EMPLOYEE]}>
                  <EmployeeDashboard />
                </PrivateRoute>
              }
            />

            {/* Calendar - Accessible by Manager and Employee */}
            <Route
              path="/calendar"
              element={
                <PrivateRoute allowedRoles={[ROLES.MANAGER, ROLES.EMPLOYEE]}>
                  <Calendar />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route path="home" element={<Home />} />
              <Route path="companies" element={<Companies />} />
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
