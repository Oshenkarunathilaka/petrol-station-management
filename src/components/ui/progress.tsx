/* eslint-disable */
import * as React from "react";
import { cn } from "cn";

function Progress({
  className,
  value = 0,
  ...props
}: React.ComponentProps<"div"> & {
  value?: number;
}) {
  return (
    <div
      data-slot="progress"
      className={cn(
        "relative inline-flex w-full items-center rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <div
        data-slot="progress-fill"
        className="h-full rounded-full bg-primary"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export { Progress };
