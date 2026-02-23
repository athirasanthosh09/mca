import React, { useEffect, useState, useRef } from 'react';
import {
    Container, Typography, Button, Box, Card, CardContent, Grid, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Avatar,
    MenuItem, Select, FormControl, InputLabel, InputAdornment, IconButton,
    Pagination, ToggleButtonGroup, ToggleButton, Divider
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

const ManageComplaints = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [users, setUsers] = useState([]);   // for customer name lookup
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [response, setResponse] = useState('');
    const [status, setStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    // New Ticket Dialog
    const [newTicketOpen, setNewTicketOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({
        customerSearch: '',
        category: '',
        priority: 'Low',
        description: '',
        attachments: []
    });
    const fileInputRef = useRef(null);

    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8000/api/v1/complaints/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(res.data);
            setFilteredComplaints(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchComplaints();
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8000/api/v1/users/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        let filtered = complaints;

        if (searchQuery) {
            filtered = filtered.filter(c =>
                c._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.user_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter !== 'All') {
            filtered = filtered.filter(c => c.status === statusFilter);
        }

        if (categoryFilter !== 'All') {
            filtered = filtered.filter(c => c.category === categoryFilter);
        }

        setFilteredComplaints(filtered);
        setPage(1);
    }, [searchQuery, statusFilter, categoryFilter, complaints]);

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8000/api/v1/complaints/${selectedComplaint._id}`,
                { admin_response: response, status: status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSelectedComplaint(null);
            setResponse('');
            setStatus('');
            fetchComplaints();
        } catch (error) {
            console.error(error);
        }
    };

    const openDialog = (complaint) => {
        setSelectedComplaint(complaint);
        setResponse(complaint.admin_response || '');
        setStatus(complaint.status);
    };

    const handleCreateTicket = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8000/api/v1/complaints/', {
                title: newTicket.category.charAt(0).toUpperCase() + newTicket.category.slice(1) + ' Issue',
                category: newTicket.category,
                description: newTicket.description,
                priority: newTicket.priority,
            }, { headers: { Authorization: `Bearer ${token}` } });
            setNewTicketOpen(false);
            setNewTicket({ customerSearch: '', category: '', priority: 'Low', description: '', attachments: [] });
            fetchComplaints();
        } catch (error) {
            console.error('Create ticket error:', error.response?.data || error);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setNewTicket(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
    };

    const exportToCSV = () => {
        const headers = ['Complaint ID', 'Customer', 'Category', 'Status', 'Date Reported', 'Description'];
        const csvData = filteredComplaints.map(c => [
            `#WC-${c._id.substring(18, 24).toUpperCase()}`,
            c.user_id || 'N/A',
            c.category,
            c.status,
            new Date(c.created_at).toLocaleDateString(),
            c.description
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `complaints_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'error';
            case 'In Progress': return 'warning';
            case 'Resolved': return 'success';
            default: return 'default';
        }
    };

    const getCategoryIcon = (category) => {
        switch (category.toLowerCase()) {
            case 'billing': return '💳';
            case 'service': return '🛠️';
            case 'overflow': return '🗑️';
            case 'pickup': return '🚚';
            case 'other': return '⚠️';
            default: return '📋';
        }
    };

    const getInitials = (userId) => {
        if (!userId) return 'U';
        return userId.substring(0, 2).toUpperCase();
    };

    const openCases = complaints.filter(c => c.status === 'Open').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolvedToday = complaints.filter(c => {
        const today = new Date().toDateString();
        const complaintDate = new Date(c.updated_at || c.created_at).toDateString();
        return c.status === 'Resolved' && complaintDate === today;
    }).length;

    const paginatedComplaints = filteredComplaints.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    const totalPages = Math.ceil(filteredComplaints.length / rowsPerPage);

    return (
        <Layout>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                            <Typography variant="h4" fontWeight={700} gutterBottom>
                                Complaints & Support
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Manage and resolve customer service tickets for waste collection services.
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<FileDownloadIcon />}
                                onClick={exportToCSV}
                                sx={{ fontWeight: 600 }}
                            >
                                Export CSV
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setNewTicketOpen(true)}
                                sx={{ fontWeight: 600 }}
                            >
                                New Ticket
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'background.paper' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '12px',
                                        bgcolor: 'error.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        <ErrorOutlineIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="overline" color="text.secondary" fontSize="0.75rem">
                                            OPEN CASES
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700}>
                                            {openCases}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'background.paper' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '12px',
                                        bgcolor: 'warning.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        <HourglassEmptyIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="overline" color="text.secondary" fontSize="0.75rem">
                                            IN PROGRESS
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700}>
                                            {inProgress}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'background.paper' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '12px',
                                        bgcolor: 'success.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        <CheckCircleOutlineIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="overline" color="text.secondary" fontSize="0.75rem">
                                            RESOLVED TODAY
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700}>
                                            {resolvedToday}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'background.paper' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '12px',
                                        bgcolor: 'primary.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        <AccessTimeIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="overline" color="text.secondary" fontSize="0.75rem">
                                            AVG. RESPONSE
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700}>
                                            1.2h
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Search and Filters */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        placeholder="Search by ID, customer name or issue..."
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ flexGrow: 1, maxWidth: 400 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="All">All Statuses</MenuItem>
                            <MenuItem value="Open">Open</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Resolved">Resolved</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="All">All Categories</MenuItem>
                            <MenuItem value="billing">Billing</MenuItem>
                            <MenuItem value="service">Service</MenuItem>
                            <MenuItem value="overflow">Overflow</MenuItem>
                            <MenuItem value="pickup">Pickup</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </Select>
                    </FormControl>
                    <IconButton size="small" sx={{ bgcolor: 'background.paper' }}>
                        <FilterListIcon />
                    </IconButton>
                    <IconButton size="small" sx={{ bgcolor: 'background.paper' }} onClick={fetchComplaints}>
                        <RefreshIcon />
                    </IconButton>
                </Box>

                {/* Data Table */}
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>
                                    COMPLAINT ID
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>
                                    CUSTOMER NAME
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>
                                    CATEGORY
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>
                                    STATUS
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>
                                    DATE REPORTED
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>
                                    ACTIONS
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedComplaints.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">No complaints found.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedComplaints.map((complaint) => (
                                    <TableRow key={complaint._id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600} color="primary">
                                                #TKT-{complaint._id.substring(18, 24).toUpperCase()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#EBF5FF', color: '#2D7DD2' }}>
                                                    {(users.find(u => u._id === complaint.user_id)?.name || '?').charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {users.find(u => u._id === complaint.user_id)?.name || complaint.user_id?.substring(18, 24).toUpperCase() || 'Unknown'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {complaint.user_id?.substring(18, 24).toUpperCase()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{getCategoryIcon(complaint.category)}</span>
                                                <Typography variant="body2">
                                                    {complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={complaint.status}
                                                color={getStatusColor(complaint.status)}
                                                size="small"
                                                sx={{ fontWeight: 600, minWidth: 90 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(complaint.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(complaint.created_at).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                variant="text"
                                                onClick={() => openDialog(complaint)}
                                                sx={{ fontWeight: 600 }}
                                            >
                                                View Thread
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        Showing {((page - 1) * rowsPerPage) + 1} to {Math.min(page * rowsPerPage, filteredComplaints.length)} of {filteredComplaints.length} results
                    </Typography>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        color="primary"
                    />
                </Box>

                {/* Efficiency Tip */}
                <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <LightbulbIcon sx={{ fontSize: 40 }} />
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                    Efficiency Tip
                                </Typography>
                                <Typography variant="body2">
                                    Most "Overflowing Bin" complaints are resolved within 24 hours of being marked "In Progress".
                                    Try assigning multiple tickets in the same route to a single technician to optimize collection efficiency.
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Update Dialog */}
                <Dialog open={!!selectedComplaint} onClose={() => setSelectedComplaint(null)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ fontWeight: 700 }}>
                        Update Complaint #{selectedComplaint?._id.substring(18, 24).toUpperCase()}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                Description
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                {selectedComplaint?.description}
                            </Typography>

                            <TextField
                                select
                                fullWidth
                                label="Status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                SelectProps={{ native: true }}
                                sx={{ mb: 2 }}
                            >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                            </TextField>

                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Admin Response"
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder="Type your response here..."
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button onClick={() => setSelectedComplaint(null)} variant="outlined">
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} variant="contained">
                            Update
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Create New Ticket Dialog */}
                <Dialog
                    open={newTicketOpen}
                    onClose={() => setNewTicketOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 3 } }}
                >
                    <DialogTitle sx={{ pb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>Create New Support Ticket</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Fill in the details below to log a new customer complaint.
                                </Typography>
                            </Box>
                            <IconButton size="small" onClick={() => setNewTicketOpen(false)}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <Divider />
                    <DialogContent sx={{ pt: 3 }}>
                        {/* Customer Selection */}
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Customer Selection
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Search customer by name, ID or address..."
                            value={newTicket.customerSearch}
                            onChange={(e) => setNewTicket(prev => ({ ...prev, customerSearch: e.target.value }))}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonSearchIcon fontSize="small" color="action" />
                                    </InputAdornment>
                                )
                            }}
                            sx={{ mb: 3 }}
                        />

                        {/* Category + Priority */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Complaint Category
                                </Typography>
                                <FormControl fullWidth size="medium">
                                    <Select
                                        value={newTicket.category}
                                        onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                                        displayEmpty
                                        renderValue={(val) => val || <span style={{ color: '#aaa' }}>Select category</span>}
                                    >
                                        <MenuItem value="overflow">Overflowing Bin</MenuItem>
                                        <MenuItem value="pickup">Missed Pickup</MenuItem>
                                        <MenuItem value="billing">Billing Issue</MenuItem>
                                        <MenuItem value="service">Damaged Bin</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Priority Level
                                </Typography>
                                <ToggleButtonGroup
                                    value={newTicket.priority}
                                    exclusive
                                    onChange={(e, val) => val && setNewTicket(prev => ({ ...prev, priority: val }))}
                                    fullWidth
                                    size="medium"
                                >
                                    <ToggleButton value="Low" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>LOW</ToggleButton>
                                    <ToggleButton value="Medium" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>MEDIUM</ToggleButton>
                                    <ToggleButton value="High" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>HIGH</ToggleButton>
                                </ToggleButtonGroup>
                            </Grid>
                        </Grid>

                        {/* Description */}
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Description
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Describe the issue in detail..."
                            value={newTicket.description}
                            onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                            sx={{ mb: 3 }}
                        />

                        {/* Attachments */}
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Attachments (Photos)
                        </Typography>
                        <Box
                            onClick={() => fileInputRef.current?.click()}
                            sx={{
                                border: '2px dashed',
                                borderColor: 'divider',
                                borderRadius: 2,
                                p: 4,
                                textAlign: 'center',
                                cursor: 'pointer',
                                bgcolor: 'background.default',
                                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                                transition: 'all 0.2s'
                            }}
                        >
                            <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="body2">
                                <Box component="span" sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer' }}>
                                    Click to upload
                                </Box>
                                {' '}or drag and drop
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                PNG, JPG or PDF (max. 10MB)
                            </Typography>
                            {newTicket.attachments.length > 0 && (
                                <Typography variant="caption" display="block" color="success.main" sx={{ mt: 1 }}>
                                    {newTicket.attachments.length} file(s) selected
                                </Typography>
                            )}
                        </Box>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".png,.jpg,.jpeg,.pdf"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
                        <Button
                            onClick={() => setNewTicketOpen(false)}
                            variant="outlined"
                            fullWidth
                            size="large"
                            sx={{ fontWeight: 600 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateTicket}
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{ fontWeight: 600 }}
                            disabled={!newTicket.category || !newTicket.description}
                        >
                            Create Ticket
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Layout>
    );
};

export default ManageComplaints;
