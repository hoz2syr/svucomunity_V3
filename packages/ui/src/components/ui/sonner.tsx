"use client";

import * as React from "react";
import { Toaster } from "sonner";
import { useTheme } from "../../hooks/useTheme";

type SonnerTheme = "light" | "dark" | "system";

const ToasterComponent = React.forwardRef<
  React.ComponentRef<typeof Toaster>,
  React.ComponentPropsWithoutRef<typeof Toaster>
>((props, ref) => {
  const { theme = "system" } = useTheme();

  return (
    <Toaster
      {...props}
      ref={ref}
      theme={theme as SonnerTheme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
    />
  );
});
ToasterComponent.displayName = "ToasterComponent";

export { ToasterComponent as Toaster };
