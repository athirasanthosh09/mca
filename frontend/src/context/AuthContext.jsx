import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async (token) => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user", error);
            // Only remove token if it's an authentication error (401 or 403)
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                console.log("Token invalid or expired, logging out");
                localStorage.removeItem('token');
                setUser(null);
            } else {
                // On network/server errors, keep trying - don't change user state
                console.log("Network or server error, will retry");
                // Don't set user to null, leave it as is
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        const response = await axios.post('http://localhost:8000/api/v1/auth/login', formData);
        const { access_token } = response.data;

        localStorage.setItem('token', access_token);
        await fetchUser(access_token);
        return true;
    };

    const register = async (userData) => {
        console.log("Registering user:", userData);
        try {
            const response = await axios.post('http://localhost:8000/api/v1/auth/register', userData);
            console.log("Registration response:", response.data);
            return true;
        } catch (error) {
            console.error("Registration error:", error.response ? error.response.data : error.message);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
