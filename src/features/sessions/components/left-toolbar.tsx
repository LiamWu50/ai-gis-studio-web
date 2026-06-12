import type { LucideIcon } from "lucide-react";

export type ToolbarAction = {
  icon: LucideIcon;
  label: string;
};

type LeftToolbarProps = {
  actions: ToolbarAction[];
};

export function LeftToolbar({ actions }: LeftToolbarProps) {
  return (
    <div className="absolute bottom-6 left-6 flex flex-col gap-3">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.label}
            className="group flex h-12 w-12 items-center justify-center border border-line bg-secondary text-secondary-foreground shadow-[0_12px_26px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:bg-muted"
            aria-label={action.label}
          >
            <Icon className="h-5 w-5 transition group-hover:text-muted-foreground" />
          </button>
        );
      })}
    </div>
  );
}
