import React, { useState } from 'react';
import {
    Container, Typography, TextField, Button, Box, MenuItem,
    Alert, Grid, Card, CardContent, Chip, Divider, InputAdornment
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import MapComponent from '../../components/MapComponent';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScaleIcon from '@mui/icons-material/Scale';
import RecyclingIcon from '@mui/icons-material/Recycling';
import GrassIcon from '@mui/icons-material/Grass';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const WASTE_TYPES = [
    { value: 'organic', label: 'Organic', icon: <GrassIcon sx={{ fontSize: 20 }} />, color: '#E67E22', bg: '#FFF3E0' },
    { value: 'recyclable', label: 'Recyclable', icon: <RecyclingIcon sx={{ fontSize: 20 }} />, color: '#2196F3', bg: '#E3F2FD' },
    { value: 'hazardous', label: 'Hazardous', icon: <WarningAmberIcon sx={{ fontSize: 20 }} />, color: '#E53935', bg: '#FFEBEE' },
    { value: 'electronic', label: 'Electronic', icon: <ElectricalServicesIcon sx={{ fontSize: 20 }} />, color: '#455A64', bg: '#ECEFF1' },
];

const FIELD_SX = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        bgcolor: 'background.paper',
    },
};

export default function RequestPickup() {
    const [formData, setFormData] = useState({
        address: '',
        scheduled_date: '',
        waste_type: 'organic',
        quantity: '',
        latitude: null,
        longitude: null,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleLocationSelect = (latlng) => {
        setFormData({ ...formData, latitude: latlng.lat, longitude: latlng.lng });
    };

    const handleWasteType = (val) => setFormData({ ...formData, waste_type: val });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8000/api/v1/pickups/', formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 1800);
        } catch (err) {
            setError('Failed to submit request. Please try again.');
            console.error(err);
        }
    };

    const selectedWaste = WASTE_TYPES.find(w => w.value === formData.waste_type);

    return (
        <Layout>
            <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1100, mx: 'auto' }}>

                {/* ── Page Header ── */}
                <Box sx={{ mb: 4 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/dashboard')}
                        sx={{ color: 'text.secondary', fontWeight: 600, mb: 2, pl: 0 }}
                    >
                        Back to Dashboard
                    </Button>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            width: 52, height: 52, borderRadius: '14px',
                            bgcolor: '#EDFAF3', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <LocalShippingIcon sx={{ fontSize: 28, color: '#34C759' }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.15 }}>
                                Request Pickup
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Schedule a waste collection from your location
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Alerts */}
                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
                {success && (
                    <Alert
                        icon={<CheckCircleIcon />}
                        severity="success"
                        sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}
                    >
                        Pickup request submitted! Redirecting to dashboard…
                    </Alert>
                )}

                <Grid container spacing={3} alignItems="stretch">

                    {/* ── LEFT: Form ── */}
                    <Grid item xs={12} md={5}>
                        <Card sx={{
                            borderRadius: 3, border: '1px solid', borderColor: 'divider',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.07)', height: '100%',
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                                    Pickup Details
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Fill in the details for your waste collection request
                                </Typography>

                                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                                    {/* Address */}
                                    <Box>
                                        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
                                            Pickup Address *
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            name="address"
                                            required
                                            placeholder="Enter your address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            helperText="Or click on the map to auto-fill address"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LocationOnIcon fontSize="small" sx={{ color: '#34C759' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={FIELD_SX}
                                        />
                                    </Box>

                                    <Divider />

                                    {/* Waste Type Selector */}
                                    <Box>
                                        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                                            Waste Type *
                                        </Typography>
                                        <Grid container spacing={1}>
                                            {WASTE_TYPES.map(w => (
                                                <Grid item xs={6} key={w.value}>
                                                    <Box
                                                        onClick={() => handleWasteType(w.value)}
                                                        sx={{
                                                            display: 'flex', alignItems: 'center', gap: 1.2,
                                                            p: 1.5, borderRadius: 2, cursor: 'pointer',
                                                            border: '2px solid',
                                                            borderColor: formData.waste_type === w.value ? w.color : 'divider',
                                                            bgcolor: formData.waste_type === w.value ? w.bg : 'background.paper',
                                                            transition: 'all 0.15s',
                                                            '&:hover': { borderColor: w.color, bgcolor: w.bg },
                                                        }}
                                                    >
                                                        <Box sx={{ color: w.color }}>{w.icon}</Box>
                                                        <Typography variant="body2" fontWeight={600} sx={{ color: formData.waste_type === w.value ? w.color : 'text.primary' }}>
                                                            {w.label}
                                                        </Typography>
                                                        {formData.waste_type === w.value && (
                                                            <CheckCircleIcon sx={{ fontSize: 16, color: w.color, ml: 'auto' }} />
                                                        )}
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>

                                    <Divider />

                                    {/* Scheduled Date */}
                                    <Box>
                                        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
                                            Preferred Date & Time *
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            name="scheduled_date"
                                            type="datetime-local"
                                            required
                                            InputLabelProps={{ shrink: true }}
                                            value={formData.scheduled_date}
                                            onChange={handleChange}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={FIELD_SX}
                                        />
                                    </Box>

                                    {/* Quantity */}
                                    <Box>
                                        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
                                            Estimated Quantity (kg)
                                            <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 1 }}>Optional</Typography>
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            name="quantity"
                                            type="number"
                                            placeholder="e.g. 15"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <ScaleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={FIELD_SX}
                                        />
                                    </Box>

                                    {/* Selected waste type preview */}
                                    {selectedWaste && (
                                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: selectedWaste.bg, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ color: selectedWaste.color }}>{selectedWaste.icon}</Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600}>Selected Category</Typography>
                                                <Typography variant="body2" fontWeight={700} sx={{ color: selectedWaste.color }}>{selectedWaste.label} Waste</Typography>
                                            </Box>
                                            {formData.latitude && (
                                                <>
                                                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>GPS Pinned</Typography>
                                                        <Typography variant="body2" fontWeight={700} sx={{ color: '#27AE60' }}>
                                                            {formData.latitude.toFixed(3)}, {formData.longitude.toFixed(3)}
                                                        </Typography>
                                                    </Box>
                                                </>
                                            )}
                                        </Box>
                                    )}

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        disabled={success}
                                        sx={{
                                            mt: 1, py: 1.5, fontWeight: 700, borderRadius: 2,
                                            bgcolor: '#34C759', '&:hover': { bgcolor: '#2DAF4F' },
                                            boxShadow: '0 4px 14px rgba(52,199,89,0.4)',
                                            fontSize: '1rem',
                                        }}
                                    >
                                        {success ? '✓ Submitted!' : 'Submit Request'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* ── RIGHT: Map ── */}
                    <Grid item xs={12} md={7}>
                        <Card sx={{
                            borderRadius: 3, border: '1px solid', borderColor: 'divider',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.07)', height: '100%', minHeight: 500,
                            display: 'flex', flexDirection: 'column',
                        }}>
                            <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.25 }}>
                                            Pin Your Location
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Click on the map to set the exact pickup point
                                        </Typography>
                                    </Box>
                                    {formData.latitude && (
                                        <Chip
                                            icon={<CheckCircleIcon sx={{ fontSize: '16px !important', color: '#27AE60 !important' }} />}
                                            label="Location pinned"
                                            size="small"
                                            sx={{ bgcolor: '#EDFAF3', color: '#27AE60', fontWeight: 700, fontSize: '0.72rem' }}
                                        />
                                    )}
                                </Box>
                                <Box sx={{
                                    flex: 1, borderRadius: 2.5, overflow: 'hidden',
                                    border: '1px solid', borderColor: 'divider',
                                    minHeight: 420,
                                }}>
                                    <MapComponent
                                        onLocationSelect={handleLocationSelect}
                                        selectedLocation={formData.latitude ? { lat: formData.latitude, lng: formData.longitude } : null}
                                        height="100%"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
}
