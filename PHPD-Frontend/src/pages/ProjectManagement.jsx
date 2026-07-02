import React from "react";

// Transpiler-compatibility helpers (nullish coalesce + optional chain)
const _nullishCoalesce = (lhs, rhsFn) => lhs != null ? lhs : rhsFn();
const _optionalChain = (ops) => {
  let lastAccessLHS;
  let value = ops[0];
  let i = 1;
  while (i < ops.length) {
    const op = ops[i];
    const fn = ops[i + 1];
    i += 2;
    if ((op === "optionalAccess" || op === "optionalCall") && value == null) return undefined;
    if (op === "access" || op === "optionalAccess") { lastAccessLHS = value; value = fn(value); }
    else if (op === "call" || op === "optionalCall") { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; }
  }
  return value;
};

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
  listProvinces,
  listDivisions,
  createProject,
  updateProject,
  deleteProject,
  listProjectActivities,
} from "@/api";

import { mediaUrl } from "@/api/config";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

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
  return "â€”";
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

/** Step 2: Primavera XER â€” opens the device file picker (same backend multipart field `xer_file`). */
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
    React.createElement('div', { className: "space-y-3 min-w-0" }
      , React.createElement('div', {}
        , React.createElement(Label, { htmlFor: XER_FILE_INPUT_ID, className: "text-base"}, "Primavera schedule (XER)"
            , editingProject ? "" : " *"
        )
        , React.createElement('p', { className: "text-xs text-muted-foreground mt-1 leading-relaxed"   }, "Export from Primavera P6, then use "
                , React.createElement('span', { className: "font-medium"}, "Choose file" ), " or tap the area below. On phone or tablet this opens your Files / Downloads app so you can pick the "
                          , React.createElement('code', { className: "text-[11px]"}, ".xer"), " from any folder. The server stores the file and builds the activity list for the Gantt chart."

        )
      )

      , editingProject && editingProject.xer_file && !xerFile && (
        React.createElement('div', { className: "rounded-lg border bg-muted/50 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3"         }
          , React.createElement(FileText, { className: "h-8 w-8 text-muted-foreground shrink-0"   } )
          , React.createElement('div', { className: "flex-1 min-w-0 space-y-1"  }
            , React.createElement('p', { className: "text-sm font-medium truncate"  }, "Current: "
               , _nullishCoalesce(editingProject.xer_file.split("/").pop(), () => ( editingProject.xer_file))
            )
            , existingXerHref ? (
              React.createElement('a', {
                href: existingXerHref,
                target: "_blank",
                rel: "noopener noreferrer" ,
                className: "text-xs text-primary hover:underline inline-block"   }
, "Open / download"

              )
            ) : null
          )
        )
      )

      , React.createElement('div', { className: "flex flex-col gap-3"  }
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
          'aria-label': "Select XER schedule file"   }

          , xerFile ? (
            React.createElement('div', { className: "flex flex-col sm:flex-row items-center gap-3 w-full max-w-full"      }
              , React.createElement(FileText, { className: "h-10 w-10 text-primary shrink-0"   } )
              , React.createElement('div', { className: "flex-1 min-w-0 text-left w-full"   }
                , React.createElement('p', { className: "font-medium text-sm sm:text-base break-all"   }, xerFile.name)
                , React.createElement('p', { className: "text-xs text-muted-foreground mt-0.5"  }
                  , (xerFile.size / 1024).toFixed(2), " KB Â· ready to upload"
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
                'aria-label': "Remove XER file"  }

                , React.createElement(X, { className: "h-4 w-4" } )
              )
            )
          ) : (
            React.createElement(React.Fragment, null
              , React.createElement(Upload, { className: "h-10 w-10 text-muted-foreground shrink-0"   } )
              , React.createElement('p', { className: "text-sm sm:text-base font-medium"  }, "Tap to choose from this device"     )
              , React.createElement('p', { className: "text-xs text-muted-foreground max-w-md"  }, ".xer only â€” same file is sent to the server on Create for schedule import."

              )
            )
          )
        )

        , React.createElement(Button, { type: "button", variant: "secondary", className: "w-full sm:w-auto min-h-11 px-6"   , onClick: openPicker}
          , React.createElement(FolderKanban, { className: "h-4 w-4 mr-2 shrink-0"   } ), "Choose fileâ€¦"

        )

        , React.createElement(Input, {
          id: XER_FILE_INPUT_ID,
          type: "file",
          accept: ".xer,.XER,application/octet-stream",
          onChange: onXerInputChange,
          className: "sr-only"}
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
  const [selectedProjectActivities, setSelectedProjectActivities] = useState([]);
  const [selectedProjectActivitiesLoading, setSelectedProjectActivitiesLoading] =
    useState(false);
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
  const { data: zonesList = [] } = useQuery({
    queryKey: ["zones"],
    queryFn: listProvinces,
  });

  const [selectedZoneId, setSelectedZoneId] = useState("");
  const zoneIdNum = selectedZoneId ? Number(selectedZoneId) : undefined;
  const { data: circlesList = [] } = useQuery({
    queryKey: ["circles", zoneIdNum],
    queryFn: () => listDivisions(zoneIdNum),
    enabled: !!zoneIdNum,
  });

  const [selectedCircleId, setSelectedCircleId] = useState("");
  const circleIdNum = selectedCircleId ? Number(selectedCircleId) : undefined;
  const { data: districtsList = [] } = useQuery({
    queryKey: ["districts", circleIdNum],
    queryFn: () => listDistricts(circleIdNum),
    enabled: !!circleIdNum,
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
    onSuccess: async (created) => {
      // Backend can populate ProjectActivity rows by parsing the uploaded XER.
      // Some setups do this lazily on the first "list activities" call, so we trigger it here.
      try {
        if (created?.id != null) await listProjectActivities(created.id);
      } catch {
        // Best-effort: project creation succeeded even if parsing failed.
      }
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
  const [categoryOther, setCategoryOther] = useState("");
  const [latitudeCoordinates, setLatitudeCoordinates] = useState("");
  const [longitudeCoordinates, setLongitudeCoordinates] = useState("");
  const [stakeholderIds, setStakeholderIds] = useState([]);
  const [selectedTehsilId, setSelectedTehsilId] = useState("");
  const [zoneComboboxOpen, setZoneComboboxOpen] = useState(false);
  const [circleComboboxOpen, setCircleComboboxOpen] = useState(false);
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



  useEffect(() => {
    if (skipGeographyClearRef.current) return;
    setSelectedCircleId("");
    setSelectedDistrictId("");
    setSelectedTehsilId("");
  }, [selectedZoneId]);

  useEffect(() => {
    if (skipGeographyClearRef.current) return;
    setSelectedDistrictId("");
    setSelectedTehsilId("");
  }, [selectedCircleId]);

  useEffect(() => {
    if (skipGeographyClearRef.current) return;
    setSelectedTehsilId("");
  }, [selectedDistrictId]);

  // When editing a project, keep cascading clear disabled until all prefilled IDs are applied.
  useEffect(() => {
    if (!skipGeographyClearRef.current) return;
    if (!editingProject) return;
    const allSet =
      selectedZoneId === String(editingProject.zone) &&
      selectedCircleId === String(editingProject.circle) &&
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
    setCategoryOther("");
    setProjectDescription("");
    setStartingDate("");
    setReferenceNumber("");
    setLatitudeCoordinates("");
    setLongitudeCoordinates("");
    setSelectedZoneId("");
    setSelectedCircleId("");
    setStakeholderIds([]);
    setSelectedDistrictId("");
    setSelectedTehsilId("");
    setTotalBudgetAllocated("");
    setBudgetUtilized("");
    setXerFile(null);
    setCurrentStep(1);
  };

  // Open dialog for editing a project â€” prefetch division/district/tehsil so dropdowns show selected values
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
      queryClient.prefetchQuery({ queryKey: ["zones"], queryFn: listProvinces }),
      queryClient.prefetchQuery({ queryKey: ["circles", p.zone], queryFn: () => listDivisions(p.zone) }),
      queryClient.prefetchQuery({ queryKey: ["districts", p.circle], queryFn: () => listDistricts(p.circle) }),
      queryClient.prefetchQuery({ queryKey: ["tehsils", p.district], queryFn: () => listTehsils(p.district) }),
    ]);
    setEditingProject(p);
    setProjectName(_nullishCoalesce(p.project_name, () => ( "")));
    setCategory(_nullishCoalesce(p.project_category, () => ( "")));
    setCategoryOther(_nullishCoalesce(p.project_category_other, () => ( "")));
    setProjectDescription(_nullishCoalesce(p.project_description, () => ( "")));
    setStartingDate(p.project_starting_date ? p.project_starting_date.slice(0, 10) : "");
    setReferenceNumber(_nullishCoalesce(p.project_reference_no, () => ( "")));
    setLatitudeCoordinates(
      String(
        _nullishCoalesce(p.latitude, () => (
          _nullishCoalesce(p.latitude_coordinates, () => ( ""))
        ))
      )
    );
    setLongitudeCoordinates(
      String(
        _nullishCoalesce(p.longitude, () => (
          _nullishCoalesce(p.longitude_coordinates, () => ( ""))
        ))
      )
    );
    setSelectedZoneId(String(p.zone));
    // selectedCircleId removed as it's not in the Project model
    setStakeholderIds(
      Array.isArray(p.stakeholder)
        ? p.stakeholder.map(String)
        : p.stakeholder != null
          ? [String(p.stakeholder)]
          : []
    );
    setSelectedDistrictId(String(p.district));
    setSelectedTehsilId(String(p.tehsil));
    setTotalBudgetAllocated(
      _nullishCoalesce(p.total_budget, () => (
        _nullishCoalesce(p.total_budget_allocated, () => ( ""))
      ))
    );
    setBudgetUtilized(
      _nullishCoalesce(p.total_consume, () => (
        _nullishCoalesce(p.budget_utilized, () => ( ""))
      ))
    );

    setXerFile(null);
    setCurrentStep(1);
    setShowAddProjectDialog(true);
  };

  // Validate step 1
  const validateStep1 = () => {
    // Frontend validation intentionally disabled (temporary).
    return true;
  };

  // Validate step 2 (schedule + boundary â€” backend consumes both on create)
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
            project_category: category === "Other" ? "Other" : (category.trim() || null),
            project_category_other: category === "Other" ? categoryOther.trim() : null,
            project_description: projectDescription.trim() || null,
            project_starting_date: startingDate || null,
            project_reference_no: referenceNumber.trim() || null,
            latitude: latitudeCoordinates.trim() || null,
            longitude: longitudeCoordinates.trim() || null,
            zone: selectedZoneId ? Number(selectedZoneId) : null,
            district: selectedDistrictId ? Number(selectedDistrictId) : null,
            tehsil: selectedTehsilId ? Number(selectedTehsilId) : null,
            total_budget: totalBudgetAllocated.trim() || null,
            total_consume: budgetUtilized.trim() || null,
            remaining_budget: String(remaining),
          },
        });
      } else {
        createProjectMutation.mutate({
          stakeholder: stakeholderIds.map(Number),
          project_name: projectName.trim() || null,
          project_category: category === "Other" ? "Other" : (category.trim() || null),
          project_category_other: category === "Other" ? categoryOther.trim() : null,
          project_description: projectDescription.trim() || null,
          project_starting_date: startingDate || null,
          project_reference_no: referenceNumber.trim() || null,
          latitude: latitudeCoordinates.trim() || null,
          longitude: longitudeCoordinates.trim() || null,
          zone: selectedZoneId ? Number(selectedZoneId) : null,
          district: selectedDistrictId ? Number(selectedDistrictId) : null,
          tehsil: selectedTehsilId ? Number(selectedTehsilId) : null,
          total_budget: totalBudgetAllocated.trim() || null,
          total_consume: budgetUtilized.trim() || null,
          remaining_budget: String(remaining),
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
      const zoneText = (_nullishCoalesce(project.zone_name, () => ( String(_nullishCoalesce(project.zone, () => ( "")))))).toLowerCase();
      const circleText = (_nullishCoalesce(project.circle_name, () => ( String(_nullishCoalesce(project.circle, () => ( "")))))).toLowerCase();
      const districtText = (_nullishCoalesce(project.district_name, () => ( String(_nullishCoalesce(project.district, () => ( "")))))).toLowerCase();
      const tehsilText = (_nullishCoalesce(project.tehsil_name, () => ( String(_nullishCoalesce(project.tehsil, () => ( "")))))).toLowerCase();

      if (!query) return true;
      return (
        zoneText.includes(query) ||
        circleText.includes(query) ||
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

  // When a project is opened in "View" panel, load its activities list.
  // Backend may parse XER lazily inside list-project-activity, so this doubles as a trigger.
  useEffect(() => {
    let cancelled = false;
    async function run() {
      const pid = selectedProjectForView?.id;
      if (!pid) {
        setSelectedProjectActivities([]);
        return;
      }
      setSelectedProjectActivitiesLoading(true);
      try {
        const acts = await listProjectActivities(pid);
        if (!cancelled) setSelectedProjectActivities(Array.isArray(acts) ? acts : []);
      } catch {
        if (!cancelled) setSelectedProjectActivities([]);
      } finally {
        if (!cancelled) setSelectedProjectActivitiesLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedProjectForView]);

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
      React.createElement(Layout, { title: "Create New Project"  }
        , React.createElement('div', { className: "flex flex-col min-h-[calc(100vh-8rem)] w-full min-w-0"    }
          , React.createElement('div', { className: "max-w-5xl mx-auto w-full"  }
            , React.createElement(Card, {}
              , React.createElement(CardHeader, {}
                , React.createElement(CardTitle, {}, editingProject ? "Update Project" : "Add New Project")
                , React.createElement(CardDescription, {}
                  , editingProject
                    ? "Edit the project details below. Leave file fields unchanged unless you want to replace them."
                    : "Fill in the project details and upload required files"
                )
              )
              , React.createElement(CardContent, {}
                /* Reuse the same wizard (step indicator + all 3 steps + footer) */
                /* Step Indicator */
                , React.createElement('div', { className: "flex flex-col items-center justify-center mb-6"    }
                  , React.createElement('div', { className: "flex items-center gap-3 w-fit"   }
                    /* Step 1 */
                    , React.createElement('div', { className: "flex flex-col items-center"  }
                      , React.createElement('div', { className: `flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                        currentStep >= 1 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground bg-background"
                      }`}
                        , currentStep > 1 ? (
                          React.createElement(CheckCircle2, { className: "h-4 w-4" } )
                        ) : (
                          React.createElement('span', { className: "text-sm font-semibold" }, "1")
                        )
                      )
                      , React.createElement('p', { className: `text-xs font-medium mt-2 ${currentStep === 1 ? "text-primary" : "text-muted-foreground"}`}, "Project Details"

                      )
                    )

                    , React.createElement('div', { className: "relative w-24 h-1 bg-muted rounded-full overflow-hidden mt-4"      }
                      , currentStep >= 2 && (
                        React.createElement(React.Fragment, null
                          , React.createElement('div', { className: "absolute inset-0 bg-primary"  } )
                          , React.createElement('div', {
                            className: "absolute inset-0" ,
                            style: {
                              background: "linear-gradient(90deg, transparent 30%, #ef4444 50%, transparent 70%)",
                              backgroundSize: "200% 100%",
                              animation: "shimmer 1.5s linear infinite",
                            }}
                          )
                        )
                      )
                    )

                    /* Step 2 */
                    , React.createElement('div', { className: "flex flex-col items-center"  }
                      , React.createElement('div', { className: `flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                        currentStep >= 2 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground bg-background"
                      }`}
                        , currentStep > 2 ? React.createElement(CheckCircle2, { className: "h-4 w-4" } ) : React.createElement('span', { className: "text-sm font-semibold" }, "2")
                      )
                      , React.createElement('p', { className: `text-xs font-medium mt-2 text-center max-w-[5.5rem] leading-tight ${currentStep === 2 ? "text-primary" : "text-muted-foreground"}`}, "XER"

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
                  }}
                )

                /* Full wizard form (same handlers/mutations as modal) */
                , React.createElement('div', { className: "rounded-xl border-2 border-green-600 p-4"}
                  , React.createElement('form', { onSubmit: handleSubmit, className: "space-y-6"}
                  /* Step 1: Project Details */
                  , currentStep === 1 && (
                    React.createElement('div', { className: "space-y-6"}
                      , React.createElement('div', { className: "space-y-2"}
                        , React.createElement(Label, { htmlFor: "projectName"}, "Project Name *"  )
                        , React.createElement(Input, {
                          id: "projectName",
                          placeholder: "Enter project name"  ,
                          value: projectName,
                          onChange: (e) => setProjectName(e.target.value)}
                        )
                      )
                      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4"   }
                        , React.createElement('div', { className: "space-y-2"}
                          , React.createElement(Label, { htmlFor: "category"}, "Category" )
                          , React.createElement(Select, { value: category || "", onValueChange: setCategory}
                            , React.createElement(SelectTrigger, { id: "category", className: "w-full"}
                              , React.createElement(SelectValue, { placeholder: "Select category"} )
                            )
                            , React.createElement(SelectContent, {}
                              , React.createElement(SelectItem, { value: "Basic Health Unit"}, "Basic Health Unit" )
                              , React.createElement(SelectItem, { value: "Dispensary"}, "Dispensary" )
                              , React.createElement(SelectItem, { value: "Dispilated"}, "Dispilated" )
                              , React.createElement(SelectItem, { value: "Other"}, "Other" )
                            )
                          )
                        )
                        , category === "Other" && (
                          React.createElement('div', { className: "space-y-2"}
                            , React.createElement(Label, { htmlFor: "categoryOther"}, "Please specify category"  )
                            , React.createElement(Input, {
                              id: "categoryOther",
                              placeholder: "Enter category name"  ,
                              value: categoryOther,
                              onChange: (e) => setCategoryOther(e.target.value)}
                            )
                          )
                        )
                      )
                      , React.createElement('div', { className: "space-y-2"}
                        , React.createElement(Label, { htmlFor: "projectDescription"}, "Project Description *"  )
                        , React.createElement(Textarea, {
                          id: "projectDescription",
                          placeholder: "Enter project description..."  ,
                          value: projectDescription,
                          onChange: (e) => setProjectDescription(e.target.value),
                          rows: 4}
                        )
                      )
                      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4"   }
                        , React.createElement('div', { className: "space-y-2"}
                          , React.createElement(Label, { htmlFor: "startingDate"}, "Project Starting Date *"   )
                          , React.createElement(Input, {
                            id: "startingDate",
                            type: "date",
                            value: startingDate,
                            onChange: (e) => setStartingDate(e.target.value)}
                          )
                        )
                        , React.createElement('div', { className: "space-y-2"}
                          , React.createElement(Label, { htmlFor: "referenceNumber"}, "Project Reference No *"   )
                          , React.createElement(Input, {
                            id: "referenceNumber",
                            placeholder: "Enter reference number"  ,
                            value: referenceNumber,
                            onChange: (e) => setReferenceNumber(e.target.value)}
                          )
                        )
                      )
                      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4"   }
                        , React.createElement('div', { className: "space-y-2"}
                          , React.createElement(Label, { htmlFor: "totalBudgetAllocated"}, "Total Budget" )
                          , React.createElement(Input, {
                            id: "totalBudgetAllocated",
                            type: "number",
                            min: 0,
                            step: "any",
                            placeholder: "e.g. 1000000",
                            value: totalBudgetAllocated,
                            onChange: (e) => setTotalBudgetAllocated(e.target.value)}
                          )
                        )
                        , React.createElement('div', { className: "space-y-2"}
                          , React.createElement(Label, { htmlFor: "budgetUtilized"}, "Total Consume" )
                          , React.createElement(Input, {
                            id: "budgetUtilized",
                            type: "number",
                            min: 0,
                            step: "any",
                            placeholder: "e.g. 250000",
                            value: budgetUtilized,
                            onChange: (e) => setBudgetUtilized(e.target.value)}
                          )
                        )
                        , React.createElement('div', { className: "space-y-2"}
                          , React.createElement(Label, { htmlFor: "remainingBudget"}, "Remaining Budget" )
                          , React.createElement(Input, {
                            id: "remainingBudget",
                            type: "number",
                            value: remainingBudget,
                            disabled: true,
                            readOnly: true}
                          )
                        )
                      )
                      , React.createElement('div', { className: "space-y-2"}
                        , React.createElement(Label, { htmlFor: "stakeholderIds"}, "Stakeholder(s) *" )
                        , React.createElement(Popover, {}
                          , React.createElement(PopoverTrigger, { asChild: true}
                            , React.createElement(Button, {
                              id: "stakeholderIds",
                              variant: "outline",
                              className: "w-full justify-between" ,
                              type: "button"}

                              , stakeholderIds.length > 0
                                ? `${stakeholderIds.length} stakeholder(s) selected`
                                : "Select stakeholders"
                              , React.createElement(ChevronDown, { className: "h-4 w-4 opacity-50"  } )
                            )
                          )
                          , React.createElement(PopoverContent, { className: "p-0 w-[var(--radix-popover-trigger-width)]" , align: "start"}
                            , React.createElement(Command, {}
                              , React.createElement(CommandInput, { placeholder: "Search stakeholders..." } )
                              , React.createElement(CommandList, {}
                                , React.createElement(CommandEmpty, {}, "No stakeholders found."  )
                                , React.createElement(CommandGroup, {}
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
                                        }}

                                        , React.createElement(Checkbox, { checked: selected, className: "mr-2"} )
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

                      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4"   }
                        , React.createElement('div', { className: "space-y-2"}
                          , React.createElement(Label, { htmlFor: "zone"}, "Zone *" )
                          , React.createElement(Popover, { open: zoneComboboxOpen, onOpenChange: setZoneComboboxOpen}
                            , React.createElement(PopoverTrigger, { asChild: true}
                              , React.createElement(Button, {
                                id: "zone",
                                variant: "outline",
                                role: "combobox",
                                'aria-expanded': zoneComboboxOpen,
                                className: "w-full justify-between font-normal h-9 px-3 text-sm"     ,
                                type: "button"}

                                , React.createElement('span', { className: "truncate"}
                                  , selectedZoneId
                                    ? (_nullishCoalesce(_optionalChain([zonesList, 'access', _Z => _Z.find, 'call', _Z2 => _Z2((z) => String(z.id) === selectedZoneId), 'optionalAccess', _Z3 => _Z3.zone_name]), () => (
                                      "Select zone")))
                                    : "Select zone"
                                )
                                , React.createElement(ChevronDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50"    } )
                              )
                            )
                            , React.createElement(PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0" , align: "start"}
                              , React.createElement(Command, {
                                filter: (value, search) => {
                                  const q = (search || "").toLowerCase();
                                  if (!q) return 1;
                                  return (value || "").toLowerCase().includes(q) ? 1 : 0;
                                }}

                                , React.createElement(CommandInput, { placeholder: "Type to search zoneâ€¦"   } )
                                , React.createElement(CommandList, {}
                                  , React.createElement(CommandEmpty, {}, "No zone found."  )
                                  , React.createElement(CommandGroup, {}
                                    , zonesList.map((z) => (
                                      React.createElement(CommandItem, {
                                        key: z.id,
                                        value: z.zone_name,
                                        onSelect: () => {
                                          skipGeographyClearRef.current = false;
                                          setSelectedZoneId(String(z.id));
                                          setZoneComboboxOpen(false);
                                        }}

                                        , z.zone_name
                                      )
                                    ))
                                  )
                                )
                              )
                            )
                          )
                        )
                        , React.createElement('div', { className: "space-y-2"}
                          , React.createElement(Label, { htmlFor: "circle"}, "Circle *" )
                          , React.createElement(Popover, { open: circleComboboxOpen, onOpenChange: setCircleComboboxOpen}
                            , React.createElement(PopoverTrigger, { asChild: true}
                              , React.createElement(Button, {
                                id: "circle",
                                variant: "outline",
                                role: "combobox",
                                'aria-expanded': circleComboboxOpen,
                                disabled: !selectedZoneId,
                                className: "w-full justify-between font-normal h-9 px-3 text-sm"     ,
                                type: "button"}

                                , React.createElement('span', { className: "truncate"}
                                  , selectedCircleId
                                    ? (_nullishCoalesce(_optionalChain([circlesList, 'access', _C => _C.find, 'call', _C2 => _C2((c) => String(c.id) === selectedCircleId), 'optionalAccess', _C3 => _C3.circle_name]), () => (
                                      "Select circle")))
                                    : selectedZoneId
                                      ? "Select circle"
                                      : "Select zone first"
                                )
                                , React.createElement(ChevronDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50"    } )
                              )
                            )
                            , React.createElement(PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0" , align: "start"}
                              , React.createElement(Command, {
                                filter: (value, search) => {
                                  const q = (search || "").toLowerCase();
                                  if (!q) return 1;
                                  return (value || "").toLowerCase().includes(q) ? 1 : 0;
                                }}

                                , React.createElement(CommandInput, { placeholder: "Type to search circleâ€¦"   } )
                                , React.createElement(CommandList, {}
                                  , React.createElement(CommandEmpty, {}, "No circle found."  )
                                  , React.createElement(CommandGroup, {}
                                    , circlesList.map((c) => (
                                      React.createElement(CommandItem, {
                                        key: c.id,
                                        value: c.circle_name,
                                        onSelect: () => {
                                          skipGeographyClearRef.current = false;
                                          setSelectedCircleId(String(c.id));
                                          setCircleComboboxOpen(false);
                                        }}

                                        , c.circle_name
                                      )
                                    ))
                                  )
                                )
                              )
                            )
                          )
                        )
                      )

                      /* District / Tehsil (Area Management) */
                      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4"   }

                        /* District â€” searchable */
                        , React.createElement('div', { className: "space-y-2"}
                          , React.createElement(Label, { htmlFor: "district"}, "District *" )
                          , React.createElement(Popover, { open: districtComboboxOpen, onOpenChange: setDistrictComboboxOpen}
                            , React.createElement(PopoverTrigger, { asChild: true}
                              , React.createElement(Button, {
                                id: "district",
                                variant: "outline",
                                role: "combobox",
                                'aria-expanded': districtComboboxOpen,
                                className: "w-full justify-between font-normal h-9 px-3 text-sm"     ,
                                type: "button"}

                                , React.createElement('span', { className: "truncate"}
                                  , selectedDistrictId
                                    ? (_nullishCoalesce(_optionalChain([districtsList, 'access', _26 => _26.find, 'call', _27 => _27((d) => String(d.id) === selectedDistrictId), 'optionalAccess', _28 => _28.district_name]), () => (
                                      "Select district")))
                                    : "Select district"
                                )
                                , React.createElement(ChevronDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50"    } )
                              )
                            )
                            , React.createElement(PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0" , align: "start"}
                              , React.createElement(Command, {
                                filter: (value, search) => {
                                  const q = (search || "").toLowerCase();
                                  if (!q) return 1;
                                  return (value || "").toLowerCase().includes(q) ? 1 : 0;
                                }}

                                , React.createElement(CommandInput, { placeholder: "Type to search districtâ€¦"   } )
                                , React.createElement(CommandList, {}
                                  , React.createElement(CommandEmpty, {}, "No district found."  )
                                  , React.createElement(CommandGroup, {}
                                    , districtsList.map((d) => (
                                      React.createElement(CommandItem, {
                                        key: d.id,
                                        value: d.district_name,
                                        onSelect: () => {
                                          skipGeographyClearRef.current = false;
                                          setSelectedDistrictId(String(d.id));
                                          setDistrictComboboxOpen(false);
                                        }}

                                        , d.district_name
                                      )
                                    ))
                                  )
                                )
                              )
                            )
                          )
                        )

                        /* Tehsil â€” searchable */
                        , React.createElement('div', { className: "space-y-2"}
                          , React.createElement(Label, { htmlFor: "tehsil"}, "Tehsil *" )
                          , React.createElement(Popover, { open: tehsilComboboxOpen, onOpenChange: setTehsilComboboxOpen}
                            , React.createElement(PopoverTrigger, { asChild: true}
                              , React.createElement(Button, {
                                id: "tehsil",
                                variant: "outline",
                                role: "combobox",
                                'aria-expanded': tehsilComboboxOpen,
                                disabled: !selectedDistrictId,
                                className: "w-full justify-between font-normal h-9 px-3 text-sm"     ,
                                type: "button"}

                                , React.createElement('span', { className: "truncate"}
                                  , selectedTehsilId
                                    ? (_nullishCoalesce(_optionalChain([tehsilsList, 'access', _29 => _29.find, 'call', _30 => _30((t) => String(t.id) === selectedTehsilId), 'optionalAccess', _31 => _31.tehsil_name]), () => (
                                      "Select tehsil")))
                                    : selectedDistrictId
                                      ? "Select tehsil"
                                      : "Select district first"
                                )
                                , React.createElement(ChevronDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50"    } )
                              )
                            )
                            , React.createElement(PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0" , align: "start"}
                              , React.createElement(Command, {
                                filter: (value, search) => {
                                  const q = (search || "").toLowerCase();
                                  if (!q) return 1;
                                  return (value || "").toLowerCase().includes(q) ? 1 : 0;
                                }}

                                , React.createElement(CommandInput, { placeholder: "Type to search tehsilâ€¦"   } )
                                , React.createElement(CommandList, {}
                                  , React.createElement(CommandEmpty, {}, "No tehsil found."  )
                                  , React.createElement(CommandGroup, {}
                                    , tehsilsList.map((t) => (
                                      React.createElement(CommandItem, {
                                        key: t.id,
                                        value: t.tehsil_name,
                                        onSelect: () => {
                                          skipGeographyClearRef.current = false;
                                          setSelectedTehsilId(String(t.id));
                                          setTehsilComboboxOpen(false);
                                        }}

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
                  React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4"   }
                    , React.createElement('div', { className: "space-y-2"}
                      , React.createElement(Label, { htmlFor: "latitudeCoordinates"}, "Latitude Coordinates" )
                      , React.createElement(Input, {
                        id: "latitudeCoordinates",
                        type: "number",
                        step: "any",
                        placeholder: "e.g. 31.5204",
                        value: latitudeCoordinates,
                        onChange: (e) => setLatitudeCoordinates(e.target.value)}
                      )
                    )
                    , React.createElement('div', { className: "space-y-2"}
                      , React.createElement(Label, { htmlFor: "longitudeCoordinates"}, "Longitude Coordinates" )
                      , React.createElement(Input, {
                        id: "longitudeCoordinates",
                        type: "number",
                        step: "any",
                        placeholder: "e.g. 74.3587",
                        value: longitudeCoordinates,
                        onChange: (e) => setLongitudeCoordinates(e.target.value)}
                      )
                    )
                  )
                )

                  /* Step 2: Schedule (XER) */
                  , currentStep === 2 && (
                    React.createElement('div', { className: "space-y-6"}
                      , React.createElement(WizardXerUploadSection, {
                        editingProject: editingProject,
                        xerFile: xerFile,
                        onXerInputChange: handleXERFileChange,
                        onClearXer: () => setXerFile(null)}
                      )
                    )
                  )

                  /* Step 3 removed */

                  , React.createElement(DialogFooter, { className: "flex flex-col gap-2 sm:flex-row sm:gap-3"    }
                    , React.createElement(Button, {
                      type: "button",
                      variant: "outline",
                      onClick: () => {
                        setEditingProject(null);
                        resetForm();
                        setLocation("/project-management/view");
                      }}
, "Cancel"

                    )
                    , currentStep === 1 && (
                      React.createElement(Button, { type: "button", onClick: handleNext, className: "gap-2"}, "Next"

                        , React.createElement(ChevronRight, { className: "h-4 w-4" } )
                      )
                    )
                    , currentStep === 2 && (
                      React.createElement(React.Fragment, null
                        , React.createElement(Button, { type: "button", variant: "outline", onClick: handlePrevious, className: "gap-2"}
                          , React.createElement(ChevronLeft, { className: "h-4 w-4" } ), "Previous"

                        )
                        , React.createElement(Button, { type: "submit", disabled: updateProjectMutation.isPending}
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
      )
    );
  }

  return (
    React.createElement(Layout, { title: "Project Management" }
      , React.createElement('div', { className: "flex flex-col min-h-[calc(100vh-8rem)] w-full min-w-0"    }
        , !isCreatePath && (
        React.createElement(React.Fragment, null
        /* Header with search and Add Project button */
        , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 mb-4"       }
          , React.createElement('div', { className: "min-w-0"}
            , React.createElement('h1', { className: "text-xl sm:text-3xl font-bold tracking-tight leading-tight"    }, "Added Projects"

            )
            , React.createElement('p', { className: "text-muted-foreground mt-1 text-sm sm:text-base"   }
              , !projectsLoading && projectsData.length > 0
                ? filteredProjects.length !== projectsData.length
                  ? `${filteredProjects.length} of ${projectsData.length} projects`
                  : `${projectsData.length} project${projectsData.length !== 1 ? "s" : ""}`
                : "Manage and view project details below"
            )
          )
          , React.createElement('div', { className: "flex flex-row items-center gap-2 w-full sm:w-auto"     }
            , !projectsLoading && projectsData.length > 0 && (
              React.createElement('div', { className: "flex-1 min-w-0 sm:w-[280px] sm:flex-none md:w-[320px]"    }
                , React.createElement(Input, {
                  value: locationSearch,
                  onChange: (e) => setLocationSearch(e.target.value),
                  placeholder: "Search division, district, or tehsil"    ,
                  className: "h-9"}
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
                className: "gap-2 shrink-0 px-3 sm:px-4"   }

                , React.createElement(Plus, { className: "h-4 w-4" } )
                , React.createElement('span', { className: "hidden sm:inline" }, "Add New Project"  )
                , React.createElement('span', { className: "sm:hidden"}, "Add")
              )
            )
          )
        )

        /* Projects Grid */
        , projectsLoading ? (
          React.createElement(Card, {}
            , React.createElement(CardContent, { className: "flex flex-col items-center justify-center py-16"    }
              , React.createElement('p', { className: "text-muted-foreground"}, "Loading projectsâ€¦" )
            )
          )
        ) : filteredProjects.length === 0 ? (
          React.createElement(Card, {}
            , React.createElement(CardContent, { className: "flex flex-col items-center justify-center py-16"    }
              , React.createElement(FolderKanban, { className: "h-16 w-16 text-muted-foreground mb-4"   } )
              , React.createElement('h3', { className: "text-lg font-semibold mb-2"  }, "No matching projects"  )
              , React.createElement('p', { className: "text-sm text-muted-foreground mb-4"  }, "Try changing division, district, or tehsil search text"       )
            )
          )
        ) : (
          React.createElement('div', { className: "flex-1 flex flex-col min-h-0"   }
          , React.createElement('div', { className: "grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"    }
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
                  }`}

                  , React.createElement(CardHeader, { className: "pb-3 pt-4 px-5"  }
                    , React.createElement('div', { className: "flex items-start justify-between gap-3"   }
                      , React.createElement('div', { className: "flex items-start gap-3 min-w-0"   }
                        , React.createElement('div', { className: `mt-0.5 h-9 w-9 rounded-lg flex items-center justify-center ${accent.iconBgClass}`}
                          , React.createElement(FolderKanban, { className: `h-5 w-5 ${accent.iconClass}`} )
                        )
                        , React.createElement('div', { className: "min-w-0"}
                          , React.createElement(CardTitle, { className: "text-base font-semibold leading-tight truncate"   , title: project.project_name || "Unnamed"}
                            , project.project_name || "Unnamed"
                          )
                          , React.createElement(CardDescription, { className: "text-xs mt-1 text-muted-foreground"  }, "Updated "
                             , project.updated_at ? new Date(project.updated_at).toLocaleDateString() : "â€”"
                          )
                        )
                      )
                      , React.createElement(Badge, { className: "shrink-0 text-[11px] font-medium px-2 py-0 bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200 border-0"         }, "Active"

                      )
                    )
                  )
                  , React.createElement(CardContent, { className: "px-5 pb-5 pt-0 space-y-4"   }
                    /* Compact summary: keep the cards clean; full details live in the View panel */
                    , React.createElement('div', { className: "flex flex-wrap gap-2"  }
                      , project.project_reference_no && (
                        React.createElement(Badge, {
                          variant: "outline",
                          className: "text-[11px] font-medium bg-background/60 border-border/70 text-foreground"    }

                          , React.createElement(FileText, { className: "h-3 w-3 mr-1 text-muted-foreground"   } )
                          , React.createElement('span', { className: "truncate max-w-[160px]" , title: project.project_reference_no}
                            , project.project_reference_no
                          )
                        )
                      )
                      , React.createElement(Badge, {
                        variant: "outline",
                        className: "text-[11px] font-medium bg-background/60 border-border/70 text-foreground"    }

                        , React.createElement(MapPin, { className: "h-3 w-3 mr-1 text-muted-foreground"   } )
                        , React.createElement('span', { className: "max-w-[220px] truncate" , title: _nullishCoalesce(project.tehsil_name, () => ( String(project.tehsil)))}
                          , _nullishCoalesce(project.tehsil_name, () => ( String(project.tehsil)))
                        )
                      )
                      , project.project_starting_date && (
                        React.createElement(Badge, {
                          variant: "outline",
                          className: "text-[11px] font-medium bg-background/60 border-border/70 text-foreground"    }

                          , React.createElement(Calendar, { className: "h-3 w-3 mr-1 text-muted-foreground"   } )
                          , new Date(project.project_starting_date).toLocaleDateString()
                        )
                      )
                    )

                    , React.createElement('div', { className: "flex items-center gap-2 pt-3 border-t border-border/60"     }
                      , React.createElement(Button, {
                        variant: "default",
                        size: "sm",
                        onClick: () => openEditDialog(project),
                        disabled: updateProjectMutation.isPending,
                        className: "flex-1 gap-1.5 h-8 bg-primary text-primary-foreground hover:bg-primary/90 border-0"      }

                        , React.createElement(Pencil, { className: "h-3.5 w-3.5" } ), "Update"

                      )
                      , React.createElement(Button, {
                        variant: "outline",
                        size: "sm",
                        onClick: () => setSelectedProjectForView(isSelected ? null : project),
                        className: `flex-1 gap-1.5 h-8 border-border bg-background hover:bg-muted/50 ${isSelected ? "ring-1 ring-primary/50 bg-muted/30" : ""}`}

                        , React.createElement(Eye, { className: "h-3.5 w-3.5" } ), "View"

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
          React.createElement('div', { className: "flex items-center justify-center gap-4 py-6 mt-auto border-t border-border/80 shrink-0"        }
            , React.createElement(Button, {
              variant: "outline",
              size: "sm",
              onClick: () => setProjectsPage((p) => Math.max(1, p - 1)),
              disabled: projectsPage <= 1,
              className: "gap-1.5"}

              , React.createElement(ChevronLeft, { className: "h-4 w-4" } ), "Previous"

            )
            , React.createElement('span', { className: "text-sm text-muted-foreground min-w-[100px] text-center"   }, "Page "
               , projectsPage, " of "  , totalProjectsPages
            )
            , React.createElement(Button, {
              variant: "default",
              size: "sm",
              onClick: () => setProjectsPage((p) => Math.min(totalProjectsPages, p + 1)),
              disabled: projectsPage >= totalProjectsPages,
              className: "gap-1.5 bg-primary text-primary-foreground"  }
, "Next"

              , React.createElement(ChevronRight, { className: "h-4 w-4" } )
            )
          )
        )

        /* Detail panel: selected project info in the space beneath the cards */
        , selectedProjectForView && (
          React.createElement(Card, { className: "mt-6 border-primary/20 shadow-lg"  }
            , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-4"     }
              , React.createElement('div', {}
                , React.createElement(CardTitle, { className: "text-xl flex items-center gap-2"   }
                  , React.createElement(FolderKanban, { className: "h-5 w-5" } )
                  , selectedProjectForView.project_name || "Unnamed Project"
                )

              )
              , React.createElement(Button, {
                variant: "ghost",
                size: "icon",
                onClick: () => setSelectedProjectForView(null),
                className: "shrink-0",
                'aria-label': "Close detail view"  }

                , React.createElement(X, { className: "h-5 w-5" } )
              )
            )
            , React.createElement(CardContent, { className: "space-y-4"}
              , React.createElement(Tabs, { defaultValue: "overview"}
                , React.createElement(TabsList, { className: "w-full justify-start gap-1 overflow-x-auto whitespace-nowrap flex-nowrap"     }
                  , React.createElement(TabsTrigger, { value: "overview", className: "shrink-0"}, "Project Info" )
                  , React.createElement(TabsTrigger, { value: "financial", className: "shrink-0"}, "Financial Details" )
                )

                , React.createElement(TabsContent, { value: "overview", className: "mt-4 space-y-6" }
                  , selectedProjectForView.project_description && (
                    React.createElement('div', {}
                      , React.createElement('h4', { className: "text-sm font-medium mb-1"  }, "Description")
                      , React.createElement('p', { className: "text-sm text-muted-foreground whitespace-pre-wrap"  }, selectedProjectForView.project_description)
                    )
                  )

                  , React.createElement('div', { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"   }
                    , React.createElement('div', { className: "flex items-center gap-3 rounded-lg border p-3"     }
                      , React.createElement('div', { className: "h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center"        }
                        , React.createElement(Building2, { className: "h-5 w-5" } )
                      )
                      , React.createElement('div', {}
                        , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Stakeholder")
                        , React.createElement('p', { className: "text-sm font-medium" }
                          , formatProjectStakeholder(selectedProjectForView)
                        )
                      )
                    )
                    , React.createElement('div', { className: "flex items-center gap-3 rounded-lg border p-3"     }
                      , React.createElement('div', { className: "h-10 w-10 rounded-xl bg-violet-500/10 text-violet-700 dark:text-violet-300 flex items-center justify-center"        }
                        , React.createElement(Calendar, { className: "h-5 w-5" } )
                      )
                      , React.createElement('div', {}
                        , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Start Date" )
                        , React.createElement('p', { className: "text-sm font-medium" }
                          , selectedProjectForView.project_starting_date
                            ? new Date(selectedProjectForView.project_starting_date).toLocaleDateString()
                            : "N/A"
                        )
                      )
                    )
                    , React.createElement('div', { className: "flex items-center gap-3 rounded-lg border p-3"     }
                      , React.createElement('div', { className: "h-10 w-10 rounded-xl bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 flex items-center justify-center"        }
                        , React.createElement(FileText, { className: "h-5 w-5" } )
                      )
                      , React.createElement('div', {}
                        , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Reference No" )
                        , React.createElement('p', { className: "text-sm font-medium" }, selectedProjectForView.project_reference_no || "N/A")
                      )
                    )
                    , React.createElement('div', { className: "flex items-center gap-3 rounded-lg border p-3"     }
                      , React.createElement('div', { className: "h-10 w-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center"        }
                        , React.createElement(MapPin, { className: "h-5 w-5" } )
                      )
                      , React.createElement('div', {}
                        , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Location")
                        , React.createElement('p', { className: "text-sm font-medium" }
                          , _nullishCoalesce(selectedProjectForView.tehsil_name, () => ( String(selectedProjectForView.tehsil)))
                        )
                      )
                    )
                  )

                  , (selectedProjectForView.total_budget_allocated != null || selectedProjectForView.budget_utilized != null) && (
                    React.createElement('div', { className: "rounded-lg border p-4"  }
                      , React.createElement('div', { className: "flex items-center gap-2 mb-3"   }
                        , React.createElement('div', { className: "h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center"        }
                          , React.createElement(Wallet, { className: "h-4 w-4" } )
                        )
                        , React.createElement('h4', { className: "text-sm font-medium" }, "Budget")
                      )
                      , React.createElement('div', { className: "flex flex-wrap gap-4 text-sm"   }
                        , selectedProjectForView.total_budget_allocated != null && selectedProjectForView.total_budget_allocated !== "" && (
                          React.createElement('span', { className: "text-muted-foreground"}, "Allocated: "
                             , React.createElement('strong', { className: "text-foreground"}, selectedProjectForView.total_budget_allocated)
                          )
                        )
                        , selectedProjectForView.budget_utilized != null && selectedProjectForView.budget_utilized !== "" && (
                          React.createElement('span', { className: "text-muted-foreground"}, "Utilized: "
                             , React.createElement('strong', { className: "text-foreground"}, selectedProjectForView.budget_utilized)
                          )
                        )
                        , selectedProjectForView.budget_remaining != null && selectedProjectForView.budget_remaining !== "" && (
                          React.createElement('span', { className: "text-muted-foreground"}, "Remaining: "
                             , React.createElement('strong', { className: "text-foreground"}, selectedProjectForView.budget_remaining)
                          )
                        )
                      )
                    )
                  )

                  , selectedProjectForView.xer_file && (
                    React.createElement('div', { className: "rounded-lg border p-3 flex items-center gap-3"     }
                      , React.createElement('div', { className: "h-10 w-10 rounded-xl bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 flex items-center justify-center"        }
                        , React.createElement(FileText, { className: "h-5 w-5" } )
                      )
                      , React.createElement('div', { className: "flex-1 min-w-0" }
                        , React.createElement('p', { className: "text-xs text-muted-foreground" }, "XER File" )
                        , React.createElement('a', {
                          href: selectedProjectForView.xer_file.startsWith("http") ? selectedProjectForView.xer_file : `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"}${selectedProjectForView.xer_file.startsWith("/") ? "" : "/"}${selectedProjectForView.xer_file}`,
                          target: "_blank",
                          rel: "noopener noreferrer" ,
                          className: "text-sm font-medium text-primary hover:underline truncate block"     }

                          , _nullishCoalesce(selectedProjectForView.xer_file.split("/").pop(), () => ( selectedProjectForView.xer_file))
                        )
                      )
                    )
                  )

                  , (() => {
                    const latRaw = selectedProjectForView.latitude;
                    const lngRaw = selectedProjectForView.longitude;
                    const lat = latRaw != null ? Number(latRaw) : Number.NaN;
                    const lng = lngRaw != null ? Number(lngRaw) : Number.NaN;
                    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
                    if (!hasCoords) return null;
                    return (
                      React.createElement('div', { className: "rounded-lg border overflow-hidden"}
                        , React.createElement('div', { className: "px-4 py-3 border-b bg-muted/20"}
                          , React.createElement('p', { className: "text-sm font-semibold" }, "Project location")
                          , React.createElement('p', { className: "text-xs text-muted-foreground"}, "Lat: " , String(latRaw), " Â· Lng: ", String(lngRaw))
                        )
                        , React.createElement('div', { className: "h-[280px] w-full"}
                          , React.createElement(MapContainer, {
                            center: [lat, lng],
                            zoom: 13,
                            scrollWheelZoom: false,
                            style: { height: "100%", width: "100%" }}
                            , React.createElement(TileLayer, {
                              attribution: '&copy; OpenStreetMap contributors',
                              url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                            )
                            , React.createElement(Marker, { position: [lat, lng]}
                              , React.createElement(Popup, {}
                                , selectedProjectForView.project_name || "Project"
                              )
                            )
                          )
                        )
                      )
                    );
                  })()

                  , React.createElement('div', { className: "rounded-lg border"}
                    , React.createElement('div', { className: "px-4 py-3 border-b bg-muted/20"}
                      , React.createElement('p', { className: "text-sm font-semibold"}, "Activities")
                      , React.createElement('p', { className: "text-xs text-muted-foreground"}, "Imported from XER (via Project Activities API).")
                    )
                    , React.createElement('div', { className: "p-4"}
                      , selectedProjectActivitiesLoading ? (
                        React.createElement('p', { className: "text-sm text-muted-foreground"}, "Loading activitiesâ€¦")
                      ) : selectedProjectActivities.length === 0 ? (
                        React.createElement('p', { className: "text-sm text-muted-foreground"}, "No activities found for this project.")
                      ) : (
                        React.createElement('div', { className: "space-y-2 max-h-[320px] overflow-auto"}
                          , selectedProjectActivities.map((a) => (
                            React.createElement('div', { key: a.id || a.activity_id || a.activity_name, className: "flex items-start justify-between gap-3 rounded-md border p-3"}
                              , React.createElement('div', { className: "min-w-0"}
                                , React.createElement('p', { className: "text-sm font-medium truncate"}, a.activity_name || a.label || "â€”")
                                , React.createElement('p', { className: "text-xs text-muted-foreground"}
                                  , (a.start_date || a.start || "â€”"), " â†’ ", (a.end_date || a.end || "â€”")
                                )
                              )
                              , React.createElement('div', { className: "text-xs text-muted-foreground shrink-0 tabular-nums"}
                                , typeof a.progress === "number" ? `${Math.round(a.progress)}%` : (a.progress ?? "")
                              )
                            )
                          ))
                        )
                      )
                    )
                  )
                )

                , React.createElement(TabsContent, { value: "financial", className: "mt-4"}
                  , (() => {
                    const p = selectedProjectForView ;
                    const hasAny = (...vals) =>
                      vals.some((v) => v !== null && v !== undefined && String(v).trim() !== "");
                    // Core project budget fields (new backend schema)
                    const showCoreBudget = hasAny(p.total_budget, p.total_consume, p.remaining_budget);
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

                    if (!showCoreBudget && !showAllocation && !showPd && !showSpending && !showPifra && !showPct) {
                      return (
                        React.createElement('div', { className: "rounded-lg border p-6 text-center text-sm text-muted-foreground"     }, "No financial details were provided for this project."

                        )
                      );
                    }

                    const formatNum = (v) => {
                      if (v === "" || v == null) return "â€”";
                      const n = typeof v === "number" ? v : Number(String(v));
                      if (!Number.isFinite(n)) return String(v);
                      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
                    };

                    const Stat = ({ label, value }) => (
                      React.createElement('div', { className: "rounded-lg border bg-muted/20 p-3"   }
                        , React.createElement('p', { className: "text-[11px] font-semibold text-muted-foreground"  }, label)
                        , React.createElement('p', { className: "mt-1 text-base font-semibold tabular-nums"   }, formatNum(value))
                      )
                    );

                    const Section = ({
                      title,
                      icon,
                      badgeClassName,
                      children,
                    }




) => (
                      React.createElement('div', { className: "rounded-xl border p-4"  }
                        , React.createElement('div', { className: "flex items-center gap-2 mb-4"   }
                          , React.createElement('div', { className: `h-8 w-8 rounded-lg flex items-center justify-center ${badgeClassName}`}
                            , icon
                          )
                          , React.createElement('div', {}
                            , React.createElement('p', { className: "text-sm font-semibold leading-tight"  }, title)
                            , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Values in millions (M)"   )
                          )
                        )
                        , children
                      )
                    );

                    return (
                      React.createElement('div', { className: "space-y-4"}
                        , showCoreBudget && (
                          React.createElement('div', { className: "rounded-xl border p-4"}
                            , React.createElement('div', { className: "flex items-center gap-2 mb-4"}
                              , React.createElement('div', { className: "h-8 w-8 rounded-lg bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 flex items-center justify-center"}
                                , React.createElement(Wallet, { className: "h-4 w-4"} )
                              )
                              , React.createElement('div', {}
                                , React.createElement('p', { className: "text-sm font-semibold leading-tight"}, "Project Budget")
                                , React.createElement('p', { className: "text-xs text-muted-foreground"}, "Totals")
                              )
                            )
                            , React.createElement('div', { className: "grid gap-3 sm:grid-cols-3"}
                              , React.createElement(Stat, { label: "Total Budget", value: p.total_budget} )
                              , React.createElement(Stat, { label: "Total Consumed", value: p.total_consume} )
                              , React.createElement(Stat, { label: "Remaining", value: p.remaining_budget} )
                            )
                          )
                        )
                        , showAllocation && (
                          React.createElement(Section, {
                            title: "Allocation",
                            icon: React.createElement(Landmark, { className: "h-4 w-4" } ),
                            badgeClassName: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"  }

                            , React.createElement('div', { className: "grid gap-3 sm:grid-cols-3"  }
                              , React.createElement(Stat, { label: "Capital (M)" , value: p.allocation_capital_cost} )
                              , React.createElement(Stat, { label: "Revenue (M)" , value: p.allocation_revenue_cost} )
                              , React.createElement(Stat, { label: "Total (M)" , value: p.allocation_total_cost} )
                            )
                          )
                        )

                        , showPd && (
                          React.createElement(Section, {
                            title: "P&D Release" ,
                            icon: React.createElement(HandCoins, { className: "h-4 w-4" } ),
                            badgeClassName: "bg-amber-500/10 text-amber-700 dark:text-amber-300"  }

                            , React.createElement('div', { className: "grid gap-3 sm:grid-cols-3"  }
                              , React.createElement(Stat, { label: "Capital (M)" , value: p.pd_release_capital_cost} )
                              , React.createElement(Stat, { label: "Revenue (M)" , value: p.pd_release_cost} )
                              , React.createElement(Stat, { label: "Total (M)" , value: p.pd_release_total_cost} )
                            )
                          )
                        )

                        , showSpending && (
                          React.createElement(Section, {
                            title: "Spending Release" ,
                            icon: React.createElement(Wallet, { className: "h-4 w-4" } ),
                            badgeClassName: "bg-emerald-600/10 text-emerald-800 dark:text-emerald-300"  }

                            , React.createElement('div', { className: "grid gap-3 sm:grid-cols-3"  }
                              , React.createElement(Stat, { label: "Capital (M)" , value: p.spending_release_capital_cost} )
                              , React.createElement(Stat, { label: "Revenue (M)" , value: p.spending_release_revenue_cost} )
                              , React.createElement(Stat, { label: "Total (M)" , value: p.spending_release_total_cost} )
                            )
                          )
                        )

                        , showPifra && (
                          React.createElement('div', { className: "rounded-xl border p-4"  }
                            , React.createElement('div', { className: "flex items-center gap-2 mb-4"   }
                              , React.createElement('div', { className: "h-8 w-8 rounded-lg bg-violet-500/10 text-violet-700 dark:text-violet-300 flex items-center justify-center"        }
                                , React.createElement(Wallet, { className: "h-4 w-4" } )
                              )
                              , React.createElement('div', {}
                                , React.createElement('p', { className: "text-sm font-semibold leading-tight"  }, "PIFRA Utilization" )
                                , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Values in millions (M)"   )
                              )
                            )
                            , React.createElement('div', { className: "grid gap-3 sm:grid-cols-4"  }
                              , React.createElement(Stat, { label: "Capital (M)" , value: p.pifra_utilization_capital_cost} )
                              , React.createElement(Stat, { label: "Revenue (M)" , value: p.pifra_utilization_revenue_cost} )
                              , React.createElement(Stat, { label: "Total (M)" , value: p.pifra_utilization_total_cost} )
                              , React.createElement('div', { className: "rounded-lg border bg-muted/20 p-3"   }
                                , React.createElement('p', { className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5"     }
                                  , React.createElement(CalendarDays, { className: "h-3.5 w-3.5" } ), "Date"

                                )
                                , React.createElement('p', { className: "mt-1 text-base font-semibold tabular-nums"   }
                                  , p.pifra_utilization_date ? String(p.pifra_utilization_date).slice(0, 10) : "â€”"
                                )
                              )
                            )
                          )
                        )

                        , showPct && (
                          React.createElement('div', { className: "rounded-xl border p-4"  }
                            , React.createElement('div', { className: "flex items-center gap-2 mb-4"   }
                              , React.createElement('div', { className: "h-8 w-8 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 flex items-center justify-center"        }
                                , React.createElement(Percent, { className: "h-4 w-4" } )
                              )
                              , React.createElement('div', {}
                                , React.createElement('p', { className: "text-sm font-semibold leading-tight"  }, "% Utilization vs Spending Release"    )
                                , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Percent values (%)"  )
                              )
                            )
                            , React.createElement('div', { className: "grid gap-3 sm:grid-cols-3"  }
                              , React.createElement(Stat, { label: "Capital %" , value: p.percentage_utilization_capital} )
                              , React.createElement(Stat, { label: "Revenue %" , value: p.percentage_utilization_revenue} )
                              , React.createElement(Stat, { label: "Total %" , value: p.percentage_utilization_total} )
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
        }}

        , React.createElement(DialogContent, {
          className: 
            "w-[95vw] max-w-[min(96vw,48rem)] sm:max-w-3xl max-h-[min(92vh,900px)] overflow-y-auto p-4 sm:p-6"
          }

          , React.createElement(DialogHeader, {}
            , React.createElement(DialogTitle, {}, editingProject ? "Update Project" : "Add New Project")
            , React.createElement(DialogDescription, {}
              , editingProject
                ? "Edit the project details below. Leave file fields unchanged unless you want to replace them."
                : "Fill in the project details and upload required files"
            )
          )

          /* Step Indicator */
          , React.createElement('div', { className: "flex flex-col items-center justify-center mb-6"    }
            , React.createElement('div', { className: "flex items-center gap-3 w-fit"   }
              /* Step 1 */
              , React.createElement('div', { className: "flex flex-col items-center"  }
                , React.createElement('div', { className: `flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                  currentStep >= 1 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground bg-background"
                }`}
                  , currentStep > 1 ? (
                    React.createElement(CheckCircle2, { className: "h-4 w-4" } )
                  ) : (
                    React.createElement('span', { className: "text-sm font-semibold" }, "1")
                  )
                )
                , React.createElement('p', { className: `text-xs font-medium mt-2 ${currentStep === 1 ? "text-primary" : "text-muted-foreground"}`}, "Project Details"

                )
              )

              /* Animated Progress Line */
              , React.createElement('div', { className: "relative w-24 h-1 bg-muted rounded-full overflow-hidden mt-4"      }
                , currentStep >= 2 && (
                  React.createElement(React.Fragment, null
                    , React.createElement('div', { className: "absolute inset-0 bg-primary"  } )
                    , React.createElement('div', { 
                      className: "absolute inset-0" ,
                      style: {
                        background: 'linear-gradient(90deg, transparent 30%, #ef4444 50%, transparent 70%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s linear infinite',
                      }}
                    )
                  )
                )
              )

              /* Step 2 */
              , React.createElement('div', { className: "flex flex-col items-center"  }
                , React.createElement('div', { className: `flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                  currentStep >= 2 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground bg-background"
                }`}
                  , currentStep > 2 ? React.createElement(CheckCircle2, { className: "h-4 w-4" } ) : React.createElement('span', { className: "text-sm font-semibold" }, "2")
                )
                , React.createElement('p', { className: `text-xs font-medium mt-2 text-center max-w-[5.5rem] leading-tight ${currentStep === 2 ? "text-primary" : "text-muted-foreground"}`}, "XER + map"

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
          `}} )

          , React.createElement('form', { onSubmit: handleSubmit, className: "space-y-6"}
            /* Step 1: Project Details */
            , currentStep === 1 && (
              React.createElement('div', { className: "space-y-6"}
                /* Project Name */
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "projectName"}, "Project Name *"  )
                  , React.createElement(Input, {
                    id: "projectName",
                    placeholder: "Enter project name"  ,
                    value: projectName,
                    onChange: (e) => setProjectName(e.target.value)}
                  )
                )
                , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4"   }
                  , React.createElement('div', { className: "space-y-2"}
                    , React.createElement(Label, { htmlFor: "category_modal"}, "Category" )
                    , React.createElement(Select, { value: category || "", onValueChange: setCategory}
                      , React.createElement(SelectTrigger, { id: "category_modal", className: "w-full"}
                        , React.createElement(SelectValue, { placeholder: "Select category"} )
                      )
                      , React.createElement(SelectContent, {}
                        , React.createElement(SelectItem, { value: "Basic Health Unit"}, "Basic Health Unit" )
                        , React.createElement(SelectItem, { value: "Dispensary"}, "Dispensary" )
                        , React.createElement(SelectItem, { value: "Dispilated"}, "Dispilated" )
                        , React.createElement(SelectItem, { value: "Other"}, "Other" )
                      )
                    )
                  )
                  , category === "Other" && (
                    React.createElement('div', { className: "space-y-2"}
                      , React.createElement(Label, { htmlFor: "categoryOther_modal"}, "Please specify category"  )
                      , React.createElement(Input, {
                        id: "categoryOther_modal",
                        placeholder: "Enter category name"  ,
                        value: categoryOther,
                        onChange: (e) => setCategoryOther(e.target.value)}
                      )
                    )
                  )
                )

                /* Project Description */
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "projectDescription"}, "Project Description *"  )
                  , React.createElement(Textarea, {
                    id: "projectDescription",
                    placeholder: "Enter project description..."  ,
                    value: projectDescription,
                    onChange: (e) => setProjectDescription(e.target.value),
                    rows: 4}
                  )
                )

                /* Starting Date and Reference Number */
                , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4"   }
                  , React.createElement('div', { className: "space-y-2"}
                    , React.createElement(Label, { htmlFor: "startingDate"}, "Project Starting Date *"   )
                    , React.createElement(Input, {
                      id: "startingDate",
                      type: "date",
                      value: startingDate,
                      onChange: (e) => setStartingDate(e.target.value)}
                    )
                  )
                  , React.createElement('div', { className: "space-y-2"}
                    , React.createElement(Label, { htmlFor: "referenceNumber"}, "Project Reference No *"   )
                    , React.createElement(Input, {
                      id: "referenceNumber",
                      placeholder: "Enter reference number"  ,
                      value: referenceNumber,
                      onChange: (e) => setReferenceNumber(e.target.value)}
                    )
                  )
                )

                , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4"   }
                  , React.createElement('div', { className: "space-y-2"}
                    , React.createElement(Label, { htmlFor: "totalBudgetAllocated"}, "Total Budget" )
                    , React.createElement(Input, {
                      id: "totalBudgetAllocated",
                      type: "number",
                      min: 0,
                      step: "any",
                      placeholder: "e.g. 1000000",
                      value: totalBudgetAllocated,
                      onChange: (e) => setTotalBudgetAllocated(e.target.value)}
                    )
                  )
                  , React.createElement('div', { className: "space-y-2"}
                    , React.createElement(Label, { htmlFor: "budgetUtilized"}, "Total Consume" )
                    , React.createElement(Input, {
                      id: "budgetUtilized",
                      type: "number",
                      min: 0,
                      step: "any",
                      placeholder: "e.g. 250000",
                      value: budgetUtilized,
                      onChange: (e) => setBudgetUtilized(e.target.value)}
                    )
                  )
                  , React.createElement('div', { className: "space-y-2"}
                    , React.createElement(Label, { htmlFor: "remainingBudget"}, "Remaining Budget" )
                    , React.createElement(Input, {
                      id: "remainingBudget",
                      type: "number",
                      value: remainingBudget,
                      disabled: true,
                      readOnly: true}
                    )
                  )
                )

                /* Stakeholder (multi-select) */
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "stakeholderIds"}, "Stakeholder(s) *" )
                  , React.createElement(Popover, {}
                    , React.createElement(PopoverTrigger, { asChild: true}
                      , React.createElement(Button, {
                        id: "stakeholderIds",
                        variant: "outline",
                        role: "combobox",
                        className: "w-full justify-between font-normal min-h-10 h-auto py-2"     }

                        , React.createElement('span', { className: "truncate"}
                          , stakeholderIds.length === 0
                            ? "Select stakeholder(s)"
                            : stakeholderIds
                                .map((id) => stakeholdersList.find((s) => String(s.id) === id))
                                .filter(Boolean)
                                .map((s) => `${s.stakeholder_title} (${s.stakeholder_type})`)
                                .join(", ")
                        )
                        , React.createElement(ChevronDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50"    } )
                      )
                    )
                    , React.createElement(PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0" , align: "start"}
                      , React.createElement('div', { className: "max-h-60 overflow-auto p-2"  }
                        , stakeholdersList.map((s) => (
                          React.createElement('label', {
                            key: s.id,
                            className: "flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted cursor-pointer"       }

                            , React.createElement(Checkbox, {
                              checked: stakeholderIds.includes(String(s.id)),
                              onCheckedChange: (checked) => {
                                setStakeholderIds((prev) =>
                                  checked
                                    ? [...prev, String(s.id)]
                                    : prev.filter((id) => id !== String(s.id))
                                );
                              }}
                            )
                            , React.createElement('span', { className: "text-sm"}
                              , s.stakeholder_title, " (" , s.stakeholder_type, ")"
                            )
                          )
                        ))
                      )
                    )
                  )
                )

                , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4"   }
                  /* Zone â€” searchable */
                  , React.createElement('div', { className: "space-y-2"}
                    , React.createElement(Label, { htmlFor: "zone_modal"}, "Zone *" )
                    , React.createElement(Popover, { open: zoneComboboxOpen, onOpenChange: setZoneComboboxOpen}
                      , React.createElement(PopoverTrigger, { asChild: true}
                        , React.createElement(Button, {
                          id: "zone_modal",
                          variant: "outline",
                          role: "combobox",
                          'aria-expanded': zoneComboboxOpen,
                          className: "w-full justify-between font-normal h-9 px-3 text-sm"     ,
                          type: "button"}

                          , React.createElement('span', { className: "truncate"}
                            , selectedZoneId
                              ? (_nullishCoalesce(_nullishCoalesce(_optionalChain([zonesList, 'access', _Z => _Z.find, 'call', _Z2 => _Z2((z) => String(z.id) === selectedZoneId), 'optionalAccess', _Z3 => _Z3.zone_name]), () => (
                                (editingProject && Number(selectedZoneId) === editingProject.zone ? editingProject.zone_name : null))), () => (
                                "Select zone")))
                              : "Select zone"
                          )
                          , React.createElement(ChevronDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50"    } )
                        )
                      )
                      , React.createElement(PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0" , align: "start"}
                        , React.createElement(Command, {
                          filter: (value, search) => {
                            const q = (search || "").toLowerCase();
                            if (!q) return 1;
                            return (value || "").toLowerCase().includes(q) ? 1 : 0;
                          }}

                          , React.createElement(CommandInput, { placeholder: "Type to search zoneâ€¦"   } )
                          , React.createElement(CommandList, {}
                            , React.createElement(CommandEmpty, {}, "No zone found."  )
                            , React.createElement(CommandGroup, {}
                              , zonesList.map((z) => (
                                React.createElement(CommandItem, {
                                  key: z.id,
                                  value: z.zone_name,
                                  onSelect: () => {
                                    skipGeographyClearRef.current = false;
                                    setSelectedZoneId(String(z.id));
                                    setZoneComboboxOpen(false);
                                  }}

                                  , z.zone_name
                                )
                              ))
                            )
                          )
                        )
                      )
                    )
                  )
                  /* Circle â€” searchable */
                  , React.createElement('div', { className: "space-y-2"}
                    , React.createElement(Label, { htmlFor: "circle_modal"}, "Circle *" )
                    , React.createElement(Popover, { open: circleComboboxOpen, onOpenChange: setCircleComboboxOpen}
                      , React.createElement(PopoverTrigger, { asChild: true}
                        , React.createElement(Button, {
                          id: "circle_modal",
                          variant: "outline",
                          role: "combobox",
                          'aria-expanded': circleComboboxOpen,
                          disabled: !selectedZoneId,
                          className: "w-full justify-between font-normal h-9 px-3 text-sm"     ,
                          type: "button"}

                          , React.createElement('span', { className: "truncate"}
                            , selectedCircleId
                              ? (_nullishCoalesce(_nullishCoalesce(_optionalChain([circlesList, 'access', _C => _C.find, 'call', _C2 => _C2((c) => String(c.id) === selectedCircleId), 'optionalAccess', _C3 => _C3.circle_name]), () => (
                                (editingProject && Number(selectedCircleId) === editingProject.circle ? editingProject.circle_name : null))), () => (
                                "Select circle")))
                              : selectedZoneId ? "Select circle" : "Select zone first"
                          )
                          , React.createElement(ChevronDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50"    } )
                        )
                      )
                      , React.createElement(PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0" , align: "start"}
                        , React.createElement(Command, {
                          filter: (value, search) => {
                            const q = (search || "").toLowerCase();
                            if (!q) return 1;
                            return (value || "").toLowerCase().includes(q) ? 1 : 0;
                          }}

                          , React.createElement(CommandInput, { placeholder: "Type to search circleâ€¦"   } )
                          , React.createElement(CommandList, {}
                            , React.createElement(CommandEmpty, {}, "No circle found."  )
                            , React.createElement(CommandGroup, {}
                              , circlesList.map((c) => (
                                React.createElement(CommandItem, {
                                  key: c.id,
                                  value: c.circle_name,
                                  onSelect: () => {
                                    skipGeographyClearRef.current = false;
                                    setSelectedCircleId(String(c.id));
                                    setCircleComboboxOpen(false);
                                  }}

                                  , c.circle_name
                                )
                              ))
                            )
                          )
                        )
                      )
                    )
                  )
                )

                /* Province/Division removed */

                /* District â€” searchable */
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "district"}, "District *" )
                  , React.createElement(Popover, { open: districtComboboxOpen, onOpenChange: setDistrictComboboxOpen}
                    , React.createElement(PopoverTrigger, { asChild: true}
                      , React.createElement(Button, {
                        id: "district",
                        variant: "outline",
                        role: "combobox",
                        'aria-expanded': districtComboboxOpen,
                        className: "w-full justify-between font-normal h-9 px-3 text-sm"     }

                        , React.createElement('span', { className: "truncate"}
                          , selectedDistrictId
                            ? (_nullishCoalesce(_nullishCoalesce(_optionalChain([districtsList, 'access', _47 => _47.find, 'call', _48 => _48((d) => String(d.id) === selectedDistrictId), 'optionalAccess', _49 => _49.district_name]), () => (
                              (editingProject && Number(selectedDistrictId) === editingProject.district ? editingProject.district_name : null))), () => (
                              "Select district")))
                            : "Select district"
                        )
                        , React.createElement(ChevronDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50"    } )
                      )
                    )
                    , React.createElement(PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0" , align: "start"}
                      , React.createElement(Command, {
                        filter: (value, search) => {
                          const q = (search || "").toLowerCase();
                          if (!q) return 1;
                          return (value || "").toLowerCase().includes(q) ? 1 : 0;
                        }}

                        , React.createElement(CommandInput, { placeholder: "Type to search districtâ€¦"   } )
                        , React.createElement(CommandList, {}
                          , React.createElement(CommandEmpty, {}, "No district found."  )
                          , React.createElement(CommandGroup, {}
                            , districtsList.map((d) => (
                              React.createElement(CommandItem, {
                                key: d.id,
                                value: d.district_name,
                                onSelect: () => {
                                  skipGeographyClearRef.current = false;
                                  setSelectedDistrictId(String(d.id));
                                  setDistrictComboboxOpen(false);
                                }}

                                , d.district_name
                              )
                            ))
                          )
                        )
                      )
                    )
                  )
                )

                /* Tehsil â€” searchable */
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "tehsil"}, "Tehsil *" )
                  , React.createElement(Popover, { open: tehsilComboboxOpen, onOpenChange: setTehsilComboboxOpen}
                    , React.createElement(PopoverTrigger, { asChild: true}
                      , React.createElement(Button, {
                        id: "tehsil",
                        variant: "outline",
                        role: "combobox",
                        'aria-expanded': tehsilComboboxOpen,
                        disabled: !selectedDistrictId,
                        className: "w-full justify-between font-normal h-9 px-3 text-sm"     }

                        , React.createElement('span', { className: "truncate"}
                          , selectedTehsilId
                            ? (_nullishCoalesce(_nullishCoalesce(_optionalChain([tehsilsList, 'access', _50 => _50.find, 'call', _51 => _51((t) => String(t.id) === selectedTehsilId), 'optionalAccess', _52 => _52.tehsil_name]), () => (
                              (editingProject && Number(selectedTehsilId) === editingProject.tehsil ? editingProject.tehsil_name : null))), () => (
                              "Select tehsil")))
                            : selectedDistrictId ? "Select tehsil" : "Select district first"
                        )
                        , React.createElement(ChevronDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50"    } )
                      )
                    )
                    , React.createElement(PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0" , align: "start"}
                      , React.createElement(Command, {
                        filter: (value, search) => {
                          const q = (search || "").toLowerCase();
                          if (!q) return 1;
                          return (value || "").toLowerCase().includes(q) ? 1 : 0;
                        }}

                        , React.createElement(CommandInput, { placeholder: "Type to search tehsilâ€¦"   } )
                        , React.createElement(CommandList, {}
                          , React.createElement(CommandEmpty, {}, "No tehsil found."  )
                          , React.createElement(CommandGroup, {}
                            , tehsilsList.map((t) => (
                              React.createElement(CommandItem, {
                                key: t.id,
                                value: t.tehsil_name,
                                onSelect: () => {
                                  skipGeographyClearRef.current = false;
                                  setSelectedTehsilId(String(t.id));
                                  setTehsilComboboxOpen(false);
                                }}

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
              React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4"   }
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "latitudeCoordinates_modal"}, "Latitude Coordinates" )
                  , React.createElement(Input, {
                    id: "latitudeCoordinates_modal",
                    type: "number",
                    step: "any",
                    placeholder: "e.g. 31.5204",
                    value: latitudeCoordinates,
                    onChange: (e) => setLatitudeCoordinates(e.target.value)}
                  )
                )
                , React.createElement('div', { className: "space-y-2"}
                  , React.createElement(Label, { htmlFor: "longitudeCoordinates_modal"}, "Longitude Coordinates" )
                  , React.createElement(Input, {
                    id: "longitudeCoordinates_modal",
                    type: "number",
                    step: "any",
                    placeholder: "e.g. 74.3587",
                    value: longitudeCoordinates,
                    onChange: (e) => setLongitudeCoordinates(e.target.value)}
                  )
                )
              )
            )

            /* Step 2: Schedule (XER) */
            , currentStep === 2 && (
              React.createElement('div', { className: "space-y-6"}
                , React.createElement(WizardXerUploadSection, {
                  editingProject: editingProject,
                  xerFile: xerFile,
                  onXerInputChange: handleXERFileChange,
                  onClearXer: () => setXerFile(null)}
                )
              )
            )

            /* Step 3 removed */

            , React.createElement(DialogFooter, {}
              , React.createElement(Button, { 
                type: "button", 
                variant: "outline", 
                onClick: () => {
                  setShowAddProjectDialog(false);
                  resetForm();
                }}
, "Cancel"

              )
              , currentStep === 1 && (
                React.createElement(Button, { type: "button", onClick: handleNext, className: "gap-2"}, "Next"

                  , React.createElement(ChevronRight, { className: "h-4 w-4" } )
                )
              )
              , currentStep === 2 && (
                React.createElement(React.Fragment, null
                  , React.createElement(Button, { 
                    type: "button", 
                    variant: "outline", 
                    onClick: handlePrevious,
                    className: "gap-2"}

                    , React.createElement(ChevronLeft, { className: "h-4 w-4" } ), "Previous"

                  )
                  , React.createElement(Button, { type: "submit", disabled: updateProjectMutation.isPending}
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
