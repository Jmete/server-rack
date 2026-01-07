'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const MobileSheetOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
      className
    )}
    {...props}
  />
));
MobileSheetOverlay.displayName = 'MobileSheetOverlay';

const MobileSheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    title?: string;
  }
>(({ className, children, title, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <MobileSheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 flex flex-col',
        'max-h-[85vh] rounded-t-2xl border-t border-border bg-card',
        'data-[state=open]:animate-slide-up data-[state=closed]:animate-slide-down',
        'focus:outline-none',
        className
      )}
      {...props}
    >
      {/* Drag handle */}
      <div className="flex justify-center py-3">
        <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
      </div>

      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
          <DialogPrimitive.Title className="text-base font-semibold">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close className="rounded-full p-2 hover:bg-muted transition-colors touch-target">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain pb-safe">
        {children}
      </div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
MobileSheetContent.displayName = 'MobileSheetContent';

export function MobileSheet({
  open,
  onOpenChange,
  children,
  title,
  className,
}: MobileSheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <MobileSheetContent title={title} className={className}>
        {children}
      </MobileSheetContent>
    </DialogPrimitive.Root>
  );
}
