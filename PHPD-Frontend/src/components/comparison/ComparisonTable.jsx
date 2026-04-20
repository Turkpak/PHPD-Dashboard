const _jsxFileName = "";
import React from "react";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";

















export function ComparisonTable({ data }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    return data.filter(city =>
      city.cityName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startEntry = (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, filteredData.length);

  return (
    React.createElement(Card, { className: "shadow-lg border-border/50" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 47}}
      , React.createElement(CardHeader, { className: "pb-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 48}}
        , React.createElement(CardTitle, { className: "font-heading text-xl font-bold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 49}}, "City Progress Data"  )
        , React.createElement(CardDescription, { className: "text-sm", __self: this, __source: {fileName: _jsxFileName, lineNumber: 50}}, "Detailed completion status for all cities"     )
      )
      , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 52}}
        , React.createElement('div', { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 53}}
          , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 54}}
            , React.createElement('span', { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}, "Show")
            , React.createElement(Select, { value: pageSize.toString(), onValueChange: (value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}
              , React.createElement(SelectTrigger, { className: "w-[100px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 60}}
                , React.createElement(SelectValue, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 61}} )
              )
              , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 63}}
                , React.createElement(SelectItem, { value: "10", __self: this, __source: {fileName: _jsxFileName, lineNumber: 64}}, "10")
                , React.createElement(SelectItem, { value: "25", __self: this, __source: {fileName: _jsxFileName, lineNumber: 65}}, "25")
                , React.createElement(SelectItem, { value: "50", __self: this, __source: {fileName: _jsxFileName, lineNumber: 66}}, "50")
              )
            )
            , React.createElement('span', { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 69}}, "entries")
          )
          , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 71}}
            , React.createElement('span', { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 72}}, "Search:")
            , React.createElement(Input, {
              type: "text",
              placeholder: "Search cities..." ,
              value: searchTerm,
              onChange: (e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              },
              className: "w-[200px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 73}}
            )
          )
        )

        , React.createElement('div', { className: "rounded-md border" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 86}}
          , React.createElement(Table, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 87}}
            , React.createElement(TableHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}
              , React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 89}}
                , React.createElement(TableHead, { className: "w-[60px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 90}}, "ID")
                , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 91}}, "City Name" )
                , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 92}}, "Surveys")
                , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 93}}, "Foundations Pole Installations"  )
                , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 94}}, "Cabinet Cameras Installation"  )
                , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 95}}, "Cable Laying & Power Connections"    )
                , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 96}}, "Control Room Renovations"  )
                , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 97}}, "PPIC3 Go Live"  )
                , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 98}}, "Percentage Completed" )
                , React.createElement(TableHead, { className: "w-[100px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 99}}, "Action")
              )
            )
            , React.createElement(TableBody, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 102}}
              , paginatedData.length === 0 ? (
                React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 104}}
                  , React.createElement(TableCell, { colSpan: 10, className: "text-center py-8 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 105}}, "No cities found"

                  )
                )
              ) : (
                paginatedData.map((city) => (
                  React.createElement(TableRow, { key: city.id, __self: this, __source: {fileName: _jsxFileName, lineNumber: 111}}
                    , React.createElement(TableCell, { className: "font-medium", __self: this, __source: {fileName: _jsxFileName, lineNumber: 112}}, city.id)
                    , React.createElement(TableCell, { className: "font-semibold", __self: this, __source: {fileName: _jsxFileName, lineNumber: 113}}, city.cityName)
                    , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 114}}, city.surveys)
                    , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 115}}, city.foundations)
                    , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 116}}, city.cabinet)
                    , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 117}}, city.cable)
                    , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 118}}, city.controlRoom)
                    , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 119}}, city.ppic3)
                    , React.createElement(TableCell, { className: "font-bold", __self: this, __source: {fileName: _jsxFileName, lineNumber: 120}}, city.percentageCompleted)
                    , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 121}}
                      , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 122}}
                        , React.createElement(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-emerald-700 hover:text-emerald-800"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 123}}
                          , React.createElement(Edit, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 124}} )
                        )
                        , React.createElement(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-red-600 hover:text-red-700"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 126}}
                          , React.createElement(Trash2, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 127}} )
                        )
                      )
                    )
                  )
                ))
              )
            )
          )
        )

        , React.createElement('div', { className: "flex flex-col sm:flex-row justify-between items-center gap-4 mt-4"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 138}}
          , React.createElement('div', { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 139}}, "Showing "
             , startEntry, " to "  , endEntry, " of "  , filteredData.length, " entries"
          )
          , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 142}}
            , React.createElement(Button, {
              variant: "outline",
              size: "sm",
              onClick: () => setCurrentPage(prev => Math.max(1, prev - 1)),
              disabled: currentPage === 1, __self: this, __source: {fileName: _jsxFileName, lineNumber: 143}}

              , React.createElement(ChevronLeft, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 149}} ), "Previous"

            )
            , Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              React.createElement(Button, {
                key: page,
                variant: currentPage === page ? "default" : "outline",
                size: "sm",
                onClick: () => setCurrentPage(page),
                className: "min-w-[40px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 153}}

                , page
              )
            ))
            , React.createElement(Button, {
              variant: "default",
              size: "sm",
              onClick: () => setCurrentPage(prev => Math.min(totalPages, prev + 1)),
              disabled: currentPage === totalPages,
              className: "bg-primary text-primary-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 163}}
, "Next"

              , React.createElement(ChevronRight, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 171}} )
            )
          )
        )
      )
    )
  );
}

