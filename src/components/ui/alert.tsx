/* eslint-disable */
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const alertVariants = cva(
  "relative overflow-hidden rounded-xl border px-4 py-3 text-sm [&>svg~*]:pl-7 [&>svg]:stroke-1.5",
  {
    variants: {
      variant: {
        default: "bg-primary/15 text-primary border-primary/20 [&>svg]:text-primary",
        destructive:
          "bg-destructive/15 text-destructive border-destructive/20 [&>svg]:text-destructive",
        success:
          "bg-success/15 text-success border-success/20 [&>svg]:text-success",
        warning:
          "bg-warning/15 text-warning border-warning/20 [&>svg]:text-warning",
        info:
          "bg-info/15 text-info border-info/20 [&>svg]:text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"div"> &
  VariantProps<typeof alertVariants>) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(alertVariants({ variant }), className),
        "role": "alert",
      },
      props
    ),
    render,
    state: {
      slot: "alert",
      variant,
    },
  })
}

function AlertTitle({
  className,
  ...props
}: useRender.ComponentProps<"h5">) {
  return useRender({
    defaultTagName: "h5",
    props: mergeProps<"h5">(
      {
        className: cn("font-medium text-base", className),
      },
      props
    ),
    state: {
      slot: "alert-title",
    },
  })
}

function AlertDescription({
  className,
  ...props
}: useRender.ComponentProps<"p">) {
  return useRender({
    defaultTagName: "p",
    props: mergeProps<"p">(
      {
        className: cn("text-sm [&_p]:leading-relaxed", className),
      },
      props
    ),
    state: {
      slot: "alert-description",
    },
  })
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
