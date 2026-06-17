"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UpdateUserProfileRequest, UserProfile } from "@/services/auth";

type UserProfileFormProps = {
  formId: string;
  user: UserProfile;
  disabled?: boolean;
  onSubmit: (payload: UpdateUserProfileRequest) => Promise<void>;
};

export const UserProfileForm = ({
  formId,
  user,
  disabled = false,
  onSubmit
}: UserProfileFormProps) => {
  const [nickname, setNickname] = useState(user.nickname);
  const [email, setEmail] = useState(user.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (disabled) {
      return;
    }

    const trimmedNickname = nickname.trim();
    const trimmedEmail = email.trim();
    const trimmedAvatarUrl = avatarUrl.trim();

    await onSubmit({
      nickname: trimmedNickname,
      email: trimmedEmail || null,
      avatarUrl: trimmedAvatarUrl || null
    });
  };

  return (
    <form id={formId} className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="profile-username">用户名</Label>
        <Input
          id="profile-username"
          disabled
          value={user.username}
          aria-readonly="true"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="profile-nickname">昵称</Label>
        <Input
          id="profile-nickname"
          autoComplete="name"
          disabled={disabled}
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="profile-email">邮箱</Label>
        <Input
          id="profile-email"
          autoComplete="email"
          disabled={disabled}
          placeholder="admin@example.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="profile-avatar-url">头像 URL</Label>
        <Input
          id="profile-avatar-url"
          disabled={disabled}
          placeholder="https://example.com/avatar.png"
          type="url"
          value={avatarUrl}
          onChange={(event) => setAvatarUrl(event.target.value)}
        />
      </div>
    </form>
  );
};
