"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "@/lib/utils"

function Tooltip({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <TooltipPrimitive.Root data-slot="tooltip" {...props}>
      {children}
    </TooltipPrimitive.Root>
  )
}

function TooltipTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      className={cn("cursor-default", className)}
      {...props}
    >
      {children}
    </TooltipPrimitive.Trigger>
  )
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
  align?: "center" | "start" | "end"
  alignOffset?: number
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "rounded-md bg-slate-900 px-3 py-1.5 text-xs text-slate-100 shadow-md",
            "origin-(--transform-origin) duration-100",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

function TooltipProviderComponent({
  className,
  delay = 600,
  closeDelay = 0,
  children,
}: {
  className?: string
  delay?: number
  closeDelay?: number
  children?: React.ReactNode
}) {
  return (
    <TooltipPrimitive.Provider delay={delay} closeDelay={closeDelay}>
      <div data-slot="tooltip-provider" className={cn("flex", className)}>
        {children}
      </div>
    </TooltipPrimitive.Provider>
  )
}

export {
  Tooltip,
  TooltipContent,
  TooltipProviderComponent as TooltipProvider,
  TooltipTrigger,
}
