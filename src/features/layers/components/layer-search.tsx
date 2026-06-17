import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type LayerSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function LayerSearch({ value, onChange }: LayerSearchProps) {
  return (
    <div className="mb-2 flex h-8 items-center rounded-md bg-muted/50 px-2">
      <Search className="pointer-events-none size-3 shrink-0 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="搜索图层"
        className="h-full border-0 bg-transparent p-0 pl-2 text-xs leading-none shadow-none placeholder:text-[11px] focus-visible:ring-0"
      />
    </div>
  );
}
