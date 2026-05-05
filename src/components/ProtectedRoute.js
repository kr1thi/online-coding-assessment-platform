import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roleRequired }) => {
    const token = localStorage.getItem('token');
    // Check both keys= role or userRole
    const storedRole = localStorage.getItem('role') || localStorage.getItem('userRole');
    const userRole = storedRole?.toUpperCase().trim();

    console.log("Current User Role in Storage:", userRole); // Debugging ku

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (roleRequired) {
        const allowedRoles = Array.isArray(roleRequired) 
            ? roleRequired.map(r => r.toUpperCase()) 
            : [roleRequired.toUpperCase()];

        const isAuthorized = allowedRoles.includes(userRole);

        if (!isAuthorized) {
            console.warn(`Role Mismatch! Allowed: ${allowedRoles}, Found: ${userRole}`);
            // userRole la illana thaan login ku poganum
           if (!userRole) return <Navigate to="/login" replace />;

            // Role mismatch aana avanga dashboard ke anupiralam
            if (userRole === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
            if (userRole === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
            if (userRole === 'ADMIN') return <Navigate to="/admin" replace />;
            
            return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
