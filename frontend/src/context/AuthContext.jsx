import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rg_user');
    return saved ? JSON.parse(saved) : {
      id: 'usr-admin-01',
      name: 'Super Administrator',
      email: 'admin@roadguard.ai',
      role: 'Administrator',
      department: 'Karnataka State Highway Authority'
    };
  });
  
  const [token, setToken] = useState(() => localStorage.getItem('rg_token') || 'demo-admin-token');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('rg_token', token);
    } else {
      localStorage.removeItem('rg_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('rg_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rg_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setToken(data.access_token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);
      setToken(data.access_token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('rg_token');
    localStorage.removeItem('rg_user');
  };

  // Quick switch role for hackathon evaluation demo
  const switchRole = (role) => {
    const roleProfiles = {
      Administrator: {
        id: 'usr-admin-01',
        name: 'Super Administrator',
        email: 'admin@roadguard.ai',
        role: 'Administrator',
        department: 'Karnataka State Highway Authority'
      },
      'Government Authority': {
        id: 'usr-gov-01',
        name: 'Executive Engineer (PWD)',
        email: 'authority@pwd.gov.in',
        role: 'Government Authority',
        department: 'Public Works Department, Davanagere Division'
      },
      Inspector: {
        id: 'usr-insp-01',
        name: 'Ramesh Kumar (Chief Inspector)',
        email: 'inspector@roadguard.ai',
        role: 'Inspector',
        department: 'Davanagere City Corporation (DCC)'
      },
      Citizen: {
        id: 'usr-cit-01',
        name: 'Ananya Sharma',
        email: 'citizen@gmail.com',
        role: 'Citizen',
        department: 'Resident'
      }
    };

    if (roleProfiles[role]) {
      setUser(roleProfiles[role]);
      setToken(`demo-token-${role.toLowerCase().replace(' ', '-')}`);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      role: user?.role || 'Citizen',
      login,
      register,
      logout,
      switchRole,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
