import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-300 bg-white",
          "px-3 py-2 text-sm ring-offset-background",
          "placeholder:text-slate-400 focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100",
          "dark:placeholder:text-slate-500 dark:focus-visible:ring-emerald-400",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
