import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { SelectedUser } from '../types/api';

const STORAGE_KEY = 'rms_current_user';

interface UserContextValue {
  /** Currently selected user (resident or faculty) */
  user: SelectedUser | null;
  /** Update the selected user */
  setUser: (user: SelectedUser | null) => void;
  /** Whether the context is still loading from localStorage */
  isLoading: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

/**
 * Provider for managing the currently selected user.
 *
 * Supports both faculty (for assessment form) and residents (for dashboard).
 * Persists selection to localStorage so it survives page refreshes.
 *
 * @example
 * <UserProvider>
 *   <App />
 * </UserProvider>
 */
export function UserProvider({ children }: UserProviderProps) {
  const [user, setUserState] = useState<SelectedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SelectedUser;
        setUserState(parsed);
      }
    } catch (error) {
      console.error('Failed to load user from localStorage:', error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist to localStorage when user changes
  const setUser = (newUser: SelectedUser | null) => {
    setUserState(newUser);

    if (newUser) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      } catch (error) {
        console.error('Failed to save user to localStorage:', error);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook to access the current user context.
 *
 * @returns The current user, setUser function, and loading state
 * @throws Error if used outside of UserProvider
 *
 * @example
 * function MyComponent() {
 *   const { user, setUser } = useUser();
 *
 *   if (user?.role === 'resident') {
 *     return <ResidentDashboard residentId={user.residentId} />;
 *   }
 *
 *   return <AssessmentForm facultyId={user.facultyId} />;
 * }
 */
export function useUser(): UserContextValue {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}

/**
 * Helper to check if current user is a resident
 */
export function isResident(user: SelectedUser | null): boolean {
  return user?.role === 'resident' && !!user.residentId;
}

/**
 * Helper to check if current user is faculty (faculty or PD)
 */
export function isFaculty(user: SelectedUser | null): boolean {
  return (
    (user?.role === 'faculty' || user?.role === 'program_director') &&
    !!user.facultyId
  );
}
