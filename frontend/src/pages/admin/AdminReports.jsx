import React, { useEffect, useState } from 'react';
import {
    Typography, Box, Card, CardContent, Grid, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Alert, LinearProgress
} from '@mui/material';
import axios from 'axios';
import Layout from '../../components/Layout';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
    Legend, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const API = 'http://localhost:8000';
const COLORS = ['#34C759', '#2D7DD2', '#E67E22', '#E53935', '#9B59B6', '#1ABC9C'];

const TAB_STYLES = (active) => ({
    px: 3, py: 1.25, borderRadius: 2, cursor: 'pointer', fontWeight: 700,
    fontSize: '0.875rem', border: 'none', outline: 'none',
    bgcolor: active ? '#34C759' : 'transparent',
    color: active ? '#fff' : 'text.secondary',
    transition: 'all 0.15s',
    '&:hover': { bgcolor: active ? '#2DAF4F' : 'action.hover' },
});

/* Transform daily-pickups API data to Chart-friendly format */
function buildDailyChartData(raw) {
    const byDate = {};
    raw.forEach(({ date, status, count }) => {
        if (!byDate[date]) byDate[date] = { date, Pending: 0, Completed: 0, Assigned: 0, 'In Progress': 0, Missed: 0 };
        byDate[date][status] = (byDate[date][status] || 0) + count;
    });
    return Object.values(byDate).slice(-14); // last 14 days
}

function SectionHeader({ title, subtitle, icon, color = '#2D7DD2', bg = '#EBF5FF' }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="h6" fontWeight={800}>{title}</Typography>
                <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
            </Box>
        </Box>
    );
}

export default function AdminReports() {
    const [tab, setTab] = useState('pickups');
    const [dailyData, setDailyData] = useState([]);
    const [complaint, setComplaint] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const h = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        setLoading(true);
        Promise.all([
            axios.get(`${API}/api/v1/admin/reports/daily-pickups`, { headers: h }),
            axios.get(`${API}/api/v1/admin/reports/complaints`, { headers: h }),
            axios.get(`${API}/api/v1/admin/reports/driver-performance`, { headers: h }),
        ]).then(([d, c, dr]) => {
            setDailyData(buildDailyChartData(d.data));
            setComplaint(c.data);
            setDrivers(dr.data);
            setLoading(false);
        }).catch(() => { setError('Failed to load report data.'); setLoading(false); });
    }, []);

    if (loading) return (
        <Layout>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        </Layout>
    );

    /* Complaint pie data */
    const statusPie = complaint ? Object.entries(complaint.by_status).map(([name, value]) => ({ name, value })) : [];
    const categoryPie = complaint ? Object.entries(complaint.by_category).map(([name, value]) => ({ name, value })) : [];

    return (
        <Layout>
            <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1200, mx: 'auto' }}>

                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AssessmentIcon sx={{ fontSize: 28, color: '#9B59B6' }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.15 }}>Reports & Analytics</Typography>
                        <Typography variant="body2" color="text.secondary">Daily pickups · Complaint resolution · Driver performance</Typography>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

                {/* Tabs */}
                <Box sx={{ display: 'flex', gap: 1, bgcolor: 'background.paper', p: 0.75, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', mb: 4, width: 'fit-content' }}>
                    {[
                        { key: 'pickups', label: 'Daily Pickup Report', icon: <LocalShippingIcon sx={{ fontSize: 16 }} /> },
                        { key: 'complaints', label: 'Complaint Resolution', icon: <ReportProblemIcon sx={{ fontSize: 16 }} /> },
                        { key: 'drivers', label: 'Driver Performance', icon: <StarIcon sx={{ fontSize: 16 }} /> },
                    ].map(t => (
                        <Box key={t.key} component="button" onClick={() => setTab(t.key)}
                            sx={{ ...TAB_STYLES(tab === t.key), display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            {t.icon} {t.label}
                        </Box>
                    ))}
                </Box>

                {/* ── Daily Pickup Report ── */}
                {tab === 'pickups' && (
                    <Box>
                        <SectionHeader
                            title="Daily Pickup Report"
                            subtitle="Number of pickups per day over the last 14 days"
                            icon={<LocalShippingIcon sx={{ fontSize: 24 }} />}
                            color="#27AE60" bg="#EDFAF3"
                        />
                        {dailyData.length === 0 ? (
                            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                                    <Typography color="text.secondary">No pickup data available yet.</Typography>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
                                <ResponsiveContainer width="100%" height={360}>
                                    <BarChart data={dailyData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                        <RechartTooltip />
                                        <Legend verticalAlign="top" />
                                        <Bar dataKey="Pending" fill="#E67E22" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Completed" fill="#34C759" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="In Progress" fill="#2D7DD2" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Missed" fill="#E53935" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                        )}
                    </Box>
                )}

                {/* ── Complaint Resolution Report ── */}
                {tab === 'complaints' && complaint && (
                    <Box>
                        <SectionHeader
                            title="Complaint Resolution Report"
                            subtitle="Status breakdown, category distribution, and resolution metrics"
                            icon={<ReportProblemIcon sx={{ fontSize: 24 }} />}
                            color="#E53935" bg="#FFEBEE"
                        />
                        {/* Summary stat cards */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                            {[
                                { label: 'Total', value: complaint.total, color: '#2D7DD2' },
                                { label: 'Open', value: complaint.by_status?.Open || 0, color: '#E67E22' },
                                { label: 'In Progress', value: complaint.by_status?.['In Progress'] || 0, color: '#2D7DD2' },
                                { label: 'Resolved', value: complaint.by_status?.Resolved || 0, color: '#27AE60' },
                                { label: 'Avg Resolution', value: complaint.avg_resolution_hours ? `${complaint.avg_resolution_hours}h` : '—', color: '#9B59B6' },
                            ].map(s => (
                                <Card key={s.label} sx={{ flex: '1 1 100px', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                                        <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>

                        {/* Pie charts — each exactly 50% */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Status Breakdown</Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie data={statusPie} cx="50%" cy="45%" outerRadius={90} dataKey="value">
                                                {statusPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <RechartTooltip formatter={(v, n) => [v, n]} />
                                            <Legend verticalAlign="bottom" height={40} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>By Category</Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie data={categoryPie} cx="50%" cy="45%" outerRadius={90} dataKey="value">
                                                {categoryPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <RechartTooltip formatter={(v, n) => [v, n]} />
                                            <Legend verticalAlign="bottom" height={40} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* ── Driver Performance Report ── */}
                {tab === 'drivers' && (
                    <Box>
                        <SectionHeader
                            title="Driver Performance Report"
                            subtitle="Task completion efficiency and rating per driver"
                            icon={<StarIcon sx={{ fontSize: 24 }} />}
                            color="#E67E22" bg="#FFF8EB"
                        />
                        {drivers.length === 0 ? (
                            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                                    <Typography color="text.secondary">No driver assignment data yet.</Typography>
                                </CardContent>
                            </Card>
                        ) : (
                            <TableContainer component={Card} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            {['Driver', 'Vehicle', 'Assigned', 'Completed', 'Missed', 'Pending', 'Efficiency', 'Avg Rating'].map(h => (
                                                <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase' }}>{h}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {drivers.map((d, idx) => (
                                            <TableRow key={d.driver_id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#FFF3E0', color: '#E67E22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                                                            {idx + 1}
                                                        </Box>
                                                        <Typography variant="body2" fontWeight={600}>{d.driver_name}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell><Typography variant="body2">{d.vehicle_number}</Typography></TableCell>
                                                <TableCell><Typography variant="body2" fontWeight={600}>{d.total_assigned}</Typography></TableCell>
                                                <TableCell><Chip label={d.completed} size="small" sx={{ bgcolor: '#EDFAF3', color: '#27AE60', fontWeight: 700 }} /></TableCell>
                                                <TableCell><Chip label={d.missed} size="small" sx={{ bgcolor: '#FFEBEE', color: '#E53935', fontWeight: 700 }} /></TableCell>
                                                <TableCell><Typography variant="body2">{d.pending}</Typography></TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <LinearProgress variant="determinate" value={d.efficiency_pct}
                                                            sx={{
                                                                flex: 1, height: 6, borderRadius: 3,
                                                                bgcolor: '#F0F0F0',
                                                                '& .MuiLinearProgress-bar': { bgcolor: d.efficiency_pct >= 80 ? '#34C759' : d.efficiency_pct >= 50 ? '#E67E22' : '#E53935', borderRadius: 3 }
                                                            }} />
                                                        <Typography variant="caption" fontWeight={700}>{d.efficiency_pct}%</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    {d.avg_rating ? (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <StarIcon sx={{ fontSize: 14, color: '#F59E0B' }} />
                                                            <Typography variant="body2" fontWeight={600}>{d.avg_rating}</Typography>
                                                        </Box>
                                                    ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                )}
            </Box>
        </Layout>
    );
}
