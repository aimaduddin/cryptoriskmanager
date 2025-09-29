import { forwardRef } from "react";
import type { LabelHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium text-slate-700",
        "dark:text-slate-300",
        className,
      )}
      {...props}
    />
  ),
);

Label.displayName = "Label";
