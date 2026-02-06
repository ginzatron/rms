import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Show loading spinner and disable interactions */
  loading?: boolean;
  /** Stretch to full container width */
  fullWidth?: boolean;
  /** Override or extend class names */
  className?: string;
  /** Button content */
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, { base: string; disabled: string }> = {
  primary: {
    base: 'bg-blue-600 text-white active:bg-blue-700 hover:bg-blue-700 focus:ring-blue-500',
    disabled: 'bg-gray-200 text-gray-500 cursor-not-allowed',
  },
  secondary: {
    base: 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200 focus:ring-blue-500',
    disabled: 'bg-gray-100 text-gray-400 cursor-not-allowed',
  },
  ghost: {
    base: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-500',
    disabled: 'bg-transparent text-gray-300 cursor-not-allowed',
  },
  danger: {
    base: 'bg-red-600 text-white active:bg-red-700 hover:bg-red-700 focus:ring-red-500',
    disabled: 'bg-gray-200 text-gray-500 cursor-not-allowed',
  },
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'py-1.5 px-3 text-xs rounded-lg',
  md: 'py-2 px-4 text-sm rounded-lg',
  lg: 'py-4 px-6 text-base rounded-lg',
};

/**
 * Consistent button with variant, size, loading, and full-width support.
 *
 * @example
 * <Button variant="primary" size="lg" fullWidth>Submit</Button>
 * <Button variant="secondary" loading>Saving...</Button>
 * <Button variant="ghost" size="sm">Cancel</Button>
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const variantStyle = isDisabled
    ? VARIANT_CLASSES[variant].disabled
    : VARIANT_CLASSES[variant].base;

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${SIZE_CLASSES[size]}
        ${variantStyle}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.trim()}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
