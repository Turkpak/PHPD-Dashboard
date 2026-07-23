import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, Trash2, Users, Search, ShieldCheck, UserX, Loader2, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  listStakeholders,
  createStakeholder,
  updateStakeholder,
  deleteStakeholder,
} from "@/api";

const ITEMS_PER_PAGE = 7;

// Extracted & Memoized Row Component to prevent full list re-renders on search input changes
const StakeholderRow = React.memo(({ stakeholder, onEdit, onDelete, isDeleting }) => {
  const isActive = stakeholder.status === "active";
  const avatarColors = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-purple-100 text-purple-700",
    "bg-rose-100 text-rose-700",
  ];
  
  const title = stakeholder.stakeholder_title || "";
  const colorClass = avatarColors[title.length % avatarColors.length];
  const initials = title.substring(0, 2).toUpperCase() || "SH";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-3.5 sm:px-6 sm:py-4 flex flex-col md:grid md:grid-cols-[2fr_1.5fr_1fr_100px] gap-2 md:gap-4 md:items-center transition-all hover:-translate-y-0.5 duration-300 hover:shadow-[0_10px_34px_-14px_rgba(0,0,0,0.14)] hover:border-gray-200">
      {/* Mobile Top Row: Entity + Status */}
      <div className="flex w-full md:contents items-start justify-between">
        {/* Entity */}
        <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
          <div
            className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center font-bold text-[13px] md:text-[15px] shrink-0 ring-1 ring-black/5 ${colorClass}`}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-[#101828] text-[13px] sm:text-[14px] leading-tight mb-0.5 truncate">
              {stakeholder.stakeholder_title}
            </div>
            <div className="text-[11px] sm:text-[12px] font-medium text-[#64748b] truncate">Organization Partner</div>
          </div>
        </div>

        {/* Status (Mobile only) */}
        <div className="flex md:hidden items-center shrink-0 ml-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
              isActive
                ? "bg-[#eaf5ef] text-[#054332] border-[#b9ddc8]"
                : "bg-gray-100 text-gray-600 border-gray-200"
            }`}
          >
            {isActive ? "Active" : "Disabled"}
          </span>
        </div>
      </div>

      {/* Mobile Bottom Row: Role + Actions */}
      <div className="flex w-full md:contents items-center justify-between mt-1 md:mt-0">
        {/* Role */}
        <div className="font-medium text-gray-600 text-[12px] sm:text-[13px] ml-[48px] md:ml-0 md:text-center truncate">
          {stakeholder.stakeholder_type}
        </div>

        {/* Status (Desktop only) */}
        <div className="hidden md:flex items-center justify-center">
          <span
            className={`inline-flex items-center px-3.5 py-1 rounded-[12px] text-[10px] font-bold uppercase tracking-wider border ${
              isActive
                ? "bg-[#eaf5ef] text-[#054332] border-[#b9ddc8]"
                : "bg-gray-100 text-gray-600 border-gray-200"
            }`}
          >
            {isActive ? "Active" : "Disabled"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-1 shrink-0">
          <button
            onClick={() => onEdit(stakeholder)}
            className="w-8 h-8 md:w-[36px] md:h-[36px] rounded-full flex items-center justify-center text-gray-500 border border-transparent hover:border-[#b9ddc8] hover:text-[#054332] hover:bg-[#eaf5ef] transition-colors"
            title="Edit Stakeholder"
          >
            <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => onDelete(stakeholder)}
            disabled={isDeleting}
            className="w-8 h-8 md:w-[36px] md:h-[36px] rounded-full flex items-center justify-center text-gray-500 border border-transparent hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            title="Delete Stakeholder"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" /> : <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
});

StakeholderRow.displayName = "StakeholderRow";

export default function StakeholderManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState(null);
  const [formData, setFormData] = useState({ type: "", title: "", status: "active" });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Custom Delete Dialog State
  const [deletingTarget, setDeletingTarget] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stakeholders = [], isLoading } = useQuery({
    queryKey: ["stakeholders"],
    queryFn: listStakeholders,
  });

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const closeDialog = useCallback(() => {
    setIsAddDialogOpen(false);
    setEditingStakeholder(null);
    setFormData({ type: "", title: "", status: "active" });
  }, []);

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
      setIsDeleteDialogOpen(false);
      setDeletingTarget(null);
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

  const openDeleteDialog = useCallback((stakeholder) => {
    setDeletingTarget(stakeholder);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deletingTarget?.id) {
      deleteMutation.mutate(deletingTarget.id);
    }
  }, [deletingTarget, deleteMutation]);

  const openEditDialog = useCallback((stakeholder) => {
    setEditingStakeholder(stakeholder);
    setFormData({
      type: stakeholder.stakeholder_type || "",
      title: stakeholder.stakeholder_title || "",
      status: stakeholder.status || "active",
    });
    setIsAddDialogOpen(true);
  }, []);

  // Memoized derived stakeholder filtering and counts
  const filteredStakeholders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return stakeholders.filter((s) => {
      const matchesSearch =
        !q ||
        (s.stakeholder_type && s.stakeholder_type.toLowerCase().includes(q)) ||
        (s.stakeholder_title && s.stakeholder_title.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all" || s.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [stakeholders, searchQuery, statusFilter]);

  const totalItems = filteredStakeholders.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedStakeholders = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredStakeholders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStakeholders, safeCurrentPage]);

  const activeCount = useMemo(
    () => stakeholders.filter((s) => s.status === "active").length,
    [stakeholders]
  );
  
  const disabledCount = useMemo(
    () => stakeholders.filter((s) => s.status === "disable").length,
    [stakeholders]
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const startRecord = totalItems === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
  const endRecord = Math.min(safeCurrentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <Layout title="Stakeholder Management">
      <div className="flex flex-col gap-5 w-full max-w-[1400px] mx-auto min-w-0 pb-16 px-3 sm:px-8 text-[13px]">

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-lg p-5 sm:p-6 shadow-[0_4px_24px_-8px_rgba(5,67,50,0.12)] border border-emerald-200/60 flex flex-col justify-between h-[135px] sm:h-[150px]">
            <div className="flex justify-between items-start w-full">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 tracking-widest uppercase">Overview</span>
            </div>
            <div className="mt-3 sm:mt-4">
              <div className="text-[24px] sm:text-[26px] leading-none font-bold text-emerald-900 mb-1">{stakeholders.length.toLocaleString()}</div>
              <div className="text-[11px] sm:text-[12px] font-semibold text-emerald-700">Total Stakeholders</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-sky-100 rounded-lg p-5 sm:p-6 shadow-[0_4px_24px_-8px_rgba(2,132,199,0.12)] border border-blue-200/60 flex flex-col justify-between h-[135px] sm:h-[150px]">
             <div className="flex justify-between items-start w-full">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-blue-700 tracking-widest uppercase">Engagement</span>
            </div>
            <div className="mt-3 sm:mt-4">
              <div className="text-[24px] sm:text-[26px] leading-none font-bold text-blue-900 mb-1">{activeCount.toLocaleString()}</div>
              <div className="text-[11px] sm:text-[12px] font-semibold text-blue-700">Active Members</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-lg p-5 sm:p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] border border-gray-200/60 flex flex-col justify-between h-[135px] sm:h-[150px] sm:col-span-2 md:col-span-1">
             <div className="flex justify-between items-start w-full">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-500 text-white flex items-center justify-center shadow-sm">
                <UserX className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Archived</span>
            </div>
            <div className="mt-3 sm:mt-4">
              <div className="text-[24px] sm:text-[26px] leading-none font-bold text-slate-800 mb-1">{disabledCount.toLocaleString()}</div>
              <div className="text-[11px] sm:text-[12px] font-semibold text-slate-500">Inactive/Disabled</div>
            </div>
          </div>
        </div>

        {/* Main Panel (Toolbar + List + Pagination) */}
        <div className="w-full mt-1 bg-white rounded-lg border border-gray-200/70 shadow-[0_6px_28px_-12px_rgba(0,0,0,0.08)] flex flex-col">
          {/* Responsive Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-4 sm:p-5 border-b border-gray-100/80">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="w-full bg-white border border-gray-200/70 shadow-sm rounded-lg h-10 pl-9 pr-4 text-[13px] placeholder:text-gray-400 focus-visible:ring-[#054332]"
                  placeholder="Search by name, role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-[150px] shrink-0">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 text-[12px] bg-white border-gray-200/70">
                    <div className="flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-gray-400" />
                      <SelectValue placeholder="All Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="disable">Disabled Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex w-full md:w-auto items-center shrink-0">
              <Dialog
                open={isAddDialogOpen}
                onOpenChange={(open) => {
                  setIsAddDialogOpen(open);
                  if (!open) closeDialog();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="w-full md:w-auto h-10 px-4 rounded-lg bg-[#054332] hover:bg-[#032d21] text-white font-semibold shadow-sm whitespace-nowrap transition-all text-[12px]">
                    <Plus className="w-3.5 h-3.5 mr-2" />
                    Add Stakeholder
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] w-[95vw]">
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
                        disabled={isSubmitting}
                        className="bg-[#054332] hover:bg-[#032d21] text-white h-11 rounded-xl font-bold min-w-[130px]"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving...</span>
                          </div>
                        ) : editingStakeholder ? (
                          "Update Stakeholder"
                        ) : (
                          "Add Stakeholder"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Data List */}
          <div className="w-full p-3 sm:p-4 flex-1">
            {/* Table Header Row (Desktop) */}
            <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_100px] gap-4 px-5 sm:px-6 py-3 rounded-[18px] bg-gray-50 border border-gray-100">
              <div className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase">Stakeholder Entity</div>
              <div className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase text-center pr-6">Assigned Role</div>
              <div className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase text-center pr-4">Current Status</div>
              <div className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase text-right pr-2">Actions</div>
            </div>

            {/* List of Rows */}
            {isLoading ? (
              <div className="space-y-3 mt-3">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <Skeleton key={i} className="w-full h-[72px] rounded-[16px] bg-white border border-gray-200/60 opacity-60" />
                ))}
              </div>
            ) : paginatedStakeholders.length === 0 ? (
              <div className="bg-white rounded-[20px] p-12 text-center border border-gray-200/70 text-gray-500 text-[14px] font-medium shadow-sm mt-3">
                No stakeholders found matching your criteria.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 mt-2 sm:mt-3">
                {paginatedStakeholders.map((stakeholder) => (
                  <StakeholderRow
                    key={stakeholder.id}
                    stakeholder={stakeholder}
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                    isDeleting={deleteMutation.isPending && deletingTarget?.id === stakeholder.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {!isLoading && totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100/80 bg-gray-50/50 rounded-b-lg">
              <div className="text-[12px] font-medium text-gray-500 text-center sm:text-left">
                Showing <span className="font-semibold text-gray-800">{startRecord}</span> to{" "}
                <span className="font-semibold text-gray-800">{endRecord}</span> of{" "}
                <span className="font-semibold text-gray-800">{totalItems}</span> stakeholders
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={safeCurrentPage <= 1}
                  className="h-8 px-3 text-[12px] border-gray-200 bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Previous
                </Button>

                <span className="text-[12px] font-semibold text-gray-700 px-2 min-w-[70px] text-center">
                  {safeCurrentPage} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={safeCurrentPage >= totalPages}
                  className="h-8 px-3 text-[12px] border-gray-200 bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-lg text-gray-900 font-bold">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-[13px] text-gray-600 mt-1">
              Are you sure you want to delete stakeholder{" "}
              <span className="font-semibold text-gray-900">"{deletingTarget?.stakeholder_title}"</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 flex-col-reverse sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl w-full sm:w-auto"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-10 rounded-xl font-bold min-w-[100px] w-full sm:w-auto"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}


