"use client";

import { Button } from "@/components/ui/button";
import { UserRoundCog } from "lucide-react";

const User = () => {
  return (
    <div className="absolute bottom-3 left-3">
      <Button
        size="icon"
        className="bg-background text-foreground hover:bg-muted [&_svg]:size-4"
      >
        <UserRoundCog strokeWidth={1.75} />
      </Button>
    </div>
  );
};

export default User;
