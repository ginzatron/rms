import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { Faculty } from '../types/api';

const STORAGE_KEY = 'rms_current_faculty';

interface FacultyContextValue {
  faculty: Faculty | null;
  setFaculty: (faculty: Faculty | null) => void;
  isLoading: boolean;
}

const FacultyContext = createContext<FacultyContextValue | null>(null);

interface FacultyProviderProps {
  children: ReactNode;
}

export function FacultyProvider({ children }: FacultyProviderProps) {
  const [faculty, setFacultyState] = useState<Faculty | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Faculty;
        setFacultyState(parsed);
      }
    } catch (error) {
      console.error('Failed to load faculty from localStorage:', error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist to localStorage when faculty changes
  const setFaculty = (newFaculty: Faculty | null) => {
    setFacultyState(newFaculty);

    if (newFaculty) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newFaculty));
      } catch (error) {
        console.error('Failed to save faculty to localStorage:', error);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <FacultyContext.Provider value={{ faculty, setFaculty, isLoading }}>
      {children}
    </FacultyContext.Provider>
  );
}

export function useFaculty(): FacultyContextValue {
  const context = useContext(FacultyContext);

  if (!context) {
    throw new Error('useFaculty must be used within a FacultyProvider');
  }

  return context;
}
