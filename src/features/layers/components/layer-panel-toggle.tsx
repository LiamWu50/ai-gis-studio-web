import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

type LayerPanelToggleProps = {
  isOpen: boolean;
  onClick: () => void;
};

export function LayerPanelToggle({ isOpen, onClick }: LayerPanelToggleProps) {
  return (
    <Button
      type="button"
      size="icon"
      aria-label={isOpen ? "隐藏图层面板" : "显示图层面板"}
      aria-pressed={isOpen}
      onClick={onClick}
      className={cn(
        "bg-background text-foreground shadow-md transition-colors hover:bg-muted [&_svg]:size-4",
        isOpen &&
          "bg-foreground text-background hover:bg-foreground focus-visible:ring-foreground",
      )}
    >
      <Layers strokeWidth={1.75} />
    </Button>
  );
}
