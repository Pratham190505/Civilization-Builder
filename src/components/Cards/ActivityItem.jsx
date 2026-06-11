import {
  HiOutlinePlus,
  HiOutlineArrowUpTray,
  HiOutlineEye,
  HiOutlineDocumentText,
  HiOutlineTrophy,
} from "react-icons/hi2";

const iconMap = {
  plus: HiOutlinePlus,
  upload: HiOutlineArrowUpTray,
  eye: HiOutlineEye,
  file: HiOutlineDocumentText,
  trophy: HiOutlineTrophy,
};

const toneMap = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
  green: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-500" },
  red: { bg: "bg-rose-500/10", text: "text-rose-500" },
};

export default function ActivityItem({ icon, tone, title, time }) {
  const Icon = iconMap[icon] || HiOutlinePlus;
  const t = toneMap[tone] || toneMap.blue;
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${t.bg} ${t.text}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs leading-snug text-foreground">{title}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}
