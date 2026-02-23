import React, { useEffect, useState } from 'react';
import {
    Typography, Button, Box, Card, CardContent, Grid,
    TextField, MenuItem, Chip, Divider, Alert, Avatar,
    InputAdornment, IconButton, Tooltip
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Layout from '../../components/Layout';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CategoryIcon from '@mui/icons-material/Category';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const CATEGORIES = [
    'Missed Pickup',
    'Damaged Bin',
    'Spillage Issue',
    'Overflow',           // Module 5: auto-flagged as urgent
    'Improper Disposal',
    'Driver Complaint',
    'Other',
];

const statusStyle = (s) => ({
    Open: { bg: '#FFF8EB', color: '#E67E22', label: 'OPEN', icon: <HourglassEmptyIcon sx={{ fontSize: 13 }} /> },
    Resolved: { bg: '#EDFAF3', color: '#27AE60', label: 'RESOLVED', icon: <CheckCircleIcon sx={{ fontSize: 13 }} /> },
    'In Progress': { bg: '#EBF5FF', color: '#2D7DD2', label: 'IN PROGRESS', icon: <PendingActionsIcon sx={{ fontSize: 13 }} /> },
}[s] || { bg: '#F5F5F5', color: '#777', label: s?.toUpperCase(), icon: null });

const priorityStyle = (p) => ({
    High: { bg: '#FFEBEE', color: '#E53935' },
    Medium: { bg: '#FFF8EB', color: '#E67E22' },
    Low: { bg: '#EDFAF3', color: '#27AE60' },
}[p] || { bg: '#F5F5F5', color: '#777' });

const FIELD_SX = {
    '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' }
};

export default function MyComplaints() {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8000/api/v1/complaints/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setComplaints(res.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchComplaints(); }, []);

    const handleSubmit = async () => {
        if (!description || !category) return;
        setSubmitting(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const title = category;
            await axios.post(
                'http://localhost:8000/api/v1/complaints/',
                { title, description, category, priority },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDescription(''); setCategory(''); setPriority('Medium');
            setSuccess(true); setFormOpen(false);
            fetchComplaints();
            setTimeout(() => setSuccess(false), 3500);
        } catch (e) {
            setError('Failed to submit complaint. Please try again.');
        } finally { setSubmitting(false); }
    };

    const filtered = complaints.filter(c =>
        (c.category?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (c.description?.toLowerCase() || '').includes(search.toLowerCase())
    );

    const openCount = complaints.filter(c => c.status === 'Open').length;
    const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

    const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <Layout>
            <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1100, mx: 'auto' }}>

                {/* ── Header ── */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ReportProblemIcon sx={{ fontSize: 28, color: '#E53935' }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.15 }}>
                                Complaints & Support
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Track, manage and submit your support requests
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setFormOpen(true)}
                        sx={{
                            fontWeight: 700, borderRadius: 2, px: 2.5, py: 1,
                            bgcolor: '#34C759', '&:hover': { bgcolor: '#2DAF4F' },
                            boxShadow: '0 4px 14px rgba(52,199,89,0.35)',
                        }}
                    >
                        New Complaint
                    </Button>
                </Box>

                {/* ── Alerts ── */}
                {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Complaint submitted successfully!</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

                {/* ── Stat Row ── */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {[
                        { label: 'Total', value: complaints.length, color: '#2D7DD2', bg: '#EBF5FF', icon: <ReportProblemIcon sx={{ fontSize: 20 }} /> },
                        { label: 'Open', value: openCount, color: '#E67E22', bg: '#FFF8EB', icon: <HourglassEmptyIcon sx={{ fontSize: 20 }} /> },
                        { label: 'Resolved', value: resolvedCount, color: '#27AE60', bg: '#EDFAF3', icon: <CheckCircleIcon sx={{ fontSize: 20 }} /> },
                    ].map(s => (
                        <Grid item xs={4} key={s.label}>
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

                {/* ── Main Grid ── */}
                <Grid container spacing={3} alignItems="flex-start">

                    {/* LEFT: New Complaint Form (slide in) */}
                    {formOpen && (
                        <Grid item xs={12} md={4}>
                            <Card sx={{ borderRadius: 3, border: '2px solid #34C759', boxShadow: '0 4px 20px rgba(52,199,89,0.15)' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" fontWeight={700}>New Complaint</Typography>
                                        <IconButton size="small" onClick={() => setFormOpen(false)}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                                        Describe your issue and we'll get back to you shortly.
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <TextField
                                            select fullWidth label="Category *"
                                            value={category} onChange={e => setCategory(e.target.value)}
                                            sx={FIELD_SX}
                                        >
                                            {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                        </TextField>

                                        <TextField
                                            select fullWidth label="Priority"
                                            value={priority} onChange={e => setPriority(e.target.value)}
                                            sx={FIELD_SX}
                                        >
                                            {['High', 'Medium', 'Low'].map(p => (
                                                <MenuItem key={p} value={p}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: priorityStyle(p).color }} />
                                                        {p}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </TextField>

                                        <TextField
                                            fullWidth multiline rows={4}
                                            label="Description *"
                                            placeholder="Describe your complaint in detail…"
                                            value={description} onChange={e => setDescription(e.target.value)}
                                            sx={FIELD_SX}
                                        />

                                        <Button
                                            variant="contained" fullWidth size="large"
                                            onClick={handleSubmit}
                                            disabled={!description || !category || submitting}
                                            sx={{ py: 1.5, fontWeight: 700, borderRadius: 2, bgcolor: '#34C759', '&:hover': { bgcolor: '#2DAF4F' }, boxShadow: '0 4px 12px rgba(52,199,89,0.35)' }}
                                        >
                                            {submitting ? 'Submitting…' : 'Submit Complaint'}
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* RIGHT: Complaints List */}
                    <Grid item xs={12} md={formOpen ? 8 : 12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight={700}>
                                My Complaints
                                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                    ({complaints.length} total)
                                </Typography>
                            </Typography>
                            <TextField
                                size="small" placeholder="Search complaints…"
                                value={search} onChange={e => setSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment>,
                                    sx: { borderRadius: 2 }
                                }}
                                sx={{ width: 220 }}
                            />
                        </Box>

                        {filtered.length === 0 ? (
                            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                                    <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                                        <ReportProblemIcon sx={{ fontSize: 32, color: '#ccc' }} />
                                    </Box>
                                    <Typography variant="body1" fontWeight={600} gutterBottom>No complaints yet</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {search ? 'No results match your search.' : 'Click "New Complaint" to get started.'}
                                    </Typography>
                                    {!search && (
                                        <Button variant="contained" onClick={() => setFormOpen(true)}
                                            sx={{ bgcolor: '#34C759', '&:hover': { bgcolor: '#2DAF4F' }, fontWeight: 700, borderRadius: 2 }}>
                                            File First Complaint
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                {filtered.map((c, idx) => {
                                    const st = statusStyle(c.status);
                                    const pr = priorityStyle(c.priority);
                                    return (
                                        <React.Fragment key={c._id}>
                                            <Box sx={{ px: 3, py: 2.5, '&:hover': { bgcolor: 'action.hover' }, transition: 'background 0.15s' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                                    <Avatar sx={{ width: 42, height: 42, bgcolor: '#F4F6F9', color: 'text.secondary', mt: 0.25, flexShrink: 0 }}>
                                                        <ReportProblemIcon sx={{ fontSize: 20 }} />
                                                    </Avatar>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        {/* Top row */}
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography variant="caption" color="text.disabled" fontWeight={600}>
                                                                    #WC-{c._id.substring(18, 24).toUpperCase()}
                                                                </Typography>
                                                                <Chip
                                                                    label={pr.color ? c.priority : ''}
                                                                    size="small"
                                                                    sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: pr.bg, color: pr.color, display: c.priority ? 'inline-flex' : 'none' }}
                                                                />
                                                            </Box>
                                                            <Chip
                                                                icon={st.icon}
                                                                label={st.label}
                                                                size="small"
                                                                sx={{ height: 22, fontSize: '0.62rem', fontWeight: 700, bgcolor: st.bg, color: st.color, '& .MuiChip-icon': { color: `${st.color} !important` } }}
                                                            />
                                                        </Box>
                                                        {/* Title / category */}
                                                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                                                            {c.category?.charAt(0).toUpperCase() + c.category?.slice(1) || 'Complaint'}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                            {c.description}
                                                        </Typography>
                                                        {/* Meta */}
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <CalendarTodayIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                                                <Typography variant="caption" color="text.disabled">{fmtDate(c.created_at)}</Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <CategoryIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                                                <Typography variant="caption" color="text.disabled">{c.category}</Typography>
                                                            </Box>
                                                        </Box>
                                                        {/* Admin response */}
                                                        {c.admin_response && (
                                                            <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#EBF5FF', borderRadius: 2, borderLeft: '3px solid #2D7DD2' }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                                                                    <AdminPanelSettingsIcon sx={{ fontSize: 14, color: '#2D7DD2' }} />
                                                                    <Typography variant="caption" fontWeight={700} sx={{ color: '#2D7DD2' }}>Admin Response</Typography>
                                                                </Box>
                                                                <Typography variant="body2" color="text.secondary">{c.admin_response}</Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Box>
                                            {idx < filtered.length - 1 && <Divider sx={{ mx: 3 }} />}
                                        </React.Fragment>
                                    );
                                })}
                            </Card>
                        )}

                        {/* ── Need More Help ── */}
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="overline" color="text.disabled" fontWeight={700} sx={{ letterSpacing: 1.5 }}>
                                NEED MORE HELP?
                            </Typography>
                            <Grid container spacing={2} sx={{ mt: 0.5 }}>
                                {[
                                    { label: 'Frequently Asked Questions', sub: 'Browse common issues & answers', icon: <HelpOutlineIcon sx={{ fontSize: 24 }} />, color: '#2D7DD2', bg: '#EBF5FF' },
                                    { label: 'Contact Customer Support', sub: 'Chat with a support agent', icon: <HeadsetMicIcon sx={{ fontSize: 24 }} />, color: '#E67E22', bg: '#FFF8EB' },
                                ].map(h => (
                                    <Grid item xs={12} sm={6} key={h.label}>
                                        <Card sx={{
                                            borderRadius: 3, cursor: 'pointer', border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            transition: 'transform 0.15s, box-shadow 0.15s',
                                            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 18px rgba(0,0,0,0.1)' }
                                        }}>
                                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '16px !important' }}>
                                                <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: h.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: h.color, flexShrink: 0 }}>
                                                    {h.icon}
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="subtitle2" fontWeight={700}>{h.label}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{h.sub}</Typography>
                                                </Box>
                                                <ChevronRightIcon sx={{ color: 'text.disabled' }} />
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
}
