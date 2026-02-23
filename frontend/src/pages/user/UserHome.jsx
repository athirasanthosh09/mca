import React, { useEffect, useState } from 'react';
import {
    Typography, Button, Box, Card, CardContent, Grid,
    LinearProgress, Chip, TextField, InputAdornment, IconButton, Avatar, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Layout from '../../components/Layout';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HistoryIcon from '@mui/icons-material/History';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RecyclingIcon from '@mui/icons-material/Recycling';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import GrassIcon from '@mui/icons-material/Grass';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

/* ─── helpers ─────────────────────────────────────── */
const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
};

const statusChip = (status) => {
    const map = {
        Completed: { bg: '#EDFAF3', color: '#27AE60', label: 'COMPLETED' },
        Assigned: { bg: '#EBF5FF', color: '#2D7DD2', label: 'ASSIGNED' },
        'In Progress': { bg: '#EBF5FF', color: '#2D7DD2', label: 'IN PROGRESS' },
        Pending: { bg: '#FFF8EB', color: '#E67E22', label: 'PENDING' },
    };
    return map[status] || { bg: '#F5F5F5', color: '#666', label: status?.toUpperCase() };
};

const progressValue = (status) => ({
    Pending: 15, Assigned: 55, 'In Progress': 75, Completed: 100
}[status] || 0);

const WASTE = [
    { type: 'Organic', Icon: GrassIcon, color: '#E67E22', bg: 'linear-gradient(135deg,#FFF3E0,#FFE0B2)' },
    { type: 'Recyclable', Icon: RecyclingIcon, color: '#2196F3', bg: 'linear-gradient(135deg,#E3F2FD,#BBDEFB)' },
    { type: 'Hazardous', Icon: WarningAmberIcon, color: '#E53935', bg: 'linear-gradient(135deg,#FFEBEE,#FFCDD2)' },
    { type: 'Electronic', Icon: ElectricalServicesIcon, color: '#455A64', bg: 'linear-gradient(135deg,#ECEFF1,#CFD8DC)' },
];

/* ─── component ──────────────────────────────────── */
export default function UserHome() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [pickups, setPickups] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        axios.get('http://localhost:8000/api/v1/pickups/', { headers })
            .then(r => setPickups(r.data)).catch(console.error);
        axios.get('http://localhost:8000/api/v1/complaints/', { headers })
            .then(r => setComplaints(r.data)).catch(console.error);
    }, []);

    const active = pickups.find(p => ['Assigned', 'In Progress'].includes(p.status));
    const recent = pickups.slice(0, 4);

    const totalPickups = pickups.length;
    const completedCount = pickups.filter(p => p.status === 'Completed').length;
    const pendingCount = pickups.filter(p => p.status === 'Pending').length;
    const openComplaints = complaints.filter(c => c.status === 'Open').length;

    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const fmtDt = (d) => {
        const dt = new Date(d);
        return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            + ' • ' + dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    /* ─── stat cards ── */
    const stats = [
        { label: 'Total Pickups', value: totalPickups, icon: <LocalShippingIcon sx={{ fontSize: 22 }} />, color: '#2D7DD2', bg: '#EBF5FF' },
        { label: 'Completed', value: completedCount, icon: <CheckCircleIcon sx={{ fontSize: 22 }} />, color: '#27AE60', bg: '#EDFAF3' },
        { label: 'Pending', value: pendingCount, icon: <PendingActionsIcon sx={{ fontSize: 22 }} />, color: '#E67E22', bg: '#FFF8EB' },
        { label: 'Open Complaints', value: openComplaints, icon: <ReportProblemIcon sx={{ fontSize: 22 }} />, color: '#E53935', bg: '#FFEBEE' },
    ];

    return (
        <Layout>
            <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1200, mx: 'auto' }}>

                {/* ── TOP BAR ── */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {getGreeting()},
                        </Typography>
                        <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.15 }}>
                            {user?.name || 'User'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <LocationOnIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                            <Typography variant="caption" color="text.disabled">
                                Citizen &bull; {today}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <TextField
                            size="small"
                            placeholder="Search activities..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2, bgcolor: 'background.paper' }
                            }}
                            sx={{ width: 210 }}
                        />
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/user/request-pickup')}
                            sx={{
                                fontWeight: 700, borderRadius: 2, px: 2.5, py: 1,
                                bgcolor: '#34C759', '&:hover': { bgcolor: '#2DAF4F' },
                                boxShadow: '0 4px 14px rgba(52,199,89,0.35)',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            New Pickup
                        </Button>
                        <IconButton sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', width: 40, height: 40 }}>
                            <NotificationsIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                {/* ── STAT SUMMARY ROW ── */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {stats.map(s => (
                        <Grid item xs={6} sm={3} key={s.label}>
                            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid', borderColor: 'divider' }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                                            {s.icon}
                                        </Box>
                                        <Chip icon={<ArrowUpwardIcon sx={{ fontSize: '11px !important' }} />} label="+2" size="small"
                                            sx={{ height: 20, fontSize: '0.65rem', bgcolor: s.bg, color: s.color, fontWeight: 700, '& .MuiChip-icon': { color: s.color } }} />
                                    </Box>
                                    <Typography variant="h5" fontWeight={800}>{s.value}</Typography>
                                    <Typography variant="caption" color="text.secondary" fontWeight={500}>{s.label}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* ── MAIN GRID ── */}
                <Grid container spacing={3}>

                    {/* LEFT COLUMN */}
                    <Grid item xs={12} md={5}>

                        {/* Current Status */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Typography variant="h6" fontWeight={700}>Current Status</Typography>
                            {active && (
                                <Typography variant="body2" sx={{ color: '#34C759', fontWeight: 700, cursor: 'pointer' }}>Details</Typography>
                            )}
                        </Box>
                        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid', borderColor: 'divider', mb: 3 }}>
                            <CardContent sx={{ p: 2.5 }}>
                                {active ? (
                                    <>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                                            <Box sx={{ width: 50, height: 50, borderRadius: '14px', bgcolor: '#EDFAF3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <LocalShippingIcon sx={{ fontSize: 28, color: '#34C759' }} />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="subtitle1" fontWeight={700}>Pickup in Transit</Typography>
                                                    <Chip label="ACTIVE" size="small" sx={{ bgcolor: '#EDFAF3', color: '#27AE60', fontWeight: 700, fontSize: '0.62rem', height: 22 }} />
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Arrival at {new Date(active.scheduled_date || active.created_at)
                                                        .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <LinearProgress variant="determinate" value={progressValue(active.status)}
                                            sx={{
                                                height: 6, borderRadius: 4, mb: 1, bgcolor: '#E8ECF0',
                                                '& .MuiLinearProgress-bar': { bgcolor: '#34C759', borderRadius: 4 }
                                            }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            {['DISPATCHED', 'EN ROUTE', 'DONE'].map(l => (
                                                <Typography key={l} variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: '0.6rem' }}>{l}</Typography>
                                            ))}
                                        </Box>
                                        {/* Map placeholder */}
                                        <Box sx={{ mt: 2, height: 110, borderRadius: 2.5, bgcolor: '#EEF3EE', border: '1px solid', borderColor: 'divider', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.25 }}>
                                                {[15, 30, 50, 65, 80].map(x => <line key={`v${x}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#555" strokeWidth="0.7" />)}
                                                {[20, 45, 70].map(y => <line key={`h${y}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#555" strokeWidth="0.7" />)}
                                                <polyline points="0,75 100,50 220,60 350,40 500,55" stroke="#888" strokeWidth="1.5" fill="none" />
                                            </svg>
                                            <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, boxShadow: '0 3px 12px rgba(52,199,89,0.55)' }}>
                                                <LocalShippingIcon sx={{ fontSize: 18, color: '#fff' }} />
                                            </Box>
                                        </Box>
                                    </>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 5 }}>
                                        <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                                            <LocalShippingIcon sx={{ fontSize: 32, color: '#ccc' }} />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            No active pickup right now
                                        </Typography>
                                        <Button variant="contained" size="small" onClick={() => navigate('/user/request-pickup')}
                                            sx={{ mt: 1, bgcolor: '#34C759', '&:hover': { bgcolor: '#2DAF4F' }, fontWeight: 700, borderRadius: 2 }}>
                                            Request Pickup
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Waste Categories — vertical on left on small, full layout */}
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>Waste Categories</Typography>
                        <Grid container spacing={1.5}>
                            {WASTE.map(({ type, Icon, color, bg }) => (
                                <Grid item xs={6} key={type}>
                                    <Card onClick={() => navigate('/user/request-pickup')}
                                        sx={{
                                            borderRadius: 3, background: bg, border: 'none', cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                            transition: 'transform 0.15s, box-shadow 0.15s',
                                            '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }
                                        }}>
                                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                                                <Icon sx={{ fontSize: 24 }} />
                                            </Box>
                                            <Typography variant="body2" fontWeight={700}>{type}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>

                    {/* RIGHT COLUMN — Recent Activity */}
                    <Grid item xs={12} md={7}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Typography variant="h6" fontWeight={700}>Recent Activity</Typography>
                            <Typography variant="body2" sx={{ color: '#34C759', fontWeight: 700, cursor: 'pointer' }}
                                onClick={() => navigate('/user/request-pickup')}>
                                View All
                            </Typography>
                        </Box>
                        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid', borderColor: 'divider' }}>
                            {recent.length === 0 ? (
                                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                                    <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                                    <Typography variant="body2" color="text.secondary">No recent activity yet</Typography>
                                    <Button variant="outlined" size="small" sx={{ mt: 2, borderColor: '#34C759', color: '#34C759', fontWeight: 700, borderRadius: 2 }}
                                        onClick={() => navigate('/user/request-pickup')}>
                                        Schedule First Pickup
                                    </Button>
                                </CardContent>
                            ) : (
                                recent.map((p, idx) => {
                                    const chip = statusChip(p.status);
                                    return (
                                        <React.Fragment key={p._id}>
                                            <Box sx={{
                                                display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 2,
                                                cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, transition: 'background 0.15s'
                                            }}>
                                                <Avatar sx={{ width: 42, height: 42, bgcolor: '#F4F6F9', color: 'text.secondary' }}>
                                                    <HistoryIcon sx={{ fontSize: 20 }} />
                                                </Avatar>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                                                        {p.waste_type
                                                            ? p.waste_type.charAt(0).toUpperCase() + p.waste_type.slice(1) + ' Waste Pickup'
                                                            : 'Waste Pickup'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">{fmtDt(p.created_at)}</Typography>
                                                </Box>
                                                <Chip label={chip.label} size="small"
                                                    sx={{ bgcolor: chip.bg, color: chip.color, fontWeight: 700, fontSize: '0.62rem', height: 24, minWidth: 80, border: 'none' }} />
                                                <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: 20, flexShrink: 0 }} />
                                            </Box>
                                            {idx < recent.length - 1 && <Divider sx={{ mx: 2.5 }} />}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </Card>

                        {/* Quick Actions */}
                        <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 1.5 }}>Quick Actions</Typography>
                        <Grid container spacing={2}>
                            {[
                                { label: 'Request Pickup', sub: 'Schedule a new collection', color: '#34C759', bg: '#EDFAF3', icon: <LocalShippingIcon sx={{ fontSize: 28 }} />, path: '/user/request-pickup' },
                                { label: 'File Complaint', sub: 'Report an issue', color: '#E53935', bg: '#FFEBEE', icon: <ReportProblemIcon sx={{ fontSize: 28 }} />, path: '/user/complaints' },
                                { label: 'View History', sub: 'Past pickups & activity', color: '#2D7DD2', bg: '#EBF5FF', icon: <HistoryIcon sx={{ fontSize: 28 }} />, path: '/user/request-pickup' },
                            ].map(a => (
                                <Grid item xs={12} sm={4} key={a.label}>
                                    <Card onClick={() => navigate(a.path)}
                                        sx={{
                                            borderRadius: 3, cursor: 'pointer', border: '1px solid', borderColor: 'divider',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            transition: 'transform 0.15s, box-shadow 0.15s',
                                            '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 6px 18px rgba(0,0,0,0.1)' }
                                        }}>
                                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                            <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color, mb: 1.5 }}>
                                                {a.icon}
                                            </Box>
                                            <Typography variant="subtitle2" fontWeight={700}>{a.label}</Typography>
                                            <Typography variant="caption" color="text.secondary">{a.sub}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
}
