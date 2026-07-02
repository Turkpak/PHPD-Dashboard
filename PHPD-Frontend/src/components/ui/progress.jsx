const _jsxFileName = "";"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef


(({ className, value, ...props }, ref) => (
  React.createElement(ProgressPrimitive.Root, {
    ref: ref,
    className: cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    ),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 12}}

    , React.createElement(ProgressPrimitive.Indicator, {
      className: "h-full w-full flex-1 bg-primary transition-all"    ,
      style: { transform: `translateX(-${100 - (value || 0)}%)` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 20}}
    )
  )
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
