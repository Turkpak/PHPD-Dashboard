import React from "react";
const _jsxFileName = ""; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, Users, Save, Search, LayoutList } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  listStakeholders,
  createStakeholder,
  updateStakeholder,
  deleteStakeholder,
} from "@/api";


function statusDisplay(s) {
  return s === "active" ? "Active" : "Disabled";
}

export default function StakeholderManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState(null);
  const [formData, setFormData] = useState({ type: "", title: "", status: "active"  });
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState("10");
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
    mutationFn: ({ id, payload }) =>
      updateStakeholder(id, payload),
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
    _optionalChain([e, 'optionalAccess', _2 => _2.preventDefault, 'call', _3 => _3()]);
    const typeTrimmed = formData.type.trim();
    const titleTrimmed = formData.title.trim();

    if (!typeTrimmed) {
      toast({
        title: "Validation Error",
        description: "Stakeholder Type is required. Please enter the type before adding.",
        variant: "destructive",
      });
      return;
    }
    if (!titleTrimmed) {
      toast({
        title: "Validation Error",
        description: "Stakeholder Title is required. Please enter the title before adding.",
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

  const toggleStatus = (s) => {
    const next = s.status === "active" ? "disable" : "active";
    updateMutation.mutate({ id: s.id, payload: { status: next } });
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
  const paginated = filteredStakeholders.slice(0, parseInt(pageSize, 10) || 10);

  const activeCount = stakeholders.filter((s) => s.status === "active").length;
  const disabledCount = stakeholders.filter((s) => s.status === "disable").length;

  const emptyListMessage = (
    React.createElement('div', { className: "flex flex-col items-center justify-center gap-3 py-6 px-4 text-center"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 169}}
      , React.createElement('div', { className: "h-14 w-14 rounded-full bg-muted flex items-center justify-center shrink-0"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 170}}
        , React.createElement(Users, { className: "h-7 w-7 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 171}} )
      )
      , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 173}}
        , React.createElement('p', { className: "font-medium text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 174}}, "No stakeholders found"  )
        , React.createElement('p', { className: "text-sm text-muted-foreground mt-0.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 175}}
          , searchQuery ? "Try a different search." : "Add your first stakeholder to get started."
        )
      )
      , !searchQuery && (
        React.createElement(Button, { className: "mt-1 w-full max-w-xs"  , onClick: () => setIsAddDialogOpen(true), __self: this, __source: {fileName: _jsxFileName, lineNumber: 180}}
          , React.createElement(Plus, { className: "h-4 w-4 mr-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 181}} ), " Add stakeholder"
        )
      )
    )
  );

  return (
    React.createElement(Layout, { title: "Stakeholder Management" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 188}}
      , React.createElement('div', { className: "flex flex-col gap-3 sm:gap-6 w-full max-w-[1400px] mx-auto min-w-0 pb-12 sm:pb-20"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 189}}
        , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 190}}
          , React.createElement('h1', { className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 191}}, "Stakeholders")
        )

        /* Summary stats */
        , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 195}}
          , React.createElement(Card, { className: "border-l-4 border-l-primary/80 shadow-sm"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 196}}
            , React.createElement(CardContent, { className: "pt-2 pb-2 sm:pt-5 sm:pb-5"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 197}}
              , React.createElement('div', { className: "flex items-center justify-between gap-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 198}}
                , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 199}}
                  , React.createElement('p', { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 200}}, "Total")
                  , React.createElement('p', { className: "text-lg sm:text-2xl font-bold text-foreground mt-0.5 tabular-nums"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 201}}, stakeholders.length)
                )
                , React.createElement('div', { className: "h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 203}}
                  , React.createElement(Users, { className: "h-4 w-4 sm:h-5 sm:w-5 text-primary"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 204}} )
                )
              )
            )
          )
          , React.createElement(Card, { className: "border-l-4 border-l-emerald-500/80 shadow-sm"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 209}}
            , React.createElement(CardContent, { className: "pt-2 pb-2 sm:pt-5 sm:pb-5"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 210}}
              , React.createElement('div', { className: "flex items-center justify-between gap-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 211}}
                , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 212}}
                  , React.createElement('p', { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 213}}, "Active")
                  , React.createElement('p', { className: "text-lg sm:text-2xl font-bold text-foreground mt-0.5 tabular-nums"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 214}}, activeCount)
                )
                , React.createElement('span', { className: "h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shrink-0"     , 'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 216}} )
              )
            )
          )
          , React.createElement(Card, { className: "border-l-4 border-l-slate-400/80 shadow-sm"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 220}}
            , React.createElement(CardContent, { className: "pt-2 pb-2 sm:pt-5 sm:pb-5"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 221}}
              , React.createElement('div', { className: "flex items-center justify-between gap-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 222}}
                , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 223}}
                  , React.createElement('p', { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 224}}, "Disabled")
                  , React.createElement('p', { className: "text-lg sm:text-2xl font-bold text-foreground mt-0.5 tabular-nums"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 225}}, disabledCount)
                )
                , React.createElement('span', { className: "h-2.5 w-2.5 rounded-full bg-slate-400 shadow-sm shrink-0"     , 'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 227}} )
              )
            )
          )
        )

        /* Main list card */
        , React.createElement(Card, { className: "shadow-md overflow-hidden rounded-xl border-border/80"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 234}}
          , React.createElement(CardHeader, { className: "border-b bg-muted/30 pb-3 px-4 sm:px-6 pt-3 sm:pt-6"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 235}}
            , React.createElement('div', { className: "flex flex-col gap-2 sm:gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 236}}
              , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 237}}
                , React.createElement(CardTitle, { className: "text-base sm:text-lg flex items-center gap-2 flex-wrap"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 238}}
                  , React.createElement(LayoutList, { className: "h-5 w-5 text-primary shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 239}} )
                  , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 240}}, "Stakeholder list" )
                )
                , React.createElement(CardDescription, { className: "mt-1 text-xs sm:text-sm"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 242}}, "Showing "
                   , paginated.length, " of "  , filteredStakeholders.length, " stakeholders"
                )
              )
              , React.createElement(Dialog, {
                open: isAddDialogOpen,
                onOpenChange: (open) => {
                  setIsAddDialogOpen(open);
                  if (!open) closeDialog();
                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 246}}

                , React.createElement(DialogTrigger, { asChild: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 253}}
                  , React.createElement(Button, { className: "bg-secondary hover:bg-secondary/90 text-white font-semibold shadow-sm w-full sm:w-auto"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 254}}
                    , React.createElement(Plus, { className: "h-4 w-4 mr-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 255}} ), " Add stakeholder"
                  )
                )
                , React.createElement(DialogContent, { className: "w-[calc(100vw-1.5rem)] max-w-[520px] gap-0 p-0 overflow-hidden max-h-[90vh] flex flex-col sm:max-h-[85vh]"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 258}}
                  , React.createElement(DialogHeader, { className: "px-4 sm:px-6 pt-5 sm:pt-6 pb-4 bg-muted/30 border-b shrink-0"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 259}}
                    , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 260}}
                      , editingStakeholder ? `Edit stakeholder` : `Add new stakeholder`
                    )
                    , _optionalChain([editingStakeholder, 'optionalAccess', _4 => _4.id]) && (
                      React.createElement('p', { className: "text-sm text-muted-foreground font-normal"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 264}}, "ID: " , editingStakeholder.id)
                    )
                  )
                  , React.createElement('form', { onSubmit: handleCreateOrUpdate, className: "p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 min-h-0"     , noValidate: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 267}}
                    , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 gap-5"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 268}}
                      , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 269}}
                        , React.createElement(Label, { htmlFor: "stakeholder-type", __self: this, __source: {fileName: _jsxFileName, lineNumber: 270}}, "Type " , React.createElement('span', { className: "text-destructive", __self: this, __source: {fileName: _jsxFileName, lineNumber: 270}}, "*"))
                        , React.createElement(Input, {
                          id: "stakeholder-type",
                          placeholder: "e.g. Client, Consultant"  ,
                          value: formData.type,
                          onChange: (e) => setFormData({ ...formData, type: e.target.value }),
                          className: "h-10",
                          required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 271}}
                        )
                      )
                      , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 280}}
                        , React.createElement(Label, { htmlFor: "stakeholder-title", __self: this, __source: {fileName: _jsxFileName, lineNumber: 281}}, "Title " , React.createElement('span', { className: "text-destructive", __self: this, __source: {fileName: _jsxFileName, lineNumber: 281}}, "*"))
                        , React.createElement(Input, {
                          id: "stakeholder-title",
                          placeholder: "e.g. Punjab Health & Population Department"    ,
                          value: formData.title,
                          onChange: (e) => setFormData({ ...formData, title: e.target.value }),
                          className: "h-10",
                          required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 282}}
                        )
                      )
                    )
                    , editingStakeholder && (
                      React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 293}}
                        , React.createElement(Label, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 294}}, "Status")
                        , React.createElement(Select, {
                          value: formData.status,
                          onValueChange: (v) => setFormData({ ...formData, status: v  }), __self: this, __source: {fileName: _jsxFileName, lineNumber: 295}}

                          , React.createElement(SelectTrigger, { className: "h-10", __self: this, __source: {fileName: _jsxFileName, lineNumber: 299}}
                            , React.createElement(SelectValue, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 300}} )
                          )
                          , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 302}}
                            , React.createElement(SelectItem, { value: "active", __self: this, __source: {fileName: _jsxFileName, lineNumber: 303}}, "Active")
                            , React.createElement(SelectItem, { value: "disable", __self: this, __source: {fileName: _jsxFileName, lineNumber: 304}}, "Disabled")
                          )
                        )
                      )
                    )
                    , React.createElement(DialogFooter, { className: "flex flex-col-reverse gap-2 pt-4 pb-0 px-0 sm:flex-row sm:justify-end"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 309}}
                      , React.createElement(Button, { type: "button", variant: "outline", onClick: closeDialog, className: "w-full sm:w-auto" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 310}}, "Cancel"

                      )
                      , React.createElement(Button, {
                        type: "submit",
                        disabled: createMutation.isPending || updateMutation.isPending,
                        className: "bg-secondary hover:bg-secondary/90 text-white w-full sm:w-auto"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 313}}

                        , React.createElement(Save, { className: "h-4 w-4 mr-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 318}} )
                        , editingStakeholder ? "Update" : "Add"
                      )
                    )
                  )
                )
              )
            )
          )
          , React.createElement(CardContent, { className: "p-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 327}}
            /* Toolbar: search + page size */
            , React.createElement('div', { className: "flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-4 border-b bg-muted/20 min-w-0"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 329}}
              , React.createElement('div', { className: "relative flex-1 min-w-0"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 330}}
                , React.createElement(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 331}} )
                , React.createElement(Input, {
                  placeholder: "Search by type or title…"    ,
                  className: "pl-9 h-10 min-h-10 bg-background border-muted-foreground/20 w-full"     ,
                  value: searchQuery,
                  onChange: (e) => setSearchQuery(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 332}}
                )
              )
              , React.createElement('div', { className: "flex items-center gap-2 shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 339}}
                , React.createElement('span', { className: "text-xs sm:text-sm text-muted-foreground whitespace-nowrap"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 340}}
                  , React.createElement('span', { className: "hidden sm:inline" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 341}}, "Rows per page"  )
                  , React.createElement('span', { className: "sm:hidden", __self: this, __source: {fileName: _jsxFileName, lineNumber: 342}}, "Rows")
                )
                , React.createElement(Select, { value: pageSize, onValueChange: setPageSize, __self: this, __source: {fileName: _jsxFileName, lineNumber: 344}}
                  , React.createElement(SelectTrigger, { className: "w-[76px] sm:w-[88px] h-10 min-h-10"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 345}}
                    , React.createElement(SelectValue, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 346}} )
                  )
                  , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 348}}
                    , React.createElement(SelectItem, { value: "5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 349}}, "5")
                    , React.createElement(SelectItem, { value: "10", __self: this, __source: {fileName: _jsxFileName, lineNumber: 350}}, "10")
                    , React.createElement(SelectItem, { value: "25", __self: this, __source: {fileName: _jsxFileName, lineNumber: 351}}, "25")
                    , React.createElement(SelectItem, { value: "50", __self: this, __source: {fileName: _jsxFileName, lineNumber: 352}}, "50")
                  )
                )
              )
            )

            /* Mobile: card list */
            , React.createElement('div', { className: "md:hidden border-t border-border/60"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 359}}
              , isLoading ? (
                React.createElement('div', { className: "p-2 space-y-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 361}}
                  , Array.from({ length: 4 }).map((_, i) => (
                    React.createElement('div', { key: i, className: "rounded-lg border bg-card p-2 space-y-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 363}}
                      , React.createElement(Skeleton, { className: "h-4 w-20" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 364}} )
                      , React.createElement(Skeleton, { className: "h-5 w-full" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 365}} )
                      , React.createElement(Skeleton, { className: "h-5 w-3/4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 366}} )
                      , React.createElement('div', { className: "flex justify-end gap-2 pt-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 367}}
                        , React.createElement(Skeleton, { className: "h-10 w-10 rounded-md"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 368}} )
                        , React.createElement(Skeleton, { className: "h-10 w-10 rounded-md"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 369}} )
                      )
                    )
                  ))
                )
              ) : paginated.length === 0 ? (
                emptyListMessage
              ) : (
                React.createElement('div', { className: "p-3 space-y-3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 377}}
                  , paginated.map((stakeholder, index) => {
                    const isActive = stakeholder.status === "active";
                    const accentBorder = isActive ? "border-l-emerald-500" : "border-l-slate-400";
                    const statusClasses = isActive
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200"
                      : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200";

                    return (
                      React.createElement(Card, {
                        key: stakeholder.id,
                        className: cn(
                          "rounded-xl border border-border/80 bg-gradient-to-b from-card to-muted/15 shadow-sm overflow-hidden border-l-4",
                          accentBorder,
                        ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 386}}

                        , React.createElement(CardHeader, { className: "pb-2 pt-3 px-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 393}}
                          , React.createElement('div', { className: "flex items-start justify-between gap-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 394}}
                            , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 395}}
                              , React.createElement(CardTitle, { className: "text-sm font-semibold leading-tight break-words"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 396}}
                                , stakeholder.stakeholder_title
                              )
                              , React.createElement(CardDescription, { className: "text-xs mt-1 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 399}}, "Type: "
                                 , React.createElement('span', { className: "font-medium text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 400}}, stakeholder.stakeholder_type)
                              )
                            )
                            , React.createElement('button', {
                              type: "button",
                              onClick: () => toggleStatus(stakeholder),
                              disabled: updateMutation.isPending,
                              className: cn(
                                "shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border-0",
                                statusClasses,
                              ),
                              'aria-label': "Toggle stakeholder status"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 403}}

                              , React.createElement('span', {
                                className: cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  isActive ? "bg-emerald-600" : "bg-slate-500",
                                ),
                                'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 413}}
                              )
                              , statusDisplay(stakeholder.status)
                            )
                          )
                        )

                        , React.createElement(CardContent, { className: "px-4 pb-4 pt-0 space-y-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 425}}
                          , React.createElement('div', { className: "flex items-center justify-between text-xs text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 426}}
                            , React.createElement('span', { className: "tabular-nums", __self: this, __source: {fileName: _jsxFileName, lineNumber: 427}}, "#", index + 1)
                          )

                          , React.createElement('div', { className: "grid grid-cols-2 gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 430}}
                            , React.createElement(Button, {
                              type: "button",
                              variant: "default",
                              className: "w-full",
                              onClick: () => openEditDialog(stakeholder),
                              disabled: updateMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 431}}

                              , React.createElement(Edit2, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 438}} ), "Edit"

                            )
                            , React.createElement(Button, {
                              type: "button",
                              variant: "outline",
                              className: "w-full text-destructive border-destructive/20 hover:bg-destructive/10"   ,
                              onClick: () => handleDelete(stakeholder.id),
                              disabled: deleteMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 441}}

                              , React.createElement(Trash2, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 448}} ), "Delete"

                            )
                          )
                        )
                      )
                    );
                  })
                )
              )
            )

            /* Desktop: table */
            , React.createElement('div', { className: "hidden md:block overflow-x-auto overflow-x-touch scrollbar-hide"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 461}}
              , React.createElement(Table, { className: "min-w-[640px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 462}}
                , React.createElement(TableHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 463}}
                  , React.createElement(TableRow, { className: "bg-muted/40 hover:bg-muted/40 border-b"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 464}}
                    , React.createElement(TableHead, { className: "w-14 font-semibold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 465}}, "#")
                    , React.createElement(TableHead, { className: "font-semibold text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 466}}, "Type")
                    , React.createElement(TableHead, { className: "font-semibold text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 467}}, "Title")
                    , React.createElement(TableHead, { className: "font-semibold text-foreground text-center w-[120px]"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 468}}, "Status")
                    , React.createElement(TableHead, { className: "font-semibold text-foreground text-right w-[120px]"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 469}}, "Actions")
                  )
                )
                , React.createElement(TableBody, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 472}}
                  , isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      React.createElement(TableRow, { key: i, __self: this, __source: {fileName: _jsxFileName, lineNumber: 475}}
                        , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 476}}, React.createElement(Skeleton, { className: "h-5 w-6" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 476}} ))
                        , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 477}}, React.createElement(Skeleton, { className: "h-5 w-24" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 477}} ))
                        , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 478}}, React.createElement(Skeleton, { className: "h-5 w-40" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 478}} ))
                        , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 479}}, React.createElement(Skeleton, { className: "h-6 w-16 mx-auto"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 479}} ))
                        , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 480}}, React.createElement(Skeleton, { className: "h-8 w-20 ml-auto"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 480}} ))
                      )
                    ))
                  ) : paginated.length > 0 ? (
                    paginated.map((stakeholder, index) => (
                      React.createElement(TableRow, {
                        key: stakeholder.id,
                        className: "group hover:bg-muted/30 transition-colors"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 485}}

                        , React.createElement(TableCell, { className: "font-medium text-muted-foreground tabular-nums"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 489}}
                          , index + 1
                        )
                        , React.createElement(TableCell, { className: "font-medium text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 492}}
                          , stakeholder.stakeholder_type
                        )
                        , React.createElement(TableCell, { className: "text-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 495}}
                          , stakeholder.stakeholder_title
                        )
                        , React.createElement(TableCell, { className: "text-center", __self: this, __source: {fileName: _jsxFileName, lineNumber: 498}}
                          , React.createElement('button', {
                            type: "button",
                            onClick: () => toggleStatus(stakeholder),
                            disabled: updateMutation.isPending,
                            className: cn(
                              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                              stakeholder.status === "active"
                                ? "border-transparent bg-primary text-primary-foreground"
                                : "border-slate-200 bg-slate-100 text-slate-700"
                            ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 499}}

                            , React.createElement('span', {
                              className: cn(
                                "h-1.5 w-1.5 rounded-full shrink-0",
                                stakeholder.status === "active" ? "bg-primary-foreground/80" : "bg-slate-500"
                              ),
                              'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 510}}
                            )
                            , statusDisplay(stakeholder.status)
                          )
                        )
                        , React.createElement(TableCell, { className: "text-right", __self: this, __source: {fileName: _jsxFileName, lineNumber: 520}}
                          , React.createElement('div', { className: "flex justify-end gap-1.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 521}}
                            , React.createElement(Tooltip, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 522}}
                              , React.createElement(TooltipTrigger, { asChild: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 523}}
                                , React.createElement(Button, {
                                  size: "icon",
                                  variant: "ghost",
                                  className: "h-8 w-8 text-primary hover:bg-primary/10"   ,
                                  onClick: () => openEditDialog(stakeholder),
                                  disabled: updateMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 524}}

                                  , React.createElement(Edit2, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 531}} )
                                )
                              )
                              , React.createElement(TooltipContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 534}}, "Edit")
                            )
                            , React.createElement(Tooltip, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 536}}
                              , React.createElement(TooltipTrigger, { asChild: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 537}}
                                , React.createElement(Button, {
                                  size: "icon",
                                  variant: "ghost",
                                  className: "h-8 w-8 text-destructive hover:bg-destructive/10"   ,
                                  onClick: () => handleDelete(stakeholder.id),
                                  disabled: deleteMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 538}}

                                  , React.createElement(Trash2, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 545}} )
                                )
                              )
                              , React.createElement(TooltipContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 548}}, "Delete")
                            )
                          )
                        )
                      )
                    ))
                  ) : (
                    React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 555}}
                      , React.createElement(TableCell, { colSpan: 5, className: "p-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 556}}
                        , emptyListMessage
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
