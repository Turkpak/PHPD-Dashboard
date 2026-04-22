import React from "react";
const _jsxFileName = ""; function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }
import { Layout } from "@/components/layout/Layout";
import { useState, useEffect } from "react";
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
  listDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
} from "@/api";


export default function DistrictManagement() {
  const [formData, setFormData] = useState({ provinceId: "", divisionId: "", district_name: "" });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize] = useState(10);
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: provinces = [], isLoading: provincesLoading } = useQuery({
    queryKey: ["provinces"],
    queryFn: listProvinces,
  });

  const provinceIdNum = formData.provinceId ? Number(formData.provinceId) : undefined;
  const { data: divisionsByProvince = [] } = useQuery({
    queryKey: ["divisions", provinceIdNum],
    queryFn: () => listDivisions(provinceIdNum),
    enabled: !!provinceIdNum,
  });

  const { data: allDistrictsRaw = [], isLoading: districtsLoading } = useQuery({
    queryKey: ["districts"],
    queryFn: () => listDistricts(),
  });
  const allDistricts = Array.isArray(allDistrictsRaw) ? allDistrictsRaw : [];

  useEffect(() => {
    if (!formData.provinceId) setFormData((f) => ({ ...f, divisionId: "" }));
  }, [formData.provinceId]);

  const createMutation = useMutation({
    mutationFn: createDistrict,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      setFormData({ provinceId: "", divisionId: "", district_name: "" });
      toast({ title: "Success", description: "District created successfully" });
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to create district", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }


) => updateDistrict(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      setFormData({ provinceId: "", divisionId: "", district_name: "" });
      setEditingId(null);
      toast({ title: "Success", description: "District updated successfully" });
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to update district", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDistrict,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      toast({ title: "Deleted", description: "District removed successfully" });
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to delete district", variant: "destructive" });
    },
  });

  const handleEdit = (d) => {
    setFormData({
      provinceId: String(d.province),
      divisionId: String(d.division),
      district_name: d.district_name,
    });
    setEditingId(d.id);
  };

  const handleSubmit = () => {
    if (!formData.district_name.trim()) {
      toast({ title: "Error", description: "District name is required", variant: "destructive" });
      return;
    }
    if (!formData.provinceId || !formData.divisionId) {
      toast({ title: "Error", description: "Please select zone and circle", variant: "destructive" });
      return;
    }
    const provinceId = Number(formData.provinceId);
    const divisionId = Number(formData.divisionId);
    if (editingId !== null) {
      updateMutation.mutate({
        id: editingId,
        payload: { district_name: formData.district_name.trim(), province: provinceId, division: divisionId },
      });
    } else {
      createMutation.mutate({
        district_name: formData.district_name.trim(),
        province: provinceId,
        division: divisionId,
      });
    }
  };

  const handleCancel = () => {
    setFormData({ provinceId: "", divisionId: "", district_name: "" });
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this district?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredDistricts = allDistricts.filter(
    (d) =>
      d.district_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.division_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.province_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredDistricts.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paginatedDistricts = filteredDistricts.slice(startIdx, startIdx + pageSize);

  return (
    React.createElement(Layout, { title: "Area Hierarchy Management"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 158}}
      , React.createElement('div', { className: "flex flex-col gap-8 w-full max-w-[1400px] mx-auto min-w-0 pb-20"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 159}}
        , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 160}}
          , React.createElement('h1', { className: "text-2xl font-bold text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 161}}, "District — Add / Edit"    )
          , React.createElement('p', { className: "text-muted-foreground text-sm" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 162}}, "Select Zone → Circle, then add the district against that hierarchy."          )
        )

        , React.createElement(Card, { className: "border-none shadow-sm overflow-hidden"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 165}}
          , React.createElement('div', { className: "h-1 bg-secondary w-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 166}} )
          , React.createElement(CardHeader, { className: "pb-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 167}}
            , React.createElement(CardTitle, { className: "text-sm font-bold uppercase tracking-widest text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 168}}, "Basic Information"

            )
          )
          , React.createElement(CardContent, { className: "pt-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 172}}
            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 173}}
              , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 174}}
                , React.createElement(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 175}}, "Zone "
                   , React.createElement('span', { className: "text-destructive", __self: this, __source: {fileName: _jsxFileName, lineNumber: 176}}, "*")
                )
                , React.createElement(Select, {
                  onValueChange: (v) => setFormData({ ...formData, provinceId: v, divisionId: "" }),
                  value: formData.provinceId,
                  disabled: provincesLoading, __self: this, __source: {fileName: _jsxFileName, lineNumber: 178}}

                  , React.createElement(SelectTrigger, { className: "h-10", __self: this, __source: {fileName: _jsxFileName, lineNumber: 183}}
                    , React.createElement(SelectValue, { placeholder: provinces.length === 0 ? "Add zones first" : "Select zone", __self: this, __source: {fileName: _jsxFileName, lineNumber: 184}} )
                  )
                  , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 186}}
                    , provinces.map((p) => (
                      React.createElement(SelectItem, { key: p.id, value: String(p.id), __self: this, __source: {fileName: _jsxFileName, lineNumber: 188}}
                        , p.province_name
                      )
                    ))
                  )
                )
              )
              , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 195}}
                , React.createElement(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 196}}, "Circle "
                   , React.createElement('span', { className: "text-destructive", __self: this, __source: {fileName: _jsxFileName, lineNumber: 197}}, "*")
                )
                , React.createElement(Select, {
                  onValueChange: (v) => setFormData({ ...formData, divisionId: v }),
                  value: formData.divisionId,
                  disabled: !formData.provinceId, __self: this, __source: {fileName: _jsxFileName, lineNumber: 199}}

                  , React.createElement(SelectTrigger, { className: "h-10", __self: this, __source: {fileName: _jsxFileName, lineNumber: 204}}
                    , React.createElement(SelectValue, { placeholder: !formData.provinceId ? "Select zone first" : "Select circle", __self: this, __source: {fileName: _jsxFileName, lineNumber: 205}} )
                  )
                  , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 207}}
                    , divisionsByProvince.map((d) => (
                      React.createElement(SelectItem, { key: d.id, value: String(d.id), __self: this, __source: {fileName: _jsxFileName, lineNumber: 209}}
                        , d.division_name
                      )
                    ))
                  )
                )
              )
              , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 216}}
                , React.createElement(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 217}}, "District Name "
                    , React.createElement('span', { className: "text-destructive", __self: this, __source: {fileName: _jsxFileName, lineNumber: 218}}, "*")
                )
                , React.createElement(Input, {
                  placeholder: "Enter district name"  ,
                  value: formData.district_name,
                  onChange: (e) => setFormData({ ...formData, district_name: e.target.value }),
                  className: "h-10", __self: this, __source: {fileName: _jsxFileName, lineNumber: 220}}
                )
              )
              , React.createElement('div', { className: "flex flex-col sm:flex-row gap-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 227}}
                , React.createElement(Button, {
                  onClick: handleSubmit,
                  disabled: createMutation.isPending || updateMutation.isPending,
                  className: "bg-secondary hover:bg-secondary/90 text-white flex-1 h-10 w-full"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 228}}

                  , editingId !== null ? "Update District" : React.createElement(React.Fragment, null, React.createElement(Plus, { className: "h-4 w-4 mr-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 233}} ), " Create District"  )
                )
                , editingId !== null && (
                  React.createElement(Button, { variant: "outline", onClick: handleCancel, className: "w-full h-10" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 236}}, "Cancel"

                  )
                )
              )
            )
          )
        )

        , React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 245}}
          , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 246}}
            , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 247}}
              , React.createElement('h2', { className: "text-xl font-bold text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 248}}, "District List" )

            )
            , React.createElement('div', { className: "relative w-full sm:w-72"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 251}}
              , React.createElement(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 252}} )
              , React.createElement(Input, {
                placeholder: "Search by name .."   ,
                className: "pl-10 h-10" ,
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 253}}
              )
            )
          )

          , React.createElement(Card, { className: "border-none shadow-sm overflow-hidden"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 262}}
            , React.createElement('div', { className: "overflow-x-auto", __self: this, __source: {fileName: _jsxFileName, lineNumber: 263}}
              , React.createElement(Table, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 264}}
                , React.createElement(TableHeader, { className: "bg-muted/50", __self: this, __source: {fileName: _jsxFileName, lineNumber: 265}}
                  , React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 266}}
                    , React.createElement(TableHead, { className: "w-16", __self: this, __source: {fileName: _jsxFileName, lineNumber: 267}}, "#")
                    , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 268}}, "Zone")
                    , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 269}}, "Circle")
                    , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 270}}, "District")
                    , React.createElement(TableHead, { className: "text-right", __self: this, __source: {fileName: _jsxFileName, lineNumber: 271}}, "Action")
                  )
                )
                , React.createElement(TableBody, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 274}}
                  , districtsLoading ? (
                    React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 276}}
                      , React.createElement(TableCell, { colSpan: 5, className: "text-center py-8 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 277}}, "Loading…"

                      )
                    )
                  ) : (
                    paginatedDistricts.map((district, index) => (
                      React.createElement(TableRow, { key: district.id, __self: this, __source: {fileName: _jsxFileName, lineNumber: 283}}
                        , React.createElement(TableCell, { className: "font-medium", __self: this, __source: {fileName: _jsxFileName, lineNumber: 284}}, startIdx + index + 1)
                        , React.createElement(TableCell, { className: "whitespace-nowrap", __self: this, __source: {fileName: _jsxFileName, lineNumber: 285}}, _nullishCoalesce(district.province_name, () => ( "")))
                        , React.createElement(TableCell, { className: "whitespace-nowrap", __self: this, __source: {fileName: _jsxFileName, lineNumber: 286}}, _nullishCoalesce(district.division_name, () => ( "")))
                        , React.createElement(TableCell, { className: "font-semibold text-primary whitespace-nowrap"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 287}}, district.district_name)
                        , React.createElement(TableCell, { className: "text-right", __self: this, __source: {fileName: _jsxFileName, lineNumber: 288}}
                          , React.createElement('div', { className: "flex justify-end gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 289}}
                            , React.createElement(Button, {
                              variant: "ghost",
                              size: "sm",
                              onClick: () => handleEdit(district),
                              className: "h-8 border border-muted hover:bg-muted whitespace-nowrap"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 290}}

                              , React.createElement(Edit2, { className: "h-3.5 w-3.5 mr-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 296}} ), " Edit"
                            )
                            , React.createElement(Button, {
                              variant: "ghost",
                              size: "sm",
                              onClick: () => handleDelete(district.id),
                              disabled: deleteMutation.isPending,
                              className: "h-8 border border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 whitespace-nowrap"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 298}}

                              , React.createElement(Trash2, { className: "h-3.5 w-3.5 mr-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 305}} ), " Delete"
                            )
                          )
                        )
                      )
                    ))
                  )
                  , !districtsLoading && filteredDistricts.length === 0 && (
                    React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 313}}
                      , React.createElement(TableCell, { colSpan: 5, className: "h-24 text-center text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 314}}, "No districts found."

                      )
                    )
                  )
                )
              )
            )
            , !districtsLoading && filteredDistricts.length > 0 && (
              React.createElement('div', { className: "flex items-center justify-between gap-3 px-4 py-3 border-t bg-muted/10"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 323}}
                , React.createElement('div', { className: "text-xs text-muted-foreground tabular-nums"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 324}}, "Showing "
                   , startIdx + 1, "–", Math.min(startIdx + pageSize, filteredDistricts.length), " of "  , filteredDistricts.length
                )
                , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 327}}
                  , React.createElement(Button, {
                    variant: "outline",
                    size: "sm",
                    className: "h-8",
                    onClick: () => setPage((p) => Math.max(1, p - 1)),
                    disabled: safePage <= 1, __self: this, __source: {fileName: _jsxFileName, lineNumber: 328}}
, "Prev"

                  )
                  , React.createElement('div', { className: "text-xs text-muted-foreground tabular-nums min-w-[88px] text-center"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 337}}, "Page "
                     , safePage, " / "  , totalPages
                  )
                  , React.createElement(Button, {
                    variant: "outline",
                    size: "sm",
                    className: "h-8",
                    onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
                    disabled: safePage >= totalPages, __self: this, __source: {fileName: _jsxFileName, lineNumber: 340}}
, "Next"

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
