import { Layers, Plus } from "lucide-react";

export type LayerItem = {
  name: string;
  meta: string;
  active: boolean;
};

type LayerPanelProps = {
  layers: LayerItem[];
};

export function LayerPanel({ layers }: LayerPanelProps) {
  return (
    <div className="absolute left-6 top-6 w-[320px] border border-line bg-panel/95 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Loaded Layers</p>
          <h1 className="mt-1 text-xl font-semibold text-panel-foreground">
            城市空间工作台
          </h1>
        </div>
        <button
          className="border border-border bg-secondary p-2 text-secondary-foreground transition hover:bg-muted"
          aria-label="新增图层"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {layers.map((layer) => (
          <div
            key={layer.name}
            className="border border-line bg-card px-4 py-3 text-card-foreground"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-card-foreground">
                    {layer.name}
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {layer.meta}
                </p>
              </div>
              <span
                className={`mt-1 inline-flex h-2.5 w-2.5 rounded-full ${
                  layer.active ? "bg-primary" : "bg-muted-foreground"
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
