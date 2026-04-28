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

  const { data: zones = [], isLoading } = useQuery({
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
    mutationFn: ({ id, payload }) => updateProvince(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provinces"] });
      setProvinceName("");
      setEditingId(null);
      toast({ title: "Success", description: "Zone updated successfully" });
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to update Zone", variant: "destructive" });
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
    setProvinceName(p.zone_name);
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

  const filteredZones = zones.filter((z) =>
    z.zone_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout title="Area Hierarchy Management">
      <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto min-w-0 pb-20">
        <div>
          <h1 className="text-2xl font-bold text-primary">Zone — Add / Edit</h1>
          <p className="text-muted-foreground text-sm">Create a new Zone or edit an existing one.</p>
        </div>

        {(canCreate || (canUpdate && editingId !== null)) && (
          <Card className="border-none shadow-sm overflow-hidden rounded-lg">
            <div className="h-1 bg-secondary w-full" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <Label htmlFor="Zone-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Zone Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="Zone-name"
                    placeholder="e.g. Punjab Zone"
                    value={provinceName}
                    onChange={(e) => setProvinceName(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="flex flex-row gap-2 min-w-0">
                  {canCreate && editingId === null && (
                    <Button
                      onClick={handleSubmit}
                      disabled={createMutation.isPending}
                      className="bg-secondary hover:bg-secondary/90 text-white flex-1 h-10 min-w-0"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Create Zone
                    </Button>
                  )}
                  {canUpdate && editingId !== null && (
                    <>
                      <Button
                        onClick={handleSubmit}
                        disabled={updateMutation.isPending}
                        className="bg-secondary hover:bg-secondary/90 text-white flex-1 h-10 min-w-0"
                      >
                        Update Zone
                      </Button>
                      <Button variant="outline" onClick={handleCancel} className="flex-1 h-10 min-w-0">
                        Cancel
                      </Button>
                    </>
                  )}
                  {editingId === null && canCreate && (
                    <Button
                      variant="outline"
                      onClick={() => setProvinceName("")}
                      className="flex-1 h-10 min-w-0 text-red-600 bg-white hover:bg-red-50 border-red-200 hover:border-red-300 text-xs font-semibold"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-primary">Zone List</h2>
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
                    <TableHead className="w-24">ID</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : filteredZones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No zones found. Create one above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredZones.map((zone, index) => (
                      <TableRow key={zone.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">{zone.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xs shrink-0">
                              {zone.zone_name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="truncate">{zone.zone_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canUpdate && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(zone)}
                                className="h-8 border border-muted hover:bg-muted whitespace-nowrap"
                              >
                                <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(zone.id)}
                                disabled={deleteMutation.isPending}
                                className="h-8 border border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 whitespace-nowrap"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                              </Button>
                            )}
                            {!canUpdate && !canDelete && <span className="text-muted-foreground text-sm">—</span>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
