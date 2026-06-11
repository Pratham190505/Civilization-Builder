import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
} from "recharts";
import { networkNodes, tierColors } from "../../data/mockData.js";

const tiers = ["active", "inactive", "platinum", "gold", "silver", "bronze"];

export default function SchoolNetworkChart() {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <XAxis
            type="number"
            dataKey="x"
            domain={[67, 98]}
            hide
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[6, 38]}
            hide
          />
          <ZAxis type="number" range={[80, 80]} />
          <Tooltip
            cursor={{ stroke: "transparent" }}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--foreground)",
            }}
            formatter={(value, name, props) => [props.payload.name, props.payload.tier]}
          />
          {tiers.map((tier) => (
            <Scatter
              key={tier}
              data={networkNodes.filter((n) => n.tier === tier)}
              fill={tierColors[tier]}
              fillOpacity={0.85}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
