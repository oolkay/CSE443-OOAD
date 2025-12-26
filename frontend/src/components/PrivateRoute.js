import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

/**
 * PrivateRoute component for role-based access control
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 */
const PrivateRoute = ({ children, allowedRoles = [] }) => {
    const location = useLocation();
    const isAuthenticated = authService.isAuthenticated();
    const currentUser = authService.getCurrentUser();

    // If not authenticated, redirect to login page
    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // If roles are specified and user doesn't have required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role)) {
        // Redirect based on user role to their appropriate home page
        // This prevents infinite loops if we just redirected to a single "unauthorized" page
        // that they might not have access to either

        const role = currentUser?.role;

        if (role === 'ROLE_CUSTOMER') {
            return <Navigate to="/appointments" replace />;
        }

        if (role === 'ROLE_MANAGER') {
            return <Navigate to="/employee-management" replace />;
        }

        if (role === 'ROLE_SUPER_ADMIN') {
            return <Navigate to="/admin/home" replace />;
        }

        if (role === 'ROLE_EMPLOYEE') {
            return <Navigate to="/calendar" replace />;
        }

        // Fallback for unknown roles
        return <Navigate to="/" replace />;
    }

    // specific check for login page if user is already authenticated
    if (location.pathname === '/' && isAuthenticated) {
        const role = currentUser?.role;

        if (role === 'ROLE_CUSTOMER') {
            return <Navigate to="/appointments" replace />;
        }

        if (role === 'ROLE_MANAGER') {
            return <Navigate to="/employee-management" replace />;
        }

        if (role === 'ROLE_SUPER_ADMIN') {
            return <Navigate to="/admin/home" replace />;
        }

        if (role === 'ROLE_EMPLOYEE') {
            return <Navigate to="/calendar" replace />;
        }
    }

    return children;
};

export default PrivateRoute;
