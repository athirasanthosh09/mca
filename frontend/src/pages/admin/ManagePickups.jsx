import React, { useEffect, useState } from 'react';
import {
    Container, Box, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Avatar,
    IconButton, Pagination, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Card, CardContent, Grid, InputAdornment
} from '@mui/material';
import axios from 'axios';
import Layout from '../../components/Layout';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WarningIcon from '@mui/icons-material/Warning';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SyncIcon from '@mui/icons-material/Sync';

const ManagePickups = () => {
    const [pickups, setPickups] = useState([]);
    const [filteredPickups, setFilteredPickups] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [users, setUsers] = useState([]);    // for customer name lookup
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Active');
    const [wasteTypeFilter, setWasteTypeFilter] = useState('Any');
    const [dateFilter, setDateFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedPickup, setSelectedPickup] = useState(null);
    const rowsPerPage = 10;

    useEffect(() => {
        fetchPickups();
        fetchDrivers();
        fetchUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [pickups, searchQuery, statusFilter, wasteTypeFilter, dateFilter]);

    const fetchPickups = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/v1/pickups/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPickups(response.data);
        } catch (error) {
            console.error("Error fetching pickups", error);
        }
    };

    const fetchDrivers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/v1/users/drivers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDrivers(response.data);
        } catch (error) {
            console.error("Error fetching drivers", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/v1/users/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const applyFilters = () => {
        let filtered = [...pickups];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.user_id.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'All Active') {
            if (statusFilter === 'Pending') {
                filtered = filtered.filter(p => p.status === 'Pending');
            } else if (statusFilter === 'Assigned') {
                filtered = filtered.filter(p => p.status === 'Assigned');
            } else if (statusFilter === 'In Progress') {
                filtered = filtered.filter(p => p.status === 'In Progress');
            } else if (statusFilter === 'Completed') {
                filtered = filtered.filter(p => p.status === 'Completed');
            }
        }

        // Waste type filter
        if (wasteTypeFilter !== 'Any') {
            filtered = filtered.filter(p => p.waste_type === wasteTypeFilter.toLowerCase());
        }

        // Date filter (simplified for now)
        if (dateFilter === 'Today') {
            const today = new Date().toDateString();
            filtered = filtered.filter(p => new Date(p.created_at).toDateString() === today);
        }

        setFilteredPickups(filtered);
    };

    const handleAssignDriver = async (driverId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:8000/api/v1/pickups/${selectedPickup._id}/assign`,
                { driver_id: driverId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAssignDialogOpen(false);
            setSelectedPickup(null);
            fetchPickups();
        } catch (error) {
            console.error("Error assigning driver", error);
        }
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Customer', 'Address', 'Waste Type', 'Status', 'Driver', 'Date'];
        const rows = filteredPickups.map(p => [
            `#PU-${p._id.substring(18, 24).toUpperCase()}`,
            p.user_id.substring(0, 8),
            p.address,
            p.waste_type,
            p.status,
            p.driver_id ? `Driver ${p.driver_id.substring(0, 4)}` : 'Unassigned',
            new Date(p.created_at).toLocaleDateString()
        ]);

        const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pickups.csv';
        a.click();
    };

    const getDriverName = (driverId) => {
        if (!driverId) return 'Unassigned';
        const driver = drivers.find(d => d._id === driverId);
        return driver ? driver.name : `Driver ${driverId.substring(0, 4)}`;
    };

    const getUserName = (userId) => {
        if (!userId) return 'Unknown';
        const user = users.find(u => u._id === userId);
        return user ? user.name : `User #${userId.substring(18, 24).toUpperCase()}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return '#34C759';
            case 'In Progress':
            case 'Assigned': return '#007AFF';
            case 'Pending': return '#FF9500';
            default: return '#6E6E73';
        }
    };

    const getWasteTypeColor = (type) => {
        switch (type) {
            case 'plastic': return { bg: '#E3F2FD', color: '#007AFF' };
            case 'organic': return { bg: '#E8F5E9', color: '#34C759' };
            case 'hazardous': return { bg: '#FFEBEE', color: '#FF3B30' };
            case 'recyclable': return { bg: '#FFF3E0', color: '#FF9500' };
            default: return { bg: '#F3F4F6', color: '#6E6E73' };
        }
    };

    const paginatedPickups = filteredPickups.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    const totalPages = Math.ceil(filteredPickups.length / rowsPerPage);

    const unassignedCount = pickups.filter(p => !p.driver_id && p.status === 'Pending').length;
    const activeDrivers = [...new Set(pickups.filter(p => p.driver_id).map(p => p.driver_id))].length;

    return (
        <Layout>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box>
                            <Typography variant="h4" fontWeight={700}>
                                Manage Assignments
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Review and dispatch active waste collection tasks in the current queue.
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={exportToCSV}
                            sx={{ fontWeight: 600 }}
                        >
                            Export CSV
                        </Button>
                    </Box>
                </Box>

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FilterListIcon sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight={700}>
                            Filters
                        </Typography>
                    </Box>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>STATUS</InputLabel>
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="STATUS">
                            <MenuItem value="All Active">All Active</MenuItem>
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Assigned">Assigned</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Completed">Completed</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>DATE</InputLabel>
                        <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} label="DATE">
                            <MenuItem value="Today">Today</MenuItem>
                            <MenuItem value="All">All</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>WASTE TYPE</InputLabel>
                        <Select value={wasteTypeFilter} onChange={(e) => setWasteTypeFilter(e.target.value)} label="WASTE TYPE">
                            <MenuItem value="Any">Any</MenuItem>
                            <MenuItem value="Organic">Organic</MenuItem>
                            <MenuItem value="Plastic">Plastic</MenuItem>
                            <MenuItem value="Recyclable">Recyclable</MenuItem>
                            <MenuItem value="Hazardous">Hazardous</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        placeholder="Search assignments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flex: 1, minWidth: 250 }}
                    />

                    <Button
                        variant="text"
                        size="small"
                        onClick={() => {
                            setStatusFilter('All Active');
                            setWasteTypeFilter('Any');
                            setDateFilter('All');
                            setSearchQuery('');
                        }}
                    >
                        Clear all
                    </Button>
                </Paper>

                {/* Table */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>PICKUP ID</TableCell>
                                <TableCell>CUSTOMER NAME</TableCell>
                                <TableCell>ADDRESS</TableCell>
                                <TableCell>WASTE TYPE</TableCell>
                                <TableCell>STATUS</TableCell>
                                <TableCell>DRIVER</TableCell>
                                <TableCell align="right">ACTIONS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedPickups.map((pickup) => {
                                const wasteColors = getWasteTypeColor(pickup.waste_type);
                                return (
                                    <TableRow key={pickup._id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600} color="primary">
                                                #PU-{pickup._id.substring(18, 24).toUpperCase()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 30, height: 30, fontSize: '0.8rem', bgcolor: '#EBF5FF', color: '#2D7DD2' }}>
                                                    {getUserName(pickup.user_id).charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {getUserName(pickup.user_id)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {pickup.user_id.substring(18, 24).toUpperCase()}
                                                    </Typography>
                                                </Box>
                                            </Box>
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
                                                    bgcolor: wasteColors.bg,
                                                    color: wasteColors.color,
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
                                                        bgcolor: getStatusColor(pickup.status)
                                                    }}
                                                />
                                                <Typography variant="body2" fontWeight={500}>
                                                    {pickup.status}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {pickup.driver_id ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'secondary.main' }}>
                                                        {getDriverName(pickup.driver_id).charAt(0)}
                                                    </Avatar>
                                                    <Typography variant="body2">
                                                        {getDriverName(pickup.driver_id)}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Chip label="Unassigned" size="small" variant="outlined" />
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            {!['Completed', 'Missed'].includes(pickup.status) && (
                                                <Button
                                                    variant={pickup.driver_id ? 'outlined' : 'contained'}
                                                    size="small"
                                                    startIcon={pickup.driver_id ? <SyncIcon /> : <PersonAddIcon />}
                                                    onClick={() => {
                                                        setSelectedPickup(pickup);
                                                        setAssignDialogOpen(true);
                                                    }}
                                                    sx={pickup.driver_id ? {
                                                        borderColor: 'primary.main',
                                                        color: 'primary.main',
                                                        '&:hover': { bgcolor: 'primary.50' }
                                                    } : {}}
                                                >
                                                    {pickup.driver_id ? 'Reassign' : 'Assign'}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        Showing {((page - 1) * rowsPerPage) + 1}-{Math.min(page * rowsPerPage, filteredPickups.length)} of {filteredPickups.length} assignments
                    </Typography>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        color="primary"
                    />
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '12px',
                                        bgcolor: '#E3F2FD',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <LocalShippingIcon sx={{ color: '#007AFF', fontSize: 24 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" fontWeight={700}>
                                            {pickups.length}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Today's Total
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '12px',
                                        bgcolor: '#FFF3E0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <WarningIcon sx={{ color: '#FF9500', fontSize: 24 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" fontWeight={700}>
                                            {unassignedCount}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Unassigned Tasks
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '12px',
                                        bgcolor: '#E8F5E9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <AssignmentIcon sx={{ color: '#34C759', fontSize: 24 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" fontWeight={700}>
                                            {activeDrivers}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Active Drivers
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Assign Driver Dialog */}
                <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight={700}>
                                Assign Driver
                            </Typography>
                            <IconButton size="small" onClick={() => setAssignDialogOpen(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Select a driver for pickup #{selectedPickup?._id.substring(18, 24).toUpperCase()}
                        </Typography>
                        <Stack spacing={2}>
                            {drivers.map((driver) => (
                                <Box
                                    key={driver._id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                                            {driver.name.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>
                                                {driver.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {driver.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleAssignDriver(driver._id)}
                                    >
                                        Assign
                                    </Button>
                                </Box>
                            ))}
                        </Stack>
                    </DialogContent>
                </Dialog>
            </Container>
        </Layout>
    );
};

export default ManagePickups;
