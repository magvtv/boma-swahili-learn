import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export function Input({
  label,
  helperText,
  error,
  leftIcon,
  rightSlot,
  id,
  className,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  const describedBy = error ? errorId : helperText ? helperId : undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-charcoal"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span
            className="pointer-events-none absolute left-3 text-charcoal-muted"
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-10 w-full rounded-xl border bg-surface px-3.5 text-sm text-charcoal placeholder:text-charcoal-muted/70 transition-colors duration-150',
            'focus:border-savanna-green focus:outline-none',
            error
              ? 'border-terracotta focus:border-terracotta'
              : 'border-warm-border hover:border-charcoal-muted/40',
            Boolean(leftIcon) && 'pl-9',
            Boolean(rightSlot) && 'pr-9',
            className,
          )}
          {...props}
        />
        {rightSlot && (
          <div className="absolute right-2.5 flex items-center">{rightSlot}</div>
        )}
      </div>
      {error ? (
        <p id={errorId} className="text-xs font-medium text-terracotta">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-charcoal-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
