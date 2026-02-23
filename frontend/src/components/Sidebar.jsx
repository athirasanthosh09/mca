import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Avatar, Divider, useTheme, IconButton, Tooltip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../App';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MapIcon from '@mui/icons-material/Map';
import HistoryIcon from '@mui/icons-material/History';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';

const drawerWidth = 280;

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const { mode, toggleTheme } = useThemeMode();

    const menuItems = {
        Admin: [
            { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
            { text: 'Pickups', icon: <LocalShippingIcon />, path: '/admin/pickups' },
            { text: 'Complaints', icon: <ReportProblemIcon />, path: '/admin/complaints' },
            { text: 'Users', icon: <GroupIcon />, path: '/admin/users' },
            { text: 'Reports', icon: <AssessmentIcon />, path: '/admin/reports' },
        ],
        User: [
            { text: 'Home', icon: <DashboardIcon />, path: '/dashboard' },
            { text: 'Pickups', icon: <LocalShippingIcon />, path: '/user/request-pickup' },
            { text: 'Complaints', icon: <ReportProblemIcon />, path: '/user/complaints' },
            { text: 'History', icon: <HistoryIcon />, path: '/user/history' },
        ],
        Driver: [
            { text: 'Tasks', icon: <LocalShippingIcon />, path: '/dashboard' },
        ]
    };

    const roleMenu = menuItems[user?.role] || [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/dashboard') {
            return location.pathname === '/' || location.pathname === '/dashboard';
        }
        return location.pathname === path;
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    borderRight: '1px dashed rgba(145, 158, 171, 0.24)',
                    backgroundColor: theme.palette.background.default
                },
            }}
        >
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                        {user?.name?.charAt(0) || 'U'}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" noWrap>
                            {user?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {user?.role}
                        </Typography>
                    </Box>
                </Box>
                <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
                    <IconButton onClick={toggleTheme} size="small">
                        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                </Tooltip>
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <List sx={{ px: 2, py: 2 }}>
                {roleMenu.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => {
                                console.log('Navigating to:', item.path);
                                navigate(item.path);
                            }}
                            sx={{
                                borderRadius: 1,
                                bgcolor: isActive(item.path) ? 'rgba(0, 171, 85, 0.08)' : 'transparent',
                                color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                                '&:hover': {
                                    bgcolor: 'rgba(145, 158, 171, 0.08)',
                                }
                            }}
                        >
                            <ListItemIcon sx={{
                                color: isActive(item.path) ? 'primary.main' : 'inherit',
                                minWidth: 40
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    variant: 'body2',
                                    fontWeight: isActive(item.path) ? 600 : 400
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ p: 2 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            borderRadius: 1,
                            color: 'error.main',
                            '&:hover': {
                                bgcolor: 'rgba(255, 72, 66, 0.08)',
                            }
                        }}
                    >
                        <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                    </ListItemButton>
                </ListItem>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
