"use client";

import { useState } from "react";

import { ChatDock } from "@/features/chat/components/chat-dock";
import { BottomChatInput } from "@/features/chat/components/input/bottom-chat-input";
import { chatMessages } from "@/features/chat/data/messages";
import { MapCanvas } from "@/features/map";
import { LayerPanel } from "@/features/map/components/layer-panel";
import { mapLayers } from "@/features/map/data/layers";
import { LeftToolbar } from "@/features/sessions/components/left-toolbar";
import { toolbarActions } from "@/features/sessions/data/toolbar-actions";

export default function HomePage() {
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <main className="relative h-screen overflow-hidden bg-background text-foreground">
      <section className="relative flex h-full">
        <div className="relative flex-1 overflow-hidden">
          <MapCanvas />
          <LayerPanel layers={mapLayers} />
          <LeftToolbar actions={toolbarActions} />

          <div className="absolute inset-x-0 top-0 flex justify-center p-6">
            <div className="border border-line bg-panel/90 px-4 py-2 text-xs text-muted-foreground">
              AI WEBGIS AGENT STUDIO
            </div>
          </div>

          <BottomChatInput />
        </div>

        <ChatDock
          isOpen={isChatOpen}
          messages={chatMessages}
          onClose={() => setIsChatOpen(false)}
          onOpen={() => setIsChatOpen(true)}
        />
      </section>
    </main>
  );
}
