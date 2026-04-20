const _jsxFileName = "";
import React from "react";
import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }) {
  return (
    React.createElement(Loader2Icon, {
      role: "status",
      'aria-label': "Loading",
      className: cn("size-4 animate-spin", className),
      ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7}}
    )
  )
}

export { Spinner }
