import { useApi } from './useApi';
import type { User } from '../types/api';

/**
 * Hook to fetch all active users in the system.
 *
 * Used by the user selector dropdown in MobileHeader to allow
 * switching between faculty (assessment form) and resident (dashboard) views.
 *
 * @returns { data: User[], loading, error, refetch }
 *
 * @example
 * const { data: users, loading } = useUsers()
 *
 * // Filter by role
 * const residents = users?.filter(u => u.role === 'resident') ?? []
 * const faculty = users?.filter(u => ['faculty', 'program_director'].includes(u.role)) ?? []
 */
export function useUsers() {
  return useApi<User[]>('/api/users');
}
