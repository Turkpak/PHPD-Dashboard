import React from "react";
const _jsxFileName = ""; function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, LucideBanknote, Wallet, AlertCircle, CheckCircle2, Filter, Percent } from "lucide-react";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useWindowSize } from "@/hooks/use-window-size";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  getProjectById,
  getProjectSummary,
  listProjects,
  listDivisions,
  listDistricts,
  listTehsils,
  updateProject,
} from "@/api";


// Backend project financials are PKR millions (M).
const formatPKRMillions = (m) => {
  const sign = m < 0 ? "−" : "";
  const abs = Math.abs(m);
  return `${sign}PKR ${abs.toFixed(2)} M`;
};

const STAGE_COLORS = ["#2F8F6C", "#0F4B3A", "#2E7D32", "#f59e0b", "#8BC34A"];

export default function Finance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { width } = useWindowSize();
  const [selectedDivisionId, setSelectedDivisionId] = useState("all");
  const [selectedDistrictId, setSelectedDistrictId] = useState("all");
  const [selectedTehsilId, setSelectedTehsilId] = useState("all");
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [isBudgetEditOpen, setIsBudgetEditOpen] = useState(false);
  const [budgetAllocatedInput, setBudgetAllocatedInput] = useState("");
  const [budgetUtilizedInput, setBudgetUtilizedInput] = useState("");

  const isMobile = width < 640;

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
  });

  const { data: divisions = [], isLoading: divisionsLoading } = useQuery({
    queryKey: ["finance", "list-division"],
    queryFn: () => listDivisions(),
    staleTime: 5 * 60 * 1000,
  });

  const divisionNumeric =
    selectedDivisionId !== "all" ? Number(selectedDivisionId) : null;
  const { data: districts = [], isFetching: districtsLoading } = useQuery({
    queryKey: ["finance", "list-district", divisionNumeric],
    queryFn: () => listDistricts(divisionNumeric),
    enabled: divisionNumeric != null && Number.isFinite(divisionNumeric),
    staleTime: 5 * 60 * 1000,
  });

  const districtNumeric =
    selectedDistrictId !== "all" ? Number(selectedDistrictId) : null;
  const { data: tehsils = [], isFetching: tehsilsLoading } = useQuery({
    queryKey: ["finance", "list-tehsil", districtNumeric],
    queryFn: () => listTehsils(districtNumeric),
    enabled: districtNumeric != null && Number.isFinite(districtNumeric),
    staleTime: 5 * 60 * 1000,
  });

  const isAllFilters =
    selectedDivisionId === "all" &&
    selectedDistrictId === "all" &&
    selectedTehsilId === "all" &&
    selectedProjectId === "all";

  const { data: projectSummary } = useQuery({
    queryKey: ["project-summary"],
    queryFn: getProjectSummary,
    enabled: isAllFilters,
    staleTime: 60 * 1000,
  });

  const filteredProjects = useMemo(() => {
    if (selectedDivisionId === "all") return projects;

    const divName =
      _nullishCoalesce(_optionalChain([divisions, 'access', _2 => _2.find, 'call', _3 => _3((d) => String(d.id) === selectedDivisionId), 'optionalAccess', _4 => _4.division_name]), () => ( null));
    const distName =
      selectedDistrictId !== "all"
        ? _nullishCoalesce(_optionalChain([districts, 'access', _5 => _5.find, 'call', _6 => _6((d) => String(d.id) === selectedDistrictId), 'optionalAccess', _7 => _7.district_name]), () => ( null))
        : null;
    const tehName =
      selectedTehsilId !== "all"
        ? _nullishCoalesce(_optionalChain([tehsils, 'access', _8 => _8.find, 'call', _9 => _9((t) => String(t.id) === selectedTehsilId), 'optionalAccess', _10 => _10.tehsil_name]), () => ( null))
        : null;

    const divNum = Number(selectedDivisionId);
    const distNum = selectedDistrictId !== "all" ? Number(selectedDistrictId) : null;
    const tehNum = selectedTehsilId !== "all" ? Number(selectedTehsilId) : null;

    let list = projects.filter((p) => {
      const byId = typeof p.division === "number" && p.division === divNum;
      const byName =
        divName != null &&
        _optionalChain([p, 'access', _11 => _11.division_name, 'optionalAccess', _12 => _12.trim, 'call', _13 => _13(), 'access', _14 => _14.toLowerCase, 'call', _15 => _15()]) === divName.trim().toLowerCase();
      return byId || byName;
    });

    if (selectedDistrictId !== "all") {
      list = list.filter((p) => {
        const byId = distNum != null && typeof p.district === "number" && p.district === distNum;
        const byName =
          distName != null &&
          _optionalChain([p, 'access', _16 => _16.district_name, 'optionalAccess', _17 => _17.trim, 'call', _18 => _18(), 'access', _19 => _19.toLowerCase, 'call', _20 => _20()]) === distName.trim().toLowerCase();
        return byId || byName;
      });
    }

    if (selectedTehsilId !== "all") {
      list = list.filter((p) => {
        const byId = tehNum != null && typeof p.tehsil === "number" && p.tehsil === tehNum;
        const byName =
          tehName != null &&
          _optionalChain([p, 'access', _21 => _21.tehsil_name, 'optionalAccess', _22 => _22.trim, 'call', _23 => _23(), 'access', _24 => _24.toLowerCase, 'call', _25 => _25()]) === tehName.trim().toLowerCase();
        return byId || byName;
      });
    }

    return list;
  }, [
    projects,
    selectedDivisionId,
    selectedDistrictId,
    selectedTehsilId,
    divisions,
    districts,
    tehsils,
  ]);

  const aggregatedFinancials = useMemo(() => {
    const toNum = (v) => {
      const n = typeof v === "number" ? v : Number(String(_nullishCoalesce(v, () => ( ""))));
      return Number.isFinite(n) ? n : 0;
    };
    const sum = (key) =>
      filteredProjects.reduce((acc, p) => acc + toNum((p )[key]), 0);

    return {
      allocation_capital_cost: sum("allocation_capital_cost" ),
      allocation_revenue_cost: sum("allocation_revenue_cost" ),
      allocation_total_cost: sum("allocation_total_cost" ),
      pd_release_capital_cost: sum("pd_release_capital_cost" ),
      pd_release_cost: sum("pd_release_cost" ),
      pd_release_total_cost: sum("pd_release_total_cost" ),
      spending_release_capital_cost: sum("spending_release_capital_cost" ),
      spending_release_revenue_cost: sum("spending_release_revenue_cost" ),
      spending_release_total_cost: sum("spending_release_total_cost" ),
      pifra_utilization_capital_cost: sum("pifra_utilization_capital_cost" ),
      pifra_utilization_revenue_cost: sum("pifra_utilization_revenue_cost" ),
      pifra_utilization_total_cost: sum("pifra_utilization_total_cost" ),
      percentage_utilization_total: (() => {
        const alloc = sum("allocation_total_cost" );
        const pifra = sum("pifra_utilization_total_cost" );
        return alloc > 0 ? (pifra / alloc) * 100 : 0;
      })(),
    };
  }, [filteredProjects]);

  const selectedProjectNumericId = selectedProjectId !== "all" ? Number(selectedProjectId) : null;
  const { data: selectedProject } = useQuery({
    queryKey: ["project-by-id", selectedProjectNumericId],
    queryFn: async () => {
      if (!selectedProjectNumericId) return null;
      return await getProjectById(selectedProjectNumericId);
    },
    enabled: selectedProjectNumericId != null && Number.isFinite(selectedProjectNumericId),
    staleTime: 30 * 1000,
  });

  // Prefill budget edit inputs from selected project
  useEffect(() => {
    if (!selectedProject) {
      setIsBudgetEditOpen(false);
      setBudgetAllocatedInput("");
      setBudgetUtilizedInput("");
      return;
    }
    setBudgetAllocatedInput(
      selectedProject.total_budget_allocated != null
        ? String(selectedProject.total_budget_allocated)
        : "",
    );
    setBudgetUtilizedInput(
      selectedProject.budget_utilized != null ? String(selectedProject.budget_utilized) : "",
    );
  }, [selectedProject]);

  // When a project is selected first, list-project/?id=… fills division/district/tehsil (ids + names).
  useEffect(() => {
    if (!selectedProject) return;
    if (selectedProject.division != null && Number.isFinite(Number(selectedProject.division))) {
      setSelectedDivisionId(String(selectedProject.division));
    }
    if (selectedProject.district != null && Number.isFinite(Number(selectedProject.district))) {
      setSelectedDistrictId(String(selectedProject.district));
    }
    if (selectedProject.tehsil != null && Number.isFinite(Number(selectedProject.tehsil))) {
      setSelectedTehsilId(String(selectedProject.tehsil));
    }
  }, [selectedProject]);

  const budgetTotals = useMemo(() => {
    const toNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    if (selectedProject) {
      const budgetM = toNum(selectedProject.total_budget_allocated);
      const consumeM = toNum(selectedProject.budget_utilized);
      const remainingM =
        selectedProject.budget_remaining != null
          ? toNum(selectedProject.budget_remaining)
          : Math.max(0, budgetM - consumeM);
      return { budgetM, consumeM, remainingM };
    }

    const budgetM = filteredProjects.reduce((sum, p) => sum + toNum(p.total_budget_allocated), 0);
    const consumeM = filteredProjects.reduce((sum, p) => sum + toNum(p.budget_utilized), 0);
    const remainingM = Math.max(0, budgetM - consumeM);
    return { budgetM, consumeM, remainingM };
  }, [selectedProject, filteredProjects]);

  const flowChartData = useMemo(() => {
    return [
      { stage: "Total Budget", totalM: budgetTotals.budgetM },
      { stage: "Total Consume", totalM: budgetTotals.consumeM },
      { stage: "Total Remaining", totalM: budgetTotals.remainingM },
    ];
  }, [budgetTotals.budgetM, budgetTotals.consumeM, budgetTotals.remainingM]);

  const divisionComparisonData = useMemo(() => {
    const EPS = 1e-6;
    const rows = filteredProjects.map((p, i) => {
      const baseName = (_optionalChain([p, 'access', _26 => _26.project_name, 'optionalAccess', _27 => _27.trim, 'call', _28 => _28()]) || `#${p.id}`) ;
      return {
        division: baseName,
        budgetM: Number(_nullishCoalesce(p.total_budget_allocated, () => ( 0))),
        consumeM: Number(_nullishCoalesce(p.budget_utilized, () => ( 0))),
        id: p.id,
        color: STAGE_COLORS[i % STAGE_COLORS.length],
      };
    });
    const nameCounts = new Map();
    for (const r of rows) nameCounts.set(r.division, (_nullishCoalesce(nameCounts.get(r.division), () => ( 0))) + 1);
    const seen = new Map();
    const withUniqueLabels = rows.map((r) => {
      if ((_nullishCoalesce(nameCounts.get(r.division), () => ( 0))) > 1) {
        const n = (_nullishCoalesce(seen.get(r.division), () => ( 0))) + 1;
        seen.set(r.division, n);
        return { ...r, division: `${r.division} (#${r.id})` };
      }
      return r;
    });
    return withUniqueLabels.filter((r) => r.budgetM > EPS || r.consumeM > EPS);
  }, [filteredProjects]);

  const kpiDerived = useMemo(() => {
    const allocationM = selectedProject
      ? Number(_nullishCoalesce(selectedProject.allocation_total_cost, () => ( 0)))
      : !isAllFilters
        ? aggregatedFinancials.allocation_total_cost
        : Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _29 => _29.total_allocation]), () => ( 0)));
    const spendingM = selectedProject
      ? Number(_nullishCoalesce(selectedProject.spending_release_total_cost, () => ( 0)))
      : !isAllFilters
        ? aggregatedFinancials.spending_release_total_cost
        : Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _30 => _30.total_spending_release]), () => ( 0)));
    const pifraM = selectedProject
      ? Number(_nullishCoalesce(selectedProject.pifra_utilization_total_cost, () => ( 0)))
      : !isAllFilters
        ? aggregatedFinancials.pifra_utilization_total_cost
        : Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _31 => _31.total_pifra]), () => ( 0)));

    const utilVsAllocationPct = allocationM > 0 ? (pifraM / allocationM) * 100 : 0;
    const utilVsSpendingPct = spendingM > 0 ? (pifraM / spendingM) * 100 : 0;
    return { allocationM, spendingM, pifraM, utilVsAllocationPct, utilVsSpendingPct };
  }, [selectedProject, projectSummary, aggregatedFinancials, isAllFilters]);

  const kpiDataWithIcons = useMemo(() => {
    const pifraVsKpi = {
      valueM: kpiDerived.utilVsAllocationPct,
      label: "PIFRA vs allocation",
      icon: Percent,
      trend: kpiDerived.utilVsAllocationPct - 100,
      format: "percent" ,
    };
    if (selectedProject) {
      return {
        allocation: {
          valueM: Number(_nullishCoalesce(selectedProject.allocation_total_cost, () => ( 0))),
          label: "Allocation (total)",
          icon: Wallet,
          trend: 0,
        },
        pdRelease: {
          valueM: Number(_nullishCoalesce(selectedProject.pd_release_total_cost, () => ( 0))),
          label: "P&D release (total)",
          icon: LucideBanknote,
          trend: 0,
        },
        spendingRelease: {
          valueM: Number(_nullishCoalesce(selectedProject.spending_release_total_cost, () => ( 0))),
          label: "Spending release (total)",
          icon: AlertCircle,
          trend: 0,
        },
        pifra: {
          valueM: Number(_nullishCoalesce(selectedProject.pifra_utilization_total_cost, () => ( 0))),
          label: "PIFRA utilization (total)",
          icon: CheckCircle2,
          trend: kpiDerived.utilVsSpendingPct,
        },
        pifraVsAllocation: pifraVsKpi,
      } ;
    }
    if (!isAllFilters) {
      return {
        allocation: {
          valueM: aggregatedFinancials.allocation_total_cost,
          label: `Allocation • ${filteredProjects.length} proj.`,
          icon: Wallet,
          trend: 0,
        },
        pdRelease: {
          valueM: aggregatedFinancials.pd_release_total_cost,
          label: "P&D release (total)",
          icon: LucideBanknote,
          trend: 0,
        },
        spendingRelease: {
          valueM: aggregatedFinancials.spending_release_total_cost,
          label: "Spending release (total)",
          icon: AlertCircle,
          trend: 0,
        },
        pifra: {
          valueM: aggregatedFinancials.pifra_utilization_total_cost,
          label: "PIFRA utilization (total)",
          icon: CheckCircle2,
          trend: kpiDerived.utilVsSpendingPct,
        },
        pifraVsAllocation: pifraVsKpi,
      } ;
    }
    return {
      allocation: {
        valueM: Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _32 => _32.total_allocation]), () => ( 0))),
        label: "Total allocation",
        icon: Wallet,
        trend: 0,
      },
      pdRelease: {
        valueM: Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _33 => _33.total_pd_release]), () => ( 0))),
        label: "Total P&D release",
        icon: LucideBanknote,
        trend: 0,
      },
      spendingRelease: {
        valueM: Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _34 => _34.total_spending_release]), () => ( 0))),
        label: "Total spending release",
        icon: AlertCircle,
        trend: 0,
      },
      pifra: {
        valueM: Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _35 => _35.total_pifra]), () => ( 0))),
        label: "Total PIFRA utilization",
        icon: CheckCircle2,
        trend: kpiDerived.utilVsSpendingPct,
      },
      pifraVsAllocation: pifraVsKpi,
    } ;
  }, [selectedProject, projectSummary, kpiDerived, aggregatedFinancials, isAllFilters, filteredProjects.length]);

  const utilizationRate = kpiDerived.utilVsAllocationPct;
  const totalPlannedM = kpiDerived.allocationM;
  const totalActualM = kpiDerived.pifraM;

  const handleDivisionChange = (value) => {
    setSelectedDivisionId(value);
    setSelectedDistrictId("all");
    setSelectedTehsilId("all");
    setSelectedProjectId("all");
  };

  const handleDistrictChange = (value) => {
    setSelectedDistrictId(value);
    setSelectedTehsilId("all");
    setSelectedProjectId("all");
  };

  const handleTehsilChange = (value) => {
    setSelectedTehsilId(value);
    setSelectedProjectId("all");
  };

  const kpiCardVariants = {
    totalBudget: {
      accent: "border-l-emerald-700",
      bg: "bg-gradient-to-br from-card via-card to-emerald-50/40 dark:to-emerald-950/20",
      blob: "bg-emerald-600/10",
      iconWrap: "bg-emerald-50 dark:bg-emerald-950/40",
      icon: "text-emerald-800 dark:text-emerald-300",
      value: "text-emerald-900 dark:text-emerald-100",
      trend: "text-emerald-600 dark:text-emerald-400",
    },
    ytdUtilization: {
      accent: "border-l-emerald-500",
      bg: "bg-gradient-to-br from-card via-card to-emerald-50/40 dark:to-emerald-950/20",
      blob: "bg-emerald-500/10",
      iconWrap: "bg-emerald-50 dark:bg-emerald-950/40",
      icon: "text-emerald-700 dark:text-emerald-300",
      value: "text-emerald-900 dark:text-emerald-100",
      trend: "text-emerald-600 dark:text-emerald-400",
    },
    remaining: {
      accent: "border-l-violet-500",
      bg: "bg-gradient-to-br from-card via-card to-violet-50/40 dark:to-violet-950/20",
      blob: "bg-violet-500/10",
      iconWrap: "bg-violet-50 dark:bg-violet-950/40",
      icon: "text-violet-700 dark:text-violet-300",
      value: "text-violet-900 dark:text-violet-100",
      trend: "text-rose-600 dark:text-rose-400",
    },
    varianceGood: {
      accent: "border-l-emerald-500",
      bg: "bg-gradient-to-br from-card via-card to-emerald-50/40 dark:to-emerald-950/20",
      blob: "bg-emerald-500/10",
      iconWrap: "bg-emerald-50 dark:bg-emerald-950/40",
      icon: "text-emerald-700 dark:text-emerald-300",
      value: "text-emerald-600 dark:text-emerald-400",
      trend: "text-emerald-600 dark:text-emerald-400",
    },
    varianceBad: {
      accent: "border-l-rose-500",
      bg: "bg-gradient-to-br from-card via-card to-rose-50/40 dark:to-rose-950/20",
      blob: "bg-rose-500/10",
      iconWrap: "bg-rose-50 dark:bg-rose-950/40",
      icon: "text-rose-700 dark:text-rose-300",
      value: "text-rose-600 dark:text-rose-400",
      trend: "text-rose-600 dark:text-rose-400",
    },
    pifraVsAlloc: {
      accent: "border-l-emerald-700",
      bg: "bg-gradient-to-br from-card via-card to-emerald-50/40 dark:to-emerald-950/20",
      blob: "bg-emerald-600/10",
      iconWrap: "bg-emerald-50 dark:bg-emerald-950/40",
      icon: "text-emerald-800 dark:text-emerald-300",
      value: "text-emerald-900 dark:text-emerald-100",
      trend: "text-emerald-800 dark:text-emerald-300",
    },
  } ;

  const getKpiVariant = (key, value) => {
    if (key === "allocation") return kpiCardVariants.totalBudget;
    if (key === "pdRelease") return kpiCardVariants.ytdUtilization;
    if (key === "spendingRelease") return value <= 0 ? kpiCardVariants.varianceGood : kpiCardVariants.varianceBad;
    if (key === "pifra") return kpiCardVariants.remaining;
    if (key === "pifraVsAllocation") return kpiCardVariants.pifraVsAlloc;
    if (key === "pct") return kpiCardVariants.varianceBad;
    return kpiCardVariants.remaining;
  };

  const stageBreakdownItems = useMemo(() => {
    const base = budgetTotals.budgetM || 1;
    return [
      { label: "Total Budget", triple: { total: budgetTotals.budgetM }, color: STAGE_COLORS[1] },
      { label: "Total Consume", triple: { total: budgetTotals.consumeM }, color: STAGE_COLORS[3] },
      { label: "Total Remaining", triple: { total: budgetTotals.remainingM }, color: STAGE_COLORS[4] },
    ].map((item) => ({
      ...item,
      pctOfApproved: base > 0 ? (Number(_nullishCoalesce(item.triple.total, () => ( 0))) / base) * 100 : 0,
    }));
  }, [budgetTotals.budgetM, budgetTotals.consumeM, budgetTotals.remainingM]);

  const stageBreakdownWithBarScale = useMemo(() => {
    const maxPct = Math.max(
      ...stageBreakdownItems.map((i) => i.pctOfApproved),
      1e-9,
    );
    return stageBreakdownItems.map((item) => ({
      ...item,
      barWidthPct: maxPct > 0 ? (item.pctOfApproved / maxPct) * 100 : 0,
    }));
  }, [stageBreakdownItems]);

  const updateBudgetMutation = useMutation({
    mutationFn: async ({ projectId, allocatedM, utilizedM }) => {
      const variance = allocatedM - utilizedM;
      const remaining = Math.max(0, allocatedM - utilizedM);
      return await updateProject(projectId, {
        total_budget_allocated: allocatedM,
        budget_utilized: utilizedM,
        budget_variance: String(variance),
        budget_remaining: String(remaining),
      });
    },
    onSuccess: () => {
      // Refresh data so Finance KPIs/charts update immediately.
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      if (selectedProjectNumericId != null) {
        queryClient.invalidateQueries({ queryKey: ["project-by-id", selectedProjectNumericId] });
      }
      queryClient.invalidateQueries({ queryKey: ["project-summary"] });

      toast({ title: "Success", description: "Budget updated successfully." });
      setIsBudgetEditOpen(false);
    },
    onError: (e) => {
      toast({
        title: "Error",
        description: e?.message || "Failed to update budget.",
        variant: "destructive",
      });
    },
  });

  const handleSaveBudget = () => {
    if (!selectedProjectNumericId || !selectedProject) return;
    const aRaw = String(budgetAllocatedInput || "").trim();
    const uRaw = String(budgetUtilizedInput || "").trim();
    const allocatedM = aRaw === "" ? 0 : Number(aRaw);
    const utilizedM = uRaw === "" ? 0 : Number(uRaw);
    if (!Number.isFinite(allocatedM) || !Number.isFinite(utilizedM)) {
      toast({
        title: "Invalid input",
        description: "Please enter valid numeric values for budget fields.",
        variant: "destructive",
      });
      return;
    }
    updateBudgetMutation.mutate({ projectId: selectedProjectNumericId, allocatedM, utilizedM });
  };

  return (
    React.createElement(Layout, { title: isMobile ? "FINANCIAL ANALYTICS" : "Financial & Budget Analytics", __self: this, __source: {fileName: _jsxFileName, lineNumber: 577}}
      , React.createElement('div', { className: "flex flex-col gap-4 sm:gap-6 w-full min-w-0"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 578}}
        /* Filters */
        , React.createElement('div', { className: "flex flex-wrap items-center gap-3 min-w-0"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 580}}
          , React.createElement(Filter, { className: "h-4 w-4 text-muted-foreground shrink-0"   , 'aria-hidden': true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 581}} )
          , React.createElement('div', { className: "grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3 min-w-0"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 582}}
            , React.createElement('div', { className: "flex flex-col gap-1 min-w-0 sm:flex sm:flex-wrap sm:flex-row sm:items-center sm:gap-2"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 583}}
              , React.createElement('label', { className: "text-sm font-medium text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 584}}, "Division")
              , React.createElement(Select, { value: selectedDivisionId, onValueChange: handleDivisionChange, disabled: divisionsLoading, __self: this, __source: {fileName: _jsxFileName, lineNumber: 585}}
                , React.createElement(SelectTrigger, { className: "h-9 w-full sm:w-[140px] border-border/50 bg-background rounded-md"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 586}}
                  , React.createElement(SelectValue, { placeholder: divisionsLoading ? "Loading…" : "All", __self: this, __source: {fileName: _jsxFileName, lineNumber: 587}} )
                )
                , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 589}}
                  , React.createElement(SelectItem, { value: "all", __self: this, __source: {fileName: _jsxFileName, lineNumber: 590}}, "All")
                  , divisions.map((d) => (
                    React.createElement(SelectItem, { key: d.id, value: String(d.id), __self: this, __source: {fileName: _jsxFileName, lineNumber: 592}}
                      , d.division_name
                    )
                  ))
                )
              )
            )

            , React.createElement('div', { className: "flex flex-col gap-1 min-w-0 sm:flex sm:flex-wrap sm:flex-row sm:items-center sm:gap-2"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 600}}
              , React.createElement('label', { className: "text-sm font-medium text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 601}}, "District")
              , React.createElement(Select, {
                value: selectedDistrictId,
                onValueChange: handleDistrictChange,
                disabled: selectedDivisionId === "all" || districtsLoading, __self: this, __source: {fileName: _jsxFileName, lineNumber: 602}}

                , React.createElement(SelectTrigger, {
                  className: cn(
                    "h-9 w-full sm:w-[140px] border-border/50 bg-background rounded-md",
                    (selectedDivisionId === "all" || districtsLoading) && "opacity-50 cursor-not-allowed"
                  ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 607}}

                  , React.createElement(SelectValue, { placeholder: districtsLoading ? "Loading…" : "All", __self: this, __source: {fileName: _jsxFileName, lineNumber: 613}} )
                )
                , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 615}}
                  , React.createElement(SelectItem, { value: "all", __self: this, __source: {fileName: _jsxFileName, lineNumber: 616}}, "All")
                  , selectedDivisionId !== "all" &&
                    districts.map((d) => (
                      React.createElement(SelectItem, { key: d.id, value: String(d.id), __self: this, __source: {fileName: _jsxFileName, lineNumber: 619}}
                        , d.district_name
                      )
                    ))
                )
              )
            )

            , React.createElement('div', { className: "flex flex-col gap-1 min-w-0 sm:flex sm:flex-wrap sm:flex-row sm:items-center sm:gap-2"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 627}}
              , React.createElement('label', { className: "text-sm font-medium text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 628}}, "Tehsil")
              , React.createElement(Select, {
                value: selectedTehsilId,
                onValueChange: handleTehsilChange,
                disabled: selectedDivisionId === "all" || selectedDistrictId === "all" || tehsilsLoading, __self: this, __source: {fileName: _jsxFileName, lineNumber: 629}}

                , React.createElement(SelectTrigger, {
                  className: cn(
                    "h-9 w-full sm:w-[140px] border-border/50 bg-background rounded-md",
                    (selectedDivisionId === "all" ||
                      selectedDistrictId === "all" ||
                      tehsilsLoading) &&
                      "opacity-50 cursor-not-allowed"
                  ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 634}}

                  , React.createElement(SelectValue, { placeholder: tehsilsLoading ? "Loading…" : "All", __self: this, __source: {fileName: _jsxFileName, lineNumber: 643}} )
                )
                , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 645}}
                  , React.createElement(SelectItem, { value: "all", __self: this, __source: {fileName: _jsxFileName, lineNumber: 646}}, "All")
                  , selectedDivisionId !== "all" &&
                    selectedDistrictId !== "all" &&
                    tehsils.map((t) => (
                      React.createElement(SelectItem, { key: t.id, value: String(t.id), __self: this, __source: {fileName: _jsxFileName, lineNumber: 650}}
                        , t.tehsil_name
                      )
                    ))
                )
              )
            )

            , React.createElement('div', { className: "flex flex-col gap-1 min-w-0 sm:flex sm:flex-wrap sm:flex-row sm:items-center sm:gap-2"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 658}}
              , React.createElement('label', { className: "text-sm font-medium text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 659}}, "Project")
              , React.createElement(Select, { value: selectedProjectId, onValueChange: setSelectedProjectId, __self: this, __source: {fileName: _jsxFileName, lineNumber: 660}}
                , React.createElement(SelectTrigger, { className: "h-9 w-full sm:w-[160px] border-border/50 bg-background rounded-md"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 661}}
                  , React.createElement(SelectValue, { placeholder: "All", __self: this, __source: {fileName: _jsxFileName, lineNumber: 662}} )
                )
                , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 664}}
                  , React.createElement(SelectItem, { value: "all", __self: this, __source: {fileName: _jsxFileName, lineNumber: 665}}, "All (" , filteredProjects.length, ")")
                  , filteredProjects.map((p) => (
                    React.createElement(SelectItem, { key: p.id, value: String(p.id), __self: this, __source: {fileName: _jsxFileName, lineNumber: 667}}
                      , p.project_name || `#${p.id}`
                    )
                  ))
                )
              )
            )

            , selectedProjectId !== "all" && (
              React.createElement(Button, {
                variant: "outline",
                size: "sm",
                onClick: () => setIsBudgetEditOpen(true),
                className: "h-9 px-3 text-xs font-semibold border-border/60 bg-background hover:bg-muted/40 shrink-0",
                disabled: !selectedProject,
                __self: this, __source: {fileName: _jsxFileName, lineNumber: 670}}
              , "Update Budget")
            )
          )
          , (selectedDivisionId !== "all" ||
            selectedDistrictId !== "all" ||
            selectedTehsilId !== "all" ||
            selectedProjectId !== "all") && (
            React.createElement(Button, {
              variant: "destructive",
              size: "sm",
              onClick: () => {
                setSelectedDivisionId("all");
                setSelectedDistrictId("all");
                setSelectedTehsilId("all");
                setSelectedProjectId("all");
              },
              className: "h-8 px-3 text-xs font-medium text-white bg-red-600 hover:bg-red-700 border-0 shrink-0"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 679}}
, "Clear"

            )
          )
        )

        , isBudgetEditOpen && selectedProjectId !== "all" && selectedProject && (
          React.createElement(Card, { className: "border border-border/60 shadow-sm", __self: this, __source: {fileName: _jsxFileName, lineNumber: 690}}
            , React.createElement(CardHeader, { className: "pb-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 691}}
              , React.createElement(CardTitle, { className: "text-base", __self: this, __source: {fileName: _jsxFileName, lineNumber: 692}}, "Update Budget")
              , React.createElement(CardDescription, { className: "text-xs", __self: this, __source: {fileName: _jsxFileName, lineNumber: 693}}
                , "Project details are locked. Only budget values can be updated."
              )
            )
            , React.createElement(CardContent, { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 697}}
              , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 698}}
                , React.createElement('div', { className: "rounded-lg border bg-muted/20 p-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 699}}
                  , React.createElement('p', { className: "text-[11px] font-semibold text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 700}}, "Project")
                  , React.createElement('p', { className: "mt-1 text-sm font-semibold truncate", __self: this, __source: {fileName: _jsxFileName, lineNumber: 701}}, selectedProject.project_name || `#${selectedProject.id}`)
                )
                , React.createElement('div', { className: "rounded-lg border bg-muted/20 p-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 702}}
                  , React.createElement('p', { className: "text-[11px] font-semibold text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 703}}, "Reference No")
                  , React.createElement('p', { className: "mt-1 text-sm font-semibold truncate", __self: this, __source: {fileName: _jsxFileName, lineNumber: 704}}, _nullishCoalesce(selectedProject.project_reference_no, () => ( "—")))
                )
                , React.createElement('div', { className: "rounded-lg border bg-muted/20 p-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 705}}
                  , React.createElement('p', { className: "text-[11px] font-semibold text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 706}}, "Location")
                  , React.createElement('p', { className: "mt-1 text-sm font-semibold truncate", __self: this, __source: {fileName: _jsxFileName, lineNumber: 707}}
                    , (_nullishCoalesce(selectedProject.division_name, () => ( "")) || "—"), " / "
                    , (_nullishCoalesce(selectedProject.district_name, () => ( "")) || "—"), " / "
                    , (_nullishCoalesce(selectedProject.tehsil_name, () => ( "")) || "—")
                  )
                )
              )

              , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 710}}
                , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 711}}
                  , React.createElement('label', { className: "text-sm font-medium text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 712}}, "Total Budget Allocated (M)")
                  , React.createElement(Input, { value: budgetAllocatedInput, onChange: (e) => setBudgetAllocatedInput(e.target.value), placeholder: "e.g. 120.50", __self: this, __source: {fileName: _jsxFileName, lineNumber: 713}} )
                )
                , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 714}}
                  , React.createElement('label', { className: "text-sm font-medium text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 715}}, "Budget Utilized (M)")
                  , React.createElement(Input, { value: budgetUtilizedInput, onChange: (e) => setBudgetUtilizedInput(e.target.value), placeholder: "e.g. 40.25", __self: this, __source: {fileName: _jsxFileName, lineNumber: 716}} )
                )
              )

              , React.createElement('div', { className: "flex items-center justify-end gap-2 pt-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 720}}
                , React.createElement(Button, { variant: "outline", size: "sm", onClick: () => setIsBudgetEditOpen(false), className: "h-8", disabled: updateBudgetMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 721}}, "Cancel")
                , React.createElement(Button, { variant: "default", size: "sm", onClick: handleSaveBudget, className: "h-8 bg-primary text-primary-foreground", disabled: updateBudgetMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 722}}
                  , updateBudgetMutation.isPending ? "Saving…" : "Save"
                )
              )
            )
          )
        )

        , (selectedProjectId !== "all" && !selectedProject) || (isAllFilters && !projectSummary) ? (
          React.createElement(React.Fragment, null
            /* Skeleton loader: keep layout stable while loading */
            , React.createElement('div', { className: "grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 698}}
              , Array.from({ length: 3 }).map((_, i) => (
                React.createElement(Card, { key: i, className: "rounded-xl border border-border/50 shadow-sm overflow-hidden"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 700}}
                  , React.createElement(CardHeader, { className: "space-y-0 px-3 pb-1 pt-3"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 701}}
                    , React.createElement('div', { className: "flex items-start justify-between gap-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 702}}
                      , React.createElement(Skeleton, { className: "h-3 w-24" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 703}} )
                      , React.createElement(Skeleton, { className: "h-8 w-8 rounded-lg"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 704}} )
                    )
                  )
                  , React.createElement(CardContent, { className: "space-y-2 px-3 pb-3 pt-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 707}}
                    , React.createElement(Skeleton, { className: "h-6 w-28" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 708}} )
                    , React.createElement(Skeleton, { className: "h-2.5 w-full" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 709}} )
                  )
                )
              ))
            )
            , React.createElement(Card, { className: "border-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 714}}
              , React.createElement(CardHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 715}}
                , React.createElement(Skeleton, { className: "h-5 w-48" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 716}} )
                , React.createElement(Skeleton, { className: "h-3 w-80 max-w-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 717}} )
              )
              , React.createElement(CardContent, { className: "h-[360px] sm:h-[420px] lg:h-[480px]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 719}}
                , React.createElement(Skeleton, { className: "h-full w-full rounded-xl"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 720}} )
              )
            )
          )
        ) : null

        , (!isAllFilters || projectSummary) && (
          React.createElement(React.Fragment, null
            /* KPI row: 3 cards (Budget / Consume / Remaining) */
            , React.createElement('div', { className: "grid grid-cols-1 items-stretch gap-3 sm:grid-cols-3 sm:gap-3"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 729}}
              , ([
                {
                  key: "totalBudget",
                  label: "Total Budget",
                  icon: Wallet,
                  valueM: budgetTotals.budgetM,
                  hint: "Approved / planned baseline",
                  variantKey: "totalBudget",
                },
                {
                  key: "totalConsume",
                  label: "Total Consume",
                  icon: TrendingUp,
                  valueM: budgetTotals.consumeM,
                  hint: "Utilized",
                  variantKey: "ytdUtilization",
                },
                {
                  key: "totalRemaining",
                  label: "Total Remaining",
                  icon: CheckCircle2,
                  valueM: budgetTotals.remainingM,
                  hint: "Remaining budget",
                  variantKey: "remaining",
                },
              ]).map((kpi) => {
                const Icon = kpi.icon;
                const variant = kpiCardVariants[kpi.variantKey] || kpiCardVariants.remaining;
                return (
                  React.createElement(Card, {
                    key: kpi.key,
                    className: cn(
                      "relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/50 shadow-sm transition-all hover:shadow-md",
                      "border-l-4",
                      variant.accent,
                      variant.bg
                    ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 777}}

                    , React.createElement('div', { className: cn("pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl", variant.blob), __self: this, __source: {fileName: _jsxFileName, lineNumber: 786}} )
                    , React.createElement(CardHeader, { className: "relative flex-shrink-0 space-y-0 px-3 pb-1 pt-3"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 787}}
                      , React.createElement('div', { className: "flex items-start justify-between gap-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 788}}
                        , React.createElement(CardTitle, { className: "min-h-[2.25rem] max-w-[calc(100%-2.25rem)] text-xs font-medium leading-snug text-muted-foreground line-clamp-2"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 789}}
                          , kpi.label
                        )
                        , React.createElement('div', {
                          className: cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/40 shadow-sm",
                            variant.iconWrap
                          ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 792}}
                          , React.createElement(Icon, { className: cn("h-4 w-4", variant.icon), __self: this, __source: {fileName: _jsxFileName, lineNumber: 798}} )
                        )
                      )
                    )
                    , React.createElement(CardContent, { className: "relative flex flex-col px-3 pb-3 pt-0"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 802}}
                      , React.createElement('div', { className: cn("text-lg font-bold font-heading xl:text-xl", variant.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 803}}
                        , formatPKRMillions(Number(_nullishCoalesce(kpi.valueM, () => ( 0))))
                      )
                      , React.createElement('p', { className: "mt-2 text-[11px] leading-snug text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 810}}
                        , kpi.hint
                      )
                    )
                  )
                );
              })
            )

            /* Budget overview */
            , React.createElement('div', { className: "grid grid-cols-1 gap-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 818}}
              , React.createElement(Card, { className: "flex min-h-0 w-full flex-col border-2 transition-colors hover:border-primary/60", __self: this, __source: {fileName: _jsxFileName, lineNumber: 819}}
                , React.createElement(CardHeader, { className: "flex-shrink-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 820}}
                  , React.createElement(CardTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 821}}, "Budget overview")
                  , React.createElement(CardDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 822}}, "Totals (PKR millions) — Total Budget → Total Consume → Total Remaining")
                )
                , React.createElement(CardContent, { className: "h-[320px] w-full sm:h-[360px] lg:h-[420px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 826}}
                  , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 827}}
                    , React.createElement(ComposedChart, { data: flowChartData, margin: { top: 16, right: 32, left: 16, bottom: isMobile ? 52 : 36 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 828}}
                      , React.createElement('defs', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 831}}
                        , React.createElement('linearGradient', { id: "colorFlowTotal", x1: "0", y1: "0", x2: "0", y2: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 832}}
                          , React.createElement('stop', { offset: "5%", stopColor: "#2F8F6C", stopOpacity: 0.35, __self: this, __source: {fileName: _jsxFileName, lineNumber: 833}} )
                          , React.createElement('stop', { offset: "95%", stopColor: "#2F8F6C", stopOpacity: 0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 834}} )
                        )
                      )
                      , React.createElement(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "hsl(var(--border))", __self: this, __source: {fileName: _jsxFileName, lineNumber: 837}} )
                      , React.createElement(XAxis, { dataKey: "stage", tick: { fontSize: 11, fill: "hsl(var(--muted-foreground))" }, interval: 0, angle: isMobile ? -35 : 0, textAnchor: isMobile ? "end" : "middle", height: isMobile ? 70 : 40, __self: this, __source: {fileName: _jsxFileName, lineNumber: 838}} )
                      , React.createElement(YAxis, { tick: { fontSize: 12, fill: "hsl(var(--muted-foreground))" }, tickFormatter: (v) => `${v}M`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 846}} )
                      , React.createElement(Tooltip, { contentStyle: { backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }, formatter: (value, name) => [`PKR ${Number(value).toFixed(2)} M`, name], __self: this, __source: {fileName: _jsxFileName, lineNumber: 847}} )
                      , React.createElement(Legend, { wrapperStyle: { paddingTop: 8 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 858}} )
                      , React.createElement(Bar, { dataKey: "totalM", fill: "url(#colorFlowTotal)", radius: [4, 4, 0, 0], name: "Total (M)", barCategoryGap: "18%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 859}} )
                    )
                  )
                )
              )
            )

            /* Project comparison — only projects with financial data; duplicate names disambiguated */
            , React.createElement(Card, { className: "border-2 transition-colors hover:border-primary/60"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 882}}
              , React.createElement(CardHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 883}}
                , React.createElement(CardTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 884}}, "Project comparison" )
                , React.createElement(CardDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 885}}, "Total Budget vs Total Consume (PKR millions), projects with data only"         )
              )
              , React.createElement(CardContent, { className: "h-[300px] sm:h-[330px] lg:h-[380px]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 887}}
                , divisionComparisonData.length === 0 ? (
                  React.createElement('div', { className: "flex h-full items-center justify-center text-sm text-muted-foreground"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 889}}, "No projects with budget/consume totals in the current filter."

                  )
                ) : (
                  React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 893}}
                    , React.createElement(ComposedChart, {
                      data: divisionComparisonData,
                      margin: { top: 10, right: 24, left: 8, bottom: divisionComparisonData.length > 6 ? 72 : 56 },
                      barCategoryGap: "12%",
                      barGap: 4, __self: this, __source: {fileName: _jsxFileName, lineNumber: 894}}

                      , React.createElement(CartesianGrid, { strokeDasharray: "3 3" , vertical: false, stroke: "hsl(var(--border))", __self: this, __source: {fileName: _jsxFileName, lineNumber: 900}} )
                      , React.createElement(XAxis, {
                        dataKey: "division",
                        angle: -35,
                        textAnchor: "end",
                        height: divisionComparisonData.length > 6 ? 88 : 72,
                        interval: 0,
                        tick: { fontSize: 10, fill: "hsl(var(--muted-foreground))" }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 901}}
                      )
                      , React.createElement(YAxis, {
                        tick: { fontSize: 12, fill: "hsl(var(--muted-foreground))" },
                        tickFormatter: (v) => `${v}M`,
                        width: 48, __self: this, __source: {fileName: _jsxFileName, lineNumber: 909}}
                      )
                      , React.createElement(Tooltip, {
                        contentStyle: {
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        },
                        formatter: (value, name) => [`PKR ${Number(value).toFixed(2)} M`, name], __self: this, __source: {fileName: _jsxFileName, lineNumber: 914}}
                      )
                      , React.createElement(Legend, { wrapperStyle: { paddingTop: 8 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 922}} )
                      , React.createElement(Bar, { dataKey: "budgetM", fill: "#2F8F6C", radius: [4, 4, 0, 0], name: "Budget (M)" , maxBarSize: 56, __self: this, __source: {fileName: _jsxFileName, lineNumber: 923}} )
                      , React.createElement(Bar, { dataKey: "consumeM", fill: "#F59E0B", radius: [4, 4, 0, 0], name: "Consume (M)" , maxBarSize: 56, __self: this, __source: {fileName: _jsxFileName, lineNumber: 924}} )
                    )
                  )
                )
              )
            )

            /* Budget S-curve */
            , React.createElement(Card, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 932}}
              , React.createElement(CardHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 933}}
                , React.createElement(CardTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 934}}, "Budget S-curve (totals)"  )
                , React.createElement(CardDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 935}}, "Curved cumulative view (Jan–Dec) scaled to totals (PKR millions)."


                )
              )
              , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 940}}
                , React.createElement('div', { className: "h-[320px] w-full sm:h-[360px] lg:h-[420px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 941}}
                  , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 942}}
                    , React.createElement(ComposedChart, {
                      data: (() => {
                        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                        const clamp01 = (x) => Math.max(0, Math.min(1, x));
                        const s = (t, k = 10, mid = 0.55) => {
                          const x = (t - mid) * k;
                          const y = 1 / (1 + Math.exp(-x));
                          return clamp01(y);
                        };
                        const budget = Number(_nullishCoalesce(budgetTotals.budgetM, () => ( 0)));
                        const consume = Number(_nullishCoalesce(budgetTotals.consumeM, () => ( 0)));
                        const remaining = Number(_nullishCoalesce(budgetTotals.remainingM, () => ( 0)));
                        return months.map((m, idx) => {
                          const t = idx / (months.length - 1);
                          return {
                            month: m,
                            budgetM: budget * s(t, 9.5, 0.52),
                            consumeM: consume * s(t, 10.5, 0.58),
                            remainingM: remaining * s(t, 9.5, 0.50),
                          };
                        });
                      })(),
                      margin: { top: 10, right: 24, left: 8, bottom: 10 },
                      __self: this, __source: {fileName: _jsxFileName, lineNumber: 943}}
                      , React.createElement(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "hsl(var(--border))", __self: this, __source: {fileName: _jsxFileName, lineNumber: 970}} )
                      , React.createElement(XAxis, { dataKey: "month", tick: { fontSize: 11, fill: "hsl(var(--muted-foreground))" }, interval: 0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 971}} )
                      , React.createElement(YAxis, { tick: { fontSize: 12, fill: "hsl(var(--muted-foreground))" }, tickFormatter: (v) => `${Number(v).toFixed(0)}M`, width: 56, __self: this, __source: {fileName: _jsxFileName, lineNumber: 972}} )
                      , React.createElement(Tooltip, { contentStyle: { backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }, formatter: (value, name) => [`PKR ${Number(value).toFixed(2)} M`, name], __self: this, __source: {fileName: _jsxFileName, lineNumber: 973}} )
                      , React.createElement(Legend, { verticalAlign: "top", height: 24, iconType: "circle", wrapperStyle: { fontSize: 11 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 974}} )
                      , React.createElement(Line, { type: "monotone", dataKey: "budgetM", name: "Total Budget", stroke: STAGE_COLORS[1], strokeWidth: 3, dot: { r: 3 }, activeDot: { r: 5 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 975}} )
                      , React.createElement(Line, { type: "monotone", dataKey: "consumeM", name: "Total Consume", stroke: STAGE_COLORS[3], strokeWidth: 3, dot: { r: 3 }, activeDot: { r: 5 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 976}} )
                      , React.createElement(Line, { type: "monotone", dataKey: "remainingM", name: "Total Remaining", stroke: STAGE_COLORS[4], strokeWidth: 3, dot: { r: 3 }, activeDot: { r: 5 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 977}} )
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
