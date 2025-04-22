
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  location?: {
    lat: number;
    lng: number;
  };
  isDonor: boolean;
  bloodType?: string;
  organDonor?: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUserLocation: (lat: number, lng: number) => void;
  updateUserProfile: (userData: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Mock login function - to be replaced with backend API call
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock API call
      // In reality, this would be a fetch request to your Node.js backend
      // that would verify the credentials against the MySQL database
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock admin user
      if (email === 'admin@example.com' && password === 'password') {
        const adminUser: User = {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          isDonor: false
        };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        navigate('/admin/dashboard');
        return;
      }
      
      // Mock regular user
      if (email === 'user@example.com' && password === 'password') {
        const regularUser: User = {
          id: '2',
          name: 'Regular User',
          email: 'user@example.com',
          role: 'user',
          isDonor: false
        };
        setUser(regularUser);
        localStorage.setItem('user', JSON.stringify(regularUser));
        navigate('/dashboard');
        return;
      }
      
      throw new Error('Invalid credentials');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mock register function - to be replaced with backend API call
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      // Mock API call
      // In reality, this would be a fetch request to your Node.js backend
      // that would create a new user in the MySQL database
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 15),
        name,
        email,
        role: 'user',
        isDonor: false
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  const setUserLocation = (lat: number, lng: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        location: { lat, lng }
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const updateUserProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...userData
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout,
      setUserLocation,
      updateUserProfile
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
