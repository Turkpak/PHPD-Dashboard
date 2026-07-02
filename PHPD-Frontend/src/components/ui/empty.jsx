const _jsxFileName = "";
import React from "react";
import { cva, } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Empty({ className, ...props }) {
  return (
    React.createElement('div', {
      'data-slot': "empty",
      className: cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-balance rounded-lg border-dashed p-6 text-center md:p-12",
        className
      ),
      ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7}}
    )
  )
}

function EmptyHeader({ className, ...props }) {
  return (
    React.createElement('div', {
      'data-slot': "empty-header",
      className: cn(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        className
      ),
      ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 20}}
    )
  )
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function EmptyMedia({
  className,
  variant = "default",
  ...props
}) {
  return (
    React.createElement('div', {
      'data-slot': "empty-icon",
      'data-variant': variant,
      className: cn(emptyMediaVariants({ variant, className })),
      ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 52}}
    )
  )
}

function EmptyTitle({ className, ...props }) {
  return (
    React.createElement('div', {
      'data-slot': "empty-title",
      className: cn("text-lg font-medium tracking-tight", className),
      ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 63}}
    )
  )
}

function EmptyDescription({ className, ...props }) {
  return (
    React.createElement('div', {
      'data-slot': "empty-description",
      className: cn(
        "text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
        className
      ),
      ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 73}}
    )
  )
}

function EmptyContent({ className, ...props }) {
  return (
    React.createElement('div', {
      'data-slot': "empty-content",
      className: cn(
        "flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance text-sm",
        className
      ),
      ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 86}}
    )
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}
