"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Database } from "lucide-react";
import DataSourceDialog from "./data-source-dialog";

const DataSourcePanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute left-3 top-14 z-30">
      <Button
        type="button"
        size="icon"
        aria-label="打开数据源面板"
        aria-pressed={isOpen}
        onClick={() => setIsOpen(true)}
        className={cn(
          "bg-background text-foreground shadow-md transition-colors hover:bg-muted [&_svg]:size-4",
          isOpen &&
            "bg-foreground text-background hover:bg-foreground focus-visible:ring-foreground",
        )}
      >
        <Database strokeWidth={1.75} />
      </Button>

      <DataSourceDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default DataSourcePanel;
