"use client";

import { useState } from "react";
import DataSourceDialog from "@/features/data-source/data-source-dialog";
import { LayerPanelContent } from "./components/layer-panel-content";
import { LayerPanelToggle } from "./components/layer-panel-toggle";
import { useLayerTree } from "./hooks/use-layer-tree";

const LayerPanel = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isDataSourceSelectOpen, setIsDataSourceSelectOpen] = useState(false);
  const {
    searchValue,
    setSearchValue,
    filteredElements,
    defaultOpenIds,
  } = useLayerTree();

  return (
    <div className="absolute left-3 top-3 z-30">
      <LayerPanelToggle
        isOpen={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      />
      <LayerPanelContent
        isOpen={isOpen}
        searchValue={searchValue}
        filteredElements={filteredElements}
        defaultOpenIds={defaultOpenIds}
        onAddLayerClick={() => setIsDataSourceSelectOpen(true)}
        onSearchChange={setSearchValue}
      />
      <DataSourceDialog
        isOpen={isDataSourceSelectOpen}
        mode="select-layer"
        onClose={() => setIsDataSourceSelectOpen(false)}
        onLayerSelected={() => setIsDataSourceSelectOpen(false)}
      />
    </div>
  );
};

export default LayerPanel;
