"use client";

import { AspectRatio as AspectRatioPrimitive } from "@radix-ui/react-aspect-ratio";
import * as React from "react";

const AspectRatio = React.forwardRef<
  React.ComponentRef<typeof AspectRatioPrimitive>,
  React.ComponentProps<typeof AspectRatioPrimitive>
>((props, ref) => {
  return <AspectRatioPrimitive data-slot="aspect-ratio" ref={ref} {...props} />;
});
AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
