import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';

const GreetingHeader = ({ userName, role }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const formatDate = () => {
        const options = { month: 'short', day: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    };

    // Generate initials from name
    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                    sx={{
                        width: 56,
                        height: 56,
                        bgcolor: 'primary.main',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                    }}
                >
                    {getInitials(userName)}
                </Avatar>
                <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {getGreeting()},
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                        {userName || 'User'}
                    </Typography>
                    {role && (
                        <Typography variant="caption" color="text.secondary">
                            {role} • {formatDate()}
                        </Typography>
                    )}
                </Box>
            </Box>
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                        bgcolor: 'primary.main',
                        borderColor: 'primary.main',
                        color: 'white',
                    },
                }}
            >
                <NotificationsOutlinedIcon />
            </Box>
        </Box>
    );
};

export default GreetingHeader;
