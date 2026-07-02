import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";










export function KPICard({ title, value, trend, trendLabel = "vs last hour", icon: Icon, className }) {
  const isPositive = trend && trend > 0;
  const isNeutral = trend === 0;

  return (
    React.createElement(Card, { className: className}
      , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2"     }
        , React.createElement(CardTitle, { className: "text-sm font-medium text-muted-foreground font-mono uppercase tracking-wider"     }
          , title
        )
        , React.createElement(Icon, { className: "h-4 w-4 text-muted-foreground"  } )
      )
      , React.createElement(CardContent, {}
        , React.createElement('div', { className: "text-2xl font-bold font-heading"  }, value)
        , trend !== undefined && (
          React.createElement('p', { className: "text-xs text-muted-foreground flex items-center mt-1"    }
            , isPositive ? (
              React.createElement(ArrowUpRight, { className: "h-4 w-4 text-emerald-500 mr-1"   } )
            ) : isNeutral ? (
              React.createElement(Minus, { className: "h-4 w-4 text-yellow-500 mr-1"   } )
            ) : (
              React.createElement(ArrowDownRight, { className: "h-4 w-4 text-rose-500 mr-1"   } )
            )
            , React.createElement('span', { className: isPositive ? "text-emerald-500 font-medium" : isNeutral ? "text-yellow-500" : "text-rose-500"}
              , Math.abs(trend), "%"
            )
            , React.createElement('span', { className: "ml-1 opacity-70" }, trendLabel)
          )
        )
      )
    )
  );
}
