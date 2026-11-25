import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  closeOnBackdropClick?: boolean;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeOnBackdropClick = true,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      dialog.returnValue = '';
      onClose();
    };

    dialog.addEventListener('close', handleClose);

    // Fallback for browsers without native `closedby="any"` support
    let pressedOutside = false;
    const isOutside = (event: PointerEvent) => {
      const rect = dialog.getBoundingClientRect();
      return (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      );
    };

    const supportsClosedBy = 'closedBy' in HTMLDialogElement.prototype;
    const handlePointerDown = (event: PointerEvent) => {
      pressedOutside = isOutside(event);
    };
    const handlePointerUp = (event: PointerEvent) => {
      if (pressedOutside && isOutside(event)) {
        dialog.close();
      }
      pressedOutside = false;
    };

    if (closeOnBackdropClick && !supportsClosedBy) {
      dialog.addEventListener('pointerdown', handlePointerDown);
      dialog.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
      if (closeOnBackdropClick && !supportsClosedBy) {
        dialog.removeEventListener('pointerdown', handlePointerDown);
        dialog.removeEventListener('pointerup', handlePointerUp);
      }
    };
  }, [closeOnBackdropClick, onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      closedby={closeOnBackdropClick ? 'any' : 'closerequest'}
      className={cn(
        'boma-modal m-auto w-[min(32rem,calc(100dvw-2rem))] rounded-2xl border border-warm-border bg-surface p-0 text-charcoal shadow-xl',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-warm-border px-5 py-4">
        <div className="space-y-1">
          <h2 id={titleId} className="text-lg font-bold text-charcoal">
            {title}
          </h2>
          {description && (
            <p id={descId} className="text-sm text-charcoal-muted">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close modal"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-charcoal-muted hover:bg-cream-dark hover:text-charcoal"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="px-5 py-4">{children}</div>

      {footer && (
        <div className="flex items-center justify-end gap-2 border-t border-warm-border bg-cream/60 px-5 py-3.5">
          {footer}
        </div>
      )}
    </dialog>
  );
}
