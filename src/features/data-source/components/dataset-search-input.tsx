import { Input } from "@/components/ui/input";

type DatasetSearchInputProps = {
  ariaLabel: string;
  disabled?: boolean;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function DatasetSearchInput({
  ariaLabel,
  disabled,
  placeholder,
  value,
  onChange,
}: DatasetSearchInputProps) {
  return (
    <div className="p-px">
      <Input
        aria-label={ariaLabel}
        className="box-border h-8 w-44 border-border/70 text-xs shadow-none focus-visible:border-foreground/30 focus-visible:ring-0"
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
