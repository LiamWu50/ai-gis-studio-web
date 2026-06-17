"use client";

import { useState } from "react";
import { LayerPanelContent } from "./components/layer-panel-content";
import { LayerPanelToggle } from "./components/layer-panel-toggle";
import { useLayerTree } from "./hooks/use-layer-tree";

const LayerPanel = () => {
  const [isOpen, setIsOpen] = useState(true);
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
        onSearchChange={setSearchValue}
      />
    </div>
  );
};

export default LayerPanel;
