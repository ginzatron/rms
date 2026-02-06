import { useState, useMemo } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { useResidents } from '../../hooks/useResidents';
import type { Resident } from '../../types/api';

interface ResidentSelectorProps {
  value: Resident | null;
  onChange: (resident: Resident) => void;
}

// PGY levels in descending order for grouping
const PGY_LEVELS = ['PGY-8', 'PGY-7', 'PGY-6', 'PGY-5', 'PGY-4', 'PGY-3', 'PGY-2', 'PGY-1'] as const;

export function ResidentSelector({ value, onChange }: ResidentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: residents, loading, error } = useResidents();

  // Filter and group residents
  const groupedResidents = useMemo(() => {
    if (!residents) return {};

    const filtered = residents.filter((resident) => {
      const query = searchQuery.toLowerCase();
      return (
        resident.first_name.toLowerCase().includes(query) ||
        resident.last_name.toLowerCase().includes(query)
      );
    });

    // Group by PGY level
    const groups: Record<string, Resident[]> = {};
    PGY_LEVELS.forEach((level) => {
      const levelResidents = filtered.filter((r) => r.pgy_level === level);
      if (levelResidents.length > 0) {
        groups[level] = levelResidents.sort((a, b) =>
          a.last_name.localeCompare(b.last_name)
        );
      }
    });

    return groups;
  }, [residents, searchQuery]);

  const handleSelect = (resident: Resident) => {
    onChange(resident);
    setIsOpen(false);
    setSearchQuery('');
  };

  const displayText = value
    ? `${value.first_name} ${value.last_name} (${value.pgy_level})`
    : 'Select Resident';

  return (
    <>
      {/* Tappable field */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full min-h-[56px] px-4 py-3 text-left bg-white border border-gray-300 rounded-lg flex items-center justify-between active:bg-gray-50 transition-colors"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {displayText}
        </span>
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Selection bottom sheet */}
      <BottomSheet
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSearchQuery('');
        }}
        title="Select Resident"
      >
        {/* Search input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Content */}
        {loading && (
          <div className="py-8 text-center text-gray-500">
            Loading residents...
          </div>
        )}

        {error && (
          <div className="py-8 text-center text-red-500">
            Failed to load residents
          </div>
        )}

        {!loading && !error && Object.keys(groupedResidents).length === 0 && (
          <div className="py-8 text-center text-gray-500">
            {searchQuery ? 'No residents match your search' : 'No residents available'}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {Object.entries(groupedResidents).map(([level, levelResidents]) => (
              <div key={level}>
                {/* Group header */}
                <div className="px-2 py-1 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  {level}
                </div>

                {/* Resident list */}
                <div className="space-y-1">
                  {levelResidents.map((resident) => (
                    <button
                      key={resident.id}
                      type="button"
                      onClick={() => handleSelect(resident)}
                      className={`
                        w-full min-h-[56px] px-4 py-3 text-left rounded-lg
                        flex items-center justify-between
                        active:bg-gray-100 transition-colors
                        ${value?.id === resident.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}
                      `}
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {resident.first_name} {resident.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {resident.medical_school}
                        </div>
                      </div>
                      {value?.id === resident.id && (
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </BottomSheet>
    </>
  );
}
