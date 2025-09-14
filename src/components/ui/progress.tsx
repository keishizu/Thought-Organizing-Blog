'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';
import { useComponentCSSRule } from '@/lib/css-rule-manager';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const progressId = React.useId();
  const progressValue = value || 0;
  const translateX = 100 - progressValue;

  // 動的CSSルールを生成
  const css = `
    [data-progress-id="${progressId}"] .progress-indicator {
      transform: translateX(-${translateX}%);
    }
  `;

  // CSSルール管理システムを使用
  useComponentCSSRule(`progress-${progressId}`, css);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      data-progress-id={progressId}
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="progress-indicator h-full w-full flex-1 bg-primary transition-all"
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
