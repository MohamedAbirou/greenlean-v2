/**
 * Skeleton Component
 * Generic loading skeleton using design system variants
 */
import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { cn, skeletonVariants } from "@/shared/design-system"

function Skeleton({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof skeletonVariants>) {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Skeleton }
