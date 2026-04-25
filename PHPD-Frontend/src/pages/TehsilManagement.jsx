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
  listProvinces as listZones,
  listDivisions as listCircles,
  listDistricts,
  listTehsils,
  createTehsil,
  updateTehsil,
  deleteTehsil,
} from "@/api";


export default function TehsilManagement() {
  const [formData, setFormData] = useState({
    zoneId: "",
    circleId: "",
    districtId: "",
    tehsil_name: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize] = useState(10);
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: zones = [], isLoading: zonesLoading } = useQuery({
    queryKey: ["zones"],
    queryFn: listZones,
  });

  const zoneIdNum = formData.zoneId ? Number(formData.zoneId) : undefined;
  const { data: circlesByZone = [] } = useQuery({
    queryKey: ["circles", zoneIdNum],
    queryFn: () => listCircles(zoneIdNum),
    enabled: !!zoneIdNum,
  });

  const circleIdNum = formData.circleId ? Number(formData.circleId) : undefined;
  const { data: districtsByCircle = [] } = useQuery({
    queryKey: ["districts", circleIdNum],
    queryFn: () => listDistricts(circleIdNum),
    enabled: !!circleIdNum,
  });

  const { data: allTehsilsRaw = [], isLoading: tehsilsLoading } = useQuery({
    queryKey: ["tehsils"],
    queryFn: () => listTehsils(),
  });
  const allTehsils = Array.isArray(allTehsilsRaw) ? allTehsilsRaw : [];

  useEffect(() => {
    if (!formData.zoneId) setFormData((f) => ({ ...f, circleId: "", districtId: "" }));
  }, [formData.zoneId]);
  useEffect(() => {
    if (!formData.circleId) setFormData((f) => ({ ...f, districtId: "" }));
  }, [formData.circleId]);

  const createMutation = useMutation({
    mutationFn: createTehsil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tehsils"] });
      setFormData({ zoneId: "", circleId: "", districtId: "", tehsil_name: "" });
      toast({ title: "Success", description: "Tehsil created successfully" });
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to create tehsil", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }


) => updateTehsil(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tehsils"] });
      setFormData({ zoneId: "", circleId: "", districtId: "", tehsil_name: "" });
      setEditingId(null);
      toast({ title: "Success", description: "Tehsil updated successfully" });
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to update tehsil", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTehsil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tehsils"] });
      toast({ title: "Deleted", description: "Tehsil removed successfully" });
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to delete tehsil", variant: "destructive" });
    },
  });

  const handleEdit = (t) => {
    setFormData({
      zoneId: String(_nullishCoalesce(t.zone, () => (t.province))),
      circleId: String(_nullishCoalesce(t.circle, () => (t.division))),
      districtId: String(t.district),
      tehsil_name: t.tehsil_name,
    });
    setEditingId(t.id);
  };

  const handleSubmit = () => {
    if (!formData.tehsil_name.trim()) {
      toast({ title: "Error", description: "Tehsil name is required", variant: "destructive" });
      return;
    }
    if (!formData.zoneId || !formData.circleId || !formData.districtId) {
      toast({ title: "Error", description: "Please select zone, circle and district", variant: "destructive" });
      return;
    }
    const zoneId = Number(formData.zoneId);
    const circleId = Number(formData.circleId);
    const districtId = Number(formData.districtId);
    if (editingId !== null) {
      updateMutation.mutate({
        id: editingId,
        payload: {
          tehsil_name: formData.tehsil_name.trim(),
          zone: zoneId,
          circle: circleId,
          district: districtId,
        },
      });
    } else {
      createMutation.mutate({
        tehsil_name: formData.tehsil_name.trim(),
        zone: zoneId,
        circle: circleId,
        district: districtId,
      });
    }
  };

  const handleCancel = () => {
    setFormData({ zoneId: "", circleId: "", districtId: "", tehsil_name: "" });
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this tehsil?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredTehsils = allTehsils.filter(
    (t) =>
      t.tehsil_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.district_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (_nullishCoalesce(_nullishCoalesce(t.circle_name, () => (t.division_name)), () => ( ""))).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (_nullishCoalesce(_nullishCoalesce(t.zone_name, () => (t.province_name)), () => ( ""))).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredTehsils.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paginatedTehsils = filteredTehsils.slice(startIdx, startIdx + pageSize);

  return (
    React.createElement(Layout, { title: "Area Hierarchy Management"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 183}}
      , React.createElement('div', { className: "flex flex-col gap-8 w-full max-w-[1400px] mx-auto min-w-0 pb-20"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 184}}
        , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 185}}
          , React.createElement('h1', { className: "text-2xl font-bold text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 186}}, "Tehsil — Add / Edit"    )
          , React.createElement('p', { className: "text-muted-foreground text-sm" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 187}}, "Select Zone → Circle → District, then enter tehsil name and click Create Tehsil."             )
        )

        , React.createElement(Card, { className: "border-none shadow-sm overflow-hidden"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 190}}
          , React.createElement('div', { className: "h-1 bg-secondary w-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 191}} )
          , React.createElement(CardHeader, { className: "pb-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 192}}
            , React.createElement(CardTitle, { className: "text-sm font-bold uppercase tracking-widest text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 193}}, "Basic Information"

            )
          )
          , React.createElement(CardContent, { className: "pt-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 197}}
            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 198}}
              , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 199}}
                , React.createElement(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 200}}, "Zone " , React.createElement('span', { className: "text-destructive", __self: this, __source: {fileName: _jsxFileName, lineNumber: 200}}, "*"))
                , React.createElement(Select, {
                  onValueChange: (v) => setFormData({ ...formData, zoneId: v, circleId: "", districtId: "" }),
                  value: formData.zoneId,
                  disabled: zonesLoading, __self: this, __source: {fileName: _jsxFileName, lineNumber: 201}}

                  , React.createElement(SelectTrigger, { className: "h-10 text-xs text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 206}}
                    , React.createElement(SelectValue, { placeholder: zones.length === 0 ? "Add zones first" : "Select zone", __self: this, __source: {fileName: _jsxFileName, lineNumber: 207}} )
                  )
                  , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 209}}
                    , zones.map((z) => (
                      React.createElement(SelectItem, { key: z.id, value: String(z.id), __self: this, __source: {fileName: _jsxFileName, lineNumber: 211}}
                        , _nullishCoalesce(z.zone_name, () => (z.province_name))
                      )
                    ))
                  )
                )
              )
              , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 218}}
                , React.createElement(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 219}}, "Circle " , React.createElement('span', { className: "text-destructive", __self: this, __source: {fileName: _jsxFileName, lineNumber: 219}}, "*"))
                , React.createElement(Select, {
                  onValueChange: (v) => setFormData({ ...formData, circleId: v, districtId: "" }),
                  value: formData.circleId,
                  disabled: !formData.zoneId, __self: this, __source: {fileName: _jsxFileName, lineNumber: 220}}

                  , React.createElement(SelectTrigger, { className: "h-10 text-xs text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 225}}
                    , React.createElement(SelectValue, { placeholder: !formData.zoneId ? "Select zone first" : "Select circle", __self: this, __source: {fileName: _jsxFileName, lineNumber: 226}} )
                  )
                  , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 228}}
                    , circlesByZone.map((c) => (
                      React.createElement(SelectItem, { key: c.id, value: String(c.id), __self: this, __source: {fileName: _jsxFileName, lineNumber: 230}}
                        , _nullishCoalesce(c.circle_name, () => (c.division_name))
                      )
                    ))
                  )
                )
              )
              , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 237}}
                , React.createElement(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 238}}, "District " , React.createElement('span', { className: "text-destructive", __self: this, __source: {fileName: _jsxFileName, lineNumber: 238}}, "*"))
                , React.createElement(Select, {
                  onValueChange: (v) => setFormData({ ...formData, districtId: v }),
                  value: formData.districtId,
                  disabled: !formData.circleId, __self: this, __source: {fileName: _jsxFileName, lineNumber: 239}}

                  , React.createElement(SelectTrigger, { className: "h-10 text-xs text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 244}}
                    , React.createElement(SelectValue, { placeholder: !formData.circleId ? "Select circle first" : "Select district", __self: this, __source: {fileName: _jsxFileName, lineNumber: 245}} )
                  )
                  , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 247}}
                    , districtsByCircle.map((d) => (
                      React.createElement(SelectItem, { key: d.id, value: String(d.id), __self: this, __source: {fileName: _jsxFileName, lineNumber: 249}}
                        , d.district_name
                      )
                    ))
                  )
                )
              )
              , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 256}}
                , React.createElement(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 257}}, "Tehsil Name "  , React.createElement('span', { className: "text-destructive", __self: this, __source: {fileName: _jsxFileName, lineNumber: 257}}, "*"))
                , React.createElement(Input, {
                  placeholder: "Enter tehsil name"  ,
                  value: formData.tehsil_name,
                  onChange: (e) => setFormData({ ...formData, tehsil_name: e.target.value }),
                  className: "h-10 text-xs" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 258}}
                )
              )
              , React.createElement('div', { className: "flex flex-col sm:flex-row gap-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 265}}
                , React.createElement(Button, {
                  onClick: handleSubmit,
                  disabled: createMutation.isPending || updateMutation.isPending,
                  className: "bg-secondary hover:bg-secondary/90 text-white w-full h-10 text-xs"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 266}}

                  , editingId !== null ? "Update Tehsil" : React.createElement(React.Fragment, null, React.createElement(Plus, { className: "h-3 w-3 mr-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 271}} ), " Create Tehsil"  )
                )
                , editingId !== null && (
                  React.createElement(Button, { variant: "outline", onClick: handleCancel, className: "w-full h-10 text-xs"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 274}}, "Cancel"

                  )
                )
              )
            )
          )
        )

        , React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 283}}
          , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 284}}
            , React.createElement('h2', { className: "text-xl font-bold text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 285}}, "Tehsil List" )
            , React.createElement('div', { className: "relative w-full sm:w-72"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 286}}
              , React.createElement(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 287}} )
              , React.createElement(Input, {
                placeholder: "Search by name .."   ,
                className: "pl-10 h-10" ,
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 288}}
              )
            )
          )

          , React.createElement(Card, { className: "border-none shadow-sm overflow-hidden"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 297}}
            , React.createElement('div', { className: "overflow-x-auto", __self: this, __source: {fileName: _jsxFileName, lineNumber: 298}}
              , React.createElement(Table, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 299}}
                , React.createElement(TableHeader, { className: "bg-muted/50", __self: this, __source: {fileName: _jsxFileName, lineNumber: 300}}
                  , React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 301}}
                    , React.createElement(TableHead, { className: "w-16", __self: this, __source: {fileName: _jsxFileName, lineNumber: 302}}, "#")
                    , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 303}}, "Zone")
                    , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 304}}, "Circle")
                    , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 305}}, "District")
                    , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 306}}, "Tehsil")
                    , React.createElement(TableHead, { className: "text-right", __self: this, __source: {fileName: _jsxFileName, lineNumber: 307}}, "Action")
                  )
                )
                , React.createElement(TableBody, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 310}}
                  , tehsilsLoading ? (
                    React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 312}}
                      , React.createElement(TableCell, { colSpan: 6, className: "text-center py-8 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 313}}, "Loading…"

                      )
                    )
                  ) : (
                    paginatedTehsils.map((tehsil, index) => (
                      React.createElement(TableRow, { key: tehsil.id, __self: this, __source: {fileName: _jsxFileName, lineNumber: 319}}
                        , React.createElement(TableCell, { className: "font-medium", __self: this, __source: {fileName: _jsxFileName, lineNumber: 320}}, startIdx + index + 1)
                        , React.createElement(TableCell, { className: "whitespace-nowrap", __self: this, __source: {fileName: _jsxFileName, lineNumber: 321}}, _nullishCoalesce(_nullishCoalesce(tehsil.zone_name, () => (tehsil.province_name)), () => ( "")))
                        , React.createElement(TableCell, { className: "whitespace-nowrap", __self: this, __source: {fileName: _jsxFileName, lineNumber: 322}}, _nullishCoalesce(_nullishCoalesce(tehsil.circle_name, () => (tehsil.division_name)), () => ( "")))
                        , React.createElement(TableCell, { className: "whitespace-nowrap", __self: this, __source: {fileName: _jsxFileName, lineNumber: 323}}, _nullishCoalesce(tehsil.district_name, () => ( "")))
                        , React.createElement(TableCell, { className: "font-semibold text-primary whitespace-nowrap"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 324}}, tehsil.tehsil_name)
                        , React.createElement(TableCell, { className: "text-right", __self: this, __source: {fileName: _jsxFileName, lineNumber: 325}}
                          , React.createElement('div', { className: "flex justify-end gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 326}}
                            , React.createElement(Button, {
                              variant: "ghost",
                              size: "sm",
                              onClick: () => handleEdit(tehsil),
                              className: "h-8 border border-muted hover:bg-muted whitespace-nowrap"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 327}}

                              , React.createElement(Edit2, { className: "h-3.5 w-3.5 mr-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 333}} ), " Edit"
                            )
                            , React.createElement(Button, {
                              variant: "ghost",
                              size: "sm",
                              onClick: () => handleDelete(tehsil.id),
                              disabled: deleteMutation.isPending,
                              className: "h-8 border border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 whitespace-nowrap"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 335}}

                              , React.createElement(Trash2, { className: "h-3.5 w-3.5 mr-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 342}} ), " Delete"
                            )
                          )
                        )
                      )
                    ))
                  )
                  , !tehsilsLoading && filteredTehsils.length === 0 && (
                    React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 350}}
                      , React.createElement(TableCell, { colSpan: 6, className: "h-24 text-center text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 351}}, "No tehsils found."

                      )
                    )
                  )
                )
              )
            )
            , !tehsilsLoading && filteredTehsils.length > 0 && (
              React.createElement('div', { className: "flex items-center justify-between gap-3 px-4 py-3 border-t bg-muted/10"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 360}}
                , React.createElement('div', { className: "text-xs text-muted-foreground tabular-nums"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 361}}, "Showing "
                   , startIdx + 1, "–", Math.min(startIdx + pageSize, filteredTehsils.length), " of "  , filteredTehsils.length
                )
                , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 364}}
                  , React.createElement(Button, {
                    variant: "outline",
                    size: "sm",
                    className: "h-8",
                    onClick: () => setPage((p) => Math.max(1, p - 1)),
                    disabled: safePage <= 1, __self: this, __source: {fileName: _jsxFileName, lineNumber: 365}}
, "Prev"

                  )
                  , React.createElement('div', { className: "text-xs text-muted-foreground tabular-nums min-w-[88px] text-center"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 374}}, "Page "
                     , safePage, " / "  , totalPages
                  )
                  , React.createElement(Button, {
                    variant: "outline",
                    size: "sm",
                    className: "h-8",
                    onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
                    disabled: safePage >= totalPages, __self: this, __source: {fileName: _jsxFileName, lineNumber: 377}}
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
