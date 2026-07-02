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
    React.createElement(Layout, { title: "System Settings" }
      , React.createElement('div', { className: "w-full max-w-4xl mx-auto space-y-6 min-w-0"    }
        , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"     }
          , React.createElement('div', {}
            , React.createElement('h2', { className: "text-2xl font-bold font-heading"  }, "Command Center Configuration"  )
            , React.createElement('p', { className: "text-muted-foreground"}, "Manage your local monitoring preferences and system behavior."       )
          )
          , React.createElement(Button, { className: "bg-secondary hover:bg-secondary/90 text-white font-bold"   }
            , React.createElement(Save, { className: "mr-2 h-4 w-4"  } ), " Save All Changes"
          )
        )

        , React.createElement('div', { className: "grid gap-6" }
          /* Appearance */
          , React.createElement(Card, {}
            , React.createElement(CardHeader, {}
              , React.createElement('div', { className: "flex items-center gap-2"  }
                , React.createElement(Palette, { className: "h-4 w-4 text-primary"  } )
                , React.createElement(CardTitle, {}, "Appearance & Display"  )
              )
              , React.createElement(CardDescription, {}, "Customize how the dashboard looks on your station."       )
            )
            , React.createElement(CardContent, { className: "space-y-6"}
              , React.createElement('div', { className: "space-y-2"}
                , React.createElement(Label, {}, "Map Tile Provider"  )
                , React.createElement(Select, { defaultValue: "carto-dark"}
                  , React.createElement(SelectTrigger, {}
                    , React.createElement(SelectValue, { placeholder: "Select Provider" } )
                  )
                  , React.createElement(SelectContent, {}
                    , React.createElement(SelectItem, { value: "carto-dark"}, "CartoDB Dark Matter"  )
                    , React.createElement(SelectItem, { value: "osm"}, "OpenStreetMap Standard" )
                    , React.createElement(SelectItem, { value: "satellite"}, "Satellite Imagery" )
                  )
                )
              )
            )
          )

          /* Notifications */
          , React.createElement(Card, {}
            , React.createElement(CardHeader, {}
              , React.createElement('div', { className: "flex items-center gap-2"  }
                , React.createElement(Bell, { className: "h-4 w-4 text-primary"  } )
                , React.createElement(CardTitle, {}, "Operational Alerts" )
              )
              , React.createElement(CardDescription, {}, "Configure which incidents trigger desktop notifications."     )
            )
            , React.createElement(CardContent, { className: "space-y-4"}
              , React.createElement('div', { className: "flex items-center justify-between"  }
                , React.createElement('div', { className: "space-y-0.5"}
                  , React.createElement(Label, {}, "Critical Incident Pulse"  )
                  , React.createElement('p', { className: "text-xs text-muted-foreground" }, "High-severity incidents will flash the dashboard borders."      )
                )
                , React.createElement(Switch, { defaultChecked: true} )
              )
              , React.createElement('div', { className: "flex items-center justify-between"  }
                , React.createElement('div', { className: "space-y-0.5"}
                  , React.createElement(Label, {}, "Audio Warnings" )
                  , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Play audible alerts for priority 1 emergencies."      )
                )
                , React.createElement(Switch, { defaultChecked: true} )
              )
            )
          )

          /* Security */
          , React.createElement(Card, {}
            , React.createElement(CardHeader, {}
              , React.createElement('div', { className: "flex items-center gap-2"  }
                , React.createElement(Lock, { className: "h-4 w-4 text-primary"  } )
                , React.createElement(CardTitle, {}, "Authentication & Access"  )
              )
              , React.createElement(CardDescription, {}, "Secure your command center session."    )
            )
            , React.createElement(CardContent, { className: "space-y-4"}
              , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 gap-4"   }
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, {}, "Officer ID" )
                  , React.createElement(Input, { defaultValue: "PHPD-402-LHR", disabled: true} )
                )
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, {}, "Session Timeout (min)"  )
                  , React.createElement(Input, { type: "number", defaultValue: "60"} )
                )
              )
              , React.createElement(Button, { variant: "outline", className: "w-full"}, "Update Access Credentials"  )
            )
          )
        )
      )
    )
  );
}
