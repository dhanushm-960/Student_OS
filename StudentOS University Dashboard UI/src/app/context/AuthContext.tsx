import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  setupCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: any; // Keep generic to support potential fields, but type profile specifically
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ token: string; user: UserProfile }>;
  signUp: (email: string, password: string, name: string) => Promise<{ token: string; user: UserProfile }>;
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Initialize and check for existing session
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const token = localStorage.getItem('studentos_token');
      if (!token) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok && data.success && data.user) {
          if (mounted) {
            // Map mongoose ID or general ID to id
            const mappedUser: UserProfile = {
              id: data.user.id || data.user._id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              setupCompleted: data.user.setupCompleted,
              createdAt: data.user.createdAt,
              updatedAt: data.user.updatedAt
            };
            setProfile(mappedUser);
          }
        } else {
          // Token expired or invalid
          console.warn('Session check failed:', data.message || 'Invalid token');
          localStorage.removeItem('studentos_token');
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid credentials or login failed.');
      }

      const mappedUser: UserProfile = {
        id: data.user.id || data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        setupCompleted: data.user.setupCompleted,
        createdAt: data.user.createdAt,
        updatedAt: data.user.updatedAt
      };

      localStorage.setItem('studentos_token', data.token);
      setProfile(mappedUser);
      return { token: data.token, user: mappedUser };
    } catch (err: any) {
      const errMsg = err.message || 'An error occurred during sign in.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
      }

      const mappedUser: UserProfile = {
        id: data.user.id || data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        setupCompleted: data.user.setupCompleted,
        createdAt: data.user.createdAt,
        updatedAt: data.user.updatedAt
      };

      localStorage.setItem('studentos_token', data.token);
      setProfile(mappedUser);
      return { token: data.token, user: mappedUser };
    } catch (err: any) {
      const errMsg = err.message || 'An error occurred during sign up.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('studentos_token');
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok && data.success && data.user) {
        const mappedUser: UserProfile = {
          id: data.user.id || data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          setupCompleted: data.user.setupCompleted,
          createdAt: data.user.createdAt,
          updatedAt: data.user.updatedAt
        };
        setProfile(mappedUser);
      }
    } catch (err) {
      console.error('refreshUser error:', err);
    }
  };

  const signOut = async () => {
    setError(null);
    localStorage.removeItem('studentos_token');
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user: profile, profile, loading, error, signIn, signUp, signOut, clearError, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
