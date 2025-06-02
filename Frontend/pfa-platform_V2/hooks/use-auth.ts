// hooks/use-auth.ts
import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name?: string;
  email?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: () => {},
});

// Provider component that wraps your app and makes auth object available to any child component that calls useAuth().
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if there's a stored user session when the component mounts
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // First check if we have a user in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } else {
          // Try to fetch the current user from the server
          // You may want to replace this with your actual authentication endpoint
          const res = await axios.get('http://localhost:8082/api/auth/me', {
            withCredentials: true  // Important for cookie-based auth
          });
          
          if (res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Not setting an error here, as it's a background check
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

}