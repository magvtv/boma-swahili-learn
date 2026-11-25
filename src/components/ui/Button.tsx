import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

type ButtonVariant =
  | 'primary'
  | 'terracotta'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'inverse';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-savanna-green text-cream hover:bg-savanna-green-hover shadow-xs',
  terracotta:
    'bg-terracotta text-cream hover:bg-terracotta-hover shadow-xs',
  secondary:
    'bg-cream-dark text-charcoal border border-warm-border hover:bg-warm-border/70',
  outline:
    'border border-warm-border bg-surface text-charcoal hover:bg-cream-dark',
  ghost:
    'bg-transparent text-charcoal-muted hover:bg-cream-dark hover:text-charcoal',
  // Quiet action on dark green surfaces
  inverse: 'bg-transparent text-cream hover:bg-cream/10',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-xs gap-2 rounded-xl',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-2xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'boma-btn inline-flex items-center justify-center font-medium disabled:pointer-events-none disabled:opacity-50',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      )}
      {...props}
    >
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </button>
  );
}
