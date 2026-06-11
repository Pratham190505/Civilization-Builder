import {
  HiOutlinePlus,
  HiOutlineCheck,
  HiOutlineMap,
  HiOutlineMegaphone,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

const iconMap = {
  plus: HiOutlinePlus,
  check: HiOutlineCheck,
  map: HiOutlineMap,
  megaphone: HiOutlineMegaphone,
  shield: HiOutlineShieldCheck,
};

const toneMap = {
  blue: "text-blue-500 bg-blue-500/10",
  green: "text-emerald-500 bg-emerald-500/10",
  amber: "text-amber-500 bg-amber-500/10",
  violet: "text-violet-500 bg-violet-500/10",
};

export default function QuickActionButton({ label, icon, tone }) {
  const Icon = iconMap[icon] || HiOutlinePlus;
  return (
    <button className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted">
      <span className={`grid h-7 w-7 place-items-center rounded-lg ${toneMap[tone] || toneMap.blue}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 truncate">{label}</span>
    </button>
  );
}
