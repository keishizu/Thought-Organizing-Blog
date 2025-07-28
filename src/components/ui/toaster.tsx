'use client';

import { useToast } from '@/hooks/use-toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="toast-custom">
            <div className="grid gap-1">
              {title && <ToastTitle className="toast-title">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="toast-description">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="toast-close" />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
