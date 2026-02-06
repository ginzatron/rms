interface EntrustmentPickerProps {
  value: number | null
  onChange: (level: number) => void
}

const ENTRUSTMENT_LEVELS = [
  { level: 1, description: 'Observe only' },
  { level: 2, description: 'Direct supervision required' },
  { level: 3, description: 'Indirect supervision (available nearby)' },
  { level: 4, description: 'Supervision available on request' },
  { level: 5, description: 'Independent / can supervise others' },
] as const

export function EntrustmentPicker({ value, onChange }: EntrustmentPickerProps) {
  const selectedLevel = ENTRUSTMENT_LEVELS.find((l) => l.level === value)

  return (
    <div className="space-y-3">
      {/* Level buttons */}
      <div className="flex gap-2">
        {ENTRUSTMENT_LEVELS.map(({ level }) => {
          const isSelected = value === level
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={`
                flex-1 min-h-[56px]
                text-xl font-semibold
                rounded-lg
                border-2 transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                active:scale-95
                ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                }
              `}
              aria-pressed={isSelected}
              aria-label={`Entrustment level ${level}`}
            >
              {level}
            </button>
          )
        })}
      </div>

      {/* Description of selected level */}
      <div
        className={`
          min-h-[48px] px-4 py-3
          bg-gray-50 rounded-lg
          text-center text-sm text-gray-600
          transition-opacity duration-200
          ${value ? 'opacity-100' : 'opacity-50'}
        `}
        aria-live="polite"
      >
        {selectedLevel ? (
          <span>
            <span className="font-medium text-gray-900">Level {selectedLevel.level}:</span>{' '}
            {selectedLevel.description}
          </span>
        ) : (
          <span className="italic">Select an entrustment level</span>
        )}
      </div>
    </div>
  )
}
