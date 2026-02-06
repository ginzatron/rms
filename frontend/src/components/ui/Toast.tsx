import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  isVisible: boolean
  onClose: () => void
}

export function Toast({ message, type, isVisible, onClose }: ToastProps) {
  // Auto-dismiss success toasts after 3 seconds
  useEffect(() => {
    if (isVisible && type === 'success') {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, type, onClose])

  const baseClasses = `
    fixed bottom-6 left-4 right-4 z-50
    mx-auto max-w-sm
    px-4 py-3 rounded-lg shadow-lg
    flex items-center justify-between gap-3
    transition-all duration-300 ease-out
  `

  const typeClasses = type === 'success'
    ? 'bg-green-600 text-white'
    : 'bg-red-600 text-white'

  const visibilityClasses = isVisible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-4 pointer-events-none'

  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`${baseClasses} ${typeClasses} ${visibilityClasses}`}
    >
      {/* Icon */}
      <div className="flex items-center gap-2">
        {type === 'success' ? (
          <svg
            className="h-5 w-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        <span className="text-sm font-medium">{message}</span>
      </div>

      {/* Close button (always shown for errors, hidden for success) */}
      {type === 'error' && (
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 rounded p-1 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close notification"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
