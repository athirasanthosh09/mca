import React, { useEffect, useState } from 'react';
import {
    Typography, Box, Card, CardContent, Grid, Chip, Avatar,
    Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, TextField, InputAdornment,
    IconButton, Tooltip, Alert, Divider
} from '@mui/material';
import axios from 'axios';
import Layout from '../../components/Layout';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SearchIcon from '@mui/icons-material/Search';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import GroupIcon from '@mui/icons-material/Group';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BlockIcon from '@mui/icons-material/Block';

const API = 'http://localhost:8000';
const TAB_STYLES = (active) => ({
    px: 3, py: 1.25, borderRadius: 2, cursor: 'pointer', fontWeight: 700,
    fontSize: '0.875rem', border: 'none', outline: 'none',
    bgcolor: active ? '#34C759' : 'transparent',
    color: active ? '#fff' : 'text.secondary',
    transition: 'all 0.15s',
    '&:hover': { bgcolor: active ? '#2DAF4F' : 'action.hover' },
});

const roleChip = (role) => ({
    Admin: { bg: '#EBF5FF', color: '#2D7DD2' },
    Driver: { bg: '#FFF3E0', color: '#E67E22' },
    User: { bg: '#EDFAF3', color: '#27AE60' },
}[role] || { bg: '#F5F5F5', color: '#777' });

export default function ManageUsers() {
    const [tab, setTab] = useState('pending');
    const [pending, setPending] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [search, setSearch] = useState('');
    const [msg, setMsg] = useState(null);

    const token = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

    const fetchAll = async () => {
        try {
            const [p, u, d] = await Promise.all([
                axios.get(`${API}/api/v1/users/pending`, { headers: token() }),
                axios.get(`${API}/api/v1/users/`, { headers: token() }),
                axios.get(`${API}/api/v1/users/drivers`, { headers: token() }),
            ]);
            setPending(p.data);
            setAllUsers(u.data);
            setDrivers(d.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchAll(); }, []);

    const approve = async (userId, approved) => {
        try {
            await axios.put(`${API}/api/v1/users/${userId}/approve?approved=${approved}`, {}, { headers: token() });
            setMsg({ type: 'success', text: approved ? 'User approved!' : 'User rejected.' });
            fetchAll();
            setTimeout(() => setMsg(null), 3000);
        } catch (e) {
            setMsg({ type: 'error', text: 'Action failed. Please try again.' });
        }
    };

    const toggleActive = async (userId, currentActive) => {
        try {
            await axios.put(`${API}/api/v1/users/${userId}`, { is_active: !currentActive }, { headers: token() });
            fetchAll();
        } catch (e) { console.error(e); }
    };

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

    const filtered = (list) => list.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search)
    );

    return (
        <Layout>
            <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1200, mx: 'auto' }}>

                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: '#EBF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GroupIcon sx={{ fontSize: 28, color: '#2D7DD2' }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.15 }}>Manage Users</Typography>
                        <Typography variant="body2" color="text.secondary">Approve registrations, manage drivers and accounts</Typography>
                    </Box>
                </Box>

                {msg && <Alert severity={msg.type} sx={{ mb: 2, borderRadius: 2 }}>{msg.text}</Alert>}

                {/* Stat row */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {[
                        { label: 'Pending Approvals', value: pending.length, color: '#E67E22', bg: '#FFF8EB', icon: <PendingActionsIcon sx={{ fontSize: 20 }} /> },
                        { label: 'Total Users', value: allUsers.length, color: '#2D7DD2', bg: '#EBF5FF', icon: <GroupIcon sx={{ fontSize: 20 }} /> },
                        { label: 'Drivers', value: drivers.length, color: '#27AE60', bg: '#EDFAF3', icon: <LocalShippingIcon sx={{ fontSize: 20 }} /> },
                        { label: 'Active Drivers', value: drivers.filter(d => d.is_active).length, color: '#34C759', bg: '#D4EFDF', icon: <VerifiedUserIcon sx={{ fontSize: 20 }} /> },
                    ].map(s => (
                        <Grid item xs={6} sm={3} key={s.label}>
                            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                                        {s.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" fontWeight={800}>{s.value}</Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={500}>{s.label}</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Tabs + Search */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 1, bgcolor: 'background.paper', p: 0.75, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                        {[
                            { key: 'pending', label: `Pending (${pending.length})`, icon: <PendingActionsIcon sx={{ fontSize: 16 }} /> },
                            { key: 'all', label: 'All Users', icon: <GroupIcon sx={{ fontSize: 16 }} /> },
                            { key: 'drivers', label: 'Drivers', icon: <LocalShippingIcon sx={{ fontSize: 16 }} /> },
                        ].map(t => (
                            <Box key={t.key} component="button" onClick={() => setTab(t.key)} sx={{ ...TAB_STYLES(tab === t.key), display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                {t.icon} {t.label}
                            </Box>
                        ))}
                    </Box>
                    <TextField size="small" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment>, sx: { borderRadius: 2 } }}
                        sx={{ width: 220 }}
                    />
                </Box>

                {/* ── Pending Tab ── */}
                {tab === 'pending' && (
                    <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        {filtered(pending).length === 0 ? (
                            <CardContent sx={{ textAlign: 'center', py: 8 }}>
                                <CheckCircleIcon sx={{ fontSize: 48, color: '#34C759', mb: 1 }} />
                                <Typography fontWeight={600}>No pending approvals</Typography>
                                <Typography variant="body2" color="text.secondary">All registrations have been processed.</Typography>
                            </CardContent>
                        ) : filtered(pending).map((u, idx) => (
                            <React.Fragment key={u._id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2.5 }}>
                                    <Avatar sx={{ bgcolor: '#FFF8EB', color: '#E67E22', width: 44, height: 44 }}>
                                        {u.name?.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                                            <Typography variant="subtitle2" fontWeight={700}>{u.name}</Typography>
                                            <Chip label={u.role} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, ...roleChip(u.role) }} />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                                        <Box sx={{ display: 'flex', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                                            {u.phone && <Typography variant="caption" color="text.disabled">📞 {u.phone}</Typography>}
                                            {u.vehicle_number && <Typography variant="caption" color="text.disabled">🚛 {u.vehicle_number}</Typography>}
                                            {u.employee_id && <Typography variant="caption" color="text.disabled">🪪 {u.employee_id}</Typography>}
                                            <Typography variant="caption" color="text.disabled">📅 Registered {fmtDate(u.created_at)}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button variant="contained" size="small" startIcon={<CheckCircleIcon />}
                                            onClick={() => approve(u._id, true)}
                                            sx={{ bgcolor: '#34C759', '&:hover': { bgcolor: '#2DAF4F' }, fontWeight: 700, borderRadius: 2 }}>
                                            Approve
                                        </Button>
                                        <Button variant="outlined" size="small" startIcon={<CancelIcon />}
                                            onClick={() => approve(u._id, false)}
                                            sx={{ color: '#E53935', borderColor: '#E53935', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#FFEBEE', borderColor: '#E53935' } }}>
                                            Reject
                                        </Button>
                                    </Box>
                                </Box>
                                {idx < filtered(pending).length - 1 && <Divider sx={{ mx: 3 }} />}
                            </React.Fragment>
                        ))}
                    </Card>
                )}

                {/* ── All Users Tab ── */}
                {tab === 'all' && (
                    <TableContainer component={Card} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {['User', 'Role', 'Email', 'Phone', 'Status', 'Registered', 'Actions'].map(h => (
                                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase' }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filtered(allUsers).map(u => (
                                    <TableRow key={u._id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem', bgcolor: '#EBF5FF', color: '#2D7DD2' }}>{u.name?.charAt(0)}</Avatar>
                                                <Typography variant="body2" fontWeight={600}>{u.name}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell><Chip label={u.role} size="small" sx={{ fontWeight: 700, ...roleChip(u.role) }} /></TableCell>
                                        <TableCell><Typography variant="body2">{u.email}</Typography></TableCell>
                                        <TableCell><Typography variant="body2">{u.phone || '—'}</Typography></TableCell>
                                        <TableCell>
                                            <Chip label={u.is_approved ? 'Approved' : 'Pending'} size="small"
                                                sx={{ fontWeight: 700, bgcolor: u.is_approved ? '#EDFAF3' : '#FFF8EB', color: u.is_approved ? '#27AE60' : '#E67E22' }} />
                                        </TableCell>
                                        <TableCell><Typography variant="body2">{fmtDate(u.created_at)}</Typography></TableCell>
                                        <TableCell>
                                            <Tooltip title={u.is_active ? 'Deactivate' : 'Activate'}>
                                                <IconButton size="small" onClick={() => toggleActive(u._id, u.is_active)}>
                                                    {u.is_active ? <BlockIcon fontSize="small" sx={{ color: '#E53935' }} /> : <VerifiedUserIcon fontSize="small" sx={{ color: '#34C759' }} />}
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* ── Drivers Tab ── */}
                {tab === 'drivers' && (
                    <TableContainer component={Card} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {['Driver', 'Email', 'Phone', 'Vehicle', 'Employee ID', 'Status', 'Actions'].map(h => (
                                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase' }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filtered(drivers).length === 0 ? (
                                    <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>No drivers yet.</TableCell></TableRow>
                                ) : filtered(drivers).map(d => (
                                    <TableRow key={d._id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem', bgcolor: '#FFF3E0', color: '#E67E22' }}>{d.name?.charAt(0)}</Avatar>
                                                <Typography variant="body2" fontWeight={600}>{d.name}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell><Typography variant="body2">{d.email}</Typography></TableCell>
                                        <TableCell><Typography variant="body2">{d.phone || '—'}</Typography></TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                <DirectionsCarIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                <Typography variant="body2">{d.vehicle_number || '—'}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell><Typography variant="body2">{d.employee_id || '—'}</Typography></TableCell>
                                        <TableCell>
                                            <Chip label={d.is_active ? 'Active' : 'Inactive'} size="small"
                                                sx={{ fontWeight: 700, bgcolor: d.is_active ? '#EDFAF3' : '#FFEBEE', color: d.is_active ? '#27AE60' : '#E53935' }} />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={d.is_active ? 'Deactivate' : 'Activate'}>
                                                <IconButton size="small" onClick={() => toggleActive(d._id, d.is_active)}>
                                                    {d.is_active ? <BlockIcon fontSize="small" sx={{ color: '#E53935' }} /> : <VerifiedUserIcon fontSize="small" sx={{ color: '#34C759' }} />}
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </Layout>
    );
}
