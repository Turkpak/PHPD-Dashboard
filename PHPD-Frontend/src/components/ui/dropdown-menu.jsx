const _jsxFileName = "";"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef




(({ className, inset, children, ...props }, ref) => (
  React.createElement(DropdownMenuPrimitive.SubTrigger, {
    ref: ref,
    className: cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 27}}

    , children
    , React.createElement(ChevronRight, { className: "ml-auto", __self: this, __source: {fileName: _jsxFileName, lineNumber: 37}} )
  )
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement(DropdownMenuPrimitive.SubContent, {
    ref: ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
      className
    ),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 47}}
  )
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef


(({ className, sideOffset = 4, ...props }, ref) => (
  React.createElement(DropdownMenuPrimitive.Portal, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 63}}
    , React.createElement(DropdownMenuPrimitive.Content, {
      ref: ref,
      sideOffset: sideOffset,
      className: cn(
        "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
        className
      ),
      ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 64}}
    )
  )
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef




(({ className, inset, ...props }, ref) => (
  React.createElement(DropdownMenuPrimitive.Item, {
    ref: ref,
    className: cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 84}}
  )
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef


(({ className, children, checked, ...props }, ref) => (
  React.createElement(DropdownMenuPrimitive.CheckboxItem, {
    ref: ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked: checked,
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 100}}

    , React.createElement('span', { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 109}}
      , React.createElement(DropdownMenuPrimitive.ItemIndicator, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 110}}
        , React.createElement(Check, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 111}} )
      )
    )
    , children
  )
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef


(({ className, children, ...props }, ref) => (
  React.createElement(DropdownMenuPrimitive.RadioItem, {
    ref: ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}

    , React.createElement('span', { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 132}}
      , React.createElement(DropdownMenuPrimitive.ItemIndicator, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 133}}
        , React.createElement(Circle, { className: "h-2 w-2 fill-current"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 134}} )
      )
    )
    , children
  )
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef




(({ className, inset, ...props }, ref) => (
  React.createElement(DropdownMenuPrimitive.Label, {
    ref: ref,
    className: cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    ),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 148}}
  )
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef


(({ className, ...props }, ref) => (
  React.createElement(DropdownMenuPrimitive.Separator, {
    ref: ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 164}}
  )
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}) => {
  return (
    React.createElement('span', {
      className: cn("ml-auto text-xs tracking-widest opacity-60", className),
      ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 177}}
    )
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
