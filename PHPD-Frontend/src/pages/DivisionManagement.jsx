import React from "react";
const _jsxFileName = ""; function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }
import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  listProvinces,
  listDivisions,
  createDivision,
  updateDivision,
  deleteDivision,
} from "@/api";


export default function DivisionManagement() {
  const [formData, setFormData] = useState({ provinceId: "" , division_name: "" });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: provinces = [], isLoading: provincesLoading } = useQuery({
    queryKey: ["provinces"],
    queryFn: listProvinces,
  });

  const { data: allDivisionsRaw, isLoading: divisionsLoading } = useQuery({
    queryKey: ["divisions"],
    queryFn: () => listDivisions(),
  });
  const allDivisions = Array.isArray(allDivisionsRaw) ? allDivisionsRaw : [];

  const createMutation = useMutation({
    mutationFn: createDivision,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
      setFormData({ provinceId: "", division_name: "" });
      toast({ title: "Success", description: "Circle created successfully" });
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to create circle", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      updateDivision(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
      setFormData({ provinceId: "", division_name: "" });
      setEditingId(null);
      toast({ title: "Success", description: "Circle updated successfully" });
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to update circle", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDivision,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
      toast({ title: "Deleted", description: "Circle removed successfully" });
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to delete circle", variant: "destructive" });
    },
  });

  const handleEdit = (d) => {
    setFormData({ provinceId: String(d.province), division_name: d.division_name });
    setEditingId(d.id);
  };

  const handleSubmit = () => {
    if (!formData.division_name.trim()) {
      toast({ title: "Error", description: "Circle name is required", variant: "destructive" });
      return;
    }
    if (!formData.provinceId) {
      toast({ title: "Error", description: "Please select a zone", variant: "destructive" });
      return;
    }
    const provinceId = Number(formData.provinceId);
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, payload: { division_name: formData.division_name.trim(), province: provinceId } });
    } else {
      createMutation.mutate({ division_name: formData.division_name.trim(), province: provinceId });
    }
  };

  const handleCancel = () => {
    setFormData({ provinceId: "", division_name: "" });
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this circle?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredDivisions = allDivisions.filter(
    (d) =>
      d.division_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.province_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const isLoading = divisionsLoading;

  return (
    React.createElement(Layout, { title: "Area Hierarchy Management"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}}
      , React.createElement('div', { className: "flex flex-col gap-8 w-full max-w-[1400px] mx-auto min-w-0 pb-20"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 118}}
        , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 119}}
          , React.createElement('h1', { className: "text-2xl font-bold text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 120}}, "Circle — Add / Edit"    )
          , React.createElement('p', { className: "text-muted-foreground text-sm" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 121}}, "Create a new circle or edit an existing one."        )
        )

        , React.createElement(Card, { className: "border-none shadow-sm overflow-hidden rounded-lg"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}
          , React.createElement('div', { className: "h-1 bg-secondary w-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 125}} )
          , React.createElement(CardHeader, { className: "pb-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 126}}
            , React.createElement(CardTitle, { className: "text-sm font-bold uppercase tracking-widest text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 127}}, "Basic Information"

            )
          )
          , React.createElement(CardContent, { className: "pt-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 131}}
            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 132}}
              , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 133}}
                , React.createElement(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 134}}, "Zone "
                   , React.createElement('span', { className: "text-destructive", __self: this, __source: {fileName: _jsxFileName, lineNumber: 135}}, "*")
                )
                , React.createElement(Select, {
                  onValueChange: (v) => setFormData({ ...formData, provinceId: v }),
                  value: formData.provinceId,
                  disabled: provincesLoading, __self: this, __source: {fileName: _jsxFileName, lineNumber: 137}}

                  , React.createElement(SelectTrigger, { className: "h-10", __self: this, __source: {fileName: _jsxFileName, lineNumber: 142}}
                    , React.createElement(SelectValue, { placeholder: provinces.length === 0 ? "No zones—add in Zone Management" : "Select zone", __self: this, __source: {fileName: _jsxFileName, lineNumber: 143}} )
                  )
                  , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 145}}
                    , provinces.map((p) => (
                      React.createElement(SelectItem, { key: p.id, value: String(p.id), __self: this, __source: {fileName: _jsxFileName, lineNumber: 147}}
                        , p.province_name
                      )
                    ))
                  )
                )
                , !provincesLoading && provinces.length === 0 && (
                  React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 154}}, "Add zones in Zone Management first, then select one here."         )
                )
              )
              , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 157}}
                , React.createElement(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 158}}, "Circle Name "
                    , React.createElement('span', { className: "text-destructive", __self: this, __source: {fileName: _jsxFileName, lineNumber: 159}}, "*")
                )
                , React.createElement(Input, {
                  placeholder: "Enter circle name"  ,
                  value: formData.division_name,
                  onChange: (e) => setFormData({ ...formData, division_name: e.target.value }),
                  className: "h-10", __self: this, __source: {fileName: _jsxFileName, lineNumber: 161}}
                )
              )
              , React.createElement('div', { className: "flex flex-row gap-2 min-w-0 lg:col-span-1"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 168}}
                , React.createElement(Button, {
                  onClick: handleSubmit,
                  disabled: createMutation.isPending || updateMutation.isPending,
                  className: "bg-secondary hover:bg-secondary/90 text-white flex-1 h-10 min-w-0"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 169}}

                  , editingId !== null ? "Update Circle" : React.createElement(React.Fragment, null, React.createElement(Plus, { className: "h-4 w-4 mr-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 174}} ), " Create Circle"  )
                )
                , editingId !== null && (
                  React.createElement(Button, { variant: "outline", onClick: handleCancel, className: "flex-1 h-10 min-w-0"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 177}}, "Cancel"

                  )
                )
                , editingId === null && (
                  React.createElement(Button, {
                    variant: "outline",
                    onClick: () => setFormData({ ...formData, division_name: "" }),
                    className: "flex-1 h-10 min-w-0 text-red-600 bg-white hover:bg-red-50 border-red-200 hover:border-red-300 text-xs font-semibold"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 182}}
, "Clear"

                  )
                )
              )
            )
          )
        )

        , React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 195}}
          , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 196}}
            , React.createElement('h2', { className: "text-xl font-bold text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 197}}, "Circle List" )
            , React.createElement('div', { className: "relative w-full sm:w-72"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 198}}
              , React.createElement(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 199}} )
              , React.createElement(Input, {
                placeholder: "Search by name .."   ,
                className: "pl-10 h-10 rounded-lg" ,
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 200}}
              )
            )
          )

          , React.createElement(Card, { className: "border-none shadow-sm overflow-hidden rounded-lg"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 209}}
            , React.createElement('div', { className: "overflow-x-auto", __self: this, __source: {fileName: _jsxFileName, lineNumber: 210}}
              , React.createElement(Table, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 211}}
                , React.createElement(TableHeader, { className: "bg-muted/50", __self: this, __source: {fileName: _jsxFileName, lineNumber: 212}}
                  , React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 213}}
                    , React.createElement(TableHead, { className: "w-20", __self: this, __source: {fileName: _jsxFileName, lineNumber: 214}}, "#")
                    , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 215}}, "Zone")
                    , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 216}}, "Circle")
                    , React.createElement(TableHead, { className: "text-right", __self: this, __source: {fileName: _jsxFileName, lineNumber: 217}}, "Action")
                  )
                )
                , React.createElement(TableBody, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 220}}
                  , isLoading ? (
                    React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 222}}
                      , React.createElement(TableCell, { colSpan: 4, className: "text-center py-8 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 223}}, "Loading…"

                      )
                    )
                  ) : (
                    filteredDivisions.map((division, index) => (
                      React.createElement(TableRow, { key: division.id, __self: this, __source: {fileName: _jsxFileName, lineNumber: 229}}
                        , React.createElement(TableCell, { className: "font-medium", __self: this, __source: {fileName: _jsxFileName, lineNumber: 230}}, index + 1)
                        , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 231}}
                          , React.createElement('div', { className: "flex items-center gap-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 232}}
                            , React.createElement('div', { className: "h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase shrink-0"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 233}}
                              , (division.province_name || "").substring(0, 2)
                            )
                            , React.createElement('span', { className: "truncate", __self: this, __source: {fileName: _jsxFileName, lineNumber: 236}}, _nullishCoalesce(division.province_name, () => ( "")))
                          )
                        )
                        , React.createElement(TableCell, { className: "font-semibold text-primary" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 239}}, division.division_name)
                        , React.createElement(TableCell, { className: "text-right", __self: this, __source: {fileName: _jsxFileName, lineNumber: 240}}
                          , React.createElement('div', { className: "flex justify-end gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 241}}
                            , React.createElement(Button, {
                              variant: "ghost",
                              size: "sm",
                              onClick: () => handleEdit(division),
                              className: "h-8 border border-muted hover:bg-muted whitespace-nowrap"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 242}}

                              , React.createElement(Edit2, { className: "h-3.5 w-3.5 mr-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 248}} ), " Edit"
                            )
                            , React.createElement(Button, {
                              variant: "ghost",
                              size: "sm",
                              onClick: () => handleDelete(division.id),
                              disabled: deleteMutation.isPending,
                              className: "h-8 border border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 whitespace-nowrap"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 250}}

                              , React.createElement(Trash2, { className: "h-3.5 w-3.5 mr-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 257}} ), " Delete"
                            )
                          )
                        )
                      )
                    ))
                  )
                  , !isLoading && filteredDivisions.length === 0 && (
                    React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 265}}
                      , React.createElement(TableCell, { colSpan: 4, className: "h-24 text-center text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 266}}, "No circles found."

                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  );
}
