"use client";

import * as React from "react";
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

const AspectRatio = React.forwardRef<
  React.ComponentRef<typeof AspectRatioPrimitive.Root>,
  React.ComponentProps<typeof AspectRatioPrimitive.Root>
>((props, ref) => {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" ref={ref} {...props} />;
});
AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
