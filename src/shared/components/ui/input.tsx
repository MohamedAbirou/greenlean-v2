/**
 * Input Component
 * Using design system variants from @/shared/design-system
 */
import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { cn, inputVariants } from "@/shared/design-system"

function Input({
  className,
  type,
  variant,
  inputSize,
  disabled,
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      disabled={disabled}
      className={cn(
        inputVariants({ variant, inputSize, disabled, className }),
        "focus-visible:outline-none disabled:pointer-events-none"
      )}
      {...props}
    />
  )
}

export { Input }

