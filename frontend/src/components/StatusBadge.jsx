import React from 'react';
import { Chip } from '@mui/material';

const StatusBadge = ({ status, size = 'small' }) => {
    const getStatusStyles = () => {
        const statusLower = status?.toLowerCase();

        const styles = {
            open: { bgcolor: '#FFEBEE', color: '#FF3B30', fontWeight: 700 },
            'in progress': { bgcolor: '#FFF3E0', color: '#FF9500', fontWeight: 700 },
            inprogress: { bgcolor: '#FFF3E0', color: '#FF9500', fontWeight: 700 },
            resolved: { bgcolor: '#E8F5E9', color: '#34C759', fontWeight: 700 },
            active: { bgcolor: '#E3F2FD', color: '#007AFF', fontWeight: 700 },
            pending: { bgcolor: '#FFF3E0', color: '#FF9500', fontWeight: 700 },
            completed: { bgcolor: '#E8F5E9', color: '#34C759', fontWeight: 700 },
            assigned: { bgcolor: '#E3F2FD', color: '#007AFF', fontWeight: 700 },
        };

        return styles[statusLower] || { bgcolor: '#F5F5F5', color: '#6E6E73', fontWeight: 700 };
    };

    return (
        <Chip
            label={status?.toUpperCase()}
            size={size}
            sx={{
                ...getStatusStyles(),
                border: 'none',
                textTransform: 'uppercase',
                fontSize: '0.688rem',
                height: 24,
                borderRadius: '6px',
                '& .MuiChip-label': {
                    px: 1.5,
                },
            }}
        />
    );
};

export default StatusBadge;
