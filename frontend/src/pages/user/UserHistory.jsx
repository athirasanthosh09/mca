import React, { useEffect, useState } from 'react';
import {
    Typography, Box, Card, CardContent, Grid, Chip,
    Avatar, Divider, TextField, InputAdornment,
    ToggleButtonGroup, ToggleButton, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Layout from '../../components/Layout';
import HistoryIcon from '@mui/icons-material/History';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GrassIcon from '@mui/icons-material/Grass';
import RecyclingIcon from '@mui/icons-material/Recycling';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';

/* ─── helpers ─────────────────────────────────────── */
const pickupStatusStyle = (s) => ({
    Completed: { bg: '#EDFAF3', color: '#27AE60', label: 'COMPLETED', icon: <CheckCircleIcon sx={{ fontSize: 13 }} /> },
    Assigned: { bg: '#EBF5FF', color: '#2D7DD2', label: 'ASSIGNED', icon: <PendingActionsIcon sx={{ fontSize: 13 }} /> },
    'In Progress': { bg: '#EBF5FF', color: '#2D7DD2', label: 'IN PROGRESS', icon: <PendingActionsIcon sx={{ fontSize: 13 }} /> },
    Pending: { bg: '#FFF8EB', color: '#E67E22', label: 'PENDING', icon: <HourglassEmptyIcon sx={{ fontSize: 13 }} /> },
}[s] || { bg: '#F5F5F5', color: '#777', label: s?.toUpperCase(), icon: null });

const complaintStatusStyle = (s) => ({
    Open: { bg: '#FFF8EB', color: '#E67E22', label: 'OPEN', icon: <HourglassEmptyIcon sx={{ fontSize: 13 }} /> },
    Resolved: { bg: '#EDFAF3', color: '#27AE60', label: 'RESOLVED', icon: <CheckCircleIcon sx={{ fontSize: 13 }} /> },
    'In Progress': { bg: '#EBF5FF', color: '#2D7DD2', label: 'IN PROGRESS', icon: <PendingActionsIcon sx={{ fontSize: 13 }} /> },
}[s] || { bg: '#F5F5F5', color: '#777', label: s?.toUpperCase(), icon: null });

const wasteIcon = (type) => ({
    organic: { icon: <GrassIcon sx={{ fontSize: 20 }} />, color: '#E67E22', bg: '#FFF3E0' },
    recyclable: { icon: <RecyclingIcon sx={{ fontSize: 20 }} />, color: '#2196F3', bg: '#E3F2FD' },
    hazardous: { icon: <WarningAmberIcon sx={{ fontSize: 20 }} />, color: '#E53935', bg: '#FFEBEE' },
    electronic: { icon: <ElectricalServicesIcon sx={{ fontSize: 20 }} />, color: '#455A64', bg: '#ECEFF1' },
}[type?.toLowerCase()] || { icon: <LocalShippingIcon sx={{ fontSize: 20 }} />, color: '#34C759', bg: '#EDFAF3' });

const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

/* ─── component ──────────────────────────────────── */
export default function UserHistory() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [pickups, setPickups] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [tab, setTab] = useState('all');   // all | pickups | complaints
    const [search, setSearch] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const h = { Authorization: `Bearer ${token}` };
        axios.get('http://localhost:8000/api/v1/pickups/', { headers: h }).then(r => setPickups(r.data)).catch(console.error);
        axios.get('http://localhost:8000/api/v1/complaints/', { headers: h }).then(r => setComplaints(r.data)).catch(console.error);
    }, []);

    /* Build unified timeline */
    const allItems = [
        ...pickups.map(p => ({ ...p, _type: 'pickup' })),
        ...complaints.map(c => ({ ...c, _type: 'complaint' })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const filtered = allItems.filter(item => {
        const matchTab =
            tab === 'all' ||
            (tab === 'pickups' && item._type === 'pickup') ||
            (tab === 'complaints' && item._type === 'complaint');
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            (item.waste_type?.toLowerCase().includes(q)) ||
            (item.category?.toLowerCase().includes(q)) ||
            (item.description?.toLowerCase().includes(q)) ||
            (item.status?.toLowerCase().includes(q));
        return matchTab && matchSearch;
    });

    const completedPickups = pickups.filter(p => p.status === 'Completed').length;
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;

    return (
        <Layout>
            <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1000, mx: 'auto' }}>

                {/* ── Header ── */}
                <Box sx={{ mb: 4 }}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}
                        sx={{ color: 'text.secondary', fontWeight: 600, mb: 2, pl: 0 }}>
                        Back to Dashboard
                    </Button>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: '#EBF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HistoryIcon sx={{ fontSize: 28, color: '#2D7DD2' }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.15 }}>Activity History</Typography>
                            <Typography variant="body2" color="text.secondary">All your pickups and complaints in one place</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* ── Stats ── */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {[
                        { label: 'Total Pickups', value: pickups.length, color: '#34C759', bg: '#EDFAF3', icon: <LocalShippingIcon sx={{ fontSize: 20 }} /> },
                        { label: 'Completed Pickups', value: completedPickups, color: '#27AE60', bg: '#D4EFDF', icon: <CheckCircleIcon sx={{ fontSize: 20 }} /> },
                        { label: 'Total Complaints', value: complaints.length, color: '#E53935', bg: '#FFEBEE', icon: <ReportProblemIcon sx={{ fontSize: 20 }} /> },
                        { label: 'Resolved', value: resolvedComplaints, color: '#2D7DD2', bg: '#EBF5FF', icon: <CheckCircleIcon sx={{ fontSize: 20 }} /> },
                    ].map(s => (
                        <Grid item xs={6} sm={3} key={s.label}>
                            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, mb: 1 }}>
                                        {s.icon}
                                    </Box>
                                    <Typography variant="h5" fontWeight={800}>{s.value}</Typography>
                                    <Typography variant="caption" color="text.secondary" fontWeight={500}>{s.label}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* ── Filters ── */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <ToggleButtonGroup value={tab} exclusive onChange={(_, v) => v && setTab(v)} size="small"
                        sx={{
                            '& .MuiToggleButton-root': { px: 2.5, py: 0.75, borderRadius: 2, fontWeight: 600, fontSize: '0.8rem', textTransform: 'none', border: '1px solid', borderColor: 'divider' },
                            '& .Mui-selected': { bgcolor: '#34C759 !important', color: '#fff !important', borderColor: '#34C759 !important' }
                        }}>
                        <ToggleButton value="all">All Activity</ToggleButton>
                        <ToggleButton value="pickups">Pickups</ToggleButton>
                        <ToggleButton value="complaints">Complaints</ToggleButton>
                    </ToggleButtonGroup>
                    <TextField size="small" placeholder="Search history…" value={search} onChange={e => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment>,
                            sx: { borderRadius: 2 }
                        }}
                        sx={{ width: 220 }}
                    />
                </Box>

                {/* ── Timeline list ── */}
                {filtered.length === 0 ? (
                    <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <CardContent sx={{ textAlign: 'center', py: 8 }}>
                            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                                <HistoryIcon sx={{ fontSize: 32, color: '#ccc' }} />
                            </Box>
                            <Typography variant="body1" fontWeight={600} gutterBottom>No activity found</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {search ? 'Try a different search term.' : 'You have no activity yet.'}
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        {filtered.map((item, idx) => {
                            const isPickup = item._type === 'pickup';
                            const st = isPickup ? pickupStatusStyle(item.status) : complaintStatusStyle(item.status);
                            const wIcon = isPickup ? wasteIcon(item.waste_type) : { icon: <ReportProblemIcon sx={{ fontSize: 20 }} />, color: '#E53935', bg: '#FFEBEE' };

                            return (
                                <React.Fragment key={item._id + item._type}>
                                    <Box sx={{
                                        display: 'flex', alignItems: 'flex-start', gap: 2, px: 3, py: 2.5,
                                        cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, transition: 'background 0.15s'
                                    }}>

                                        {/* Type icon */}
                                        <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: wIcon.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: wIcon.color, flexShrink: 0, mt: 0.25 }}>
                                            {wIcon.icon}
                                        </Box>

                                        {/* Content */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                                                <Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                                                        <Chip
                                                            label={isPickup ? 'PICKUP' : 'COMPLAINT'}
                                                            size="small"
                                                            sx={{
                                                                height: 18, fontSize: '0.6rem', fontWeight: 700,
                                                                bgcolor: isPickup ? '#EDFAF3' : '#FFEBEE',
                                                                color: isPickup ? '#27AE60' : '#E53935'
                                                            }}
                                                        />
                                                        <Typography variant="caption" color="text.disabled" fontWeight={600}>
                                                            #{item._id.substring(18, 24).toUpperCase()}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="subtitle2" fontWeight={700}>
                                                        {isPickup
                                                            ? `${item.waste_type?.charAt(0).toUpperCase()}${item.waste_type?.slice(1) || 'Waste'} Pickup`
                                                            : item.category?.charAt(0).toUpperCase() + item.category?.slice(1)}
                                                    </Typography>
                                                    {!isPickup && item.description && (
                                                        <Typography variant="body2" color="text.secondary"
                                                            sx={{ mt: 0.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                            {item.description}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Chip icon={st.icon} label={st.label} size="small"
                                                    sx={{
                                                        height: 22, fontSize: '0.62rem', fontWeight: 700, bgcolor: st.bg, color: st.color, flexShrink: 0,
                                                        '& .MuiChip-icon': { color: `${st.color} !important` }
                                                    }} />
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <CalendarTodayIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                                                    <Typography variant="caption" color="text.disabled">
                                                        {fmtDate(item.created_at)} • {fmtTime(item.created_at)}
                                                    </Typography>
                                                </Box>
                                                {isPickup && item.address && (
                                                    <Typography variant="caption" color="text.disabled" noWrap sx={{ maxWidth: 200 }}>
                                                        📍 {item.address}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: 20, flexShrink: 0, mt: 0.5 }} />
                                    </Box>
                                    {idx < filtered.length - 1 && <Divider sx={{ mx: 3 }} />}
                                </React.Fragment>
                            );
                        })}
                    </Card>
                )}
            </Box>
        </Layout>
    );
}
