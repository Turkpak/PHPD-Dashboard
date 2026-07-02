const _jsxFileName = "";
import React from "react";
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    React.createElement('div', {
      className: cn("animate-pulse rounded-md bg-primary/10", className),
      ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8}}
    )
  )
}

export { Skeleton }
