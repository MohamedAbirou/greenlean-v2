/**
 * Button Component
 * Using design system variants from @/shared/design-system
 */
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps } from "class-variance-authority"
import * as React from "react"

import { buttonVariants, cn } from "@/shared/design-system"

function Button({
  className,
  variant,
  size,
  fullWidth,
  loading,
  asChild = false,
  disabled,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"
  const isDisabled = loading || disabled

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, fullWidth, loading, className })
      )}
      {...props}
      {...(isDisabled ? { disabled: true } : {})}
    />
  )
}


export { Button, buttonVariants }

