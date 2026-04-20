const _jsxFileName = "";
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return (
      React.createElement('input', {
        type: type,
        className: cn(
          "flex h-11 w-full rounded-2xl border border-input bg-white/50 backdrop-blur-sm px-4 py-2 text-base shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref: ref,
        ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8}}
      )
    )
  }
)
Input.displayName = "Input"

export { Input }
