// Centralized mock data for temporary UI rendering when APIs are missing/offline.
// Remove this file once real API wiring is complete.

export const mockZones = [
  { id: 1, zone_name: "Punjab" },
  { id: 2, zone_name: "Islamabad" },
];

export const mockCircles = [
  { id: 11, circle_name: "Lahore Circle", zone: 1, zone_name: "Punjab" },
  { id: 12, circle_name: "Rawalpindi Circle", zone: 1, zone_name: "Punjab" },
  { id: 21, circle_name: "ICT Circle", zone: 2, zone_name: "Islamabad" },
];

export const mockDistricts = [
  { id: 111, district_name: "Lahore", zone: 1, zone_name: "Punjab", circle: 11, circle_name: "Lahore Circle" },
  { id: 112, district_name: "Kasur", zone: 1, zone_name: "Punjab", circle: 11, circle_name: "Lahore Circle" },
  { id: 121, district_name: "Rawalpindi", zone: 1, zone_name: "Punjab", circle: 12, circle_name: "Rawalpindi Circle" },
  { id: 211, district_name: "Islamabad", zone: 2, zone_name: "Islamabad", circle: 21, circle_name: "ICT Circle" },
];

export const mockTehsils = [
  { id: 1001, tehsil_name: "Pattoki", district: 112, district_name: "Kasur", zone: 1, zone_name: "Punjab", circle: 11, circle_name: "Lahore Circle" },
  { id: 1002, tehsil_name: "Chunian", district: 112, district_name: "Kasur", zone: 1, zone_name: "Punjab", circle: 11, circle_name: "Lahore Circle" },
  { id: 1003, tehsil_name: "18 Hazari", district: 121, district_name: "Rawalpindi", zone: 1, zone_name: "Punjab", circle: 12, circle_name: "Rawalpindi Circle" },
];

export const mockProjects = [
  {
    id: 27,
    project_name: "Pattoki",
    division: 11,
    division_name: "Lahore Circle",
    district: 112,
    district_name: "Kasur",
    tehsil: 1001,
    tehsil_name: "Pattoki",
    total_budget_allocated: 1200,
    budget_utilized: 300,
    budget_remaining: 900,
    activities: [],
  },
  {
    id: 25,
    project_name: "Chunian",
    division: 11,
    division_name: "Lahore Circle",
    district: 112,
    district_name: "Kasur",
    tehsil: 1002,
    tehsil_name: "Chunian",
    total_budget_allocated: 900,
    budget_utilized: 180,
    budget_remaining: 720,
    activities: [],
  },
  {
    id: 39,
    project_name: "18 Hazari",
    division: 12,
    division_name: "Rawalpindi Circle",
    district: 121,
    district_name: "Rawalpindi",
    tehsil: 1003,
    tehsil_name: "18 Hazari",
    total_budget_allocated: 700,
    budget_utilized: 50,
    budget_remaining: 650,
    activities: [],
  },
];

export function filterByZone(list, zoneId) {
  if (!zoneId) return list;
  const z = Number(zoneId);
  return list.filter((x) => Number(x.zone) === z);
}

export function filterByCircle(list, circleId) {
  if (!circleId) return list;
  const c = Number(circleId);
  return list.filter((x) => Number(x.circle) === c);
}

export function filterByDistrict(list, districtId) {
  if (!districtId) return list;
  const d = Number(districtId);
  return list.filter((x) => Number(x.district) === d);
}

export function mockGanttSchedulesForProjects(projects) {
  // Minimal shape consumed by Dashboard/Comparison: [{ _id, tasks: [{_id:"1",progress,...}] }]
  const clamp = (n) => Math.max(0, Math.min(100, n));
  const pct = (pid) => clamp((pid * 7) % 101);
  return (projects || []).map((p) => ({
    _id: Number(p.id),
    tasks: [
      {
        _id: "1",
        text: "Root",
        progress: pct(Number(p.id)),
        subtasks: [],
      },
    ],
  }));
}

