import React from "react";
const _jsxFileName = ""; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp } from "lucide-react";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// City coordinates for Punjab cities
const CITY_COORDINATES = {
  sheikhupura: { pos: [31.7167, 73.9833], name: "Sheikhupura" },
  sialkot: { pos: [32.4945, 74.5222], name: "Sialkot" },
  gujrat: { pos: [32.5739, 74.0776], name: "Gujrat" },
  jehlum: { pos: [32.9333, 73.7333], name: "Jehlum" },
  attock: { pos: [33.7667, 72.3667], name: "Attock" },
  hassanAbdal: { pos: [33.8167, 72.6833], name: "Hassan Abdal" },
  sahiwal: { pos: [30.6667, 73.1000], name: "Sahiwal" },
  okara: { pos: [30.8081, 73.4458], name: "Okara" },
  jhang: { pos: [31.2833, 72.3333], name: "Jhang" },
  muzaffargarh: { pos: [30.0667, 71.2000], name: "Muzaffargarh" },
};











const getProgressColor = (percentage) => {
  if (percentage >= 80) return "#2E7D32"; // forest green
  if (percentage >= 60) return "#2F8F6C"; // azure
  if (percentage >= 40) return "#f59e0b"; // orange
  return "#ef4444"; // red
};

const getProgressIcon = (percentage) => {
  const color = getProgressColor(percentage);
  return L.divIcon({
    className: 'installation-marker',
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 10px;
      ">
        ${percentage}%
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

export function InstallationMap({ cityData, selectedCity, onCitySelect }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      React.createElement(Card, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 87}}
        , React.createElement(CardHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}
          , React.createElement(CardTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 89}}, "Divisonwise Milestone Progress Map"   )
          , React.createElement(CardDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 90}}, "Geographic overview across Punjab"   )
        )
        , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 92}}
          , React.createElement('div', { className: "h-[320px] sm:h-[420px] lg:h-[500px] w-full bg-muted animate-pulse rounded-xl"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 93}} )
        )
      )
    );
  }

  // Calculate center point (roughly center of Punjab)
  const center = [31.5, 73.0];
  const zoom = 7;

  return (
    React.createElement(Card, { className: "shadow-lg border-border/50" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 104}}
      , React.createElement(CardHeader, { className: "pb-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 105}}
        , React.createElement(CardTitle, { className: "flex items-center gap-2 font-heading text-xl font-bold"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 106}}
          , React.createElement('div', { className: "h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 107}}
            , React.createElement(MapPin, { className: "h-5 w-5 text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 108}} )
          ), "Progress Map"

        )
        , React.createElement(CardDescription, { className: "text-sm", __self: this, __source: {fileName: _jsxFileName, lineNumber: 112}}, "Geographic overview of camera installation across Punjab cities"       )
      )
      , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 114}}
        , React.createElement('div', { className: "h-[320px] sm:h-[420px] lg:h-[500px] w-full rounded-xl overflow-hidden border relative z-0"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 115}}
          , React.createElement(MapContainer, {
            center: center,
            zoom: zoom,
            style: { height: "100%", width: "100%", zIndex: 0 },
            scrollWheelZoom: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}}

            , React.createElement(TileLayer, {
              attribution: "© <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"   ,
              url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", __self: this, __source: {fileName: _jsxFileName, lineNumber: 122}}
            )

            , Object.entries(CITY_COORDINATES).map(([key, city]) => {
              const data = cityData[key];
              if (!data) return null;
              
              const percentage = data.overall;
              const color = getProgressColor(percentage);
              const isSelected = selectedCity === key;
              
              return (
                React.createElement('div', { key: key, __self: this, __source: {fileName: _jsxFileName, lineNumber: 136}}
                  , React.createElement(Marker, {
                    position: city.pos,
                    icon: getProgressIcon(percentage),
                    eventHandlers: {
                      click: () => _optionalChain([onCitySelect, 'optionalCall', _ => _(key)]),
                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 137}}

                    , React.createElement(Popup, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 144}}
                      , React.createElement('div', { className: "p-2 min-w-[200px]" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 145}}
                        , React.createElement('div', { className: "flex items-center justify-between mb-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 146}}
                          , React.createElement('h3', { className: "font-bold text-sm" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 147}}, city.name)
                          , React.createElement(Badge, { 
                            variant: "outline", 
                            className: "text-xs",
                            style: { 
                              borderColor: color,
                              color: color 
                            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 148}}

                            , percentage, "%"
                          )
                        )
                        , React.createElement('div', { className: "space-y-1 text-xs" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 159}}
                          , React.createElement('div', { className: "flex items-center gap-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 160}}
                            , React.createElement(TrendingUp, { className: "h-3 w-3 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 161}} )
                            , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 162}}, "Overall Progress" )
                          )
                          , React.createElement('div', { className: "w-full bg-muted rounded-full h-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 164}}
                            , React.createElement('div', {
                              className: "h-full rounded-full transition-all"  ,
                              style: {
                                width: `${percentage}%`,
                                backgroundColor: color,
                              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 165}}
                            )
                          )
                          , isSelected && (
                            React.createElement('p', { className: "text-primary font-medium mt-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 174}}, "Currently Selected" )
                          )
                        )
                      )
                    )
                  )
                )
              );
            })

            /* Selected city highlight circle */
            , selectedCity && CITY_COORDINATES[selectedCity] && (() => {
              const city = CITY_COORDINATES[selectedCity];
              const data = cityData[selectedCity];
              if (!data) return null;
              const color = getProgressColor(data.overall);
              return (
                React.createElement(Circle, {
                  key: `circle-${selectedCity}`,
                  center: city.pos,
                  radius: 15000,
                  pathOptions: {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.1,
                    weight: 2,
                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 191}}
                )
              );
            })()
          )
        )

        /* Legend */
        , React.createElement('div', { className: "mt-4 flex flex-wrap items-center gap-4 text-xs"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 208}}
          , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 209}}
            , React.createElement('div', { className: "w-4 h-4 rounded-full bg-emerald-500"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 210}})
            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 211}}, "80-100% (Excellent)" )
          )
          , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 213}}
            , React.createElement('div', { className: "w-4 h-4 rounded-full bg-emerald-600"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 214}})
            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 215}}, "60-79% (Good)" )
          )
          , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 217}}
            , React.createElement('div', { className: "w-4 h-4 rounded-full bg-orange-500"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 218}})
            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 219}}, "40-59% (In Progress)"  )
          )
          , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 221}}
            , React.createElement('div', { className: "w-4 h-4 rounded-full bg-red-500"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 222}})
            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 223}}, "0-39% (Early Stage)"  )
          )
        )
      )
    )
  );
}

