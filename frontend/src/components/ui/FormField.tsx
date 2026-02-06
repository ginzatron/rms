import type { ReactNode } from 'react';

interface FormFieldProps {
  /** Field label text */
  label: string;
  /** Mark the field as required (adds red asterisk) */
  required?: boolean;
  /** Optional hint text shown after the label in parentheses */
  hint?: string;
  /** Help text displayed below the input */
  helpText?: string;
  /** HTML for attribute to associate label with input */
  htmlFor?: string;
  /** The input/control element */
  children: ReactNode;
}

/**
 * Consistent form field wrapper with label, required indicator, and help text.
 *
 * @example
 * <FormField label="Resident" required>
 *   <ResidentSelector value={resident} onChange={setResident} />
 * </FormField>
 *
 * <FormField label="Feedback" hint="optional" helpText="Tap the microphone to dictate">
 *   <textarea ... />
 * </FormField>
 */
export function FormField({
  label,
  required = false,
  hint,
  helpText,
  htmlFor,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
        {hint && <span className="text-gray-400"> ({hint})</span>}
      </label>
      {children}
      {helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
}
