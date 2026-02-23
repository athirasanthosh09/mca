import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import UserHome from './user/UserHome';
import AdminHome from './admin/AdminHome';
import DriverHome from './driver/DriverHome';

const Dashboard = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    switch (user.role) {
        case 'Admin':
            return <AdminHome />;
        case 'Driver':
            return <DriverHome />;
        case 'User':
        default:
            return <UserHome />;
    }
};

export default Dashboard;
