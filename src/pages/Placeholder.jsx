export default function Placeholder({ title }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center rounded-2xl border border-border bg-surface text-center">
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This module is coming soon. Ask to build it next.
      </p>
    </div>
  );
}
