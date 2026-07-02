const _jsxFileName = "";
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import {
  listProvinces,
  createProvince,
  updateProvince,
  deleteProvince,
} from "@/api/province";


export default function ProvinceManagement() {
  const [provinceName, setProvinceName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const perm = usePermissions().getPermission("Area Management", "Province");
  const canCreate = perm.can_create;
  const canUpdate = perm.can_update;
  const canDelete = perm.can_delete;

  const { data: provinces = [], isLoading } = useQuery({
    queryKey: ["provinces"],
    queryFn: listProvinces,
  });

  const createMutation = useMutation({
    mutationFn: createProvince,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provinces"] });
      setProvinceName("");
      toast({ title: "Success", description: "Zone created successfully" });
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to create Zone", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      updateProvince(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provinces"] });
      setProvinceName("");
      setEditingId(null);
      toast({ title: "Success", description: "Zone updated successfully" });
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to update province", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProvince,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provinces"] });
      toast({ title: "Deleted", description: "Zone removed successfully" });
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to delete Zone", variant: "destructive" });
    },
  });

  const handleEdit = (p) => {
    setProvinceName(p.province_name);
    setEditingId(p.id);
  };

  const handleSubmit = () => {
    if (!provinceName.trim()) {
      toast({ title: "Error", description: "Zone name is required", variant: "destructive" });
      return;
    }
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, payload: { province_name: provinceName.trim() } });
    } else {
      createMutation.mutate({ province_name: provinceName.trim() });
    }
  };

  const handleCancel = () => {
    setProvinceName("");
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this Zone?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredProvinces = provinces.filter((p) =>
    p.province_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    React.createElement(Layout, { title: "Area Hierarchy Management"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 106}}
      , React.createElement('div', { className: "flex flex-col gap-8 w-full max-w-[1400px] mx-auto min-w-0 pb-20"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 107}}
        , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 108}}
          , React.createElement('h1', { className: "text-2xl font-bold text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 109}}, "Zone — Add / Edit"    )
          , React.createElement('p', { className: "text-muted-foreground text-sm" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 110}}, "Create a new Zone or edit an existing one."        )
        )

        , (canCreate || (canUpdate && editingId !== null)) && (
          React.createElement(Card, { className: "border-none shadow-sm overflow-hidden"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 114}}
            , React.createElement('div', { className: "h-1 bg-secondary w-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 115}} )
            , React.createElement(CardHeader, { className: "pb-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}}
              , React.createElement(CardTitle, { className: "text-sm font-bold uppercase tracking-widest text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}}, "Basic Information"

              )
            )
            , React.createElement(CardContent, { className: "pt-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 121}}
              , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6 items-end"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 122}}
                , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 123}}
                  , React.createElement(Label, { htmlFor: "Zone-name", className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}, "Zone Name "
                      , React.createElement('span', { className: "text-destructive", __self: this, __source: {fileName: _jsxFileName, lineNumber: 125}}, "*")
                  )
                  , React.createElement(Input, {
                    id: "Zone-name",
                    placeholder: "e.g. Punjab Zone" ,
                    value: provinceName,
                    onChange: (e) => setProvinceName(e.target.value),
                    className: "h-10", __self: this, __source: {fileName: _jsxFileName, lineNumber: 127}}
                  )
                )
                , React.createElement('div', { className: "flex flex-row gap-2 min-w-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 135}}
                  , canCreate && editingId === null && (
                    React.createElement(Button, {
                      onClick: handleSubmit,
                      disabled: createMutation.isPending,
                      className: "bg-secondary hover:bg-secondary/90 text-white flex-1 h-10 min-w-0"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 137}}

                      , React.createElement(Plus, { className: "h-4 w-4 mr-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 142}} ), " Create Zone"
                    )
                  )
                  , canUpdate && editingId !== null && (
                    React.createElement(React.Fragment, null
                      , React.createElement(Button, {
                        onClick: handleSubmit,
                        disabled: updateMutation.isPending,
                        className: "bg-secondary hover:bg-secondary/90 text-white flex-1 h-10 min-w-0"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 147}}
, "Update Zone"

                      )
                      , React.createElement(Button, { variant: "outline", onClick: handleCancel, className: "flex-1 h-10 min-w-0"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 154}}, "Cancel"

                      )
                    )
                  )
                  , editingId === null && canCreate && (
                    React.createElement(Button, {
                      variant: "outline",
                      onClick: () => setProvinceName(""),
                      className: "flex-1 h-10 min-w-0 text-red-600 bg-white hover:bg-red-50 border-red-200 hover:border-red-300 text-xs font-semibold"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 160}}
, "Clear"

                    )
                  )
                )
              )
            )
          )
        )

        , React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 174}}
          , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 175}}
            , React.createElement('h2', { className: "text-xl font-bold text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 176}}, "Zone List" )
            , React.createElement('div', { className: "relative w-full sm:w-72"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 177}}
              , React.createElement(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 178}} )
              , React.createElement(Input, {
                placeholder: "Search by name .."   ,
                className: "pl-10 h-10" ,
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 179}}
              )
            )
          )

          , React.createElement(Card, { className: "border-none shadow-sm overflow-hidden"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 188}}
            , React.createElement('div', { className: "overflow-x-auto", __self: this, __source: {fileName: _jsxFileName, lineNumber: 189}}
              , React.createElement(Table, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 190}}
                , React.createElement(TableHeader, { className: "bg-muted/50", __self: this, __source: {fileName: _jsxFileName, lineNumber: 191}}
                  , React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 192}}
                    , React.createElement(TableHead, { className: "w-16", __self: this, __source: {fileName: _jsxFileName, lineNumber: 193}}, "#")
                    , React.createElement(TableHead, { className: "w-24", __self: this, __source: {fileName: _jsxFileName, lineNumber: 194}}, "ID")
                    , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 195}}, "Zone")
                    , React.createElement(TableHead, { className: "text-right", __self: this, __source: {fileName: _jsxFileName, lineNumber: 196}}, "Action")
                  )
                )
                , React.createElement(TableBody, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 199}}
                  , isLoading ? (
                    React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 201}}
                      , React.createElement(TableCell, { colSpan: 4, className: "text-center py-8 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 202}}, "Loading…"

                      )
                    )
                  ) : filteredProvinces.length === 0 ? (
                    React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 207}}
                      , React.createElement(TableCell, { colSpan: 4, className: "h-24 text-center text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 208}}, "No zones found. Create one above."

                      )
                    )
                  ) : (
                    filteredProvinces.map((province, index) => (
                      <TableRow key={province.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">{province.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xs shrink-0">
                              {province.province_name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="truncate">{province.province_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canUpdate && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(province)}
                                className="table-action-btn h-9 w-9 sm:w-auto sm:px-3 border border-muted hover:bg-muted"
                                aria-label="Edit zone"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline ml-1">Edit</span>
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(province.id)}
                                disabled={deleteMutation.isPending}
                                className="table-action-btn h-9 w-9 sm:w-auto sm:px-3 border border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
                                aria-label="Delete zone"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline ml-1">Delete</span>
                              </Button>
                            )}
                            {!canUpdate && !canDelete && <span className="text-muted-foreground text-sm">—</span>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
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
