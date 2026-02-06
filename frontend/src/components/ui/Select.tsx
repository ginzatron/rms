import type { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  /** Dropdown options */
  options: SelectOption[];
  /** Placeholder text shown as the first disabled option */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Consistently styled select dropdown.
 *
 * Matches the app's form input styling: rounded-lg, gray border,
 * blue focus ring.
 *
 * @example
 * <Select
 *   value={urgency}
 *   onChange={(e) => setUrgency(e.target.value)}
 *   placeholder="Select urgency"
 *   options={[
 *     { value: 'elective', label: 'Elective' },
 *     { value: 'urgent', label: 'Urgent' },
 *     { value: 'emergent', label: 'Emergent' },
 *   ]}
 * />
 */
export function Select({
  options,
  placeholder,
  className = '',
  ...rest
}: SelectProps) {
  return (
    <select
      className={`
        w-full px-4 py-3
        bg-white border border-gray-300 rounded-lg
        text-gray-900
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${className}
      `.trim()}
      {...rest}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
