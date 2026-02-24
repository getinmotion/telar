import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-card hover:shadow-hover",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-lg",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg shadow-card",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-lg",
        link: "text-primary underline-offset-4 hover:underline",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 rounded-lg",
        success: "bg-success text-success-foreground hover:bg-success/90 rounded-lg",
        premium: "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-elegant hover:shadow-hover rounded-lg",
        // Artisan variants
        artisan: "bg-gradient-primary text-white hover:shadow-hover transition-all hover:scale-105 rounded-full",
        earth: "bg-wood-brown text-white hover:bg-wood-brown/90 shadow-card hover:shadow-hover rounded-lg",
        clay: "bg-terracotta text-white hover:bg-terracotta/90 shadow-card hover:shadow-hover rounded-lg",
        moss: "bg-moss-green text-white hover:bg-moss-green/90 shadow-card hover:shadow-hover rounded-lg",
        golden: "bg-golden-hour text-charcoal hover:bg-golden-hour/90 shadow-card hover:shadow-hover rounded-lg",
        // Legacy variants
        neon: "bg-gradient-primary text-white hover:shadow-hover hover:scale-105 font-semibold rounded-full",
        'dark-elevated': "bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant hover:shadow-hover hover:scale-[1.02] rounded-xl",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
        pill: "h-10 px-6 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }