import { HiOutlineMagnifyingGlass, HiChevronDown } from "react-icons/hi2";
import { Card, CardHeader, Tier } from "../../components/common/Page.jsx";
import SchoolNetworkChart from "../../components/Charts/SchoolNetworkChart.jsx";

const stateList = [
  { name: "Maharashtra", active: 178, total: 212, tier: "Platinum" },
  { name: "Gujarat", active: 96, total: 124, tier: "Gold" },
  { name: "Rajasthan", active: 63, total: 88, tier: "Silver" },
  { name: "Delhi", active: 42, total: 48, tier: "Gold" },
  { name: "Uttar Pradesh", active: 102, total: 156, tier: "Bronze" },
  { name: "Bihar", active: 58, total: 72, tier: "Silver" },
  { name: "West Bengal", active: 74, total: 90, tier: "Bronze" },
  { name: "Karnataka", active: 88, total: 104, tier: "Gold" },
  { name: "Tamil Nadu", active: 66, total: 78, tier: "Platinum" },
  { name: "Kerala", active: 52, total: 60, tier: "Gold" },
  { name: "Andhra Pradesh", active: 71, total: 86, tier: "Silver" },
  { name: "Telangana", active: 48, total: 58, tier: "Gold" },
  { name: "Madhya Pradesh", active: 90, total: 118, tier: "Silver" },
];

export default function IndiaMap() {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader
          title="India School Network Map"
          subtitle="Click any state dot to see details"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <HiOutlineMagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input placeholder="Search state…" className="w-36 rounded-lg border border-border bg-background py-1.5 pl-8 pr-2 text-xs text-foreground focus:outline-none" />
              </div>
              <button className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                All India <HiChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          }
        />
        <div className="px-5 pb-5">
          <SchoolNetworkChart />
        </div>
      </Card>

      <Card>
        <CardHeader title="State-wise Schools" />
        <div className="max-h-170 space-y-2 overflow-y-auto px-5 pb-5">
          {stateList.map((s) => (
            <div key={s.name} className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 shadow-sm hover:bg-muted">
              <div>
                <p className="font-semibold text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.active}/{s.total} active</p>
              </div>
              <Tier value={s.tier} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
