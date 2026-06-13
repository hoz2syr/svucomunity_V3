"use client";

import * as React from "react";
import {
	Drawer as DrawerPrimitive,
	DrawerTrigger,
	DrawerPortal,
	DrawerClose,
	DrawerOverlay,
	DrawerContent,
	DrawerTitle,
	DrawerDescription,
} from "vaul";

import { cn } from "./utils";

const Drawer = React.forwardRef<
	React.ComponentRef<typeof DrawerPrimitive.Root>,
	React.ComponentProps<typeof DrawerPrimitive.Root>
>((props, ref) => {
	return <DrawerPrimitive.Root data-slot="drawer" ref={ref} {...props} />;
});
Drawer.displayName = "Drawer";

const DrawerTriggerRef = React.forwardRef<
	React.ComponentRef<typeof DrawerTrigger>,
	React.ComponentProps<typeof DrawerTrigger>
>((props, ref) => {
	return (
		<DrawerTrigger data-slot="drawer-trigger" ref={ref} {...props} />
	);
});
DrawerTriggerRef.displayName = "DrawerTrigger";

const DrawerPortalRef = React.forwardRef<
	React.ComponentRef<typeof DrawerPortal>,
	React.ComponentProps<typeof DrawerPortal>
>((props, ref) => {
	return (
		<DrawerPortal data-slot="drawer-portal" ref={ref} {...props} />
	);
});
DrawerPortalRef.displayName = "DrawerPortal";

const DrawerCloseRef = React.forwardRef<
	React.ComponentRef<typeof DrawerClose>,
	React.ComponentProps<typeof DrawerClose>
>((props, ref) => {
	return (
		<DrawerClose data-slot="drawer-close" ref={ref} {...props} />
	);
});
DrawerCloseRef.displayName = "DrawerClose";

const DrawerOverlayRef = React.forwardRef<
	React.ComponentRef<typeof DrawerOverlay>,
	React.ComponentProps<typeof DrawerOverlay>
>(({ className, ...props }, ref) => {
	return (
		<DrawerOverlay
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
DrawerOverlayRef.displayName = "DrawerOverlay";

const DrawerContentRef = React.forwardRef<
	React.ComponentRef<typeof DrawerContent>,
	React.ComponentProps<typeof DrawerContent>
>(({ className, children, ...props }, ref) => {
	return (
		<DrawerPortal>
			<DrawerOverlay />
			<DrawerContent
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
			</DrawerContent>
		</DrawerPortal>
	);
});
DrawerContentRef.displayName = "DrawerContent";

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

const DrawerTitleRef = React.forwardRef<
	React.ComponentRef<typeof DrawerTitle>,
	React.ComponentProps<typeof DrawerTitle>
>(({ className, ...props }, ref) => {
	return (
		<DrawerTitle
			data-slot="drawer-title"
			className={cn("text-foreground font-semibold", className)}
			ref={ref}
			{...props}
		/>
	);
});
DrawerTitleRef.displayName = "DrawerTitle";

const DrawerDescriptionRef = React.forwardRef<
	React.ComponentRef<typeof DrawerDescription>,
	React.ComponentProps<typeof DrawerDescription>
>(({ className, ...props }, ref) => {
	return (
		<DrawerDescription
			data-slot="drawer-description"
			className={cn("text-muted-foreground text-sm", className)}
			ref={ref}
			{...props}
		/>
	);
});
DrawerDescriptionRef.displayName = "DrawerDescription";

export {
	Drawer,
	DrawerPortalRef as DrawerPortal,
	DrawerOverlayRef as DrawerOverlay,
	DrawerTriggerRef as DrawerTrigger,
	DrawerCloseRef as DrawerClose,
	DrawerContentRef as DrawerContent,
	DrawerHeader,
	DrawerFooter,
	DrawerTitleRef as DrawerTitle,
	DrawerDescriptionRef as DrawerDescription,
};
