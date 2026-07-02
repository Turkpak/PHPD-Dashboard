const _jsxFileName = "";
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Lock, Save, Palette } from "lucide-react";

export default function Settings() {
  return (
    React.createElement(Layout, { title: "System Settings" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 12}}
      , React.createElement('div', { className: "w-full max-w-4xl mx-auto space-y-6 min-w-0"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 13}}
        , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 14}}
          , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 15}}
            , React.createElement('h2', { className: "text-2xl font-bold font-heading"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 16}}, "Command Center Configuration"  )
            , React.createElement('p', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 17}}, "Manage your local monitoring preferences and system behavior."       )
          )
          , React.createElement(Button, { className: "bg-secondary hover:bg-secondary/90 text-white font-bold"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 19}}
            , React.createElement(Save, { className: "mr-2 h-4 w-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 20}} ), " Save All Changes"
          )
        )

        , React.createElement('div', { className: "grid gap-6" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 24}}
          /* Appearance */
          , React.createElement(Card, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 26}}
            , React.createElement(CardHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 27}}
              , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 28}}
                , React.createElement(Palette, { className: "h-4 w-4 text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 29}} )
                , React.createElement(CardTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 30}}, "Appearance & Display"  )
              )
              , React.createElement(CardDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 32}}, "Customize how the dashboard looks on your station."       )
            )
            , React.createElement(CardContent, { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 34}}
              , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 35}}
                , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 36}}, "Map Tile Provider"  )
                , React.createElement(Select, { defaultValue: "carto-dark", __self: this, __source: {fileName: _jsxFileName, lineNumber: 37}}
                  , React.createElement(SelectTrigger, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 38}}
                    , React.createElement(SelectValue, { placeholder: "Select Provider" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 39}} )
                  )
                  , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 41}}
                    , React.createElement(SelectItem, { value: "carto-dark", __self: this, __source: {fileName: _jsxFileName, lineNumber: 42}}, "CartoDB Dark Matter"  )
                    , React.createElement(SelectItem, { value: "osm", __self: this, __source: {fileName: _jsxFileName, lineNumber: 43}}, "OpenStreetMap Standard" )
                    , React.createElement(SelectItem, { value: "satellite", __self: this, __source: {fileName: _jsxFileName, lineNumber: 44}}, "Satellite Imagery" )
                  )
                )
              )
            )
          )

          /* Notifications */
          , React.createElement(Card, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 52}}
            , React.createElement(CardHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 53}}
              , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 54}}
                , React.createElement(Bell, { className: "h-4 w-4 text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}} )
                , React.createElement(CardTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}, "Operational Alerts" )
              )
              , React.createElement(CardDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 58}}, "Configure which incidents trigger desktop notifications."     )
            )
            , React.createElement(CardContent, { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 60}}
              , React.createElement('div', { className: "flex items-center justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 61}}
                , React.createElement('div', { className: "space-y-0.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 62}}
                  , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 63}}, "Critical Incident Pulse"  )
                  , React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 64}}, "High-severity incidents will flash the dashboard borders."      )
                )
                , React.createElement(Switch, { defaultChecked: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 66}} )
              )
              , React.createElement('div', { className: "flex items-center justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 68}}
                , React.createElement('div', { className: "space-y-0.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 69}}
                  , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 70}}, "Audio Warnings" )
                  , React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 71}}, "Play audible alerts for priority 1 emergencies."      )
                )
                , React.createElement(Switch, { defaultChecked: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 73}} )
              )
            )
          )

          /* Security */
          , React.createElement(Card, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 79}}
            , React.createElement(CardHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 80}}
              , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 81}}
                , React.createElement(Lock, { className: "h-4 w-4 text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 82}} )
                , React.createElement(CardTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 83}}, "Authentication & Access"  )
              )
              , React.createElement(CardDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 85}}, "Secure your command center session."    )
            )
            , React.createElement(CardContent, { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 87}}
              , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 gap-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}
                , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 89}}
                  , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 90}}, "Officer ID" )
                  , React.createElement(Input, { defaultValue: "PHPD-402-LHR", disabled: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 91}} )
                )
                , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 93}}
                  , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 94}}, "Session Timeout (min)"  )
                  , React.createElement(Input, { type: "number", defaultValue: "60", __self: this, __source: {fileName: _jsxFileName, lineNumber: 95}} )
                )
              )
              , React.createElement(Button, { variant: "outline", className: "w-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 98}}, "Update Access Credentials"  )
            )
          )
        )
      )
    )
  );
}