"use client";

import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const Setting = () => {
  return (
    <div className="absolute bottom-14 left-3">
      <Button
        size="icon"
        className="bg-background text-foreground hover:bg-muted [&_svg]:size-4"
      >
        <Settings />
      </Button>
    </div>
  );
};

export default Setting;
