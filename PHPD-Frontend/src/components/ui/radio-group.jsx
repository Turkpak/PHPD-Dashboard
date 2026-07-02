const _jsxFileName = "";
import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef


(({ className, ...props }, ref) => {
  return (
    React.createElement(RadioGroupPrimitive.Root, {
      className: cn("grid gap-2", className),
      ...props,
      ref: ref, __self: this, __source: {fileName: _jsxFileName, lineNumber: 12}}
    )
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef


(({ className, ...props }, ref) => {
  return (
    React.createElement(RadioGroupPrimitive.Item, {
      ref: ref,
      className: cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 26}}

      , React.createElement(RadioGroupPrimitive.Indicator, { className: "flex items-center justify-center"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 34}}
        , React.createElement(Circle, { className: "h-3.5 w-3.5 fill-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 35}} )
      )
    )
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
