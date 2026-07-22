const _jsxFileName = "";
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement(CheckboxPrimitive.Root, {
    ref: ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 !min-h-4 !min-w-4 shrink-0 rounded-sm border border-[#054332] shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#054332] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#054332] data-[state=checked]:text-white data-[state=checked]:border-[#054332]",
      className
    ),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 11}}


    , React.createElement(CheckboxPrimitive.Indicator, {
      className: cn("grid place-content-center text-current"), __self: this, __source: {fileName: _jsxFileName, lineNumber: 19}}

      , React.createElement(Check, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 22}} )
    )
  )
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
