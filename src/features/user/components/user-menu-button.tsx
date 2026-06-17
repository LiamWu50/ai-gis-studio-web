"use client";

import { Button } from "@/components/ui/button";
import { UserRoundCog } from "lucide-react";

type UserMenuButtonProps = {
  onClick: () => void;
};

export const UserMenuButton = ({ onClick }: UserMenuButtonProps) => {
  return (
    <Button
      size="icon"
      className="bg-background text-foreground hover:bg-muted [&_svg]:size-4"
      onClick={onClick}
      type="button"
      aria-label="打开用户菜单"
    >
      <UserRoundCog strokeWidth={1.75} />
    </Button>
  );
};
