import React from "react";
const _jsxFileName = ""; function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FolderKanban, Plus, Upload, FileText, X, ChevronRight, ChevronLeft, CheckCircle2, Calendar, Eye, Pencil, ChevronDown, Building2, Wallet, Landmark, HandCoins, Percent, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  listProjects,
  getProjectById,
  listStakeholders,
  listDistricts,
  listTehsils,
  createProject,
  updateProject,
  deleteProject,
} from "@/api";

import { mediaUrl } from "@/api/config";
import { MapContainer, TileLayer } from "react-leaflet";

/** Format stakeholder for display using API stakeholder_details (names) instead of IDs */
function formatProjectStakeholder(project) {
  const details = project.stakeholder_details;
  if (details && details.length > 0) {
    return details
      .map((d) =>
        d.stakeholder_title && d.stakeholder_type
          ? `${d.stakeholder_title} (${d.stakeholder_type})`
          : d.stakeholder_title || d.stakeholder_type || ""
      )
      .filter(Boolean)
      .join(", ") || fallbackStakeholderLabel(project);
  }
  return fallbackStakeholderLabel(project);
}
function fallbackStakeholderLabel(project) {
  const ids = Array.isArray(project.stakeholder) ? project.stakeholder : [project.stakeholder];
  if (ids.length > 0) return `Stakeholder #${ids.join(", #")}`;
  return "—";
}
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";










function getProjectAccent(projectId) {
  const accents = [
    {
      borderClass: "border-l-emerald-700",
      iconBgClass: "bg-emerald-50 dark:bg-emerald-950/35",
      iconClass: "text-emerald-800 dark:text-emerald-300",
    },
    {
      borderClass: "border-l-emerald-500",
      iconBgClass: "bg-emerald-50 dark:bg-emerald-950/35",
      iconClass: "text-emerald-700 dark:text-emerald-300",
    },
    {
      borderClass: "border-l-violet-500",
      iconBgClass: "bg-violet-50 dark:bg-violet-950/35",
      iconClass: "text-violet-700 dark:text-violet-300",
    },
    {
      borderClass: "border-l-amber-500",
      iconBgClass: "bg-amber-50 dark:bg-amber-950/35",
      iconClass: "text-amber-800 dark:text-amber-300",
    },
  ];
  const idx = Math.abs(projectId) % accents.length;
  return accents[idx];
}

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// ProjectAreaMap removed (boundary/map upload removed)

const XER_FILE_INPUT_ID = "xer-file-input-wizard";

/** Step 2: Primavera XER — opens the device file picker (same backend multipart field `xer_file`). */
function WizardXerUploadSection({
  editingProject,
  xerFile,
  onXerInputChange,
  onClearXer,
}




) {
  const openPicker = () => _optionalChain([document, 'access', _ => _.getElementById, 'call', _2 => _2(XER_FILE_INPUT_ID), 'optionalAccess', _3 => _3.click, 'call', _4 => _4()]);

  const existingXerHref =
    _optionalChain([editingProject, 'optionalAccess', _5 => _5.xer_file]) &&
    (editingProject.xer_file.startsWith("http")
      ? editingProject.xer_file
      : mediaUrl(editingProject.xer_file.startsWith("/") ? editingProject.xer_file : `/${editingProject.xer_file}`));

  return (
    React.createElement('div', { className: "space-y-3 min-w-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 195}}
      , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 196}}
        , React.createElement(Label, { htmlFor: XER_FILE_INPUT_ID, className: "text-base", __self: this, __source: {fileName: _jsxFileName, lineNumber: 197}}, "Primavera schedule (XER)"
            , editingProject ? "" : " *"
        )
        , React.createElement('p', { className: "text-xs text-muted-foreground mt-1 leading-relaxed"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 200}}, "Export from Primavera P6, then use "
                , React.createElement('span', { className: "font-medium", __self: this, __source: {fileName: _jsxFileName, lineNumber: 201}}, "Choose file" ), " or tap the area below. On phone or tablet this opens your Files / Downloads app so you can pick the "
                          , React.createElement('code', { className: "text-[11px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 202}}, ".xer"), " from any folder. The server stores the file and builds the activity list for the Gantt chart."

        )
      )

      , editingProject && editingProject.xer_file && !xerFile && (
        React.createElement('div', { className: "rounded-lg border bg-muted/50 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 208}}
          , React.createElement(FileText, { className: "h-8 w-8 text-muted-foreground shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 209}} )
          , React.createElement('div', { className: "flex-1 min-w-0 space-y-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 210}}
            , React.createElement('p', { className: "text-sm font-medium truncate"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 211}}, "Current: "
               , _nullishCoalesce(editingProject.xer_file.split("/").pop(), () => ( editingProject.xer_file))
            )
            , existingXerHref ? (
              React.createElement('a', {
                href: existingXerHref,
                target: "_blank",
                rel: "noopener noreferrer" ,
                className: "text-xs text-primary hover:underline inline-block"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 215}}
, "Open / download"

              )
            ) : null
          )
        )
      )

      , React.createElement('div', { className: "flex flex-col gap-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 228}}
        , React.createElement('div', {
          className: `relative rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 text-center px-4 py-8 sm:py-10 min-h-[10.5rem] touch-manipulation ${
            xerFile
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 active:bg-muted/40 cursor-pointer"
          }`,
          onClick: openPicker,
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openPicker();
            }
          },
          role: "button",
          tabIndex: 0,
          'aria-label': "Select XER schedule file"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 229}}

          , xerFile ? (
            React.createElement('div', { className: "flex flex-col sm:flex-row items-center gap-3 w-full max-w-full"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 247}}
              , React.createElement(FileText, { className: "h-10 w-10 text-primary shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 248}} )
              , React.createElement('div', { className: "flex-1 min-w-0 text-left w-full"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 249}}
                , React.createElement('p', { className: "font-medium text-sm sm:text-base break-all"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 250}}, xerFile.name)
                , React.createElement('p', { className: "text-xs text-muted-foreground mt-0.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 251}}
                  , (xerFile.size / 1024).toFixed(2), " KB · ready to upload"
                )
              )
              , React.createElement(Button, {
                type: "button",
                variant: "ghost",
                size: "icon",
                className: "shrink-0 h-11 w-11"  ,
                onClick: (e) => {
                  e.stopPropagation();
                  onClearXer();
                },
                'aria-label': "Remove XER file"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 255}}

                , React.createElement(X, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 266}} )
              )
            )
          ) : (
            React.createElement(React.Fragment, null
              , React.createElement(Upload, { className: "h-10 w-10 text-muted-foreground shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 271}} )
              , React.createElement('p', { className: "text-sm sm:text-base font-medium"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 272}}, "Tap to choose from this device"     )
              , React.createElement('p', { className: "text-xs text-muted-foreground max-w-md"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 273}}, ".xer only — same file is sent to the server on Create for schedule import."

              )
            )
          )
        )

        , React.createElement(Button, { type: "button", variant: "secondary", className: "w-full sm:w-auto min-h-11 px-6"   , onClick: openPicker, __self: this, __source: {fileName: _jsxFileName, lineNumber: 280}}
          , React.createElement(FolderKanban, { className: "h-4 w-4 mr-2 shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 281}} ), "Choose file…"

        )

        , React.createElement(Input, {
          id: XER_FILE_INPUT_ID,
          type: "file",
          accept: ".xer,.XER,application/octet-stream",
          onChange: onXerInputChange,
          className: "sr-only", __self: this, __source: {fileName: _jsxFileName, lineNumber: 285}}
        )
      )
    )
  );
}

export default function ProjectManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProjectForView, setSelectedProjectForView] = useState(null);
  const [projectsPage, setProjectsPage] = useState(1);
  const [locationSearch, setLocationSearch] = useState("");

  const PROJECTS_PER_PAGE = 6;
  const { data: projectsData = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
  });

  // Sidebar deep-link support.
  // NOTE: wouter commonly tracks pathname only; query params may not trigger location updates.
  // We support BOTH:
  // - /project-management/create  (preferred)
  // - /project-management/view
  // - /project-management?mode=create (fallback)
  const deepLinkMode = useMemo(() => {
    try {
      const rawPath = String(location || "");
      // Prefer explicit path suffixes (works reliably with wouter)
      if (rawPath.startsWith("/project-management/create")) return "create";
      if (rawPath.startsWith("/project-management/view")) return "view";

      // Fallback: read from the actual browser URL search params
      const mode = (new URL(window.location.href).searchParams.get("mode") || "").toLowerCase();
      return mode === "create" || mode === "view" ? (mode ) : "";
    } catch (e2) {
      return "";
    }
  }, [location]);

  const prevDeepLinkModeRef = useRef("");
  useEffect(() => {
    const prev = prevDeepLinkModeRef.current;
    prevDeepLinkModeRef.current = deepLinkMode;

    if (deepLinkMode === "create") {
      // /project-management/create is rendered as a full page (no dialog needed).
      return;
    }
    if (deepLinkMode === "view") {
      // Only auto-close when we *navigate* from create -> view.
      if (prev === "create" && showAddProjectDialog) setShowAddProjectDialog(false);
    }
  }, [deepLinkMode, showAddProjectDialog, editingProject]);
  const { data: stakeholdersList = [] } = useQuery({
    queryKey: ["stakeholders"],
    queryFn: listStakeholders,
  });
  // Province/Division removed from create/edit form; keep only District/Tehsil selectors.
  const { data: districtsList = [] } = useQuery({
    queryKey: ["districts"],
    queryFn: () => listDistricts(undefined),
  });
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const districtIdNum = selectedDistrictId ? Number(selectedDistrictId) : undefined;
  const { data: tehsilsList = [] } = useQuery({
    queryKey: ["tehsils", districtIdNum],
    queryFn: () => listTehsils(districtIdNum),
    enabled: !!districtIdNum,
  });

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Success", description: "Project created successfully." });
      resetForm();
      setEditingProject(null);
      setShowAddProjectDialog(false);
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to create project", variant: "destructive" });
    },
  });
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      updateProject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Success", description: "Project updated successfully." });
      resetForm();
      setEditingProject(null);
      setShowAddProjectDialog(false);
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to update project", variant: "destructive" });
    },
  });
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Project Deleted", description: "Project has been deleted successfully." });
    },
    onError: (e) => {
      toast({ title: "Error", description: e.message || "Failed to delete project", variant: "destructive" });
    },
  });

  // Form state
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [startingDate, setStartingDate] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [category, setCategory] = useState("");
  const [latitudeCoordinates, setLatitudeCoordinates] = useState("");
  const [longitudeCoordinates, setLongitudeCoordinates] = useState("");
  const [zone, setZone] = useState("");
  const [circle, setCircle] = useState("");
  const [stakeholderIds, setStakeholderIds] = useState([]);
  const [selectedTehsilId, setSelectedTehsilId] = useState("");
  const [districtComboboxOpen, setDistrictComboboxOpen] = useState(false);
  const [tehsilComboboxOpen, setTehsilComboboxOpen] = useState(false);
  const [totalBudgetAllocated, setTotalBudgetAllocated] = useState("");
  const [budgetUtilized, setBudgetUtilized] = useState("");
  const [xerFile, setXerFile] = useState(null);
  // NOTE: Boundary/map uploads removed from frontend.
  /** When true, geography useEffects should not clear children (we're loading from project) */
  const skipGeographyClearRef = useRef(false);

  const remainingBudget = useMemo(() => {
    const tRaw = String(totalBudgetAllocated || "").trim();
    if (!tRaw) return "";
    const t = Number(tRaw);
    if (!Number.isFinite(t)) return "";
    const uRaw = String(budgetUtilized || "").trim();
    const u = uRaw ? Number(uRaw) : 0;
    if (!Number.isFinite(u)) return "";
    return String(Math.max(0, t - u));
  }, [totalBudgetAllocated, budgetUtilized]);

  const zoneOptions = useMemo(() => {
    const options = new Set();
    for (const p of projectsData) {
      const z = String(_nullishCoalesce(p.zone, () => ( ""))).trim();
      if (z) options.add(z);
    }
    const current = String(zone || "").trim();
    if (current) options.add(current);
    return Array.from(options).sort((a, b) => a.localeCompare(b));
  }, [projectsData, zone]);

  const circleOptions = useMemo(() => {
    const options = new Set();
    for (const p of projectsData) {
      const c = String(_nullishCoalesce(p.circle, () => ( ""))).trim();
      if (c) options.add(c);
    }
    const current = String(circle || "").trim();
    if (current) options.add(current);
    return Array.from(options).sort((a, b) => a.localeCompare(b));
  }, [projectsData, circle]);

  useEffect(() => {
    if (skipGeographyClearRef.current) return;
    setSelectedTehsilId("");
  }, [selectedDistrictId]);

  // When editing a project, keep cascading clear disabled until all prefilled IDs are applied.
  useEffect(() => {
    if (!skipGeographyClearRef.current) return;
    if (!editingProject) return;
    const allSet =
      selectedDistrictId === String(editingProject.district) &&
      selectedTehsilId === String(editingProject.tehsil);
    if (allSet) skipGeographyClearRef.current = false;
  }, [
    editingProject,
    selectedDistrictId,
    selectedTehsilId,
  ]);

  // Handle XER file upload
  const handleXERFileChange = (e) => {
    const file = _optionalChain([e, 'access', _6 => _6.target, 'access', _7 => _7.files, 'optionalAccess', _8 => _8[0]]);
    if (file) {
      if (!file.name.toLowerCase().endsWith(".xer")) {
        toast({
          title: "Invalid File",
          description: "Please select a valid .xer file",
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }
      setXerFile(file);
    }
    e.target.value = "";
  };

  // handleAreaFileChange removed

  // Reset form
  const resetForm = () => {
    setProjectName("");
    setCategory("");
    setProjectDescription("");
    setStartingDate("");
    setReferenceNumber("");
    setLatitudeCoordinates("");
    setLongitudeCoordinates("");
    setZone("");
    setCircle("");
    setStakeholderIds([]);
    setSelectedDistrictId("");
    setSelectedTehsilId("");
    setTotalBudgetAllocated("");
    setBudgetUtilized("");
    setXerFile(null);
    setCurrentStep(1);
  };

  // Open dialog for editing a project — prefetch division/district/tehsil so dropdowns show selected values
  const openEditDialog = async (project) => {
    // Always refetch the full project payload for prefill (includes financials + geom).
    // If fetch fails (auth/network), still open the wizard using the card payload.
    let p = project;
    try {
      const full = await getProjectById(project.id);
      if (full) p = full ;
    } catch (e3) {
      // best-effort; continue with provided card project
    }
    skipGeographyClearRef.current = true;
    await Promise.all([
      queryClient.prefetchQuery({ queryKey: ["districts"], queryFn: () => listDistricts(undefined) }),
      queryClient.prefetchQuery({ queryKey: ["tehsils", p.district], queryFn: () => listTehsils(p.district) }),
    ]);
    setEditingProject(p);
    setProjectName(_nullishCoalesce(p.project_name, () => ( "")));
    setCategory(String(_nullishCoalesce(p.category, () => ( ""))));
    setProjectDescription(_nullishCoalesce(p.project_description, () => ( "")));
    setStartingDate(p.project_starting_date ? p.project_starting_date.slice(0, 10) : "");
    setReferenceNumber(_nullishCoalesce(p.project_reference_no, () => ( "")));
    setLatitudeCoordinates(
      String(
        _nullishCoalesce(p.latitude_coordinates, () => (
          _nullishCoalesce(p.latitude, () => ( ""))
        ))
      )
    );
    setLongitudeCoordinates(
      String(
        _nullishCoalesce(p.longitude_coordinates, () => (
          _nullishCoalesce(p.longitude, () => ( ""))
        ))
      )
    );
    setZone(String(_nullishCoalesce(p.zone, () => ( ""))));
    setCircle(String(_nullishCoalesce(p.circle, () => ( ""))));
    setStakeholderIds(
      Array.isArray(p.stakeholder)
        ? p.stakeholder.map(String)
        : p.stakeholder != null
          ? [String(p.stakeholder)]
          : []
    );
    setSelectedDistrictId(String(p.district));
    setSelectedTehsilId(String(p.tehsil));
    setTotalBudgetAllocated(_nullishCoalesce(p.total_budget_allocated, () => ( "")));
    setBudgetUtilized(_nullishCoalesce(p.budget_utilized, () => ( "")));

    setXerFile(null);
    setCurrentStep(1);
    setShowAddProjectDialog(true);
  };

  // Validate step 1
  const validateStep1 = () => {
    // Frontend validation intentionally disabled (temporary).
    return true;
  };

  // Validate step 2 (schedule + boundary — backend consumes both on create)
  const validateStep2 = () => {
    if (editingProject) return true;
    if (!xerFile) {
      toast({
        title: "XER file required",
        description: "Upload a Primavera P6 .xer file so the schedule can be stored and activities imported.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  // Handle next step
  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep === 2) setCurrentStep(1);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      handleNext();
      return;
    }
    if (currentStep === 2) {
      if (!validateStep2()) return;

      const totalBudget = totalBudgetAllocated.trim() ? Number(totalBudgetAllocated) : 0;
      const utilized = budgetUtilized.trim() ? Number(budgetUtilized) : 0;
      const variance = totalBudget - utilized;
      const remaining = Math.max(0, totalBudget - utilized);

      if (editingProject) {
        updateProjectMutation.mutate({
          id: editingProject.id,
          payload: {
            stakeholder: stakeholderIds.map(Number),
            project_name: projectName.trim() || null,
            category: category.trim() || null,
            project_description: projectDescription.trim() || null,
            project_starting_date: startingDate || null,
            project_reference_no: referenceNumber.trim() || null,
            latitude_coordinates: latitudeCoordinates.trim() || null,
            longitude_coordinates: longitudeCoordinates.trim() || null,
            zone: zone.trim() || null,
            circle: circle.trim() || null,
            district: Number(selectedDistrictId),
            tehsil: Number(selectedTehsilId),
            total_budget_allocated: totalBudgetAllocated.trim() || null,
            budget_utilized: budgetUtilized.trim() || null,
            budget_variance: String(variance),
            budget_remaining: String(remaining),
          },
        });
      } else {
        createProjectMutation.mutate({
          stakeholder: stakeholderIds.map(Number),
          project_name: projectName.trim() || null,
          category: category.trim() || null,
          project_description: projectDescription.trim() || null,
          project_starting_date: startingDate || null,
          project_reference_no: referenceNumber.trim() || null,
          latitude_coordinates: latitudeCoordinates.trim() || null,
          longitude_coordinates: longitudeCoordinates.trim() || null,
          zone: zone.trim() || null,
          circle: circle.trim() || null,
          district: Number(selectedDistrictId),
          tehsil: Number(selectedTehsilId),
          total_budget_allocated: totalBudget,
          budget_utilized: utilized,
          budget_variance: String(variance),
          budget_remaining: String(remaining),
          xer_file: _nullishCoalesce(xerFile, () => ( undefined)),
        });
      }
    }
  };

  const handleDeleteProject = (id) => {
    const project = projectsData.find((p) => p.id === id);
    if (window.confirm(`Are you sure you want to delete "${_optionalChain([project, 'optionalAccess', _14 => _14.project_name])}"?`)) {
      deleteProjectMutation.mutate(id);
      setSelectedProjectForView((prev) => (_optionalChain([prev, 'optionalAccess', _15 => _15.id]) === id ? null : prev));
    }
  };

  const filteredProjects = useMemo(() => {
    const query = locationSearch.trim().toLowerCase();

    const filtered = projectsData.filter((project) => {
      const divisionText = (_nullishCoalesce(project.division_name, () => ( String(_nullishCoalesce(project.division, () => ( "")))))).toLowerCase();
      const districtText = (_nullishCoalesce(project.district_name, () => ( String(_nullishCoalesce(project.district, () => ( "")))))).toLowerCase();
      const tehsilText = (_nullishCoalesce(project.tehsil_name, () => ( String(_nullishCoalesce(project.tehsil, () => ( "")))))).toLowerCase();

      if (!query) return true;
      return (
        divisionText.includes(query) ||
        districtText.includes(query) ||
        tehsilText.includes(query)
      );
    });
    
    const asTime = (value) => {
      if (typeof value !== "string") return Number.NaN;
      const t = new Date(value).getTime();
      return Number.isFinite(t) ? t : Number.NaN;
    };

    // Show most recently created projects first.
    // If created_at is missing/invalid, fall back to id (higher id = newer).
    return filtered.slice().sort((a, b) => {
      const ta = asTime((a ).created_at);
      const tb = asTime((b ).created_at);
      if (Number.isFinite(ta) && Number.isFinite(tb)) return tb - ta;
      if (Number.isFinite(tb)) return 1;
      if (Number.isFinite(ta)) return -1;
      return (_nullishCoalesce(b.id, () => ( 0))) - (_nullishCoalesce(a.id, () => ( 0)));
    });
  }, [projectsData, locationSearch]);

  const totalProjectsPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (projectsPage - 1) * PROJECTS_PER_PAGE;
    return filteredProjects.slice(start, start + PROJECTS_PER_PAGE);
  }, [filteredProjects, projectsPage, PROJECTS_PER_PAGE]);

  useEffect(() => {
    if (projectsPage > totalProjectsPages && totalProjectsPages > 0) {
      setProjectsPage(totalProjectsPages);
    }
  }, [projectsPage, totalProjectsPages]);

  useEffect(() => {
    setProjectsPage(1);
  }, [locationSearch]);

  const isCreatePath =
    typeof window !== "undefined" &&
    _optionalChain([window, 'access', _16 => _16.location, 'optionalAccess', _17 => _17.pathname]) === "/project-management/create";
  const isViewPath =
    typeof window !== "undefined" &&
    _optionalChain([window, 'access', _18 => _18.location, 'optionalAccess', _19 => _19.pathname]) === "/project-management/view";
  const dialogOpen = showAddProjectDialog;

  // Full-page create flow: keep all existing API/mutation/state logic intact,
  // but render the exact same wizard as a normal page (not a dialog/overlay).
  if (isCreatePath) {
    return (
      React.createElement(Layout, { title: "Create New Project"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1058}}
        , React.createElement('div', { className: "flex flex-col min-h-[calc(100vh-8rem)] w-full min-w-0"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1059}}
          , React.createElement('div', { className: "max-w-5xl mx-auto w-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1060}}
            , React.createElement(Card, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1061}}
              , React.createElement(CardHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1062}}
                , React.createElement(CardTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1063}}, editingProject ? "Update Project" : "Add New Project")
                , React.createElement(CardDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1064}}
                  , editingProject
                    ? "Edit the project details below. Leave file fields unchanged unless you want to replace them."
                    : "Fill in the project details and upload required files"
                )
              )
              , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1070}}
                /* Reuse the same wizard (step indicator + all 3 steps + footer) */
                /* Step Indicator */
                , React.createElement('div', { className: "flex flex-col items-center justify-center mb-6"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1073}}
                  , React.createElement('div', { className: "flex items-center gap-3 w-fit"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1074}}
                    /* Step 1 */
                    , React.createElement('div', { className: "flex flex-col items-center"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1076}}
                      , React.createElement('div', { className: `flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                        currentStep >= 1 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground bg-background"
                      }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1077}}
                        , currentStep > 1 ? (
                          React.createElement(CheckCircle2, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1081}} )
                        ) : (
                          React.createElement('span', { className: "text-sm font-semibold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1083}}, "1")
                        )
                      )
                      , React.createElement('p', { className: `text-xs font-medium mt-2 ${currentStep === 1 ? "text-primary" : "text-muted-foreground"}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1086}}, "Project Details"

                      )
                    )

                    , React.createElement('div', { className: "relative w-24 h-1 bg-muted rounded-full overflow-hidden mt-4"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1091}}
                      , currentStep >= 2 && (
                        React.createElement(React.Fragment, null
                          , React.createElement('div', { className: "absolute inset-0 bg-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1094}} )
                          , React.createElement('div', {
                            className: "absolute inset-0" ,
                            style: {
                              background: "linear-gradient(90deg, transparent 30%, #ef4444 50%, transparent 70%)",
                              backgroundSize: "200% 100%",
                              animation: "shimmer 1.5s linear infinite",
                            }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1095}}
                          )
                        )
                      )
                    )

                    /* Step 2 */
                    , React.createElement('div', { className: "flex flex-col items-center"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1108}}
                      , React.createElement('div', { className: `flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                        currentStep >= 2 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground bg-background"
                      }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1109}}
                        , currentStep > 2 ? React.createElement(CheckCircle2, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1112}} ) : React.createElement('span', { className: "text-sm font-semibold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1112}}, "2")
                      )
                      , React.createElement('p', { className: `text-xs font-medium mt-2 text-center max-w-[5.5rem] leading-tight ${currentStep === 2 ? "text-primary" : "text-muted-foreground"}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1114}}, "XER"

                      )
                    )

                    /* Step 3 removed */
                  )
                )

                , React.createElement('style', {
                  dangerouslySetInnerHTML: {
                    __html: `
                      @keyframes shimmer {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                      }
                    `,
                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1153}}
                )

                /* Full wizard form (same handlers/mutations as modal) */
                , React.createElement('form', { onSubmit: handleSubmit, className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1165}}
                  /* Step 1: Project Details */
                  , currentStep === 1 && (
                    React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1168}}
                      , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1169}}
                        , React.createElement(Label, { htmlFor: "projectName", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1170}}, "Project Name *"  )
                        , React.createElement(Input, {
                          id: "projectName",
                          placeholder: "Enter project name"  ,
                          value: projectName,
                          onChange: (e) => setProjectName(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 1171}}
                        )
                      )
                      , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1177}}
                        , React.createElement(Label, { htmlFor: "category", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1178}}, "Category" )
                        , React.createElement(Select, { value: category || "", onValueChange: setCategory, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1179}}
                          , React.createElement(SelectTrigger, { id: "category", className: "w-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1180}}
                            , React.createElement(SelectValue, { placeholder: "Select category", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1181}} )
                          )
                          , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1183}}
                            , React.createElement(SelectItem, { value: "Basic Health Unit", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1184}}, "Basic Health Unit" )
                            , React.createElement(SelectItem, { value: "Dispensary", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1185}}, "Dispensary" )
                            , React.createElement(SelectItem, { value: "Dispilated", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1186}}, "Dispilated" )
                          )
                        )
                      )
                      , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1178}}
                        , React.createElement(Label, { htmlFor: "projectDescription", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1179}}, "Project Description *"  )
                        , React.createElement(Textarea, {
                          id: "projectDescription",
                          placeholder: "Enter project description..."  ,
                          value: projectDescription,
                          onChange: (e) => setProjectDescription(e.target.value),
                          rows: 4, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1180}}
                        )
                      )
                      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1188}}
                        , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1189}}
                          , React.createElement(Label, { htmlFor: "startingDate", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1190}}, "Project Starting Date *"   )
                          , React.createElement(Input, {
                            id: "startingDate",
                            type: "date",
                            value: startingDate,
                            onChange: (e) => setStartingDate(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 1191}}
                          )
                        )
                        , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1198}}
                          , React.createElement(Label, { htmlFor: "referenceNumber", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1199}}, "Project Reference No *"   )
                          , React.createElement(Input, {
                            id: "referenceNumber",
                            placeholder: "Enter reference number"  ,
                            value: referenceNumber,
                            onChange: (e) => setReferenceNumber(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 1200}}
                          )
                        )
                      )
                      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1207}}
                        , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1208}}
                          , React.createElement(Label, { htmlFor: "totalBudgetAllocated", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1209}}, "Total Budget" )
                          , React.createElement(Input, {
                            id: "totalBudgetAllocated",
                            type: "number",
                            min: 0,
                            step: "any",
                            placeholder: "e.g. 1000000",
                            value: totalBudgetAllocated,
                            onChange: (e) => setTotalBudgetAllocated(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 1210}}
                          )
                        )
                        , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1217}}
                          , React.createElement(Label, { htmlFor: "budgetUtilized", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1218}}, "Total Consume" )
                          , React.createElement(Input, {
                            id: "budgetUtilized",
                            type: "number",
                            min: 0,
                            step: "any",
                            placeholder: "e.g. 250000",
                            value: budgetUtilized,
                            onChange: (e) => setBudgetUtilized(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 1219}}
                          )
                        )
                        , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1226}}
                          , React.createElement(Label, { htmlFor: "remainingBudget", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1227}}, "Remaining Budget" )
                          , React.createElement(Input, {
                            id: "remainingBudget",
                            type: "number",
                            value: remainingBudget,
                            disabled: true,
                            readOnly: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1228}}
                          )
                        )
                      )
                      , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1208}}
                        , React.createElement(Label, { htmlFor: "stakeholderIds", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1209}}, "Stakeholder(s) *" )
                        , React.createElement(Popover, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1210}}
                          , React.createElement(PopoverTrigger, { asChild: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1211}}
                            , React.createElement(Button, {
                              id: "stakeholderIds",
                              variant: "outline",
                              className: "w-full justify-between" ,
                              type: "button", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1212}}

                              , stakeholderIds.length > 0
                                ? `${stakeholderIds.length} stakeholder(s) selected`
                                : "Select stakeholders"
                              , React.createElement(ChevronDown, { className: "h-4 w-4 opacity-50"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1221}} )
                            )
                          )
                          , React.createElement(PopoverContent, { className: "p-0 w-[var(--radix-popover-trigger-width)]" , align: "start", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1224}}
                            , React.createElement(Command, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1225}}
                              , React.createElement(CommandInput, { placeholder: "Search stakeholders..." , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1226}} )
                              , React.createElement(CommandList, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1227}}
                                , React.createElement(CommandEmpty, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1228}}, "No stakeholders found."  )
                                , React.createElement(CommandGroup, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1229}}
                                  , stakeholdersList.map((s) => {
                                    const id = String(s.id);
                                    const selected = stakeholderIds.includes(id);
                                    return (
                                      React.createElement(CommandItem, {
                                        key: id,
                                        onSelect: () => {
                                          setStakeholderIds((prev) =>
                                            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                                          );
                                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1234}}

                                        , React.createElement(Checkbox, { checked: selected, className: "mr-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1242}} )
                                        , s.stakeholder_title, " (" , s.stakeholder_type, ")"
                                      )
                                    );
                                  })
                                )
                              )
                            )
                          )
                        )
                      )

                      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1252}}
                        , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1253}}
                          , React.createElement(Label, { htmlFor: "zone", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1254}}, "Zone" )
                          , React.createElement(Select, { value: zone || "", onValueChange: setZone, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1255}}
                            , React.createElement(SelectTrigger, { id: "zone", className: "w-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1256}}
                              , React.createElement(SelectValue, { placeholder: zoneOptions.length ? "Select zone" : "No zone options", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1257}} )
                            )
                            , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1259}}
                              , zoneOptions.map((z) => (
                                React.createElement(SelectItem, { key: z, value: z, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1261}}, z )
                              ))
                            )
                          )
                        )
                        , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1263}}
                          , React.createElement(Label, { htmlFor: "circle", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1264}}, "Circle" )
                          , React.createElement(Select, { value: circle || "", onValueChange: setCircle, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1265}}
                            , React.createElement(SelectTrigger, { id: "circle", className: "w-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1266}}
                              , React.createElement(SelectValue, { placeholder: circleOptions.length ? "Select circle" : "No circle options", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1267}} )
                            )
                            , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1269}}
                              , circleOptions.map((c) => (
                                React.createElement(SelectItem, { key: c, value: c, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1271}}, c )
                              ))
                            )
                          )
                        )
                      )

                      /* District / Tehsil (Area Management) */
                      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1255}}

                        /* District — searchable */
                        , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1368}}
                          , React.createElement(Label, { htmlFor: "district", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1369}}, "District *" )
                          , React.createElement(Popover, { open: districtComboboxOpen, onOpenChange: setDistrictComboboxOpen, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1370}}
                            , React.createElement(PopoverTrigger, { asChild: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1371}}
                              , React.createElement(Button, {
                                id: "district",
                                variant: "outline",
                                role: "combobox",
                                'aria-expanded': districtComboboxOpen,
                                className: "w-full justify-between font-normal h-9 px-3 text-sm"     ,
                                type: "button", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1372}}

                                , React.createElement('span', { className: "truncate", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1381}}
                                  , selectedDistrictId
                                    ? (_nullishCoalesce(_optionalChain([districtsList, 'access', _26 => _26.find, 'call', _27 => _27((d) => String(d.id) === selectedDistrictId), 'optionalAccess', _28 => _28.district_name]), () => (
                                      "Select district")))
                                    : "Select district"
                                )
                                , React.createElement(ChevronDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1389}} )
                              )
                            )
                            , React.createElement(PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0" , align: "start", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1392}}
                              , React.createElement(Command, {
                                filter: (value, search) => {
                                  const q = (search || "").toLowerCase();
                                  if (!q) return 1;
                                  return (value || "").toLowerCase().includes(q) ? 1 : 0;
                                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1393}}

                                , React.createElement(CommandInput, { placeholder: "Type to search district…"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1400}} )
                                , React.createElement(CommandList, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1401}}
                                  , React.createElement(CommandEmpty, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1402}}, "No district found."  )
                                  , React.createElement(CommandGroup, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1403}}
                                    , districtsList.map((d) => (
                                      React.createElement(CommandItem, {
                                        key: d.id,
                                        value: d.district_name,
                                        onSelect: () => {
                                          skipGeographyClearRef.current = false;
                                          setSelectedDistrictId(String(d.id));
                                          setDistrictComboboxOpen(false);
                                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1405}}

                                        , d.district_name
                                      )
                                    ))
                                  )
                                )
                              )
                            )
                          )
                        )

                        /* Tehsil — searchable */
                        , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1425}}
                          , React.createElement(Label, { htmlFor: "tehsil", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1426}}, "Tehsil *" )
                          , React.createElement(Popover, { open: tehsilComboboxOpen, onOpenChange: setTehsilComboboxOpen, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1427}}
                            , React.createElement(PopoverTrigger, { asChild: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1428}}
                              , React.createElement(Button, {
                                id: "tehsil",
                                variant: "outline",
                                role: "combobox",
                                'aria-expanded': tehsilComboboxOpen,
                                disabled: !selectedDistrictId,
                                className: "w-full justify-between font-normal h-9 px-3 text-sm"     ,
                                type: "button", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1429}}

                                , React.createElement('span', { className: "truncate", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1438}}
                                  , selectedTehsilId
                                    ? (_nullishCoalesce(_optionalChain([tehsilsList, 'access', _29 => _29.find, 'call', _30 => _30((t) => String(t.id) === selectedTehsilId), 'optionalAccess', _31 => _31.tehsil_name]), () => (
                                      "Select tehsil")))
                                    : selectedDistrictId
                                      ? "Select tehsil"
                                      : "Select district first"
                                )
                                , React.createElement(ChevronDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1446}} )
                              )
                            )
                            , React.createElement(PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0" , align: "start", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1449}}
                              , React.createElement(Command, {
                                filter: (value, search) => {
                                  const q = (search || "").toLowerCase();
                                  if (!q) return 1;
                                  return (value || "").toLowerCase().includes(q) ? 1 : 0;
                                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1450}}

                                , React.createElement(CommandInput, { placeholder: "Type to search tehsil…"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1457}} )
                                , React.createElement(CommandList, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1458}}
                                  , React.createElement(CommandEmpty, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1459}}, "No tehsil found."  )
                                  , React.createElement(CommandGroup, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1460}}
                                    , tehsilsList.map((t) => (
                                      React.createElement(CommandItem, {
                                        key: t.id,
                                        value: t.tehsil_name,
                                        onSelect: () => {
                                          skipGeographyClearRef.current = false;
                                          setSelectedTehsilId(String(t.id));
                                          setTehsilComboboxOpen(false);
                                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1462}}

                                        , t.tehsil_name
                                      )
                                    ))
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  )

                , currentStep === 1 && (
                  React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1481}}
                    , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1482}}
                      , React.createElement(Label, { htmlFor: "latitudeCoordinates", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1483}}, "Latitude Coordinates" )
                      , React.createElement(Input, {
                        id: "latitudeCoordinates",
                        type: "number",
                        step: "any",
                        placeholder: "e.g. 31.5204",
                        value: latitudeCoordinates,
                        onChange: (e) => setLatitudeCoordinates(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 1484}}
                      )
                    )
                    , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1493}}
                      , React.createElement(Label, { htmlFor: "longitudeCoordinates", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1494}}, "Longitude Coordinates" )
                      , React.createElement(Input, {
                        id: "longitudeCoordinates",
                        type: "number",
                        step: "any",
                        placeholder: "e.g. 74.3587",
                        value: longitudeCoordinates,
                        onChange: (e) => setLongitudeCoordinates(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 1495}}
                      )
                    )
                  )
                )

                  /* Step 2: Schedule (XER) */
                  , currentStep === 2 && (
                    React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1486}}
                      , React.createElement(WizardXerUploadSection, {
                        editingProject: editingProject,
                        xerFile: xerFile,
                        onXerInputChange: handleXERFileChange,
                        onClearXer: () => setXerFile(null), __self: this, __source: {fileName: _jsxFileName, lineNumber: 1520}}
                      )
                    )
                  )

                  /* Step 3 removed */

                  , React.createElement(DialogFooter, { className: "flex flex-col gap-2 sm:flex-row sm:gap-3"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1741}}
                    , React.createElement(Button, {
                      type: "button",
                      variant: "outline",
                      onClick: () => {
                        setEditingProject(null);
                        resetForm();
                        setLocation("/project-management/view");
                      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1742}}
, "Cancel"

                    )
                    , currentStep === 1 && (
                      React.createElement(Button, { type: "button", onClick: handleNext, className: "gap-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1754}}, "Next"

                        , React.createElement(ChevronRight, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1756}} )
                      )
                    )
                    , currentStep === 2 && (
                      React.createElement(React.Fragment, null
                        , React.createElement(Button, { type: "button", variant: "outline", onClick: handlePrevious, className: "gap-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1761}}
                          , React.createElement(ChevronLeft, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1762}} ), "Previous"

                        )
                        , React.createElement(Button, { type: "submit", disabled: updateProjectMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1765}}
                          , editingProject ? "Update Project" : "Create Project"
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

  return (
    React.createElement(Layout, { title: "Project Management" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1793}}
      , React.createElement('div', { className: "flex flex-col min-h-[calc(100vh-8rem)] w-full min-w-0"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1794}}
        , !isCreatePath && (
        React.createElement(React.Fragment, null
        /* Header with search and Add Project button */
        , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 mb-4"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1798}}
          , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1799}}
            , React.createElement('h1', { className: "text-xl sm:text-3xl font-bold tracking-tight leading-tight"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1800}}, "Added Projects"

            )
            , React.createElement('p', { className: "text-muted-foreground mt-1 text-sm sm:text-base"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1803}}
              , !projectsLoading && projectsData.length > 0
                ? filteredProjects.length !== projectsData.length
                  ? `${filteredProjects.length} of ${projectsData.length} projects`
                  : `${projectsData.length} project${projectsData.length !== 1 ? "s" : ""}`
                : "Manage and view project details below"
            )
          )
          , React.createElement('div', { className: "flex flex-row items-center gap-2 w-full sm:w-auto"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1811}}
            , !projectsLoading && projectsData.length > 0 && (
              React.createElement('div', { className: "flex-1 min-w-0 sm:w-[280px] sm:flex-none md:w-[320px]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1813}}
                , React.createElement(Input, {
                  value: locationSearch,
                  onChange: (e) => setLocationSearch(e.target.value),
                  placeholder: "Search division, district, or tehsil"    ,
                  className: "h-9", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1814}}
                )
              )
            )
            , !isViewPath && (
              React.createElement(Button, {
                onClick: () => {
                  setEditingProject(null);
                  resetForm();
                  setShowAddProjectDialog(true);
                },
                className: "gap-2 shrink-0 px-3 sm:px-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1823}}

                , React.createElement(Plus, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1831}} )
                , React.createElement('span', { className: "hidden sm:inline" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1832}}, "Add New Project"  )
                , React.createElement('span', { className: "sm:hidden", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1833}}, "Add")
              )
            )
          )
        )

        /* Projects Grid */
        , projectsLoading ? (
          React.createElement(Card, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1841}}
            , React.createElement(CardContent, { className: "flex flex-col items-center justify-center py-16"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1842}}
              , React.createElement('p', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1843}}, "Loading projects…" )
            )
          )
        ) : filteredProjects.length === 0 ? (
          React.createElement(Card, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1847}}
            , React.createElement(CardContent, { className: "flex flex-col items-center justify-center py-16"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1848}}
              , React.createElement(FolderKanban, { className: "h-16 w-16 text-muted-foreground mb-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1849}} )
              , React.createElement('h3', { className: "text-lg font-semibold mb-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1850}}, "No matching projects"  )
              , React.createElement('p', { className: "text-sm text-muted-foreground mb-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1851}}, "Try changing division, district, or tehsil search text"       )
            )
          )
        ) : (
          React.createElement('div', { className: "flex-1 flex flex-col min-h-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1855}}
          , React.createElement('div', { className: "grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1856}}
            , paginatedProjects.map((project) => {
              const isSelected = _optionalChain([selectedProjectForView, 'optionalAccess', _40 => _40.id]) === project.id;
              const accent = getProjectAccent(project.id);
              return (
                React.createElement(Card, {
                  key: project.id,
                  className: `rounded-xl border border-border/80 bg-gradient-to-b from-card to-muted/15 shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden border-l-4 ${accent.borderClass} ${
                    isSelected
                      ? "ring-2 ring-primary shadow-md"
                      : "hover:border-primary/30"
                  }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1861}}

                  , React.createElement(CardHeader, { className: "pb-3 pt-4 px-5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1869}}
                    , React.createElement('div', { className: "flex items-start justify-between gap-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1870}}
                      , React.createElement('div', { className: "flex items-start gap-3 min-w-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1871}}
                        , React.createElement('div', { className: `mt-0.5 h-9 w-9 rounded-lg flex items-center justify-center ${accent.iconBgClass}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1872}}
                          , React.createElement(FolderKanban, { className: `h-5 w-5 ${accent.iconClass}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1873}} )
                        )
                        , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1875}}
                          , React.createElement(CardTitle, { className: "text-base font-semibold leading-tight truncate"   , title: project.project_name || "Unnamed", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1876}}
                            , project.project_name || "Unnamed"
                          )
                          , React.createElement(CardDescription, { className: "text-xs mt-1 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1879}}, "Updated "
                             , project.updated_at ? new Date(project.updated_at).toLocaleDateString() : "—"
                          )
                        )
                      )
                      , React.createElement(Badge, { className: "shrink-0 text-[11px] font-medium px-2 py-0 bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200 border-0"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1884}}, "Active"

                      )
                    )
                  )
                  , React.createElement(CardContent, { className: "px-5 pb-5 pt-0 space-y-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1889}}
                    /* Compact summary: keep the cards clean; full details live in the View panel */
                    , React.createElement('div', { className: "flex flex-wrap gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1891}}
                      , project.project_reference_no && (
                        React.createElement(Badge, {
                          variant: "outline",
                          className: "text-[11px] font-medium bg-background/60 border-border/70 text-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1893}}

                          , React.createElement(FileText, { className: "h-3 w-3 mr-1 text-muted-foreground"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1897}} )
                          , React.createElement('span', { className: "truncate max-w-[160px]" , title: project.project_reference_no, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1898}}
                            , project.project_reference_no
                          )
                        )
                      )
                      , React.createElement(Badge, {
                        variant: "outline",
                        className: "text-[11px] font-medium bg-background/60 border-border/70 text-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1903}}

                        , React.createElement(MapPin, { className: "h-3 w-3 mr-1 text-muted-foreground"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1907}} )
                        , React.createElement('span', { className: "max-w-[220px] truncate" , title: _nullishCoalesce(project.tehsil_name, () => ( String(project.tehsil))), __self: this, __source: {fileName: _jsxFileName, lineNumber: 1908}}
                          , _nullishCoalesce(project.tehsil_name, () => ( String(project.tehsil)))
                        )
                      )
                      , project.project_starting_date && (
                        React.createElement(Badge, {
                          variant: "outline",
                          className: "text-[11px] font-medium bg-background/60 border-border/70 text-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1913}}

                          , React.createElement(Calendar, { className: "h-3 w-3 mr-1 text-muted-foreground"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1917}} )
                          , new Date(project.project_starting_date).toLocaleDateString()
                        )
                      )
                    )

                    , React.createElement('div', { className: "flex items-center gap-2 pt-3 border-t border-border/60"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1923}}
                      , React.createElement(Button, {
                        variant: "default",
                        size: "sm",
                        onClick: () => openEditDialog(project),
                        disabled: updateProjectMutation.isPending,
                        className: "flex-1 gap-1.5 h-8 bg-primary text-primary-foreground hover:bg-primary/90 border-0"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1924}}

                        , React.createElement(Pencil, { className: "h-3.5 w-3.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1931}} ), "Update"

                      )
                      , React.createElement(Button, {
                        variant: "outline",
                        size: "sm",
                        onClick: () => setSelectedProjectForView(isSelected ? null : project),
                        className: `flex-1 gap-1.5 h-8 border-border bg-background hover:bg-muted/50 ${isSelected ? "ring-1 ring-primary/50 bg-muted/30" : ""}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 1934}}

                        , React.createElement(Eye, { className: "h-3.5 w-3.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1940}} ), "View"

                      )
                    )
                  )
                )
              );
            })
          )
          )
        )

        /* Pagination at bottom of page */
        , !projectsLoading && projectsData.length > 0 && totalProjectsPages > 1 && (
          React.createElement('div', { className: "flex items-center justify-center gap-4 py-6 mt-auto border-t border-border/80 shrink-0"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1954}}
            , React.createElement(Button, {
              variant: "outline",
              size: "sm",
              onClick: () => setProjectsPage((p) => Math.max(1, p - 1)),
              disabled: projectsPage <= 1,
              className: "gap-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 1955}}

              , React.createElement(ChevronLeft, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1962}} ), "Previous"

            )
            , React.createElement('span', { className: "text-sm text-muted-foreground min-w-[100px] text-center"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1965}}, "Page "
               , projectsPage, " of "  , totalProjectsPages
            )
            , React.createElement(Button, {
              variant: "default",
              size: "sm",
              onClick: () => setProjectsPage((p) => Math.min(totalProjectsPages, p + 1)),
              disabled: projectsPage >= totalProjectsPages,
              className: "gap-1.5 bg-primary text-primary-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1968}}
, "Next"

              , React.createElement(ChevronRight, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1976}} )
            )
          )
        )

        /* Detail panel: selected project info in the space beneath the cards */
        , selectedProjectForView && (
          React.createElement(Card, { className: "mt-6 border-primary/20 shadow-lg"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1983}}
            , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1984}}
              , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 1985}}
                , React.createElement(CardTitle, { className: "text-xl flex items-center gap-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1986}}
                  , React.createElement(FolderKanban, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1987}} )
                  , selectedProjectForView.project_name || "Unnamed Project"
                )

              )
              , React.createElement(Button, {
                variant: "ghost",
                size: "icon",
                onClick: () => setSelectedProjectForView(null),
                className: "shrink-0",
                'aria-label': "Close detail view"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1992}}

                , React.createElement(X, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 1999}} )
              )
            )
            , React.createElement(CardContent, { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2002}}
              , React.createElement(Tabs, { defaultValue: "overview", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2003}}
                , React.createElement(TabsList, { className: "w-full justify-start gap-1 overflow-x-auto whitespace-nowrap flex-nowrap"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2004}}
                  , React.createElement(TabsTrigger, { value: "overview", className: "shrink-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2005}}, "Project Info" )
                  , React.createElement(TabsTrigger, { value: "financial", className: "shrink-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2006}}, "Financial Details" )
                )

                , React.createElement(TabsContent, { value: "overview", className: "mt-4 space-y-6" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2009}}
                  , selectedProjectForView.project_description && (
                    React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2011}}
                      , React.createElement('h4', { className: "text-sm font-medium mb-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2012}}, "Description")
                      , React.createElement('p', { className: "text-sm text-muted-foreground whitespace-pre-wrap"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2013}}, selectedProjectForView.project_description)
                    )
                  )

                  , React.createElement('div', { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2017}}
                    , React.createElement('div', { className: "flex items-center gap-3 rounded-lg border p-3"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2018}}
                      , React.createElement('div', { className: "h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2019}}
                        , React.createElement(Building2, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2020}} )
                      )
                      , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2022}}
                        , React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2023}}, "Stakeholder")
                        , React.createElement('p', { className: "text-sm font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2024}}
                          , formatProjectStakeholder(selectedProjectForView)
                        )
                      )
                    )
                    , React.createElement('div', { className: "flex items-center gap-3 rounded-lg border p-3"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2029}}
                      , React.createElement('div', { className: "h-10 w-10 rounded-xl bg-violet-500/10 text-violet-700 dark:text-violet-300 flex items-center justify-center"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2030}}
                        , React.createElement(Calendar, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2031}} )
                      )
                      , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2033}}
                        , React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2034}}, "Start Date" )
                        , React.createElement('p', { className: "text-sm font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2035}}
                          , selectedProjectForView.project_starting_date
                            ? new Date(selectedProjectForView.project_starting_date).toLocaleDateString()
                            : "N/A"
                        )
                      )
                    )
                    , React.createElement('div', { className: "flex items-center gap-3 rounded-lg border p-3"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2042}}
                      , React.createElement('div', { className: "h-10 w-10 rounded-xl bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 flex items-center justify-center"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2043}}
                        , React.createElement(FileText, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2044}} )
                      )
                      , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2046}}
                        , React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2047}}, "Reference No" )
                        , React.createElement('p', { className: "text-sm font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2048}}, selectedProjectForView.project_reference_no || "N/A")
                      )
                    )
                    , React.createElement('div', { className: "flex items-center gap-3 rounded-lg border p-3"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2051}}
                      , React.createElement('div', { className: "h-10 w-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2052}}
                        , React.createElement(MapPin, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2053}} )
                      )
                      , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2055}}
                        , React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2056}}, "Location")
                        , React.createElement('p', { className: "text-sm font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2057}}
                          , _nullishCoalesce(selectedProjectForView.tehsil_name, () => ( String(selectedProjectForView.tehsil)))
                        )
                      )
                    )
                  )

                  , (selectedProjectForView.total_budget_allocated != null || selectedProjectForView.budget_utilized != null) && (
                    React.createElement('div', { className: "rounded-lg border p-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2065}}
                      , React.createElement('div', { className: "flex items-center gap-2 mb-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2066}}
                        , React.createElement('div', { className: "h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2067}}
                          , React.createElement(Wallet, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2068}} )
                        )
                        , React.createElement('h4', { className: "text-sm font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2070}}, "Budget")
                      )
                      , React.createElement('div', { className: "flex flex-wrap gap-4 text-sm"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2072}}
                        , selectedProjectForView.total_budget_allocated != null && selectedProjectForView.total_budget_allocated !== "" && (
                          React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2074}}, "Allocated: "
                             , React.createElement('strong', { className: "text-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2075}}, selectedProjectForView.total_budget_allocated)
                          )
                        )
                        , selectedProjectForView.budget_utilized != null && selectedProjectForView.budget_utilized !== "" && (
                          React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2079}}, "Utilized: "
                             , React.createElement('strong', { className: "text-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2080}}, selectedProjectForView.budget_utilized)
                          )
                        )
                        , selectedProjectForView.budget_remaining != null && selectedProjectForView.budget_remaining !== "" && (
                          React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2084}}, "Remaining: "
                             , React.createElement('strong', { className: "text-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2085}}, selectedProjectForView.budget_remaining)
                          )
                        )
                      )
                    )
                  )

                  , selectedProjectForView.xer_file && (
                    React.createElement('div', { className: "rounded-lg border p-3 flex items-center gap-3"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2093}}
                      , React.createElement('div', { className: "h-10 w-10 rounded-xl bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 flex items-center justify-center"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2094}}
                        , React.createElement(FileText, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2095}} )
                      )
                      , React.createElement('div', { className: "flex-1 min-w-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2097}}
                        , React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2098}}, "XER File" )
                        , React.createElement('a', {
                          href: selectedProjectForView.xer_file.startsWith("http") ? selectedProjectForView.xer_file : `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"}${selectedProjectForView.xer_file.startsWith("/") ? "" : "/"}${selectedProjectForView.xer_file}`,
                          target: "_blank",
                          rel: "noopener noreferrer" ,
                          className: "text-sm font-medium text-primary hover:underline truncate block"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2099}}

                          , _nullishCoalesce(selectedProjectForView.xer_file.split("/").pop(), () => ( selectedProjectForView.xer_file))
                        )
                      )
                    )
                  )

                  /* Project area map removed */
                )

                , React.createElement(TabsContent, { value: "financial", className: "mt-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2121}}
                  , (() => {
                    const p = selectedProjectForView ;
                    const hasAny = (...vals) =>
                      vals.some((v) => v !== null && v !== undefined && String(v).trim() !== "");
                    const showAllocation = hasAny(p.allocation_capital_cost, p.allocation_revenue_cost, p.allocation_total_cost);
                    const showPd = hasAny(p.pd_release_capital_cost, p.pd_release_cost, p.pd_release_total_cost);
                    const showSpending = hasAny(p.spending_release_capital_cost, p.spending_release_revenue_cost, p.spending_release_total_cost);
                    const showPifra = hasAny(
                      p.pifra_utilization_capital_cost,
                      p.pifra_utilization_revenue_cost,
                      p.pifra_utilization_total_cost,
                      p.pifra_utilization_date,
                    );
                    const showPct = hasAny(p.percentage_utilization_capital, p.percentage_utilization_revenue, p.percentage_utilization_total);

                    if (!showAllocation && !showPd && !showSpending && !showPifra && !showPct) {
                      return (
                        React.createElement('div', { className: "rounded-lg border p-6 text-center text-sm text-muted-foreground"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2139}}, "No financial details were provided for this project."

                        )
                      );
                    }

                    const formatNum = (v) => {
                      if (v === "" || v == null) return "—";
                      const n = typeof v === "number" ? v : Number(String(v));
                      if (!Number.isFinite(n)) return String(v);
                      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
                    };

                    const Stat = ({ label, value }) => (
                      React.createElement('div', { className: "rounded-lg border bg-muted/20 p-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2153}}
                        , React.createElement('p', { className: "text-[11px] font-semibold text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2154}}, label)
                        , React.createElement('p', { className: "mt-1 text-base font-semibold tabular-nums"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2155}}, formatNum(value))
                      )
                    );

                    const Section = ({
                      title,
                      icon,
                      badgeClassName,
                      children,
                    }




) => (
                      React.createElement('div', { className: "rounded-xl border p-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2170}}
                        , React.createElement('div', { className: "flex items-center gap-2 mb-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2171}}
                          , React.createElement('div', { className: `h-8 w-8 rounded-lg flex items-center justify-center ${badgeClassName}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2172}}
                            , icon
                          )
                          , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2175}}
                            , React.createElement('p', { className: "text-sm font-semibold leading-tight"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2176}}, title)
                            , React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2177}}, "Values in millions (M)"   )
                          )
                        )
                        , children
                      )
                    );

                    return (
                      React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2185}}
                        , showAllocation && (
                          React.createElement(Section, {
                            title: "Allocation",
                            icon: React.createElement(Landmark, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2189}} ),
                            badgeClassName: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2187}}

                            , React.createElement('div', { className: "grid gap-3 sm:grid-cols-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2192}}
                              , React.createElement(Stat, { label: "Capital (M)" , value: p.allocation_capital_cost, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2193}} )
                              , React.createElement(Stat, { label: "Revenue (M)" , value: p.allocation_revenue_cost, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2194}} )
                              , React.createElement(Stat, { label: "Total (M)" , value: p.allocation_total_cost, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2195}} )
                            )
                          )
                        )

                        , showPd && (
                          React.createElement(Section, {
                            title: "P&D Release" ,
                            icon: React.createElement(HandCoins, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2203}} ),
                            badgeClassName: "bg-amber-500/10 text-amber-700 dark:text-amber-300"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2201}}

                            , React.createElement('div', { className: "grid gap-3 sm:grid-cols-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2206}}
                              , React.createElement(Stat, { label: "Capital (M)" , value: p.pd_release_capital_cost, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2207}} )
                              , React.createElement(Stat, { label: "Revenue (M)" , value: p.pd_release_cost, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2208}} )
                              , React.createElement(Stat, { label: "Total (M)" , value: p.pd_release_total_cost, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2209}} )
                            )
                          )
                        )

                        , showSpending && (
                          React.createElement(Section, {
                            title: "Spending Release" ,
                            icon: React.createElement(Wallet, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2217}} ),
                            badgeClassName: "bg-emerald-600/10 text-emerald-800 dark:text-emerald-300"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2215}}

                            , React.createElement('div', { className: "grid gap-3 sm:grid-cols-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2220}}
                              , React.createElement(Stat, { label: "Capital (M)" , value: p.spending_release_capital_cost, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2221}} )
                              , React.createElement(Stat, { label: "Revenue (M)" , value: p.spending_release_revenue_cost, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2222}} )
                              , React.createElement(Stat, { label: "Total (M)" , value: p.spending_release_total_cost, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2223}} )
                            )
                          )
                        )

                        , showPifra && (
                          React.createElement('div', { className: "rounded-xl border p-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2229}}
                            , React.createElement('div', { className: "flex items-center gap-2 mb-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2230}}
                              , React.createElement('div', { className: "h-8 w-8 rounded-lg bg-violet-500/10 text-violet-700 dark:text-violet-300 flex items-center justify-center"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2231}}
                                , React.createElement(Wallet, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2232}} )
                              )
                              , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2234}}
                                , React.createElement('p', { className: "text-sm font-semibold leading-tight"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2235}}, "PIFRA Utilization" )
                                , React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2236}}, "Values in millions (M)"   )
                              )
                            )
                            , React.createElement('div', { className: "grid gap-3 sm:grid-cols-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2239}}
                              , React.createElement(Stat, { label: "Capital (M)" , value: p.pifra_utilization_capital_cost, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2240}} )
                              , React.createElement(Stat, { label: "Revenue (M)" , value: p.pifra_utilization_revenue_cost, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2241}} )
                              , React.createElement(Stat, { label: "Total (M)" , value: p.pifra_utilization_total_cost, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2242}} )
                              , React.createElement('div', { className: "rounded-lg border bg-muted/20 p-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2243}}
                                , React.createElement('p', { className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2244}}
                                  , React.createElement(CalendarDays, { className: "h-3.5 w-3.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2245}} ), "Date"

                                )
                                , React.createElement('p', { className: "mt-1 text-base font-semibold tabular-nums"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2248}}
                                  , p.pifra_utilization_date ? String(p.pifra_utilization_date).slice(0, 10) : "—"
                                )
                              )
                            )
                          )
                        )

                        , showPct && (
                          React.createElement('div', { className: "rounded-xl border p-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2257}}
                            , React.createElement('div', { className: "flex items-center gap-2 mb-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2258}}
                              , React.createElement('div', { className: "h-8 w-8 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 flex items-center justify-center"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2259}}
                                , React.createElement(Percent, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2260}} )
                              )
                              , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2262}}
                                , React.createElement('p', { className: "text-sm font-semibold leading-tight"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2263}}, "% Utilization vs Spending Release"    )
                                , React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2264}}, "Percent values (%)"  )
                              )
                            )
                            , React.createElement('div', { className: "grid gap-3 sm:grid-cols-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2267}}
                              , React.createElement(Stat, { label: "Capital %" , value: p.percentage_utilization_capital, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2268}} )
                              , React.createElement(Stat, { label: "Revenue %" , value: p.percentage_utilization_revenue, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2269}} )
                              , React.createElement(Stat, { label: "Total %" , value: p.percentage_utilization_total, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2270}} )
                            )
                          )
                        )
                      )
                    );
                  })()
                )
              )
            )
          )
        )
        )
        )
      )

      /* Add Project Dialog (also used as full-page on /project-management/create) */
      , React.createElement(Dialog, {
        open: dialogOpen,
        onOpenChange: (open) => {
          setShowAddProjectDialog(open);
          if (!open) {
            resetForm();
            setEditingProject(null);
          }
        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2287}}

        , React.createElement(DialogContent, {
          className: 
            "w-[95vw] max-w-[min(96vw,48rem)] sm:max-w-3xl max-h-[min(92vh,900px)] overflow-y-auto p-4 sm:p-6"
          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2297}}

          , React.createElement(DialogHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2302}}
            , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2303}}, editingProject ? "Update Project" : "Add New Project")
            , React.createElement(DialogDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2304}}
              , editingProject
                ? "Edit the project details below. Leave file fields unchanged unless you want to replace them."
                : "Fill in the project details and upload required files"
            )
          )

          /* Step Indicator */
          , React.createElement('div', { className: "flex flex-col items-center justify-center mb-6"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2312}}
            , React.createElement('div', { className: "flex items-center gap-3 w-fit"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2313}}
              /* Step 1 */
              , React.createElement('div', { className: "flex flex-col items-center"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2315}}
                , React.createElement('div', { className: `flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                  currentStep >= 1 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground bg-background"
                }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2316}}
                  , currentStep > 1 ? (
                    React.createElement(CheckCircle2, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2320}} )
                  ) : (
                    React.createElement('span', { className: "text-sm font-semibold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2322}}, "1")
                  )
                )
                , React.createElement('p', { className: `text-xs font-medium mt-2 ${currentStep === 1 ? "text-primary" : "text-muted-foreground"}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2325}}, "Project Details"

                )
              )

              /* Animated Progress Line */
              , React.createElement('div', { className: "relative w-24 h-1 bg-muted rounded-full overflow-hidden mt-4"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2331}}
                , currentStep >= 2 && (
                  React.createElement(React.Fragment, null
                    , React.createElement('div', { className: "absolute inset-0 bg-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2334}} )
                    , React.createElement('div', { 
                      className: "absolute inset-0" ,
                      style: {
                        background: 'linear-gradient(90deg, transparent 30%, #ef4444 50%, transparent 70%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s linear infinite',
                      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2335}}
                    )
                  )
                )
              )

              /* Step 2 */
              , React.createElement('div', { className: "flex flex-col items-center"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2348}}
                , React.createElement('div', { className: `flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                  currentStep >= 2 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground bg-background"
                }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2349}}
                  , currentStep > 2 ? React.createElement(CheckCircle2, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2352}} ) : React.createElement('span', { className: "text-sm font-semibold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2352}}, "2")
                )
                , React.createElement('p', { className: `text-xs font-medium mt-2 text-center max-w-[5.5rem] leading-tight ${currentStep === 2 ? "text-primary" : "text-muted-foreground"}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2354}}, "XER + map"

                )
              )

              /* Step 3 removed */
            )
          )

          , React.createElement('style', { dangerouslySetInnerHTML: {__html: `
            @keyframes shimmer {
              0% {
                background-position: -200% 0;
              }
              100% {
                background-position: 200% 0;
              }
            }
          `}, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2399}} )

          , React.createElement('form', { onSubmit: handleSubmit, className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2410}}
            /* Step 1: Project Details */
            , currentStep === 1 && (
              React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2413}}
                /* Project Name */
                , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2415}}
                  , React.createElement(Label, { htmlFor: "projectName", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2416}}, "Project Name *"  )
                  , React.createElement(Input, {
                    id: "projectName",
                    placeholder: "Enter project name"  ,
                    value: projectName,
                    onChange: (e) => setProjectName(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 2417}}
                  )
                )
                , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2424}}
                  , React.createElement(Label, { htmlFor: "category_modal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2425}}, "Category" )
                  , React.createElement(Select, { value: category || "", onValueChange: setCategory, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2426}}
                    , React.createElement(SelectTrigger, { id: "category_modal", className: "w-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2427}}
                      , React.createElement(SelectValue, { placeholder: "Select category", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2428}} )
                    )
                    , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2430}}
                      , React.createElement(SelectItem, { value: "Basic Health Unit", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2431}}, "Basic Health Unit" )
                      , React.createElement(SelectItem, { value: "Dispensary", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2432}}, "Dispensary" )
                      , React.createElement(SelectItem, { value: "Dispilated", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2433}}, "Dispilated" )
                    )
                  )
                )

                /* Project Description */
                , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2426}}
                  , React.createElement(Label, { htmlFor: "projectDescription", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2427}}, "Project Description *"  )
                  , React.createElement(Textarea, {
                    id: "projectDescription",
                    placeholder: "Enter project description..."  ,
                    value: projectDescription,
                    onChange: (e) => setProjectDescription(e.target.value),
                    rows: 4, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2428}}
                  )
                )

                /* Starting Date and Reference Number */
                , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2438}}
                  , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2439}}
                    , React.createElement(Label, { htmlFor: "startingDate", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2440}}, "Project Starting Date *"   )
                    , React.createElement(Input, {
                      id: "startingDate",
                      type: "date",
                      value: startingDate,
                      onChange: (e) => setStartingDate(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 2441}}
                    )
                  )
                  , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2448}}
                    , React.createElement(Label, { htmlFor: "referenceNumber", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2449}}, "Project Reference No *"   )
                    , React.createElement(Input, {
                      id: "referenceNumber",
                      placeholder: "Enter reference number"  ,
                      value: referenceNumber,
                      onChange: (e) => setReferenceNumber(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 2450}}
                    )
                  )
                )

                , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2457}}
                  , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2458}}
                    , React.createElement(Label, { htmlFor: "totalBudgetAllocated", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2459}}, "Total Budget" )
                    , React.createElement(Input, {
                      id: "totalBudgetAllocated",
                      type: "number",
                      min: 0,
                      step: "any",
                      placeholder: "e.g. 1000000",
                      value: totalBudgetAllocated,
                      onChange: (e) => setTotalBudgetAllocated(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 2460}}
                    )
                  )
                  , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2467}}
                    , React.createElement(Label, { htmlFor: "budgetUtilized", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2468}}, "Total Consume" )
                    , React.createElement(Input, {
                      id: "budgetUtilized",
                      type: "number",
                      min: 0,
                      step: "any",
                      placeholder: "e.g. 250000",
                      value: budgetUtilized,
                      onChange: (e) => setBudgetUtilized(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 2469}}
                    )
                  )
                  , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2476}}
                    , React.createElement(Label, { htmlFor: "remainingBudget", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2477}}, "Remaining Budget" )
                    , React.createElement(Input, {
                      id: "remainingBudget",
                      type: "number",
                      value: remainingBudget,
                      disabled: true,
                      readOnly: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2478}}
                    )
                  )
                )

                /* Stakeholder (multi-select) */
                , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2460}}
                  , React.createElement(Label, { htmlFor: "stakeholderIds", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2461}}, "Stakeholder(s) *" )
                  , React.createElement(Popover, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2462}}
                    , React.createElement(PopoverTrigger, { asChild: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2463}}
                      , React.createElement(Button, {
                        id: "stakeholderIds",
                        variant: "outline",
                        role: "combobox",
                        className: "w-full justify-between font-normal min-h-10 h-auto py-2"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2464}}

                        , React.createElement('span', { className: "truncate", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2470}}
                          , stakeholderIds.length === 0
                            ? "Select stakeholder(s)"
                            : stakeholderIds
                                .map((id) => stakeholdersList.find((s) => String(s.id) === id))
                                .filter(Boolean)
                                .map((s) => `${s.stakeholder_title} (${s.stakeholder_type})`)
                                .join(", ")
                        )
                        , React.createElement(ChevronDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2479}} )
                      )
                    )
                    , React.createElement(PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0" , align: "start", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2482}}
                      , React.createElement('div', { className: "max-h-60 overflow-auto p-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2483}}
                        , stakeholdersList.map((s) => (
                          React.createElement('label', {
                            key: s.id,
                            className: "flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted cursor-pointer"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2485}}

                            , React.createElement(Checkbox, {
                              checked: stakeholderIds.includes(String(s.id)),
                              onCheckedChange: (checked) => {
                                setStakeholderIds((prev) =>
                                  checked
                                    ? [...prev, String(s.id)]
                                    : prev.filter((id) => id !== String(s.id))
                                );
                              }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2489}}
                            )
                            , React.createElement('span', { className: "text-sm", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2499}}
                              , s.stakeholder_title, " (" , s.stakeholder_type, ")"
                            )
                          )
                        ))
                      )
                    )
                  )
                )

                , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2506}}
                  , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2507}}
                    , React.createElement(Label, { htmlFor: "zone_modal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2508}}, "Zone" )
                    , React.createElement(Select, { value: zone || "", onValueChange: setZone, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2509}}
                      , React.createElement(SelectTrigger, { id: "zone_modal", className: "w-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2510}}
                        , React.createElement(SelectValue, { placeholder: zoneOptions.length ? "Select zone" : "No zone options", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2511}} )
                      )
                      , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2513}}
                        , zoneOptions.map((z) => (
                          React.createElement(SelectItem, { key: z, value: z, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2515}}, z )
                        ))
                      )
                    )
                  )
                  , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2517}}
                    , React.createElement(Label, { htmlFor: "circle_modal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2518}}, "Circle" )
                    , React.createElement(Select, { value: circle || "", onValueChange: setCircle, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2519}}
                      , React.createElement(SelectTrigger, { id: "circle_modal", className: "w-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2520}}
                        , React.createElement(SelectValue, { placeholder: circleOptions.length ? "Select circle" : "No circle options", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2521}} )
                      )
                      , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2523}}
                        , circleOptions.map((c) => (
                          React.createElement(SelectItem, { key: c, value: c, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2525}}, c )
                        ))
                      )
                    )
                  )
                )

                /* Province/Division removed */

                /* District — searchable */
                , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2617}}
                  , React.createElement(Label, { htmlFor: "district", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2618}}, "District *" )
                  , React.createElement(Popover, { open: districtComboboxOpen, onOpenChange: setDistrictComboboxOpen, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2619}}
                    , React.createElement(PopoverTrigger, { asChild: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2620}}
                      , React.createElement(Button, {
                        id: "district",
                        variant: "outline",
                        role: "combobox",
                        'aria-expanded': districtComboboxOpen,
                        className: "w-full justify-between font-normal h-9 px-3 text-sm"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2621}}

                        , React.createElement('span', { className: "truncate", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2629}}
                          , selectedDistrictId
                            ? (_nullishCoalesce(_nullishCoalesce(_optionalChain([districtsList, 'access', _47 => _47.find, 'call', _48 => _48((d) => String(d.id) === selectedDistrictId), 'optionalAccess', _49 => _49.district_name]), () => (
                              (editingProject && Number(selectedDistrictId) === editingProject.district ? editingProject.district_name : null))), () => (
                              "Select district")))
                            : "Select district"
                        )
                        , React.createElement(ChevronDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2636}} )
                      )
                    )
                    , React.createElement(PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0" , align: "start", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2639}}
                      , React.createElement(Command, {
                        filter: (value, search) => {
                          const q = (search || "").toLowerCase();
                          if (!q) return 1;
                          return (value || "").toLowerCase().includes(q) ? 1 : 0;
                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2640}}

                        , React.createElement(CommandInput, { placeholder: "Type to search district…"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2647}} )
                        , React.createElement(CommandList, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2648}}
                          , React.createElement(CommandEmpty, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2649}}, "No district found."  )
                          , React.createElement(CommandGroup, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2650}}
                            , districtsList.map((d) => (
                              React.createElement(CommandItem, {
                                key: d.id,
                                value: d.district_name,
                                onSelect: () => {
                                  skipGeographyClearRef.current = false;
                                  setSelectedDistrictId(String(d.id));
                                  setDistrictComboboxOpen(false);
                                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2652}}

                                , d.district_name
                              )
                            ))
                          )
                        )
                      )
                    )
                  )
                )

                /* Tehsil — searchable */
                , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2672}}
                  , React.createElement(Label, { htmlFor: "tehsil", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2673}}, "Tehsil *" )
                  , React.createElement(Popover, { open: tehsilComboboxOpen, onOpenChange: setTehsilComboboxOpen, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2674}}
                    , React.createElement(PopoverTrigger, { asChild: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2675}}
                      , React.createElement(Button, {
                        id: "tehsil",
                        variant: "outline",
                        role: "combobox",
                        'aria-expanded': tehsilComboboxOpen,
                        disabled: !selectedDistrictId,
                        className: "w-full justify-between font-normal h-9 px-3 text-sm"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2676}}

                        , React.createElement('span', { className: "truncate", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2684}}
                          , selectedTehsilId
                            ? (_nullishCoalesce(_nullishCoalesce(_optionalChain([tehsilsList, 'access', _50 => _50.find, 'call', _51 => _51((t) => String(t.id) === selectedTehsilId), 'optionalAccess', _52 => _52.tehsil_name]), () => (
                              (editingProject && Number(selectedTehsilId) === editingProject.tehsil ? editingProject.tehsil_name : null))), () => (
                              "Select tehsil")))
                            : selectedDistrictId ? "Select tehsil" : "Select district first"
                        )
                        , React.createElement(ChevronDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2691}} )
                      )
                    )
                    , React.createElement(PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0" , align: "start", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2694}}
                      , React.createElement(Command, {
                        filter: (value, search) => {
                          const q = (search || "").toLowerCase();
                          if (!q) return 1;
                          return (value || "").toLowerCase().includes(q) ? 1 : 0;
                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2695}}

                        , React.createElement(CommandInput, { placeholder: "Type to search tehsil…"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2702}} )
                        , React.createElement(CommandList, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2703}}
                          , React.createElement(CommandEmpty, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2704}}, "No tehsil found."  )
                          , React.createElement(CommandGroup, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2705}}
                            , tehsilsList.map((t) => (
                              React.createElement(CommandItem, {
                                key: t.id,
                                value: t.tehsil_name,
                                onSelect: () => {
                                  skipGeographyClearRef.current = false;
                                  setSelectedTehsilId(String(t.id));
                                  setTehsilComboboxOpen(false);
                                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2707}}

                                , t.tehsil_name
                              )
                            ))
                          )
                        )
                      )
                    )
                  )
                )
              )
            )

            , currentStep === 1 && (
              React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2728}}
                , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2729}}
                  , React.createElement(Label, { htmlFor: "latitudeCoordinates_modal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2730}}, "Latitude Coordinates" )
                  , React.createElement(Input, {
                    id: "latitudeCoordinates_modal",
                    type: "number",
                    step: "any",
                    placeholder: "e.g. 31.5204",
                    value: latitudeCoordinates,
                    onChange: (e) => setLatitudeCoordinates(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 2731}}
                  )
                )
                , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2740}}
                  , React.createElement(Label, { htmlFor: "longitudeCoordinates_modal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2741}}, "Longitude Coordinates" )
                  , React.createElement(Input, {
                    id: "longitudeCoordinates_modal",
                    type: "number",
                    step: "any",
                    placeholder: "e.g. 74.3587",
                    value: longitudeCoordinates,
                    onChange: (e) => setLongitudeCoordinates(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 2742}}
                  )
                )
              )
            )

            /* Step 2: Schedule (XER) */
            , currentStep === 2 && (
              React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2730}}
                , React.createElement(WizardXerUploadSection, {
                  editingProject: editingProject,
                  xerFile: xerFile,
                  onXerInputChange: handleXERFileChange,
                  onClearXer: () => setXerFile(null), __self: this, __source: {fileName: _jsxFileName, lineNumber: 2764}}
                )
              )
            )

            /* Step 3 removed */

            , React.createElement(DialogFooter, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 2985}}
              , React.createElement(Button, { 
                type: "button", 
                variant: "outline", 
                onClick: () => {
                  setShowAddProjectDialog(false);
                  resetForm();
                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 2986}}
, "Cancel"

              )
              , currentStep === 1 && (
                React.createElement(Button, { type: "button", onClick: handleNext, className: "gap-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 2997}}, "Next"

                  , React.createElement(ChevronRight, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 2999}} )
                )
              )
              , currentStep === 2 && (
                React.createElement(React.Fragment, null
                  , React.createElement(Button, { 
                    type: "button", 
                    variant: "outline", 
                    onClick: handlePrevious,
                    className: "gap-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 3004}}

                    , React.createElement(ChevronLeft, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 3010}} ), "Previous"

                  )
                  , React.createElement(Button, { type: "submit", disabled: updateProjectMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 3013}}
                    , editingProject ? "Update Project" : "Create Project"
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
