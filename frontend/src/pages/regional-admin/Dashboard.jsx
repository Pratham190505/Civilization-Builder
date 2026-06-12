import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from "recharts";
import {
  ArrowUpRight,
  Eye,
  School,
  ArrowRight
} from "lucide-react";
import {
  statsCards,
  growthData,
  districts,
  activities,
  quickActions,
  heatmapDistricts,
  districtColors,
  activityIcons,
  activityColors
} from "../../data/regionalAdminMockData.js";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 14 }
  }
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 regional-admin-theme pb-8"
    >
      {/* 1. Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          const isNegative = card.trend.startsWith("-");

          return (
            <motion.div
              key={card.title}
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: `0 8px 30px ${card.color}18` }}
              className="rounded-2xl p-4 cursor-default transition-shadow duration-200"
              style={{
                background: "var(--glass-card)",
                border: "1px solid var(--glass-border)",
                backdropFilter: "blur(20px)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: card.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-lg flex items-center gap-0.5 font-semibold"
                  style={{
                    background: isNegative ? "rgba(239, 68, 68, 0.08)" : "rgba(16, 185, 129, 0.08)",
                    color: isNegative ? "#EF4444" : "#10B981",
                  }}
                >
                  <ArrowUpRight
                    className="w-3 h-3"
                    style={{ transform: isNegative ? "rotate(90deg)" : "none" }}
                  />
                  {card.trend}
                </span>
              </div>
              <div
                className="text-2xl mb-0.5"
                style={{ color: "var(--text-primary)", fontWeight: 700 }}
              >
                {card.value}
              </div>
              <div
                className="text-xs font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                {card.title}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: card.color, fontWeight: 500 }}
              >
                {card.sub}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 2. Heatmap & Growth Chart Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Gujarat Heatmap Card */}
        <motion.div
          variants={cardVariants}
          className="xl:col-span-2 rounded-2xl p-5 flex flex-col"
          style={{
            background: "var(--glass-card)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(20px)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                Gujarat District Heatmap
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                School density by district
              </p>
            </div>
            <div
              className="flex items-center gap-3 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              {[
                ["High", "#3B82F6"],
                ["Medium", "#10B981"],
                ["Low", "#F59E0B"],
              ].map(([level, color]) => (
                <span key={level} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  {level}
                </span>
              ))}
            </div>
          </div>

          {/* Heatmap Graphics SVG */}
          <div
            className="relative w-full rounded-xl overflow-hidden flex-1"
            style={{
              height: 250,
              background: "var(--heatmap-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            {/* Background Grid Lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.05 }}>
              {Array.from({ length: 12 }).map((_, r) => (
                <line
                  key={`h${r}`}
                  x1="0"
                  y1={`${(r * 100) / 11}%`}
                  x2="100%"
                  y2={`${(r * 100) / 11}%`}
                  stroke="currentColor"
                  strokeWidth="1"
                />
              ))}
              {Array.from({ length: 12 }).map((_, r) => (
                <line
                  key={`v${r}`}
                  x1={`${(r * 100) / 11}%`}
                  y1="0"
                  x2={`${(r * 100) / 11}%`}
                  y2="100%"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              ))}
            </svg>

            {/* Glowing Map Background Overlay */}
            <div
              className="absolute inset-3 rounded-xl"
              style={{
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.06), rgba(99, 102, 241, 0.06))",
                border: "1.5px dashed rgba(99, 102, 241, 0.2)",
                borderRadius: "45% 55% 50% 50% / 48% 52% 48% 52%",
              }}
            />

            {/* Pulsing District Points */}
            {heatmapDistricts.map((dist, idx) => {
              const size = Math.max(26, Math.min(54, dist.schools / 6));
              return (
                <motion.div
                  key={dist.name}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.3 + idx * 0.04,
                    type: "spring",
                    stiffness: 180,
                  }}
                  whileHover={{ scale: 1.18, zIndex: 10 }}
                  className="absolute flex items-center justify-center rounded-full cursor-pointer"
                  style={{
                    left: `${dist.x}%`,
                    top: `${dist.y}%`,
                    width: size,
                    height: size,
                    transform: "translate(-50%, -50%)",
                    background: `${dist.color}16`,
                    border: `1.5px solid ${dist.color}88`,
                    boxShadow: `0 0 12px ${dist.color}33`,
                  }}
                  onClick={() => navigate("/regional-admin/schools")}
                  title={`${dist.name}: ${dist.schools} schools`}
                >
                  <span
                    style={{
                      color: dist.color,
                      fontSize: 8,
                      fontWeight: 700,
                    }}
                  >
                    {dist.schools}
                  </span>
                </motion.div>
              );
            })}

            {/* District Labels */}
            {heatmapDistricts.slice(0, 5).map((dist) => (
              <div
                key={`lbl-${dist.name}`}
                className="absolute pointer-events-none"
                style={{
                  left: `${dist.x + 3}%`,
                  top: `${dist.y - 6}%`,
                  color: dist.color,
                  fontWeight: 700,
                  fontSize: 9,
                  textShadow: "0 1px 4px rgba(0, 0, 0, 0.7)",
                }}
              >
                {dist.name}
              </div>
            ))}
          </div>

          {/* Growth Chart */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                Monthly Growth Metrics
              </p>
              <span className="text-[11px]" style={{ color: "#10B981", fontWeight: 600 }}>
                ↑ Trending up
              </span>
            </div>
            <div className="w-full h-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 9, fill: "var(--text-muted)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--dropdown-bg)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: 10,
                      fontSize: 11,
                      color: "var(--text-primary)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="schools"
                    name="Schools"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#sg)"
                  />
                  <Area
                    type="monotone"
                    dataKey="media"
                    name="Media Uploaded"
                    stroke="#8B5CF6"
                    strokeWidth={1.5}
                    fill="url(#mg)"
                    strokeDasharray="4 3"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Right Side Column (Top Districts & Recent Activity) */}
        <div className="flex flex-col gap-4">
          {/* Top Districts Card */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl p-5"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(20px)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                Top Districts
              </h3>
              <button
                onClick={() => navigate("/regional-admin/districts")}
                className="text-xs flex items-center gap-1 font-semibold"
                style={{ color: "#3B82F6" }}
              >
                <Eye className="w-3.5 h-3.5" /> View All
              </button>
            </div>

            <div className="space-y-3">
              {districts.slice(0, 5).map((dist, idx) => (
                <div key={dist.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                        style={{
                          background:
                            idx === 0
                              ? "#F59E0B"
                              : idx === 1
                                ? "#94A3B8"
                                : idx === 2
                                  ? "#CD7F32"
                                  : "rgba(99, 102, 241, 0.6)",
                          fontSize: 9,
                          fontWeight: 700,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {dist.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        {dist.schools} Schools
                      </span>
                      <span
                        className="text-[9px] px-1 py-0.5 rounded font-bold"
                        style={{
                          background: "rgba(139, 92, 246, 0.1)",
                          color: "#8B5CF6",
                        }}
                      >
                        {dist.platinum}P
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--glass-hover)" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(dist.schools / 312) * 100}%` }}
                      transition={{ delay: 0.4 + idx * 0.1, duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${districtColors[idx % districtColors.length]}, ${
                          districtColors[(idx + 1) % districtColors.length]
                        })`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity Feed Card */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl p-5 flex-1"
            style={{
              background: "var(--glass-card)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(20px)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Recent Activity
            </h3>
            <div className="space-y-4">
              {activities.map((act, idx) => {
                const ActivityIcon = activityIcons[act.icon] || School;
                const activityColor = activityColors[act.icon] || "#3B82F6";

                return (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.08 }}
                    className="flex gap-3 items-start"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${activityColor}15` }}
                    >
                      <ActivityIcon className="w-3.5 h-3.5" style={{ color: activityColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                        {act.text}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {act.time}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 3. District School Distribution Chart & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* District School Distribution Bar Chart */}
        <motion.div
          variants={cardVariants}
          className="xl:col-span-2 rounded-2xl p-5"
          style={{
            background: "var(--glass-card)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(20px)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              District School Distribution
            </h3>
            <button
              onClick={() => navigate("/regional-admin/districts")}
              className="text-xs flex items-center gap-1 font-semibold"
              style={{ color: "#3B82F6" }}
            >
              <Eye className="w-3.5 h-3.5" /> Details
            </button>
          </div>

          <div className="w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={districts.slice(0, 8)}
                barSize={12}
                barGap={4}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--dropdown-bg)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: 10,
                    fontSize: 11,
                    color: "var(--text-primary)",
                  }}
                />
                <Bar dataKey="platinum" name="Platinum" radius={[3, 3, 0, 0]}>
                  {districts.slice(0, 8).map((_, idx) => (
                    <Cell key={idx} fill="#8B5CF6" />
                  ))}
                </Bar>
                <Bar dataKey="gold" name="Gold" radius={[3, 3, 0, 0]}>
                  {districts.slice(0, 8).map((_, idx) => (
                    <Cell key={idx} fill="#F59E0B" />
                  ))}
                </Bar>
                <Bar dataKey="silver" name="Silver" radius={[3, 3, 0, 0]}>
                  {districts.slice(0, 8).map((_, idx) => (
                    <Cell key={idx} fill="#94A3B8" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legends */}
          <div className="flex items-center gap-4 mt-3">
            {[
              ["Platinum", "#8B5CF6"],
              ["Gold", "#F59E0B"],
              ["Silver", "#94A3B8"],
            ].map(([label, color]) => (
              <span key={label} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions & Category Summary */}
        <motion.div
          variants={cardVariants}
          className="rounded-2xl p-5 flex flex-col gap-5"
          style={{
            background: "var(--glass-card)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(20px)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          {/* Quick Actions Grid */}
          <div>
            <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {quickActions.map((act) => {
                const ActionIcon = act.icon;

                return (
                  <motion.button
                    key={act.label}
                    onClick={() => navigate(`/regional-admin/${act.page === "dashboard" ? "" : act.page}`)}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex flex-col items-center gap-2 p-3.5 rounded-xl text-center cursor-pointer transition-shadow"
                    style={{
                      background: act.bg,
                      border: `1px solid ${act.color}20`,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${act.color}18` }}
                    >
                      <ActionIcon className="w-4.5 h-4.5" style={{ color: act.color }} />
                    </div>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {act.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Category Summary progress list */}
          <div
            style={{
              borderTop: "1px solid var(--glass-border)",
              paddingTop: "1rem",
            }}
          >
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
              Category Summary
            </p>
            {[
              { label: "Platinum", count: 42, pct: 3.4, color: "#8B5CF6" },
              { label: "Gold", count: 156, pct: 12.5, color: "#F59E0B" },
              { label: "Silver", count: 318, pct: 25.5, color: "#6B7280" },
              { label: "Bronze", count: 487, pct: 39, color: "#CD7F32" },
              { label: "No Rank", count: 245, pct: 19.6, color: "#94A3B8" },
            ].map((cat) => (
              <div key={cat.label} className="mb-2.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                    <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                      {cat.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: cat.color }}>
                    {cat.count}
                  </span>
                </div>
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ background: "var(--glass-hover)" }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.pct}%` }}
                    transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
