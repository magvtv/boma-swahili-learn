import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface DisclosureProps {
  label: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

/** Keeps secondary controls out of sight until they are wanted. */
export function Disclosure({ label, children, defaultOpen }: DisclosureProps) {
  return (
    <details open={defaultOpen} className="group">
      <summary className="mx-auto flex w-fit cursor-pointer list-none items-center gap-2 rounded-xl px-3 py-2 text-center text-sm text-charcoal-muted hover:text-charcoal [&::-webkit-details-marker]:hidden">
        <span>{label}</span>
        <ChevronDown
          className="size-4 shrink-0 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="pt-6">{children}</div>
    </details>
  );
}
