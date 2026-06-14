"use client";

import * as React from "react";
import { useTheme } from "../../hooks/useTheme";
import { Toaster as Sonner } from "sonner";

const Toaster = React.forwardRef<
  React.ComponentRef<typeof Sonner>,
  React.ComponentProps<typeof Sonner>
>((props, ref) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      ref={ref}
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
});
Toaster.displayName = "Toaster";

export { Toaster };
