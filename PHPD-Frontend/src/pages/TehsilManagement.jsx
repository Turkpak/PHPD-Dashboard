import React from "react";
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
    mutationFn: ({ id, payload }) => updateTehsil(id, payload),
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
      zoneId: String(t.zone ?? t.province),
      circleId: String(t.circle ?? t.division),
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
      ((t.circle_name ?? t.division_name) ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((t.zone_name ?? t.province_name) ?? "").toLowerCase().includes(searchQuery.toLowerCase())
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
    <Layout title="Area Hierarchy Management">
      <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto min-w-0 pb-20">
        <div>
          <h1 className="text-2xl font-bold text-primary">Tehsil — Add / Edit</h1>
          <p className="text-muted-foreground text-sm">Select Zone → Circle → District, then enter tehsil name and click Create Tehsil.</p>
        </div>

        <Card className="border-none shadow-sm overflow-hidden rounded-lg">
          <div className="h-1 bg-secondary w-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Zone <span className="text-destructive">*</span>
                </Label>
                <Select
                  onValueChange={(v) => setFormData({ ...formData, zoneId: v, circleId: "", districtId: "" })}
                  value={formData.zoneId}
                  disabled={zonesLoading}
                >
                  <SelectTrigger className="h-10 text-xs text-foreground">
                    <SelectValue placeholder={zones.length === 0 ? "Add zones first" : "Select zone"} />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((z) => (
                      <SelectItem key={z.id} value={String(z.id)}>
                        {z.zone_name ?? z.province_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Circle <span className="text-destructive">*</span>
                </Label>
                <Select
                  onValueChange={(v) => setFormData({ ...formData, circleId: v, districtId: "" })}
                  value={formData.circleId}
                  disabled={!formData.zoneId}
                >
                  <SelectTrigger className="h-10 text-xs text-foreground">
                    <SelectValue placeholder={!formData.zoneId ? "Select zone first" : "Select circle"} />
                  </SelectTrigger>
                  <SelectContent>
                    {circlesByZone.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.circle_name ?? c.division_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  District <span className="text-destructive">*</span>
                </Label>
                <Select
                  onValueChange={(v) => setFormData({ ...formData, districtId: v })}
                  value={formData.districtId}
                  disabled={!formData.circleId}
                >
                  <SelectTrigger className="h-10 text-xs text-foreground">
                    <SelectValue placeholder={!formData.circleId ? "Select circle first" : "Select district"} />
                  </SelectTrigger>
                  <SelectContent>
                    {districtsByCircle.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.district_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tehsil Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Enter tehsil name"
                  value={formData.tehsil_name}
                  onChange={(e) => setFormData({ ...formData, tehsil_name: e.target.value })}
                  className="h-10 text-xs"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-secondary hover:bg-secondary/90 text-white w-full h-10 text-xs"
                >
                  {editingId !== null ? "Update Tehsil" : <><Plus className="h-3 w-3 mr-2" /> Create Tehsil</>}
                </Button>
                {editingId !== null && (
                  <Button variant="outline" onClick={handleCancel} className="w-full h-10 text-xs">
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-primary">Tehsil List</h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name .."
                className="pl-10 h-10 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Card className="border-none shadow-sm overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Circle</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Tehsil</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tehsilsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTehsils.map((tehsil, index) => (
                      <TableRow key={tehsil.id}>
                        <TableCell className="font-medium">{startIdx + index + 1}</TableCell>
                        <TableCell className="whitespace-nowrap">{(tehsil.zone_name ?? tehsil.province_name) ?? ""}</TableCell>
                        <TableCell className="whitespace-nowrap">{(tehsil.circle_name ?? tehsil.division_name) ?? ""}</TableCell>
                        <TableCell className="whitespace-nowrap">{tehsil.district_name ?? ""}</TableCell>
                        <TableCell className="font-semibold text-primary whitespace-nowrap">{tehsil.tehsil_name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(tehsil)}
                              className="h-8 border border-muted hover:bg-muted whitespace-nowrap"
                            >
                              <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(tehsil.id)}
                              disabled={deleteMutation.isPending}
                              className="h-8 border border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 whitespace-nowrap"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {!tehsilsLoading && filteredTehsils.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No tehsils found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {!tehsilsLoading && filteredTehsils.length > 0 && (
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-t bg-muted/10">
                <div className="text-xs text-muted-foreground tabular-nums">
                  Showing {startIdx + 1}–{Math.min(startIdx + pageSize, filteredTehsils.length)} of {filteredTehsils.length}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                  >
                    Prev
                  </Button>
                  <div className="text-xs text-muted-foreground tabular-nums min-w-[88px] text-center">
                    Page {safePage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
