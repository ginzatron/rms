export type DashboardTab = 'progress' | 'to-review';

interface TabBarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  toReviewCount: number;
}

/**
 * Tab bar for switching between Progress and To Review views.
 *
 * Shows a badge count on the "To Review" tab when there are
 * unacknowledged assessments.
 */
export function TabBar({ activeTab, onTabChange, toReviewCount }: TabBarProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex px-4" aria-label="Dashboard tabs">
        <button
          type="button"
          onClick={() => onTabChange('progress')}
          className={`
            relative px-4 py-3 text-sm font-medium
            border-b-2 transition-colors
            ${
              activeTab === 'progress'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }
          `}
          aria-current={activeTab === 'progress' ? 'page' : undefined}
        >
          Progress
        </button>

        <button
          type="button"
          onClick={() => onTabChange('to-review')}
          className={`
            relative px-4 py-3 text-sm font-medium
            border-b-2 transition-colors flex items-center gap-2
            ${
              activeTab === 'to-review'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }
          `}
          aria-current={activeTab === 'to-review' ? 'page' : undefined}
        >
          To Review
          {toReviewCount > 0 && (
            <span
              className={`
                inline-flex items-center justify-center
                min-w-5 h-5 px-1.5 rounded-full text-xs font-medium
                ${
                  activeTab === 'to-review'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-200 text-gray-600'
                }
              `}
            >
              {toReviewCount}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
}
