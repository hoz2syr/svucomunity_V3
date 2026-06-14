"use client";

import * as React from "react";

import { cn } from "./utils";
import { Root, Portal, Overlay, Content } from "vaul";

const DrawerRoot = Root;

const DrawerPortal = React.forwardRef<
  React.ComponentRef<typeof Portal>,
  React.ComponentPropsWithoutRef<typeof Portal>
>((props, ref) => {
  return <Portal data-slot="drawer-portal" {...props} ref={ref} />;
});
DrawerPortal.displayName = "DrawerPortal";

const DrawerComponent = React.forwardRef<
  React.ComponentRef<typeof DrawerRoot>,
  React.ComponentPropsWithoutRef<typeof DrawerRoot>
>((props, ref) => {
  return <DrawerRoot data-slot="drawer" {...props} ref={ref} />;
});
DrawerComponent.displayName = "Drawer";

const DrawerOverlayWrapped = React.forwardRef<
  React.ComponentRef<typeof Overlay>,
  React.ComponentPropsWithoutRef<typeof Overlay>
>(({ className, ...props }, ref) => {
  return (
    <Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 dark:bg-black/70",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
DrawerOverlayWrapped.displayName = "DrawerOverlay";

const DrawerContentWrapped = React.forwardRef<
  React.ComponentRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content>
>(({ className, children, ...props }, ref) => {
  return (
    <DrawerPortal>
      <DrawerOverlayWrapped />
      <Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className,
        )}
        ref={ref}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </Content>
    </DrawerPortal>
  );
});
DrawerContentWrapped.displayName = "DrawerContent";

const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      ref={ref}
      {...props}
    />
  );
});
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      ref={ref}
      {...props}
    />
  );
});
DrawerFooter.displayName = "DrawerFooter";

export {
  DrawerComponent as Drawer,
  DrawerPortal,
  DrawerOverlayWrapped as DrawerOverlay,
  DrawerContentWrapped as DrawerContent,
  DrawerHeader,
  DrawerFooter,
};