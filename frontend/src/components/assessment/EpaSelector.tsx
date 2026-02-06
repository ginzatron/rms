import { useState, useMemo } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { useEpas } from '../../hooks/useEpas';
import type { EpaDefinition } from '../../types/api';

interface EpaSelectorProps {
  value: EpaDefinition | null;
  onChange: (epa: EpaDefinition) => void;
}

// Category configuration with display names
const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'intraoperative', label: 'Intraoperative' },
  { key: 'preoperative', label: 'Preoperative' },
  { key: 'postoperative', label: 'Postoperative' },
  { key: 'longitudinal', label: 'Longitudinal' },
  { key: 'professional', label: 'Professional' },
] as const;

type CategoryKey = typeof CATEGORIES[number]['key'];

export function EpaSelector({ value, onChange }: EpaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const { data: epas, loading, error } = useEpas();

  // Group EPAs by category
  const groupedEpas = useMemo((): Record<CategoryKey, EpaDefinition[]> => {
    const groups: Record<CategoryKey, EpaDefinition[]> = {
      all: [],
      preoperative: [],
      intraoperative: [],
      postoperative: [],
      longitudinal: [],
      professional: [],
    };

    if (!epas) return groups;

    epas.forEach((epa) => {
      groups.all.push(epa);
      if (groups[epa.category]) {
        groups[epa.category].push(epa);
      }
    });

    // Sort each category by display_order
    Object.keys(groups).forEach((key) => {
      groups[key as CategoryKey].sort((a, b) => a.display_order - b.display_order);
    });

    return groups;
  }, [epas]);

  const handleSelect = (epa: EpaDefinition) => {
    onChange(epa);
    setIsOpen(false);
  };

  const displayText = value
    ? `EPA ${value.epa_number}: ${value.short_name}`
    : 'Select EPA';

  const currentEpas = groupedEpas[activeCategory] || [];

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
        onClose={() => setIsOpen(false)}
        title="Select EPA"
      >
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 -mx-4 px-4 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => setActiveCategory(category.key)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
                transition-colors whitespace-nowrap
                ${
                  activeCategory === category.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                }
              `}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Content - fixed height container for consistent drawer size */}
        <div className="h-[400px] overflow-y-auto">
          {loading && (
            <div className="py-8 text-center text-gray-500">
              Loading EPAs...
            </div>
          )}

          {error && (
            <div className="py-8 text-center text-gray-500">
              Failed to load EPAs
            </div>
          )}

          {!loading && !error && currentEpas.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              No EPAs in this category
            </div>
          )}

          {!loading && !error && currentEpas.length > 0 && (
            <div className="space-y-2">
              {currentEpas.map((epa) => (
              <button
                key={epa.id}
                type="button"
                onClick={() => handleSelect(epa)}
                className={`
                  w-full min-h-[56px] px-4 py-3 text-left rounded-lg
                  flex items-center justify-between
                  active:bg-gray-100 transition-colors
                  ${value?.id === epa.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}
                `}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">
                    EPA {epa.epa_number}: {epa.short_name}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {epa.title}
                  </div>
                </div>
                {value?.id === epa.id && (
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0 ml-3"
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
          )}
        </div>
      </BottomSheet>
    </>
  );
}
