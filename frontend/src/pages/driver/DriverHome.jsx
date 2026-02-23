import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, Card, CardContent, Grid, Checkbox } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Layout from '../../components/Layout';
import NavigationIcon from '@mui/icons-material/Navigation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GreetingHeader from '../../components/GreetingHeader';
import StatusBadge from '../../components/StatusBadge';

const DriverHome = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/v1/pickups/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter pickups where driver_id matches current user
            const myTasks = response.data.filter(p => p.driver_id === user?._id);
            setTasks(myTasks);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [user]);

    const handleComplete = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8000/api/v1/pickups/${taskId}`,
                { status: 'Completed' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTasks();
        } catch (error) {
            console.error(error);
        }
    };

    const handleNavigate = (lat, lng, address) => {
        if (lat && lng) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        } else {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Get priority pickup (first pending or assigned task)
    const priorityTask = tasks.find(t => t.status !== 'Completed');
    const remainingTasks = tasks.filter(t => t.status !== 'Completed').length;

    return (
        <Layout>
            <Container maxWidth="lg">
                <GreetingHeader userName={user?.name} role={`Driver`} />

                {/* Priority Pickup Card */}
                {priorityTask && (
                    <Card sx={{ mb: 4, border: '3px solid #007AFF', position: 'relative', overflow: 'visible' }}>
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -12,
                                left: 20,
                                bgcolor: '#E3F2FD',
                                px: 2,
                                py: 0.5,
                                borderRadius: '6px',
                                border: '2px solid #007AFF',
                            }}
                        >
                            <Typography variant="caption" fontWeight={700} color="#007AFF">
                                PRIORITY PICKUP
                            </Typography>
                        </Box>
                        <CardContent sx={{ pt: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                <Box>
                                    <Typography variant="overline" color="text.secondary" fontWeight={600}>
                                        NEXT PICKUP
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, mb: 1 }}>
                                        {priorityTask.address}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {priorityTask.waste_type.toUpperCase()} Waste
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        ETA
                                    </Typography>
                                    <Typography variant="h6" fontWeight={700} color="primary">
                                        15 mins
                                    </Typography>
                                </Box>
                            </Box>
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                startIcon={<NavigationIcon />}
                                onClick={() => handleNavigate(priorityTask.latitude, priorityTask.longitude, priorityTask.address)}
                                sx={{
                                    py: 2,
                                    fontSize: '1.125rem',
                                    fontWeight: 700,
                                }}
                            >
                                NAVIGATE NOW
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Assigned Tasks */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>
                        Assigned Tasks
                    </Typography>
                    <Typography variant="subtitle1" color="primary" fontWeight={700}>
                        {remainingTasks} Remaining
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    {tasks.length === 0 ? (
                        <Grid item xs={12}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No tasks assigned yet
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ) : (
                        tasks.map((task) => (
                            <Grid item xs={12} key={task._id}>
                                <Card
                                    sx={{
                                        opacity: task.status === 'Completed' ? 0.6 : 1,
                                        bgcolor: task.status === 'Completed' ? 'background.default' : 'background.paper',
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <Checkbox
                                                checked={task.status === 'Completed'}
                                                onChange={() => task.status !== 'Completed' && handleComplete(task._id)}
                                                icon={<Box sx={{
                                                    width: 28,
                                                    height: 28,
                                                    border: '2px solid #C7C7CC',
                                                    borderRadius: '50%'
                                                }} />}
                                                checkedIcon={<CheckCircleIcon sx={{ fontSize: 32, color: 'secondary.main' }} />}
                                            />
                                            <LocationOnIcon color="action" />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight={600}
                                                    sx={{
                                                        textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                                                    }}
                                                >
                                                    {task.address}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                                    <StatusBadge status={task.waste_type} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDate(task.scheduled_date)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {task.status !== 'Completed' && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<NavigationIcon />}
                                                    onClick={() => handleNavigate(task.latitude, task.longitude, task.address)}
                                                    sx={{
                                                        minWidth: 120,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Navigate
                                                </Button>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            </Container>
        </Layout>
    );
};

export default DriverHome;
