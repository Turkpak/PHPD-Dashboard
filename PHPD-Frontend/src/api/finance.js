 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }
import { get } from "./client";

 







export async function getProjectSummary() {
  const data = await get("project-summary/");
  return _nullishCoalesce(data, () => ( {
    total_allocation: 0,
    total_pd_release: 0,
    total_spending_release: 0,
    total_pifra: 0,
  }));
}

