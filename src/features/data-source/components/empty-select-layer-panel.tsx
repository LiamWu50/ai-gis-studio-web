import { SelectLayerToolbar } from "./select-layer-toolbar";

type EmptySelectLayerPanelProps = {
  title: string;
};

export function EmptySelectLayerPanel({ title }: EmptySelectLayerPanelProps) {
  return (
    <section className="flex h-full min-w-0 flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        <SelectLayerToolbar
          isAdding={false}
          isLoading={false}
          searchKeyword=""
          selectedRowId={null}
          onAddLayer={() => undefined}
          onRefresh={() => undefined}
          onSearchChange={() => undefined}
        />
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center p-4 text-xs text-muted-foreground">
        暂无可添加的数据源
      </div>
    </section>
  );
}
