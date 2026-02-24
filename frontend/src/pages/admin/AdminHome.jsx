import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, Button, Card, CardContent, Stack, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import MapComponent from '../../components/MapComponent';
import GreetingHeader from '../../components/GreetingHeader';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MapIcon from '@mui/icons-material/Map';
import WarningIcon from '@mui/icons-material/Warning';

const AdminHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_users: 0,
        total_pickups: 0,
        pending_pickups: 0,
        completed_pickups: 0,
        total_complaints: 0,
        open_complaints: 0
    });
    const [pickups, setPickups] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [statsRes, pickupsRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/v1/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:8000/api/v1/pickups/', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setStats(statsRes.data);
                setPickups(pickupsRes.data);
            } catch (error) {
                console.error("Error fetching data", error);
            }
        };
        fetchData();
    }, []);

    const StatCard = ({ title, value, icon, iconBg, iconColor, trend, trendColor = '#34C759' }) => (
        <Card sx={{
            height: '100%',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            transition: 'transform 0.18s, box-shadow 0.18s',
            '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' },
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* Accent bar */}
            <Box sx={{ height: 4, bgcolor: iconColor, width: '100%' }} />
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box sx={{
                    width: 52, height: 52, borderRadius: '14px',
                    bgcolor: iconBg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                }}>
                    {icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} noWrap sx={{ mb: 0.25 }}>
                        {title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                            {value.toLocaleString()}
                        </Typography>
                        {trend && (
                            <Chip label={trend} size="small" sx={{
                                bgcolor: `${trendColor}18`,
                                color: trendColor,
                                fontWeight: 700,
                                fontSize: '0.68rem',
                                height: 22,
                                ml: 0.5,
                            }} />
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    const inProgressPickups = pickups.filter(p => p.status === 'In Progress' || p.status === 'Assigned').length;
    const completedPickups = pickups.filter(p => p.status === 'Completed').length;
    const pendingPickups = pickups.filter(p => p.status === 'Pending').length;

    const statusData = [
        { name: 'In Progress', value: inProgressPickups, color: '#007AFF' },
        { name: 'Completed', value: completedPickups, color: '#34C759' },
        { name: 'Scheduled', value: pendingPickups, color: '#FF9500' },
    ];

    const totalPickupsCount = inProgressPickups + completedPickups + pendingPickups;

    return (
        <Layout>
            <Container maxWidth="xl">
                <GreetingHeader userName={user?.name} role="Admin" />

                <Grid container spacing={2.5} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Registered Users"
                            value={stats.total_users}
                            icon={<PeopleIcon sx={{ fontSize: 26, color: '#007AFF' }} />}
                            iconBg="#E3F2FD" iconColor="#007AFF"
                            trend="+4%" trendColor="#34C759"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Pickups Today"
                            value={stats.total_pickups}
                            icon={<LocalShippingIcon sx={{ fontSize: 26, color: '#34C759' }} />}
                            iconBg="#E8F5E9" iconColor="#34C759"
                            trend="+12%" trendColor="#34C759"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Pending Requests"
                            value={stats.pending_pickups}
                            icon={<AssignmentIcon sx={{ fontSize: 26, color: '#FF9500' }} />}
                            iconBg="#FFF3E0" iconColor="#FF9500"
                            trend="Active" trendColor="#FF9500"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Open Complaints"
                            value={stats.open_complaints}
                            icon={<ReportProblemIcon sx={{ fontSize: 26, color: '#FF3B30' }} />}
                            iconBg="#FFEBEE" iconColor="#FF3B30"
                            trend="High" trendColor="#FF3B30"
                        />
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<MapIcon />}
                        onClick={() => navigate('/admin/pickups')}
                        sx={{ py: 1.25, px: 3, fontWeight: 700, borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                    >
                        Manage All Pickups
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        startIcon={<WarningIcon />}
                        onClick={() => navigate('/admin/complaints')}
                        sx={{ py: 1.25, px: 3, fontWeight: 700, borderRadius: 2.5 }}
                    >
                        Review Pending Complaints
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 2.5, mb: 4, alignItems: 'stretch' }}>
                    {/* Live Pickup Map */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <MapIcon sx={{ color: '#007AFF', fontSize: 20 }} />
                                    <Typography variant="h6" fontWeight={700}>Live Pickup Map</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Real-time tracking of active collection fleets
                                </Typography>
                                <Box sx={{ flex: 1, minHeight: 340, borderRadius: 2, overflow: 'hidden', bgcolor: 'background.default' }}>
                                    <MapComponent
                                        markers={pickups.filter(p => p.latitude && p.longitude).map(p => ({
                                            lat: p.latitude,
                                            lng: p.longitude,
                                            popup: `${p.address} (${p.status})`
                                        }))}
                                        height="100%"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Pickup Status */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    Pickup Status
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Current task distribution
                                </Typography>

                                {/* Circular Progress */}
                                <Box sx={{ position: 'relative', height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={85}
                                                paddingAngle={3}
                                                dataKey="value"
                                                label={false}
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Typography variant="h3" fontWeight={700}>
                                            {totalPickupsCount}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                            TOTAL
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Status Breakdown */}
                                <Stack spacing={1.5}>
                                    {statusData.map((item) => (
                                        <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                                                <Typography variant="body2" fontWeight={500}>
                                                    {item.name}
                                                </Typography>
                                            </Box>
                                            <Typography variant="subtitle2" fontWeight={700}>
                                                {item.value}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>

                                <Button
                                    variant="text"
                                    fullWidth
                                    sx={{ mt: 3, fontWeight: 600, color: '#007AFF' }}
                                    onClick={() => navigate('/admin/pickups')}
                                >
                                    View Detailed Analytics
                                </Button>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>

                {/* Recent Pickups Table */}
                {/* <Card>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" fontWeight={700}>
                                Recent Pickups
                            </Typography>
                            <Button
                                variant="text"
                                sx={{ fontWeight: 600, color: '#007AFF' }}
                                onClick={() => navigate('/admin/pickups')}
                            >
                                See all
                            </Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>ID</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>LOCATION</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>WASTE TYPE</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>STATUS</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>DRIVER</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }} align="right">TIME</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pickups.slice(0, 5).map((pickup) => {
                                        const getDriverName = () => {
                                            return pickup.driver_id ? `Driver ${pickup.driver_id.substring(0, 4)}` : 'Unassigned';
                                        };

                                        const getTimeAgo = (date) => {
                                            const seconds = Math.floor((new Date() - new Date(date)) / 1000);
                                            if (seconds < 60) return `${seconds} secs ago`;
                                            const minutes = Math.floor(seconds / 60);
                                            if (minutes < 60) return `${minutes} mins ago`;
                                            const hours = Math.floor(minutes / 60);
                                            return `${hours} hours ago`;
                                        };

                                        return (
                                            <TableRow key={pickup._id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        #PU-{pickup._id.substring(18, 24).toUpperCase()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {pickup.address}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={pickup.waste_type.charAt(0).toUpperCase() + pickup.waste_type.slice(1)}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: pickup.waste_type === 'plastic' ? '#E3F2FD' :
                                                                pickup.waste_type === 'organic' ? '#E8F5E9' : '#FFF3E0',
                                                            color: pickup.waste_type === 'plastic' ? '#007AFF' :
                                                                pickup.waste_type === 'organic' ? '#34C759' : '#FF9500',
                                                            fontWeight: 600,
                                                            fontSize: '0.688rem',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box
                                                            sx={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                bgcolor: pickup.status === 'Completed' ? '#34C759' :
                                                                    pickup.status === 'In Progress' || pickup.status === 'Assigned' ? '#007AFF' : '#FF9500'
                                                            }}
                                                        />
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {pickup.status === 'Assigned' ? 'In Transit' : pickup.status}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {getDriverName()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" color="text.secondary">
                                                        {getTimeAgo(pickup.created_at)}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card> */}
            </Container>
        </Layout>
    );
};

export default AdminHome;
