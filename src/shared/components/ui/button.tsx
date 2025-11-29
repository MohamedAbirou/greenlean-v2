/**
 * Button Component
 * Using design system variants from @/shared/design-system
 */
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn, buttonVariants } from "@/shared/design-system"

function Button({
  className,
  variant,
  size,
  fullWidth,
  loading,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, fullWidth, loading, className }))}
      disabled={loading || props.disabled}
      {...props}
    />
  )
}

export { Button, buttonVariants }

