"use client";

import { useState } from "react";
import { FileTree, type FileTreeElement } from "@/components/unlumen-ui/file-tree";

const initElements = (): FileTreeElement[] => [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [
      {
        id: "components",
        name: "components",
        type: "folder",
      },
      { id: "page", name: "page.tsx" },
    ],
  },
  {
    id: "package-json",
    name: "package.json",
    type: "folder",
    children: [
      { id: "button", name: "button.tsx", highlight: true },
      { id: "card", name: "card.tsx", highlight: true },
    ],
  },
];

export function LayerPanel() {
  const [elements, setElements] = useState(initElements());

  return (
    <div className="absolute top-5 left-5 bg-background p-3 shadow-lg backdrop-blur">
      <FileTree elements={elements} defaultOpenIds={["src"]} />
    </div>
  );
}
