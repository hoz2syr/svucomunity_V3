"use client";

import * as React from "react";
import { GripVerticalIcon } from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { cn } from "./utils";

const ResizablePanelGroup = React.forwardRef<
  React.ComponentRef<typeof PanelGroup>,
  React.ComponentProps<typeof PanelGroup>
>(({ className, ...props }, ref) => {
  return (
    <PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
ResizablePanelGroup.displayName = "ResizablePanelGroup";

const ResizablePanel = React.forwardRef<
  React.ComponentRef<typeof Panel>,
  React.ComponentProps<typeof Panel>
>((props, ref) => {
  return (
    <Panel data-slot="resizable-panel" ref={ref} {...props} />
  );
});
ResizablePanel.displayName = "ResizablePanel";

const ResizableHandle = React.forwardRef<
  React.ComponentRef<typeof PanelResizeHandle>,
  React.ComponentProps<typeof PanelResizeHandle>
>(({ className, ...props }, ref) => {
  return (
    <PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
