"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Wrapper to suppress hydration warnings for Select components
export const SelectWrapper = React.forwardRef<
  React.ElementRef<typeof Select>,
  React.ComponentPropsWithoutRef<typeof Select>
>(({ children, ...props }, ref) => {
  return (
    <div suppressHydrationWarning>
      <Select {...props}>{children}</Select>
    </div>
  );
});

SelectWrapper.displayName = "SelectWrapper";

export const SelectTriggerWrapper = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  React.ComponentPropsWithoutRef<typeof SelectTrigger>
>(({ children, ...props }, ref) => {
  return (
    <SelectTrigger ref={ref} {...props} suppressHydrationWarning>
      {children}
    </SelectTrigger>
  );
});

SelectTriggerWrapper.displayName = "SelectTriggerWrapper";

export { SelectContent, SelectItem, SelectValue };
