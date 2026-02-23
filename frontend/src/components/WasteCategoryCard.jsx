import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import RecyclingIcon from '@mui/icons-material/Recycling';
import CompostIcon from '@mui/icons-material/Compost';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import WarningIcon from '@mui/icons-material/Warning';

const WasteCategoryCard = ({ type, onClick }) => {
    const categories = {
        organic: {
            icon: <CompostIcon sx={{ fontSize: 40 }} />,
            label: 'Organic',
            color: '#FF9500',
            bgcolor: '#FFF3E0',
        },
        recyclable: {
            icon: <RecyclingIcon sx={{ fontSize: 40 }} />,
            label: 'Recyclable',
            color: '#007AFF',
            bgcolor: '#E3F2FD',
        },
        electronic: {
            icon: <BatteryChargingFullIcon sx={{ fontSize: 40 }} />,
            label: 'Electronic',
            color: '#8E8E93',
            bgcolor: '#F5F5F5',
        },
        hazardous: {
            icon: <WarningIcon sx={{ fontSize: 40 }} />,
            label: 'Hazardous',
            color: '#FF3B30',
            bgcolor: '#FFEBEE',
        },
    };

    const category = categories[type] || categories.organic;

    return (
        <Card
            onClick={onClick}
            sx={{
                cursor: onClick ? 'pointer' : 'default',
                height: '100%',
                minHeight: 140,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                border: '2px solid transparent',
                '&:hover': onClick ? {
                    borderColor: category.color,
                    transform: 'translateY(-4px)',
                    boxShadow: `0px 8px 24px ${category.color}40`,
                } : {},
            }}
        >
            <CardContent sx={{ textAlign: 'center', width: '100%' }}>
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '16px',
                        bgcolor: category.bgcolor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1.5,
                        color: category.color,
                    }}
                >
                    {category.icon}
                </Box>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                    {category.label}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default WasteCategoryCard;
