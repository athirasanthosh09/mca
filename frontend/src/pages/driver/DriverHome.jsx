import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Button, Box, Card, CardContent, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Divider, Avatar, LinearProgress
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Layout from '../../components/Layout';
import NavigationIcon from '@mui/icons-material/Navigation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GreetingHeader from '../../components/GreetingHeader';

const WASTE_COLOR = {
    organic: '#34C759',
    recyclable: '#007AFF',
    hazardous: '#FF3B30',
    general: '#8E8E93',
    overflow: '#FF9500',
};

const DriverHome = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [confirmTask, setConfirmTask] = useState(null);   // task pending confirmation
    const [completing, setCompleting] = useState(false);    // loading state for submit

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/v1/pickups/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const myTasks = response.data.filter(p => p.driver_id === user?._id);
            // Sort: pending/assigned first, completed last
            myTasks.sort((a, b) => {
                const done = s => s === 'Completed' || s === 'Missed';
                return done(a.status) - done(b.status);
            });
            setTasks(myTasks);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchTasks(); }, [user]);

    const handleNavigate = (lat, lng, address) => {
        if (lat && lng) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        } else {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
        }
    };

    const confirmComplete = async () => {
        if (!confirmTask) return;
        setCompleting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:8000/api/v1/pickups/${confirmTask._id}`,
                { status: 'Completed' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchTasks();
        } catch (error) {
            console.error(error);
        } finally {
            setCompleting(false);
            setConfirmTask(null);
        }
    };

    const handleUndo = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:8000/api/v1/pickups/${taskId}`,
                { status: 'Assigned' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchTasks();
        } catch (error) {
            console.error(error);
        }
    };

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const activeTasks = tasks.filter(t => t.status !== 'Completed' && t.status !== 'Missed');
    const doneTasks = tasks.filter(t => t.status === 'Completed' || t.status === 'Missed');
    const priorityTask = activeTasks[0];
    const progress = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

    return (
        <Layout>
            <Container maxWidth="lg" sx={{ pb: 6 }}>
                <GreetingHeader userName={user?.name} role="Driver" />

                {/* Progress Bar */}
                {tasks.length > 0 && (
                    <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <CardContent sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" fontWeight={700}>Today's Progress</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {doneTasks.length} / {tasks.length} tasks done
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                    height: 8, borderRadius: 4,
                                    bgcolor: '#F0F0F0',
                                    '& .MuiLinearProgress-bar': { bgcolor: '#34C759', borderRadius: 4 }
                                }}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Priority Pickup Card */}
                {priorityTask && (
                    <Card sx={{ mb: 3, border: '2px solid #007AFF', borderRadius: 3, position: 'relative', overflow: 'visible' }}>
                        <Box sx={{
                            position: 'absolute', top: -13, left: 16,
                            bgcolor: '#007AFF', px: 1.5, py: 0.4, borderRadius: '6px',
                        }}>
                            <Typography variant="caption" fontWeight={800} color="#fff" sx={{ letterSpacing: 1 }}>
                                ⚡ NEXT PICKUP
                            </Typography>
                        </Box>
                        <CardContent sx={{ pt: 3.5 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2.5 }}>
                                <Avatar sx={{ bgcolor: '#EBF5FF', color: '#007AFF', width: 48, height: 48 }}>
                                    <LocalShippingIcon />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                                        {priorityTask.address}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip
                                            label={priorityTask.waste_type?.toUpperCase()}
                                            size="small"
                                            sx={{
                                                bgcolor: `${WASTE_COLOR[priorityTask.waste_type?.toLowerCase()] || '#8E8E93'}20`,
                                                color: WASTE_COLOR[priorityTask.waste_type?.toLowerCase()] || '#8E8E93',
                                                fontWeight: 700, fontSize: '0.7rem',
                                            }}
                                        />
                                        {priorityTask.quantity && (
                                            <Chip label={`${priorityTask.quantity} kg`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                                        )}
                                        <Chip
                                            icon={<CalendarTodayIcon sx={{ fontSize: '0.75rem !important' }} />}
                                            label={formatDate(priorityTask.scheduled_date)}
                                            size="small" variant="outlined"
                                            sx={{ fontWeight: 500, fontSize: '0.7rem' }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<NavigationIcon />}
                                    onClick={() => handleNavigate(priorityTask.latitude, priorityTask.longitude, priorityTask.address)}
                                    sx={{ flex: 2, py: 1.5, fontWeight: 700, borderRadius: 2.5 }}
                                >
                                    Navigate
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<CheckCircleIcon />}
                                    onClick={() => setConfirmTask(priorityTask)}
                                    sx={{ flex: 1, py: 1.5, fontWeight: 700, borderRadius: 2.5, color: '#34C759', borderColor: '#34C759', '&:hover': { bgcolor: '#34C75910' } }}
                                >
                                    Mark Done
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* ── Active Tasks List ── */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>Assigned Tasks</Typography>
                    <Chip
                        label={`${activeTasks.length} Remaining`}
                        size="small"
                        sx={{ bgcolor: activeTasks.length > 0 ? '#EBF5FF' : '#EDFAF3', color: activeTasks.length > 0 ? '#007AFF' : '#34C759', fontWeight: 700 }}
                    />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
                    {activeTasks.length === 0 && doneTasks.length === 0 ? (
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent sx={{ textAlign: 'center', py: 6 }}>
                                <Typography color="text.secondary">No tasks assigned yet.</Typography>
                            </CardContent>
                        </Card>
                    ) : activeTasks.length === 0 ? (
                        <Card sx={{ borderRadius: 3, border: '1px solid #34C759' }}>
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <CheckCircleIcon sx={{ fontSize: 40, color: '#34C759', mb: 1 }} />
                                <Typography fontWeight={700} color="#34C759">All tasks completed!</Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        activeTasks.map((task) => (
                            <Card key={task._id} sx={{
                                borderRadius: 3, border: '1px solid', borderColor: 'divider',
                                transition: 'box-shadow 0.15s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.09)' }
                            }}>
                                <CardContent sx={{ py: 2 }}>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <RadioButtonUncheckedIcon sx={{ color: '#C7C7CC', fontSize: 28, flexShrink: 0 }} />
                                        <LocationOnIcon color="action" sx={{ flexShrink: 0 }} />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="subtitle1" fontWeight={600} noWrap>{task.address}</Typography>
                                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                                <Chip
                                                    label={task.waste_type?.toUpperCase()}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: `${WASTE_COLOR[task.waste_type?.toLowerCase()] || '#8E8E93'}18`,
                                                        color: WASTE_COLOR[task.waste_type?.toLowerCase()] || '#8E8E93',
                                                        fontWeight: 700, fontSize: '0.65rem', height: 20,
                                                    }}
                                                />
                                                {task.quantity && (
                                                    <Typography variant="caption" color="text.secondary">{task.quantity} kg</Typography>
                                                )}
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(task.scheduled_date)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<NavigationIcon />}
                                                onClick={() => handleNavigate(task.latitude, task.longitude, task.address)}
                                                sx={{ fontWeight: 600, borderRadius: 2, minWidth: 0 }}
                                            >
                                                Go
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<CheckCircleIcon />}
                                                onClick={() => setConfirmTask(task)}
                                                sx={{ fontWeight: 700, borderRadius: 2, bgcolor: '#34C759', '&:hover': { bgcolor: '#2DAF4F' } }}
                                            >
                                                Done
                                            </Button>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </Box>

                {/* ── Completed Tasks ── */}
                {doneTasks.length > 0 && (
                    <>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5 }}>
                            COMPLETED ({doneTasks.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {doneTasks.map((task) => (
                                <Card key={task._id} sx={{ borderRadius: 3, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', opacity: task.status === 'Missed' ? 0.55 : 0.8 }}>
                                    <CardContent sx={{ py: 1.5 }}>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <CheckCircleIcon sx={{ color: task.status === 'Completed' ? '#34C759' : '#FF3B30', fontSize: 24, flexShrink: 0 }} />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="body2" fontWeight={600}
                                                    sx={{ textDecoration: 'line-through', color: 'text.secondary' }} noWrap>
                                                    {task.address}
                                                </Typography>
                                                <Chip
                                                    label={task.status}
                                                    size="small"
                                                    sx={{
                                                        mt: 0.5, height: 18, fontSize: '0.65rem', fontWeight: 700,
                                                        bgcolor: task.status === 'Completed' ? '#EDFAF3' : '#FFEBEE',
                                                        color: task.status === 'Completed' ? '#34C759' : '#FF3B30',
                                                    }}
                                                />
                                            </Box>
                                            {task.status === 'Completed' && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => handleUndo(task._id)}
                                                    sx={{
                                                        fontWeight: 700, borderRadius: 2, flexShrink: 0,
                                                        fontSize: '0.72rem', color: '#FF9500', borderColor: '#FF9500',
                                                        '&:hover': { bgcolor: '#FF950015' },
                                                    }}
                                                >
                                                    Undo
                                                </Button>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </>
                )}
            </Container>

            {/* ── Confirmation Dialog ── */}
            <Dialog
                open={!!confirmTask}
                onClose={() => !completing && setConfirmTask(null)}
                PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 380 } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: '#FFF3E0', color: '#FF9500', width: 40, height: 40 }}>
                            <WarningAmberIcon />
                        </Avatar>
                        <Typography variant="h6" fontWeight={800}>Mark as Completed?</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        You are about to mark this pickup as <strong>Completed</strong>. This action <strong>cannot be undone</strong>.
                    </Typography>
                    {confirmTask && (
                        <Box sx={{ bgcolor: 'background.default', borderRadius: 2, p: 1.5, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="subtitle2" fontWeight={700}>{confirmTask.address}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {confirmTask.waste_type?.toUpperCase()} · {formatDate(confirmTask.scheduled_date)}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setConfirmTask(null)}
                        disabled={completing}
                        sx={{ fontWeight: 700, borderRadius: 2, flex: 1 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={confirmComplete}
                        disabled={completing}
                        startIcon={<CheckCircleIcon />}
                        sx={{ fontWeight: 700, borderRadius: 2, flex: 1, bgcolor: '#34C759', '&:hover': { bgcolor: '#2DAF4F' } }}
                    >
                        {completing ? 'Saving...' : 'Confirm Done'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
};

export default DriverHome;
