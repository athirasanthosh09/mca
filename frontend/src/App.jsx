import React, { useState, useMemo, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RequestPickup from './pages/user/RequestPickup';
import ManagePickups from './pages/admin/ManagePickups';
import MyComplaints from './pages/user/MyComplaints';
import ManageComplaints from './pages/admin/ManageComplaints';
import ManageUsers from './pages/admin/ManageUsers';
import AdminReports from './pages/admin/AdminReports';
import UserHistory from './pages/user/UserHistory';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Theme Mode Context
const ThemeModeContext = createContext();

export const useThemeMode = () => useContext(ThemeModeContext);

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#007AFF',
      light: '#4DA2FF',
      dark: '#0051D5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#34C759',
      light: '#5DD57D',
      dark: '#28A745',
    },
    background: {
      default: mode === 'dark' ? '#0A0E27' : '#F3F4F6',
      paper: mode === 'dark' ? '#151932' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#FFFFFF' : '#1C1C1E',
      secondary: mode === 'dark' ? '#B8B9BE' : '#6E6E73',
    },
    success: {
      main: '#34C759',
      dark: '#28A745',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#FF9500',
      dark: '#E68600',
      contrastText: '#ffffff',
    },
    error: {
      main: '#FF3B30',
      dark: '#D62828',
      contrastText: '#ffffff',
    },
    info: {
      main: '#007AFF',
      dark: '#0051D5',
      contrastText: '#ffffff',
    },
    divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 700,
      fontSize: '1.125rem',
    },
    subtitle1: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: '0.875rem',
    },
    body1: {
      fontSize: '0.938rem',
    },
    body2: {
      fontSize: '0.813rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    mode === 'dark' ?
      '0px 2px 4px rgba(0,0,0,0.25)' :
      '0px 2px 4px rgba(0,0,0,0.06)',
    mode === 'dark' ?
      '0px 4px 8px rgba(0,0,0,0.3)' :
      '0px 4px 8px rgba(0,0,0,0.08)',
    mode === 'dark' ?
      '0px 6px 12px rgba(0,0,0,0.35)' :
      '0px 6px 12px rgba(0,0,0,0.1)',
    mode === 'dark' ?
      '0px 8px 16px rgba(0,0,0,0.4)' :
      '0px 8px 16px rgba(0,0,0,0.12)',
    ...Array(20).fill(mode === 'dark' ?
      '0px 10px 20px rgba(0,0,0,0.45)' :
      '0px 10px 20px rgba(0,0,0,0.14)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: '0.875rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: mode === 'dark' ?
              '0px 4px 12px rgba(0, 122, 255, 0.3)' :
              '0px 4px 12px rgba(0,122,255,0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'dark' ?
            '0px 2px 8px rgba(0,0,0,0.3)' :
            '0px 2px 8px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: mode === 'dark' ?
            '1px solid rgba(255,255,255,0.08)' :
            '1px solid rgba(0,0,0,0.08)',
        },
        head: {
          fontWeight: 700,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: mode === 'dark' ? '#B8B9BE' : '#6E6E73',
        },
      },
    },
  },
});

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Still fetching user from token on refresh — don't redirect yet
  if (loading) {
    return null;  // or a spinner
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  const [mode, setMode] = useState('light');
  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/request-pickup"
                element={
                  <ProtectedRoute allowedRoles={['User']}>
                    <RequestPickup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/complaints"
                element={
                  <ProtectedRoute allowedRoles={['User']}>
                    <MyComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/history"
                element={
                  <ProtectedRoute allowedRoles={['User']}>
                    <UserHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <ManageUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pickups"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <ManagePickups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <ManageComplaints />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export default App;
