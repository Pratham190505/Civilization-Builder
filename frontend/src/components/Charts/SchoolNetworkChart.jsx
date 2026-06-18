import { useState, useEffect } from "react";
import { getStates, getSchools } from "../../api/schools";
import { getRegionalAdmins } from "../../api/security";
import { useNavigate } from "react-router-dom";

const STATE_COORDINATES = {
  "Karnataka": { x: 77.6, y: 12.9 },
  "Maharashtra": { x: 72.8, y: 19.0 },
  "Gujarat": { x: 72.6, y: 23.0 },
  "Uttar Pradesh": { x: 80.9, y: 26.8 },
  "Rajasthan": { x: 75.8, y: 26.9 },
  "Delhi": { x: 77.2, y: 28.6 },
  "West Bengal": { x: 88.4, y: 22.6 },
  "Tamil Nadu": { x: 80.3, y: 13.1 },
  "Madhya Pradesh": { x: 77.4, y: 23.3 },
  "Bihar": { x: 85.1, y: 25.6 },
  "Punjab": { x: 75.8, y: 31.0 },
  "Haryana": { x: 76.08, y: 29.06 },
  "Kerala": { x: 76.27, y: 10.85 },
  "Andhra Pradesh": { x: 79.74, y: 15.91 },
  "Telangana": { x: 79.01, y: 18.11 },
  "Odisha": { x: 84.8, y: 20.95 },
  "Assam": { x: 92.93, y: 26.2 },
  "Jharkhand": { x: 85.33, y: 23.61 },
  "Chhattisgarh": { x: 81.86, y: 21.27 },
  "Himachal Pradesh": { x: 77.17, y: 32.12 },
  "Uttarakhand": { x: 79.01, y: 30.06 },
  "Jammu & Kashmir": { x: 74.79, y: 34.08 },
  "Goa": { x: 74.12, y: 15.3 }
};

// Simplified futuristic projection of India map border
const INDIA_MAP_OUTLINE = "M 180,30 L 195,15 L 210,18 L 220,15 L 225,25 L 230,30 L 235,40 L 245,45 L 255,42 L 265,48 L 262,65 L 275,70 L 285,68 L 295,78 L 305,82 L 315,92 L 322,105 L 328,122 L 340,135 L 350,148 L 342,165 L 345,178 L 335,190 L 328,205 L 332,218 L 338,225 L 342,238 L 335,248 L 328,255 L 325,262 L 318,270 L 310,278 L 302,285 L 295,292 L 288,298 L 280,305 L 272,312 L 265,318 L 258,325 L 252,332 L 248,338 L 245,345 L 242,352 L 238,360 L 235,368 L 232,375 L 228,382 L 225,388 L 222,392 L 218,390 L 215,382 L 212,375 L 208,368 L 205,360 L 202,352 L 198,345 L 195,338 L 192,332 L 188,325 L 185,318 L 182,312 L 178,305 L 175,298 L 172,292 L 168,285 L 165,278 L 162,270 L 158,262 L 155,255 L 152,248 L 148,240 L 145,232 L 142,225 L 138,218 L 135,212 L 132,205 L 128,198 L 125,192 L 122,185 L 118,178 L 115,170 L 112,165 L 108,160 L 105,155 L 102,148 L 98,140 L 95,135 L 92,130 L 88,125 L 85,120 L 82,115 L 78,110 L 75,105 L 72,100 L 68,95 L 65,90 L 78,92 L 90,88 L 100,95 L 110,85 L 118,80 L 122,68 L 128,65 L 132,58 L 135,52 L 138,45 L 142,38 L 145,32 L 148,25 L 152,18 L 155,12 L 158,5 Z";

export default function SchoolNetworkChart() {
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const [statesRes, schoolsRes, adminsRes] = await Promise.all([
          getStates(),
          getSchools(),
          getRegionalAdmins(),
        ]);

        if (statesRes.success && schoolsRes.success && adminsRes.success) {
          const states = statesRes.data || [];
          const schools = schoolsRes.data || [];
          const admins = adminsRes.data || [];

          const mapped = states.map((st) => {
            const stateSchools = schools.filter(
              (s) => s.District?.State?.id === st.id || s.District?.state_id === st.id
            );
            const active = stateSchools.filter((s) => s.status === "APPROVED").length;
            const adminCount = admins.filter((a) => a.stateId === st.id).length;

            return {
              id: st.id,
              name: st.state_name,
              code: st.state_code,
              total: stateSchools.length,
              active,
              admins: adminCount,
              coords: STATE_COORDINATES[st.state_name] || null
            };
          }).filter(st => st.coords !== null); // Only show states with defined coordinates

          setMapData(mapped);
        }
      } catch (err) {
        console.error("Failed to load map statistics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  const projectCoords = (lon, lat) => {
    // Mercator-like projection:
    // Translate longitude (65 to 98) to SVG X (30 to 370)
    const x = 30 + ((lon - 65) / (98 - 65)) * 340;
    // Translate latitude (6 to 38) to SVG Y (370 to 30)
    const y = 370 - ((lat - 6) / (38 - 6)) * 340;
    return { x, y };
  };

  if (loading) {
    return (
      <div className="h-[380px] w-full flex items-center justify-center text-xs text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p>Loading interactive India map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[380px] w-full bg-background/20 rounded-2xl border border-border p-2 overflow-hidden flex items-center justify-center">
      <svg viewBox="0 0 400 400" className="h-full w-auto max-w-full">
        {/* Glowing visual grid */}
        <g stroke="var(--border)" strokeWidth="0.5" opacity="0.15">
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v-${i}`} x1={40 * (i + 1)} y1="0" x2={40 * (i + 1)} y2="400" />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`h-${i}`} x1="0" y1={40 * (i + 1)} x2="400" y2={40 * (i + 1)} />
          ))}
        </g>

        {/* Outline Map of India */}
        <path
          d={INDIA_MAP_OUTLINE}
          fill="rgba(59, 130, 246, 0.04)"
          stroke="rgba(59, 130, 246, 0.25)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* State markers */}
        {mapData.map((state) => {
          const { x, y } = projectCoords(state.coords.x, state.coords.y);
          const hasSchools = state.total > 0;
          
          return (
            <g
              key={state.id}
              className="cursor-pointer group"
              onClick={() => navigate("/states")}
              onMouseEnter={(e) => {
                setHoveredState(state);
                setTooltipPos({ x, y });
              }}
              onMouseLeave={() => setHoveredState(null)}
            >
              {/* Pulsing ring */}
              <circle
                cx={x}
                cy={y}
                r={hasSchools ? "9" : "6"}
                fill={hasSchools ? "var(--primary)" : "var(--border)"}
                className="animate-ping opacity-25"
                style={{ animationDuration: "3s" }}
              />
              {/* Outer stroke */}
              <circle
                cx={x}
                cy={y}
                r="6"
                fill="none"
                stroke={hasSchools ? "rgba(59, 130, 246, 0.4)" : "rgba(255, 255, 255, 0.15)"}
                strokeWidth="2"
              />
              {/* Core Dot */}
              <circle
                cx={x}
                cy={y}
                r="3.5"
                fill={hasSchools ? "#10b981" : "#ef4444"}
                className="transition-all group-hover:scale-125 group-hover:fill-blue-400"
              />
              {/* Text Label */}
              <text
                x={x + 8}
                y={y + 3}
                fill="var(--text-muted)"
                fontSize="7"
                fontWeight="600"
                className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none fill-foreground"
              >
                {state.code}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating glassmorphic tooltip card */}
      {hoveredState && (
        <div
          className="absolute z-50 rounded-xl border border-border bg-surface/90 backdrop-blur-md p-3 shadow-xl pointer-events-none text-xs text-foreground animate-fade-in w-48"
          style={{
            left: `${Math.min(Math.max(tooltipPos.x - 96, 10), 200)}px`,
            top: `${Math.min(Math.max(tooltipPos.y - 120, 10), 250)}px`,
            border: "1px solid rgba(59, 130, 246, 0.3)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="font-bold border-b border-border pb-1 mb-1.5 flex justify-between items-center text-foreground">
            <span>{hoveredState.name}</span>
            <span className="text-[9px] bg-primary/20 text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">
              {hoveredState.code}
            </span>
          </div>
          <div className="space-y-1 font-medium">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Schools:</span>
              <span className="font-semibold">{hoveredState.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active:</span>
              <span className="font-semibold text-emerald-400">{hoveredState.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Regional Coordinators:</span>
              <span className="font-semibold text-blue-400">{hoveredState.admins}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
