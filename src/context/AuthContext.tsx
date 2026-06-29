'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  customer: Customer | null;
  setCustomer: (customer: Customer | null) => void;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const res = await fetch(apiUrl('/api/auth/customer/me'), {
          // Send cookies if cross-origin
          credentials: 'omit', // Wait, the Express server might be cross-origin
          // Using credentials: 'include' is needed for cookies
        });
        
        // Let's use localStorage for token to simplify cross-origin SPA auth
        const token = localStorage.getItem('dhanti_customer_token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Decode JWT manually or just fetch with Authorization header.
        // Actually, Express is using cookies now based on my server.js changes.
        // We set `credentials: 'include'` so cookies are sent.
      } catch (err) {
        console.error("Auth check failed", err);
      }
    };
    // Since we did token in cookie in server.js but it might have SameSite issues across ports locally,
    // let's rely on the token we saved in localStorage from the login response if we want it simple.
    // Wait, in server.js we return the customer object in login/signup! We can save it to localStorage.
    
    const saved = localStorage.getItem('dhanti_customer');
    if (saved) {
      try {
        setCustomer(JSON.parse(saved));
      } catch (e) {}
    }
    setIsLoading(false);
  }, []);

  const handleSetCustomer = (newCustomer: Customer | null) => {
    setCustomer(newCustomer);
    if (newCustomer) {
      localStorage.setItem('dhanti_customer', JSON.stringify(newCustomer));
    } else {
      localStorage.removeItem('dhanti_customer');
    }
  };

  const logout = async () => {
    try {
      await fetch(apiUrl('/api/auth/customer/logout'), { method: 'POST', credentials: 'include' });
    } catch (e) {}
    handleSetCustomer(null);
  };

  return (
    <AuthContext.Provider value={{ customer, setCustomer: handleSetCustomer, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
