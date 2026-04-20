import React from "react";
const _jsxFileName = ""; function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, LucideBanknote, Wallet, AlertCircle, CheckCircle2, Filter, Percent } from "lucide-react";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useWindowSize } from "@/hooks/use-window-size";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  getProjectById,
  getProjectSummary,
  listProjects,
  listDivisions,
  listDistricts,
  listTehsils,
} from "@/api";


// Backend project financials are PKR millions (M).
const formatPKRMillions = (m) => {
  const sign = m < 0 ? "−" : "";
  const abs = Math.abs(m);
  return `${sign}PKR ${abs.toFixed(2)} M`;
};

const STAGE_COLORS = ["#2F8F6C", "#0F4B3A", "#2E7D32", "#f59e0b", "#8BC34A"];

export default function Finance() {
  const { width } = useWindowSize();
  const [selectedDivisionId, setSelectedDivisionId] = useState("all");
  const [selectedDistrictId, setSelectedDistrictId] = useState("all");
  const [selectedTehsilId, setSelectedTehsilId] = useState("all");
  const [selectedProjectId, setSelectedProjectId] = useState("all");

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

  const flowChartData = useMemo(() => {
    if (selectedProject) {
      return [
        {
          stage: "Allocation",
          totalM: Number(_nullishCoalesce(selectedProject.allocation_total_cost, () => ( 0))),
          capitalM: Number(_nullishCoalesce(selectedProject.allocation_capital_cost, () => ( 0))),
          revenueM: Number(_nullishCoalesce(selectedProject.allocation_revenue_cost, () => ( 0))),
        },
        {
          stage: "P&D Release",
          totalM: Number(_nullishCoalesce(selectedProject.pd_release_total_cost, () => ( 0))),
          capitalM: Number(_nullishCoalesce(selectedProject.pd_release_capital_cost, () => ( 0))),
          revenueM: Number(_nullishCoalesce(selectedProject.pd_release_cost, () => ( 0))),
        },
        {
          stage: "Spending Release",
          totalM: Number(_nullishCoalesce(selectedProject.spending_release_total_cost, () => ( 0))),
          capitalM: Number(_nullishCoalesce(selectedProject.spending_release_capital_cost, () => ( 0))),
          revenueM: Number(_nullishCoalesce(selectedProject.spending_release_revenue_cost, () => ( 0))),
        },
        {
          stage: "PIFRA Utilization",
          totalM: Number(_nullishCoalesce(selectedProject.pifra_utilization_total_cost, () => ( 0))),
          capitalM: Number(_nullishCoalesce(selectedProject.pifra_utilization_capital_cost, () => ( 0))),
          revenueM: Number(_nullishCoalesce(selectedProject.pifra_utilization_revenue_cost, () => ( 0))),
        },
      ];
    }
    // If filtering by area (but not selecting a single project), aggregate from list-project.
    if (!isAllFilters && selectedProjectId === "all") {
      return [
        {
          stage: "Allocation",
          totalM: aggregatedFinancials.allocation_total_cost,
          capitalM: aggregatedFinancials.allocation_capital_cost,
          revenueM: aggregatedFinancials.allocation_revenue_cost,
        },
        {
          stage: "P&D Release",
          totalM: aggregatedFinancials.pd_release_total_cost,
          capitalM: aggregatedFinancials.pd_release_capital_cost,
          revenueM: aggregatedFinancials.pd_release_cost,
        },
        {
          stage: "Spending Release",
          totalM: aggregatedFinancials.spending_release_total_cost,
          capitalM: aggregatedFinancials.spending_release_capital_cost,
          revenueM: aggregatedFinancials.spending_release_revenue_cost,
        },
        {
          stage: "PIFRA Utilization",
          totalM: aggregatedFinancials.pifra_utilization_total_cost,
          capitalM: aggregatedFinancials.pifra_utilization_capital_cost,
          revenueM: aggregatedFinancials.pifra_utilization_revenue_cost,
        },
      ];
    }
    if (projectSummary) {
      return [
        { stage: "Allocation", totalM: Number(_nullishCoalesce(projectSummary.total_allocation, () => ( 0))), capitalM: 0, revenueM: 0 },
        { stage: "P&D Release", totalM: Number(_nullishCoalesce(projectSummary.total_pd_release, () => ( 0))), capitalM: 0, revenueM: 0 },
        { stage: "Spending Release", totalM: Number(_nullishCoalesce(projectSummary.total_spending_release, () => ( 0))), capitalM: 0, revenueM: 0 },
        { stage: "PIFRA Utilization", totalM: Number(_nullishCoalesce(projectSummary.total_pifra, () => ( 0))), capitalM: 0, revenueM: 0 },
      ];
    }
    return [];
  }, [selectedProject, projectSummary, aggregatedFinancials, isAllFilters, selectedProjectId]);

  const divisionComparisonData = useMemo(() => {
    const EPS = 1e-6;
    const rows = filteredProjects.map((p, i) => {
      const baseName = (_optionalChain([p, 'access', _26 => _26.project_name, 'optionalAccess', _27 => _27.trim, 'call', _28 => _28()]) || `#${p.id}`) ;
      return {
        division: baseName,
        approvedM: Number(_nullishCoalesce(p.allocation_total_cost, () => ( 0))),
        pifraM: Number(_nullishCoalesce(p.pifra_utilization_total_cost, () => ( 0))),
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
    return withUniqueLabels.filter((r) => r.approvedM > EPS || r.pifraM > EPS);
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
  const alloc = {
    capital: selectedProject
      ? Number(_nullishCoalesce(selectedProject.allocation_capital_cost, () => ( 0)))
      : Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _36 => _36.total_allocation_capital]), () => ( 0))),

    revenue: selectedProject
      ? Number(_nullishCoalesce(selectedProject.allocation_revenue_cost, () => ( 0)))
      : Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _37 => _37.total_allocation_revenue]), () => ( 0))),

    total: selectedProject
      ? Number(_nullishCoalesce(selectedProject.allocation_total_cost, () => ( 0)))
      : Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _38 => _38.total_allocation]), () => ( 0))),
  };

  const pd = {
    capital: selectedProject
      ? Number(_nullishCoalesce(selectedProject.pd_release_capital_cost, () => ( 0)))
      : Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _39 => _39.total_pd_release_capital]), () => ( 0))),

    revenue: selectedProject
      ? Number(_nullishCoalesce(selectedProject.pd_release_cost, () => ( 0)))
      : Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _40 => _40.total_pd_release_revenue]), () => ( 0))),

    total: selectedProject
      ? Number(_nullishCoalesce(selectedProject.pd_release_total_cost, () => ( 0)))
      : Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _41 => _41.total_pd_release]), () => ( 0))),
  };

  const spending = {
    capital: selectedProject
      ? Number(_nullishCoalesce(selectedProject.spending_release_capital_cost, () => ( 0)))
      : Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _42 => _42.total_spending_release_capital]), () => ( 0))),

    revenue: selectedProject
      ? Number(_nullishCoalesce(selectedProject.spending_release_revenue_cost, () => ( 0)))
      : Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _43 => _43.total_spending_release_revenue]), () => ( 0))),

    total: selectedProject
      ? Number(_nullishCoalesce(selectedProject.spending_release_total_cost, () => ( 0)))
      : Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _44 => _44.total_spending_release]), () => ( 0))),
  };

  const pifra = {
    capital: selectedProject
      ? Number(_nullishCoalesce(selectedProject.pifra_utilization_capital_cost, () => ( 0)))
      : Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _45 => _45.total_pifra_capital]), () => ( 0))),

    revenue: selectedProject
      ? Number(_nullishCoalesce(selectedProject.pifra_utilization_revenue_cost, () => ( 0)))
      : Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _46 => _46.total_pifra_revenue]), () => ( 0))),

    total: selectedProject
      ? Number(_nullishCoalesce(selectedProject.pifra_utilization_total_cost, () => ( 0)))
      : Number(_nullishCoalesce(_optionalChain([projectSummary, 'optionalAccess', _47 => _47.total_pifra]), () => ( 0))),
  };

  const base = alloc.total || 1;

  return [
    { label: "Allocation", triple: alloc, color: STAGE_COLORS[1] },
    { label: "P&D release", triple: pd, color: STAGE_COLORS[2] },
    { label: "Spending release", triple: spending, color: STAGE_COLORS[3] },
    { label: "PIFRA utilization", triple: pifra, color: STAGE_COLORS[4] },
  ].map((item) => ({
    ...item,
    totalM: item.triple.total,
    pctOfApproved: base > 0 ? (item.triple.total / base) * 100 : 0,
  }));
}, [selectedProject, projectSummary]);

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

        , (selectedProjectId !== "all" && !selectedProject) || (isAllFilters && !projectSummary) ? (
          React.createElement(React.Fragment, null
            /* Skeleton loader: keep layout stable while loading */
            , React.createElement('div', { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3 xl:grid-cols-5"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 698}}
              , Array.from({ length: 5 }).map((_, i) => (
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
            /* KPI row: five compact cards incl. PIFRA vs allocation */
            , React.createElement('div', { className: "grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-3 xl:grid-cols-5"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 729}}
              , Object.entries(kpiDataWithIcons).map(([key, kpi]) => {
                const Icon = kpi.icon;
                const isPercentKpi = (kpi ).format === "percent";
                const isPositive = kpi.trend >= 0;
                const variant = getKpiVariant(key, Number(_nullishCoalesce((kpi ).valueM, () => ( 0))));

                const footerTrend =
                  key === "pifraVsAllocation" ? (
                    React.createElement('div', { className: "w-full space-y-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 738}}
                      , React.createElement('p', { className: "text-[10px] leading-tight text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 739}}, "Share of allocation in PIFRA"    )
                      , React.createElement('div', { className: "h-1.5 w-full overflow-hidden rounded-full bg-muted"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 740}}
                        , React.createElement('div', {
                          className: "h-full rounded-full bg-primary transition-all"   ,
                          style: { width: `${Math.min(100, utilizationRate)}%` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 741}}
                        )
                      )
                      , React.createElement('div', { className: "flex justify-between gap-1 text-[10px] leading-tight text-muted-foreground"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 746}}
                        , React.createElement('span', { className: "min-w-0 truncate" , title: formatPKRMillions(totalActualM), __self: this, __source: {fileName: _jsxFileName, lineNumber: 747}}
                          , formatPKRMillions(totalActualM)
                        )
                        , React.createElement('span', { className: "min-w-0 truncate text-right"  , title: formatPKRMillions(totalPlannedM), __self: this, __source: {fileName: _jsxFileName, lineNumber: 750}}
                          , formatPKRMillions(totalPlannedM)
                        )
                      )
                    )
                  ) : key === "pifra" ? (
                    React.createElement('div', { className: "flex items-center gap-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 756}}
                      , isPositive ? (
                        React.createElement(TrendingUp, { className: cn("h-3 w-3 shrink-0", variant.trend), __self: this, __source: {fileName: _jsxFileName, lineNumber: 758}} )
                      ) : (
                        React.createElement(TrendingDown, { className: cn("h-3 w-3 shrink-0", variant.trend), __self: this, __source: {fileName: _jsxFileName, lineNumber: 760}} )
                      )
                      , React.createElement('p', { className: cn("text-[11px] leading-snug", variant.trend), __self: this, __source: {fileName: _jsxFileName, lineNumber: 762}}
                        , `${kpiDerived.utilVsSpendingPct.toFixed(1)}% of spending release`
                      )
                    )
                  ) : key === "pct" ? (
                    React.createElement('p', { className: "text-[11px] leading-snug text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 767}}, "Share of approved allocation"   )
                  ) : key === "pdRelease" ? (
                    React.createElement('p', { className: "text-[11px] leading-snug text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 769}}, "Planning & development"  )
                  ) : key === "allocation" ? (
                    React.createElement('p', { className: "text-[11px] leading-snug text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 771}}, "Approved / planned baseline"   )
                  ) : (
                    React.createElement('p', { className: "text-[11px] leading-snug text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 773}}, "Released for expenditure"  )
                  );

                return (
                  React.createElement(Card, {
                    key: key,
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
                      , React.createElement('div', { className: "text-lg font-bold font-heading text-foreground xl:text-xl"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 803}}
                        , isPercentKpi
                          ? `${Number(_nullishCoalesce((kpi ).valueM, () => ( 0))).toFixed(1)}%`
                          : key === "pct"
                            ? `${Number(_nullishCoalesce((kpi ).valueM, () => ( 0))).toFixed(2)}%`
                            : formatPKRMillions(Number(_nullishCoalesce((kpi ).valueM, () => ( 0))))
                      )
                      , React.createElement('div', { className: "mt-2 min-h-[2.5rem]" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 810}}, footerTrend)
                    )
                  )
                );
              })
            )

            /* Scheme financial flow — full width */
            , React.createElement(Card, { className: "flex min-h-0 w-full flex-col border-2 transition-colors hover:border-primary/60"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 818}}
              , React.createElement(CardHeader, { className: "flex-shrink-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 819}}
                , React.createElement(CardTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 820}}, "Scheme financial flow"  )
                , React.createElement(CardDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 821}}, "Totals (PKR millions) by stage — Allocation → P&D → Spending release → PIFRA"

                )
              )
              , React.createElement(CardContent, { className: "h-[360px] w-full sm:h-[420px] lg:h-[480px]"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 825}}
                , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 826}}
                  , React.createElement(ComposedChart, {
                    data: flowChartData,
                    margin: { top: 16, right: 32, left: 16, bottom: isMobile ? 52 : 36 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 827}}

                      , React.createElement('defs', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 831}}
                        , React.createElement('linearGradient', { id: "colorFlowTotal", x1: "0", y1: "0", x2: "0", y2: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 832}}
                          , React.createElement('stop', { offset: "5%", stopColor: "#2F8F6C", stopOpacity: 0.35, __self: this, __source: {fileName: _jsxFileName, lineNumber: 833}} )
                          , React.createElement('stop', { offset: "95%", stopColor: "#2F8F6C", stopOpacity: 0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 834}} )
                        )
                      )
                      , React.createElement(CartesianGrid, { strokeDasharray: "3 3" , vertical: false, stroke: "hsl(var(--border))", __self: this, __source: {fileName: _jsxFileName, lineNumber: 837}} )
                      , React.createElement(XAxis, {
                        dataKey: "stage",
                        tick: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
                        interval: 0,
                        angle: isMobile ? -35 : 0,
                        textAnchor: isMobile ? "end" : "middle",
                        height: isMobile ? 70 : 40, __self: this, __source: {fileName: _jsxFileName, lineNumber: 838}}
                      )
                      , React.createElement(YAxis, { tick: { fontSize: 12, fill: "hsl(var(--muted-foreground))" }, tickFormatter: (v) => `${v}M`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 846}} )
                      , React.createElement(Tooltip, {
                        contentStyle: {
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        },
                        formatter: (value, name) => {
                          if (name === "Total (M)") return [`PKR ${Number(value).toFixed(2)} M`, name];
                          return [`PKR ${Number(value).toFixed(2)} M`, name];
                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 847}}
                      )
                      , React.createElement(Legend, { wrapperStyle: { paddingTop: 8 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 858}} )
                      , React.createElement(Bar, {
                        dataKey: "totalM",
                        fill: "url(#colorFlowTotal)",
                        radius: [4, 4, 0, 0],
                        name: "Total (M)" ,
                        barCategoryGap: "18%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 859}}
                      )
                      , flowChartData.some((x) => Number((x ).revenueM) > 0) && (
                        React.createElement(Line, {
                          type: "monotone",
                          dataKey: "revenueM",
                          stroke: "#2E7D32",
                          strokeWidth: 2,
                          name: "Revenue (M)" ,
                          dot: { fill: "#2E7D32", r: 3 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 867}}
                        )
                      )
                    )
                  )
                )
              )

            /* Project comparison — only projects with financial data; duplicate names disambiguated */
            , React.createElement(Card, { className: "border-2 transition-colors hover:border-primary/60"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 882}}
              , React.createElement(CardHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 883}}
                , React.createElement(CardTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 884}}, "Project comparison" )
                , React.createElement(CardDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 885}}, "Allocation vs PIFRA utilization (PKR millions), projects with data only"         )
              )
              , React.createElement(CardContent, { className: "h-[300px] sm:h-[330px] lg:h-[380px]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 887}}
                , divisionComparisonData.length === 0 ? (
                  React.createElement('div', { className: "flex h-full items-center justify-center text-sm text-muted-foreground"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 889}}, "No projects with allocation or PIFRA totals in the current filter."

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
                      , React.createElement(Bar, { dataKey: "approvedM", fill: "#2F8F6C", radius: [4, 4, 0, 0], name: "Approved (M)" , maxBarSize: 56, __self: this, __source: {fileName: _jsxFileName, lineNumber: 923}} )
                      , React.createElement(Bar, { dataKey: "pifraM", fill: "#2E7D32", radius: [4, 4, 0, 0], name: "PIFRA (M)" , maxBarSize: 56, __self: this, __source: {fileName: _jsxFileName, lineNumber: 924}} )
                    )
                  )
                )
              )
            )

            /* Stage breakdown */
            , React.createElement(Card, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 932}}
              , React.createElement(CardHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 933}}
                , React.createElement(CardTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 934}}, "Stage breakdown (totals)"  )
                , React.createElement(CardDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 935}}, "Capital / revenue / total (PKR M). Bar length is relative across stages (longest = highest % vs approved); the percentage is vs approved allocation."


                )
              )
              , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 940}}
                , React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 941}}
                  , stageBreakdownWithBarScale.map((item) => (
                    React.createElement('div', { key: item.label, className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 943}}
                      , React.createElement('div', { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 944}}
                        , React.createElement('span', { className: "font-bold text-primary" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 945}}, item.label)
                        , React.createElement('div', { className: "text-xs font-mono text-muted-foreground flex items-center gap-3 sm:gap-0 sm:space-y-0.5 sm:block sm:text-right"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 946}}
                          , React.createElement('span', { className: "whitespace-nowrap", __self: this, __source: {fileName: _jsxFileName, lineNumber: 947}}, "C: " , item.triple.capital.toFixed(2), " M" )
                          , React.createElement('span', { className: "whitespace-nowrap", __self: this, __source: {fileName: _jsxFileName, lineNumber: 948}}, "R: " , item.triple.revenue.toFixed(2), " M" )
                          , React.createElement('span', { className: "whitespace-nowrap font-bold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 949}}, "T: " , item.triple.total.toFixed(2), " M" )
                        )
                      )
                      , React.createElement('div', { className: "w-full bg-muted h-3 rounded-full overflow-hidden"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 952}}
                        , React.createElement('div', {
                          className: "h-full rounded-full transition-all"  ,
                          style: {
                            width: `${Math.min(100, item.barWidthPct)}%`,
                            backgroundColor: item.color,
                          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 953}}
                        )
                      )
                      , React.createElement('div', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 961}}
                        , item.pctOfApproved.toFixed(1), "% of approved total"
                      )
                    )
                  ))
                )
              )
            )
          )
        )
      )
    )
  );
}
