import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, Trash2, Users, Save, Search, ShieldCheck, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  listStakeholders,
  createStakeholder,
  updateStakeholder,
  deleteStakeholder,
} from "@/api";

export default function StakeholderManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState(null);
  const [formData, setFormData] = useState({ type: "", title: "", status: "active" });
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stakeholders = [], isLoading } = useQuery({
    queryKey: ["stakeholders"],
    queryFn: listStakeholders,
  });

  const createMutation = useMutation({
    mutationFn: createStakeholder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stakeholders"] });
      closeDialog();
      toast({ title: "Success", description: "Stakeholder added successfully" });
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to add stakeholder", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateStakeholder(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stakeholders"] });
      closeDialog();
      toast({ title: "Success", description: "Stakeholder updated successfully" });
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to update stakeholder", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStakeholder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stakeholders"] });
      toast({ title: "Deleted", description: "Stakeholder removed successfully" });
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to delete stakeholder", variant: "destructive" });
    },
  });

  const handleCreateOrUpdate = (e) => {
    e?.preventDefault();
    const typeTrimmed = formData.type.trim();
    const titleTrimmed = formData.title.trim();

    if (!typeTrimmed || !titleTrimmed) {
      toast({
        title: "Validation Error",
        description: "Stakeholder Type and Title are required.",
        variant: "destructive",
      });
      return;
    }

    if (editingStakeholder) {
      updateMutation.mutate({
        id: editingStakeholder.id,
        payload: {
          stakeholder_type: typeTrimmed,
          stakeholder_title: titleTrimmed,
          status: formData.status,
        },
      });
    } else {
      createMutation.mutate({
        stakeholder_type: typeTrimmed,
        stakeholder_title: titleTrimmed,
      });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this stakeholder?")) {
      deleteMutation.mutate(id);
    }
  };

  const openEditDialog = (stakeholder) => {
    setEditingStakeholder(stakeholder);
    setFormData({
      type: stakeholder.stakeholder_type,
      title: stakeholder.stakeholder_title,
      status: stakeholder.status,
    });
    setIsAddDialogOpen(true);
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setEditingStakeholder(null);
    setFormData({ type: "", title: "", status: "active" });
  };

  const filteredStakeholders = stakeholders.filter(
    (s) =>
      s.stakeholder_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.stakeholder_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = stakeholders.filter((s) => s.status === "active").length;
  const disabledCount = stakeholders.filter((s) => s.status === "disable").length;

  return (
    <Layout title="Stakeholder Management">
      <div className="flex flex-col gap-5 w-full max-w-[1400px] mx-auto min-w-0 pb-16 px-4 sm:px-8 text-[13px] sm:text-[13px]">

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col justify-between h-[150px]">
            <div className="flex justify-between items-start w-full">
              <div className="w-11 h-11 rounded-xl bg-[#f0fdf4] text-[#054332] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Overview</span>
            </div>
            <div className="mt-4">
              <div className="text-[26px] leading-none font-bold text-[#101828] mb-1">{stakeholders.length.toLocaleString()}</div>
              <div className="text-[12px] font-semibold text-[#64748b]">Total Stakeholders</div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col justify-between h-[150px]">
             <div className="flex justify-between items-start w-full">
              <div className="w-11 h-11 rounded-xl bg-[#f0f9ff] text-[#0284c7] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Engagement</span>
            </div>
            <div className="mt-4">
              <div className="text-[26px] leading-none font-bold text-[#101828] mb-1">{activeCount.toLocaleString()}</div>
              <div className="text-[12px] font-semibold text-[#64748b]">Active Members</div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col justify-between h-[150px]">
             <div className="flex justify-between items-start w-full">
              <div className="w-11 h-11 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center">
                <UserX className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">Archived</span>
            </div>
            <div className="mt-4">
              <div className="text-[26px] leading-none font-bold text-[#101828] mb-1">{disabledCount.toLocaleString()}</div>
              <div className="text-[12px] font-semibold text-[#64748b]">Inactive/Disabled</div>
            </div>
          </div>
        </div>

        {/* Main Panel (Toolbar + List) */}
        <div className="w-full mt-1 bg-white rounded-[24px] border border-gray-200/70 shadow-[0_6px_28px_-12px_rgba(0,0,0,0.08)]">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-b border-gray-100/80">
            <div className="relative w-full max-w-[620px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                className="w-full bg-white border border-gray-200/70 shadow-sm rounded-full h-[46px] pl-[48px] pr-5 text-[13px] placeholder:text-gray-400 focus-visible:ring-[#054332]"
                placeholder="Search by name, role, or organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex w-full sm:w-auto items-center gap-3">
              <Dialog
                open={isAddDialogOpen}
                onOpenChange={(open) => {
                  setIsAddDialogOpen(open);
                  if (!open) closeDialog();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="h-9 px-4 rounded-full bg-[#054332] hover:bg-[#032d21] text-white font-semibold shadow-sm whitespace-nowrap transition-all text-[12px]">
                    <Plus className="w-3.5 h-3.5 mr-2" />
                    Add Stakeholder
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      {editingStakeholder ? "Edit Stakeholder" : "Add New Stakeholder"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateOrUpdate} className="space-y-6 py-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-semibold text-gray-700">
                          Name (Title) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          placeholder="e.g. Julian Vane"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                          className="h-12 bg-gray-50/50 border-gray-200/70"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold text-gray-700">
                          Role (Type) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          placeholder="e.g. Strategic Advisor"
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          required
                          className="h-12 bg-gray-50/50 border-gray-200/70"
                        />
                      </div>
                      {editingStakeholder && (
                        <div className="space-y-2">
                          <Label className="font-semibold text-gray-700">Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(v) => setFormData({ ...formData, status: v })}
                          >
                            <SelectTrigger className="h-12 bg-gray-50/50 border-gray-200/70">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="disable">Disabled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={closeDialog}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="bg-[#054332] text-white h-11 rounded-xl font-bold"
                      >
                        {editingStakeholder ? "Update Stakeholder" : "Add Stakeholder"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Data List */}
          <div className="w-full p-3 sm:p-4">
            {/* Table Header Row */}
            <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_100px] gap-4 px-5 sm:px-6 py-3 rounded-[18px] bg-gray-50 border border-gray-100">
              <div className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase">Stakeholder Entity</div>
              <div className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase text-center pr-6">Assigned Role</div>
              <div className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase text-center pr-4">Current Status</div>
              <div className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase text-right pr-2">Actions</div>
            </div>

            {/* List of Rows */}
            {isLoading ? (
              <div className="space-y-3 mt-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="w-full h-[88px] rounded-[20px] bg-white border border-gray-200/60 opacity-60" />
                ))}
              </div>
            ) : filteredStakeholders.length === 0 ? (
              <div className="bg-white rounded-[20px] p-14 text-center border border-gray-200/70 text-gray-500 text-[15px] font-medium shadow-sm mt-3">
                No stakeholders found matching your criteria.
              </div>
            ) : (
              <div className="flex flex-col gap-3 mt-3">
                {filteredStakeholders.map((stakeholder) => {
                  const isActive = stakeholder.status === "active";
                  const avatarColors = [
                    "bg-blue-100 text-blue-700",
                    "bg-emerald-100 text-emerald-700",
                    "bg-amber-100 text-amber-700",
                    "bg-purple-100 text-purple-700",
                    "bg-rose-100 text-rose-700",
                  ];
                  const colorClass = avatarColors[stakeholder.stakeholder_title.length % avatarColors.length];
                  const initials = stakeholder.stakeholder_title.substring(0, 2).toUpperCase();

                  return (
                    <div
                      key={stakeholder.id}
                      className="bg-white rounded-[20px] shadow-sm border border-gray-200/60 py-4 px-5 sm:px-6 grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_100px] gap-4 items-center transition-all hover:-translate-y-0.5 duration-300 hover:shadow-[0_10px_34px_-14px_rgba(0,0,0,0.14)] hover:border-gray-200"
                    >
                      {/* Entity Column */}
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-[48px] h-[48px] rounded-full flex items-center justify-center font-bold text-[16px] shrink-0 ring-1 ring-black/5 ${colorClass}`}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="font-bold text-[#101828] text-[14px] leading-tight mb-0.5">
                            {stakeholder.stakeholder_title}
                          </div>
                          <div className="text-[12px] font-medium text-[#64748b]">Organization Partner</div>
                        </div>
                      </div>

                      {/* Role Column */}
                      <div className="font-semibold text-gray-700 text-[13px] text-left md:text-center">
                        {stakeholder.stakeholder_type}
                      </div>

                      {/* Status Column */}
                      <div className="flex items-center md:justify-center">
                        <span
                          className={`inline-flex items-center px-4 py-1.5 rounded-[12px] text-[10px] font-bold uppercase tracking-wider border ${
                            isActive
                              ? "bg-[#eaf5ef] text-[#054332] border-[#b9ddc8]"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                        >
                          {isActive ? "Active" : "Disabled"}
                        </span>
                      </div>

                      {/* Actions Column */}
                      <div className="flex items-center md:justify-end gap-1">
                        <button
                          onClick={() => openEditDialog(stakeholder)}
                          className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-gray-500 border border-transparent hover:border-[#b9ddc8] hover:text-[#054332] hover:bg-[#eaf5ef] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(stakeholder.id)}
                          className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-gray-500 border border-transparent hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
