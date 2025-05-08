import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import { getUserIdFromToken } from './api';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  username: string | null;
  role: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  handleSignOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userId: null,
  username: null,
  role: null,
  loading: true,
  signIn: async () => false,
  signOut: () => {},
  handleSignOut: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const id = getUserIdFromToken();
      if (id) {
        setUserId(id);
        setIsAuthenticated(true);
        
        // Fetch user details
        const fetchUserDetails = async () => {
          try {
            const response = await axios.get(`http://localhost:5000/users/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            setUsername(response.data.username);
            setRole(response.data.role);
          } catch (error) {
            console.error('Error fetching user details:', error);
            // If error, logout user
            signOut();
          } finally {
            setLoading(false);
          }
        };
        
        fetchUserDetails();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        email,
        password
      });
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      const id = getUserIdFromToken();
      if (id) {
        setUserId(id);
        setIsAuthenticated(true);
        
        // Fetch user details
        const userResponse = await axios.get(`http://localhost:5000/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUsername(userResponse.data.username);
        setRole(userResponse.data.role);
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserId(null);
    setUsername(null);
    setRole(null);
  };

  const handleSignOut = () => {
    signOut();
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userId, 
      username, 
      role, 
      loading, 
      signIn, 
      signOut,
      handleSignOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 