"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type * as React from "react";
import { cn } from "@/lib/utils";

type ItemProps = React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
};

export function DropdownMenuItem({ className, inset, variant = "default", ...props }: ItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground",
        "data-[variant=destructive]:text-destructive",
        "data-[variant=destructive]:focus:bg-destructive/10",
        "dark:data-[variant=destructive]:focus:bg-destructive/20",
        "relative flex cursor-default items-center gap-2 rounded-sm",
        "px-2 py-1.5 text-sm outline-hidden select-none",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}
