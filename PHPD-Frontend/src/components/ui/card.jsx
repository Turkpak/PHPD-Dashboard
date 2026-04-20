const _jsxFileName = "";
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement('div', {
    ref: ref,
    className: cn(
      "rounded-[2rem] border border-white/50 bg-card/60 backdrop-blur-md text-card-foreground shadow-[0_8px_32px_rgba(0,0,0,0.04)]",
      className
    ),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9}}
  )
))
Card.displayName = "Card"

const CardHeader = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement('div', {
    ref: ref,
    className: cn("flex flex-col space-y-1.5 p-6", className),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 24}}
  )
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement('div', {
    ref: ref,
    className: cn("font-semibold leading-none tracking-tight", className),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 36}}
  )
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement('div', {
    ref: ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 48}}
  )
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement('div', { ref: ref, className: cn("p-6 pt-0", className), ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 60}} )
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement('div', {
    ref: ref,
    className: cn("flex items-center p-6 pt-0", className),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 68}}
  )
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
