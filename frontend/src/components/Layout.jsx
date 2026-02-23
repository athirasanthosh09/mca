import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const { user } = useAuth();

    if (!user) {
        return <>{children}</>;
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: `calc(100% - 280px)` }}>
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
