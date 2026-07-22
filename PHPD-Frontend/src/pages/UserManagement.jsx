import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  listStakeholders,
  createUser,
  listUsers,
  createUserPermission,
  getUsersWithPermissions,
  updateUserPermission,
} from "@/api";
import { UserPlus, Users, ShieldAlert, ListChecks, UserCog, ChevronLeft, ChevronRight, ChevronDown, Loader2 } from "lucide-react";

/** Normalize role from login */
function isSuperAdminRole(role) {
  if (!role) return false;
  const r = role.trim().toLowerCase();
  return r === "super_admin" || r === "super admin";
}

/** Permission rows for Step 2 (Add User) & Page Permissions Table */
const ADD_USER_PERMISSION_ROWS = [
  { sidebar_label: "Citywise Progress", sub_label: null, displayLabel: "Dashboard" },
  { sidebar_label: "Stakeholders", sub_label: null, displayLabel: "Stakeholders" },

  // Area Management (tree)
  { sidebar_label: "Area Management", sub_label: null, displayLabel: "Area Management", kind: "group", groupId: "area" },
  { sidebar_label: "Area Management", sub_label: "Zone", displayLabel: "Zone", indent: 1, kind: "item", groupId: "area" },
  { sidebar_label: "Area Management", sub_label: "Circle", displayLabel: "Circle", indent: 1, kind: "item", groupId: "area" },
  { sidebar_label: "Area Management", sub_label: "District", displayLabel: "District", indent: 1, kind: "item", groupId: "area" },
  { sidebar_label: "Area Management", sub_label: "Tehsil", displayLabel: "Tehsil", indent: 1, kind: "item", groupId: "area" },

  // Projects (tree)
  { sidebar_label: "Project Management", sub_label: null, displayLabel: "Projects", kind: "group", groupId: "projects" },
  { sidebar_label: "Project Management", sub_label: "Create", displayLabel: "Create New Project", indent: 1, kind: "item", groupId: "projects" },
  { sidebar_label: "Project Management", sub_label: "View", displayLabel: "View All Projects", indent: 1, kind: "item", groupId: "projects" },

  { sidebar_label: "Finance & Budget", sub_label: null, displayLabel: "Finance & Budget" },
  { sidebar_label: "GIS Layers", sub_label: null, displayLabel: "GIS Layers" },
  { sidebar_label: "User Management", sub_label: null, displayLabel: "User Management" },
];

function permissionRowKey(sidebar_label, sub_label) {
  return `${sidebar_label}|${sub_label || ""}`;
}

export default function UserManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentRole = (user?.role || localStorage.getItem("userRole") || "").trim().toLowerCase();
  const isSuperAdmin = isSuperAdminRole(user?.role) || isSuperAdminRole(localStorage.getItem("userRole"));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [addUserStep, setAddUserStep] = useState(1);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [stakeholderId, setStakeholderId] = useState("");
  const [newUserPermissions, setNewUserPermissions] = useState({});

  const [selectedUserIdForPermissions, setSelectedUserIdForPermissions] = useState(null);
  const [updatingPermKey, setUpdatingPermKey] = useState(null); // track specific pending checkbox
  const [usersPage, setUsersPage] = useState(1);
  const USERS_PER_PAGE = 6;
  const [nameComboboxOpen, setNameComboboxOpen] = useState(false);

  const [expandedGroups, setExpandedGroups] = useState({
    area: true,
    projects: true,
  });

  const visiblePermissionRows = useMemo(() => {
    return ADD_USER_PERMISSION_ROWS.filter((r) => {
      if (r.kind === "group") return true;
      if (r.groupId === "area") return expandedGroups.area;
      if (r.groupId === "projects") return expandedGroups.projects;
      return true;
    });
  }, [expandedGroups]);

  const { data: stakeholders = [] } = useQuery({
    queryKey: ["stakeholders"],
    queryFn: listStakeholders,
  });

  const roleStakeholders = useMemo(
    () => stakeholders.filter((s) => s.stakeholder_type === "Consultant" || s.stakeholder_type === "Contractor"),
    [stakeholders]
  );

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
  });

  const { data: usersWithPermissions = [], isLoading: usersWithPermissionsLoading } = useQuery({
    queryKey: ["users-with-permissions"],
    queryFn: getUsersWithPermissions,
  });

  const pagePermissionsCardRef = useRef(null);

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.id - b.id),
    [users]
  );

  const totalUsersPages = Math.max(1, Math.ceil(sortedUsers.length / USERS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const start = (usersPage - 1) * USERS_PER_PAGE;
    return sortedUsers.slice(start, start + USERS_PER_PAGE);
  }, [sortedUsers, usersPage]);

  useEffect(() => {
    if (usersPage > totalUsersPages && totalUsersPages >= 1) {
      setUsersPage(totalUsersPages);
    }
  }, [usersPage, totalUsersPages]);

  const resetForm = useCallback(() => {
    setEmail("");
    setFirstName("");
    setLastName("");
    setPassword("");
    setStakeholderId("");
    setAddUserStep(1);
    setNewUserPermissions({});
  }, []);

  const getNewUserPerm = (sidebar_label, sub_label) => {
    const key = permissionRowKey(sidebar_label, sub_label);
    return newUserPermissions[key] || { create: false, read: false, update: false, delete: false };
  };

  const setNewUserPerm = (sidebar_label, sub_label, key, value) => {
    const rowKey = permissionRowKey(sidebar_label, sub_label);
    setNewUserPermissions((prev) => {
      const current = prev[rowKey] || { create: false, read: false, update: false, delete: false };
      return { ...prev, [rowKey]: { ...current, [key]: value } };
    });
  };

  const handleSubmitStep1 = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Validation Error", description: "Email is required.", variant: "destructive" });
      return;
    }
    if (!firstName.trim()) {
      toast({ title: "Validation Error", description: "First name is required.", variant: "destructive" });
      return;
    }
    if (!lastName.trim()) {
      toast({ title: "Validation Error", description: "Last name is required.", variant: "destructive" });
      return;
    }
    if (!password || password.length < 8) {
      toast({ title: "Validation Error", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (!stakeholderId) {
      toast({ title: "Validation Error", description: "Please select a role.", variant: "destructive" });
      return;
    }
    setAddUserStep(2);
  };

  const [isCreatingWithPermissions, setIsCreatingWithPermissions] = useState(false);

  const handleCreateUserWithPermissions = async (e) => {
    e.preventDefault();
    const selectedStakeholder = roleStakeholders.find((s) => String(s.id) === stakeholderId);
    const role = selectedStakeholder ? selectedStakeholder.stakeholder_type.toLowerCase() : "";
    setIsCreatingWithPermissions(true);

    try {
      const res = await createUser({
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password,
        role,
        stakeholder: Number(stakeholderId),
      });

      const userId = res.user.id;
      const permissionPromises = [];

      for (const row of ADD_USER_PERMISSION_ROWS) {
        const p = getNewUserPerm(row.sidebar_label, row.sub_label);
        const hasAny = p.read || p.create || p.update || p.delete;
        if (!hasAny) continue;

        permissionPromises.push(
          createUserPermission({
            user: userId,
            sidebar_label: row.sidebar_label,
            sub_label: row.sub_label,
            can_view: !!p.read,
            can_create: !!p.create,
            can_update: !!p.update,
            can_delete: !!p.delete,
          })
        );
      }

      await Promise.all(permissionPromises);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-with-permissions"] });
      toast({ title: "Success", description: "User and permissions created successfully." });
      resetForm();
      setDialogOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create user or permissions",
        variant: "destructive",
      });
    } finally {
      setIsCreatingWithPermissions(false);
    }
  };

  const handleAddUserSubmit = (e) => {
    if (addUserStep === 1) handleSubmitStep1(e);
    else handleCreateUserWithPermissions(e);
  };

  const getStakeholderLabel = (id) => {
    if (id == null) return "—";
    const s = stakeholders.find((st) => st.id === id);
    return s ? `${s.stakeholder_title} (${s.stakeholder_type})` : String(id);
  };

  const formatRole = (role) => {
    if (!role) return "—";
    const r = role.trim().toLowerCase();
    if (r === "super_admin") return "Super Admin";
    if (r === "contractor") return "Contractor";
    if (r === "consultant") return "Consultant";
    return role;
  };

  const usersForPermissionView = useMemo(
    () =>
      usersWithPermissions.filter((u) => {
        const r = (u.role || "").trim().toLowerCase();
        return r === "consultant" || r === "contractor";
      }),
    [usersWithPermissions]
  );

  const selectedUserWithPermissions = useMemo(
    () => usersWithPermissions.find((u) => u.user_id === selectedUserIdForPermissions) || null,
    [usersWithPermissions, selectedUserIdForPermissions]
  );

  /** Optimistic & Non-Recursive Permission Toggle Handler */
  const handlePermissionToggle = async (sidebar_label, sub_label, key, value) => {
    if (!selectedUserWithPermissions) return;
    const userId = selectedUserWithPermissions.user_id;
    const toggleKey = `${userId}|${sidebar_label}|${sub_label || ""}|${key}`;
    setUpdatingPermKey(toggleKey);

    const previousData = queryClient.getQueryData(["users-with-permissions"]);

    const targetPerm = selectedUserWithPermissions.permissions.find(
      (p) => p.sidebar_label === sidebar_label && (p.sub_label || "") === (sub_label || "")
    );

    // 1. Optimistically update query cache immediately (UI responds instantly)
    queryClient.setQueryData(["users-with-permissions"], (oldData = []) => {
      return oldData.map((u) => {
        if (u.user_id !== userId) return u;

        let updatedPermissions;
        if (targetPerm) {
          updatedPermissions = u.permissions.map((p) => {
            if (p.sidebar_label === sidebar_label && (p.sub_label || "") === (sub_label || "")) {
              return { ...p, [key]: value };
            }
            return p;
          });
        } else {
          const newPerm = {
            id: `temp-${Date.now()}`,
            user: userId,
            sidebar_label,
            sub_label: sub_label || null,
            can_view: key === "can_view" ? value : false,
            can_create: key === "can_create" ? value : false,
            can_update: key === "can_update" ? value : false,
            can_delete: key === "can_delete" ? value : false,
          };
          updatedPermissions = [...u.permissions, newPerm];
        }

        return { ...u, permissions: updatedPermissions };
      });
    });

    // 2. Perform API call in background without query invalidation loop
    try {
      let response;
      if (targetPerm && !String(targetPerm.id).startsWith("temp-")) {
        const payload = {
          user: userId,
          sidebar_label,
          sub_label: sub_label || undefined,
          can_view: key === "can_view" ? value : targetPerm.can_view,
          can_create: key === "can_create" ? value : targetPerm.can_create,
          can_update: key === "can_update" ? value : targetPerm.can_update,
          can_delete: key === "can_delete" ? value : targetPerm.can_delete,
        };
        response = await updateUserPermission(targetPerm.id, payload);
      } else {
        response = await createUserPermission({
          user: userId,
          sidebar_label,
          sub_label: sub_label || undefined,
          can_view: key === "can_view" ? value : false,
          can_create: key === "can_create" ? value : false,
          can_update: key === "can_update" ? value : false,
          can_delete: key === "can_delete" ? value : false,
        });
      }

      // Update temp perm ID with real ID from backend
      if (response && response.id) {
        queryClient.setQueryData(["users-with-permissions"], (oldData = []) => {
          return oldData.map((u) => {
            if (u.user_id !== userId) return u;
            return {
              ...u,
              permissions: u.permissions.map((p) => {
                if (p.sidebar_label === sidebar_label && (p.sub_label || "") === (sub_label || "")) {
                  return { ...p, id: response.id };
                }
                return p;
              }),
            };
          });
        });
      }
      toast({ title: "Saved", description: "Page permission updated." });
    } catch (err) {
      // Rollback on error
      queryClient.setQueryData(["users-with-permissions"], previousData);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update permission",
        variant: "destructive",
      });
    } finally {
      setUpdatingPermKey(null);
    }
  };

  if (!isSuperAdmin) {
    return (
      <Layout title="User Management">
        <div className="space-y-6">
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <ShieldAlert className="h-5 w-5" />
                Access restricted
              </CardTitle>
              <CardDescription>
                User Management is available only to Super Admin. Your role: <strong>{currentRole || "—"}</strong>. Contact an administrator to manage users.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="User Management">
      <div className="space-y-6">
        {/* Top Header Action */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            onClick={() => setDialogOpen(true)}
            size="sm"
            className="gap-2 w-fit self-start sm:w-auto sm:self-auto shrink-0 px-3 bg-[#054332] hover:bg-[#032d21] text-white"
          >
            <UserPlus className="h-4 w-4" />
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add New User</span>
          </Button>
        </div>

        {/* Add User Dialog */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add New User {addUserStep === 2 ? "— Step 2 of 2" : ""}
              </DialogTitle>
              {addUserStep === 2 && (
                <DialogDescription>
                  Set page permissions for this user. Read = view, Create = add, Update = edit, Delete = remove.
                </DialogDescription>
              )}
            </DialogHeader>

            <form onSubmit={handleAddUserSubmit} className="space-y-6">
              {addUserStep === 1 ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dialog-email">Email</Label>
                      <Input
                        id="dialog-email"
                        type="email"
                        placeholder="e.g. user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dialog-role">Role</Label>
                      <Select value={stakeholderId} onValueChange={setStakeholderId}>
                        <SelectTrigger id="dialog-role">
                          <SelectValue placeholder="Select role (Consultant / Contractor)" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleStakeholders.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.stakeholder_type} {s.stakeholder_title ? `— ${s.stakeholder_title}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dialog-first_name">First name</Label>
                      <Input
                        id="dialog-first_name"
                        placeholder="e.g. John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        autoComplete="given-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dialog-last_name">Last name</Label>
                      <Input
                        id="dialog-last_name"
                        placeholder="e.g. Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dialog-password">Password</Label>
                    <Input
                      id="dialog-password"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                </>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[220px]">Page</TableHead>
                        <TableHead className="text-center w-[80px]">Read</TableHead>
                        <TableHead className="text-center w-[80px]">Create</TableHead>
                        <TableHead className="text-center w-[80px]">Update</TableHead>
                        <TableHead className="text-center w-[80px]">Delete</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visiblePermissionRows.map((row) => {
                        const p = getNewUserPerm(row.sidebar_label, row.sub_label);
                        const isGroup = row.kind === "group";
                        const groupId = row.groupId;

                        return (
                          <TableRow key={permissionRowKey(row.sidebar_label, row.sub_label)}>
                            <TableCell className="font-medium">
                              {isGroup && groupId ? (
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-2 font-semibold text-gray-800"
                                  onClick={() =>
                                    setExpandedGroups((prev) => ({
                                      ...prev,
                                      [groupId]: !prev[groupId],
                                    }))
                                  }
                                >
                                  <span className="text-base leading-none">{expandedGroups[groupId] ? "▾" : "▸"}</span>
                                  <span>{row.displayLabel}</span>
                                </button>
                              ) : (
                                <span style={{ paddingLeft: `${(row.indent || 0) * 16}px` }}>{row.displayLabel}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {!isGroup && (
                                <Checkbox
                                  checked={!!p.read}
                                  onCheckedChange={(c) => setNewUserPerm(row.sidebar_label, row.sub_label, "read", !!c)}
                                />
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {!isGroup && (
                                <Checkbox
                                  checked={!!p.create}
                                  onCheckedChange={(c) => setNewUserPerm(row.sidebar_label, row.sub_label, "create", !!c)}
                                />
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {!isGroup && (
                                <Checkbox
                                  checked={!!p.update}
                                  onCheckedChange={(c) => setNewUserPerm(row.sidebar_label, row.sub_label, "update", !!c)}
                                />
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {!isGroup && (
                                <Checkbox
                                  checked={!!p.delete}
                                  onCheckedChange={(c) => setNewUserPerm(row.sidebar_label, row.sub_label, "delete", !!c)}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (addUserStep === 2) setAddUserStep(1);
                    else setDialogOpen(false);
                  }}
                >
                  {addUserStep === 2 ? "Back" : "Cancel"}
                </Button>
                <Button type="submit" disabled={isCreatingWithPermissions} className="bg-[#054332] text-white">
                  {addUserStep === 1 ? "Next" : isCreatingWithPermissions ? "Creating…" : "Create user"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Registered Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Registered Users
            </CardTitle>
            <CardDescription>
              Users added by Super Admin. Total: {users.length}
              {users.length > USERS_PER_PAGE && ` · Page ${usersPage} of ${totalUsersPages}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <p className="text-muted-foreground py-8 text-center">Loading users…</p>
            ) : users.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No users yet. Click "Add New User" to create one.</p>
            ) : (
              <>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10 p-2">#</TableHead>
                        <TableHead className="p-2">Email</TableHead>
                        <TableHead className="hidden sm:table-cell p-2">Full name</TableHead>
                        <TableHead className="p-2">Role</TableHead>
                        <TableHead className="hidden md:table-cell p-2">Stakeholder</TableHead>
                        <TableHead className="hidden lg:table-cell p-2">Status</TableHead>
                        <TableHead className="text-right p-2">Permissions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.map((u, index) => {
                        const rowNumber = (usersPage - 1) * USERS_PER_PAGE + index + 1;
                        const isSuperAdminUser = (u.role || "").trim().toLowerCase() === "super_admin";

                        return (
                          <TableRow key={u.id}>
                            <TableCell className="font-mono text-muted-foreground text-xs p-2">{rowNumber}</TableCell>
                            <TableCell className="max-w-[140px] truncate text-xs p-2 font-medium">{u.email}</TableCell>
                            <TableCell className="hidden sm:table-cell p-2 text-xs">{u.full_name}</TableCell>
                            <TableCell className="capitalize text-xs p-2">{formatRole(u.role)}</TableCell>
                            <TableCell className="hidden md:table-cell text-xs p-2">{getStakeholderLabel(u.stakeholder)}</TableCell>
                            <TableCell className="hidden lg:table-cell p-2">
                              <span className={u.is_active ? "text-green-600 dark:text-green-400 font-medium text-xs" : "text-muted-foreground text-xs"}>
                                {u.is_active ? "Active" : "Inactive"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right p-2">
                              {!isSuperAdminUser ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 text-xs text-[#054332] hover:bg-[#eaf5ef]"
                                  onClick={() => {
                                    setSelectedUserIdForPermissions(u.id);
                                    pagePermissionsCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                                  }}
                                >
                                  <UserCog className="h-3.5 w-3.5" />
                                  View permissions
                                </Button>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {totalUsersPages > 1 && (
                  <div className="flex items-center justify-between gap-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {(usersPage - 1) * USERS_PER_PAGE + 1}–{Math.min(usersPage * USERS_PER_PAGE, sortedUsers.length)} of {sortedUsers.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                        disabled={usersPage <= 1}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setUsersPage((p) => Math.min(totalUsersPages, p + 1))}
                        disabled={usersPage >= totalUsersPages}
                        className="gap-1 bg-[#054332] text-white"
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Page Permissions Management Card */}
        <Card ref={pagePermissionsCardRef}>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" /> Page permissions
              </CardTitle>

              {usersWithPermissionsLoading ? (
                <p className="text-muted-foreground text-sm">Loading users and permissions…</p>
              ) : (
                <div className="grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap sm:items-end sm:gap-4">
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="permissions-name-combobox">Name</Label>
                    <Popover open={nameComboboxOpen} onOpenChange={setNameComboboxOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="permissions-name-combobox"
                          variant="outline"
                          role="combobox"
                          aria-expanded={nameComboboxOpen}
                          className="w-full sm:w-[240px] justify-between font-normal h-9 px-3 text-sm border-gray-200"
                        >
                          <span className="truncate">
                            {selectedUserWithPermissions
                              ? selectedUserWithPermissions.full_name || selectedUserWithPermissions.email || `User ${selectedUserWithPermissions.user_id}`
                              : "Select user by name…"}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[min(300px,calc(100vw-2rem))] p-0" align="start">
                        <Command
                          filter={(value, search) => {
                            const label = (value || "").toLowerCase();
                            const q = (search || "").toLowerCase();
                            if (!q) return 1;
                            return label.includes(q) ? 1 : 0;
                          }}
                        >
                          <CommandInput placeholder="Type to search name or email…" />
                          <CommandList>
                            <CommandEmpty>No user found.</CommandEmpty>
                            <CommandGroup>
                              {usersForPermissionView.map((u) => {
                                const label = u.full_name || u.email || `User ${u.user_id}`;
                                return (
                                  <CommandItem
                                    key={u.user_id}
                                    value={`${label} ${u.email}`}
                                    onSelect={() => {
                                      setSelectedUserIdForPermissions(u.user_id);
                                      setNameComboboxOpen(false);
                                    }}
                                  >
                                    {label}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="permissions-role-display">Role</Label>
                    <Input
                      id="permissions-role-display"
                      readOnly
                      className="bg-muted w-full sm:w-[160px] h-9 text-sm"
                      value={selectedUserWithPermissions ? formatRole(selectedUserWithPermissions.role) : "—"}
                    />
                  </div>

                  {selectedUserIdForPermissions != null && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setSelectedUserIdForPermissions(null)}
                      className="col-span-2 sm:col-span-auto shrink-0 h-9 text-white bg-red-600 hover:bg-red-700 border-0 text-xs font-semibold"
                    >
                      Clear selection
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {selectedUserWithPermissions == null ? (
              <p className="text-muted-foreground py-8 text-center rounded-md border border-dashed text-sm">
                Select a user by name above (or click "View permissions" in the Registered Users table) to view and edit their page permissions.
              </p>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[220px]">Page</TableHead>
                      <TableHead className="text-center w-[90px]">Read</TableHead>
                      <TableHead className="text-center w-[90px]">Create</TableHead>
                      <TableHead className="text-center w-[90px]">Update</TableHead>
                      <TableHead className="text-center w-[90px]">Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visiblePermissionRows.map((row) => {
                      const userPerms = selectedUserWithPermissions.permissions || [];
                      const perm = userPerms.find(
                        (p) =>
                          p.sidebar_label === row.sidebar_label &&
                          (p.sub_label || "") === (row.sub_label || "")
                      );

                      const canView = !!perm?.can_view;
                      const canCreate = !!perm?.can_create;
                      const canUpdate = !!perm?.can_update;
                      const canDelete = !!perm?.can_delete;
                      const isGroup = row.kind === "group";
                      const groupId = row.groupId;

                      const userId = selectedUserWithPermissions.user_id;
                      const viewKey = `${userId}|${row.sidebar_label}|${row.sub_label || ""}|can_view`;
                      const createKey = `${userId}|${row.sidebar_label}|${row.sub_label || ""}|can_create`;
                      const updateKey = `${userId}|${row.sidebar_label}|${row.sub_label || ""}|can_update`;
                      const deleteKey = `${userId}|${row.sidebar_label}|${row.sub_label || ""}|can_delete`;

                      return (
                        <TableRow key={permissionRowKey(row.sidebar_label, row.sub_label)}>
                          <TableCell className="font-medium">
                            {isGroup && groupId ? (
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 font-semibold text-gray-800"
                                onClick={() =>
                                  setExpandedGroups((prev) => ({
                                    ...prev,
                                    [groupId]: !prev[groupId],
                                  }))
                                }
                              >
                                <span className="text-base leading-none">{expandedGroups[groupId] ? "▾" : "▸"}</span>
                                <span>{row.displayLabel}</span>
                              </button>
                            ) : (
                              <span style={{ paddingLeft: `${(row.indent || 0) * 16}px` }}>{row.displayLabel}</span>
                            )}
                          </TableCell>

                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              {!isGroup && (
                                <Checkbox
                                  checked={canView}
                                  disabled={updatingPermKey === viewKey}
                                  onCheckedChange={(c) =>
                                    handlePermissionToggle(row.sidebar_label, row.sub_label, "can_view", !!c)
                                  }
                                />
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              {!isGroup && (
                                <Checkbox
                                  checked={canCreate}
                                  disabled={updatingPermKey === createKey}
                                  onCheckedChange={(c) =>
                                    handlePermissionToggle(row.sidebar_label, row.sub_label, "can_create", !!c)
                                  }
                                />
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              {!isGroup && (
                                <Checkbox
                                  checked={canUpdate}
                                  disabled={updatingPermKey === updateKey}
                                  onCheckedChange={(c) =>
                                    handlePermissionToggle(row.sidebar_label, row.sub_label, "can_update", !!c)
                                  }
                                />
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              {!isGroup && (
                                <Checkbox
                                  checked={canDelete}
                                  disabled={updatingPermKey === deleteKey}
                                  onCheckedChange={(c) =>
                                    handlePermissionToggle(row.sidebar_label, row.sub_label, "can_delete", !!c)
                                  }
                                />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

