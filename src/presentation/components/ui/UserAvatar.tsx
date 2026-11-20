"use client";

import React from "react";
import type { AuthUser } from "@/src/application/stores/use-auth-store";

/** Profile photo when the user has one, otherwise their initials on the ocean gradient. */
export function UserAvatar({
  user,
  className = "w-8 h-8 text-[11px]",
}: {
  user: Pick<AuthUser, "initials" | "avatarUrl" | "name">;
  className?: string;
}) {
  return (
    <span
      className={`relative rounded-full ocean-gradient-btn flex items-center justify-center font-bold shrink-0 overflow-hidden ${className}`}
    >
      {user.initials}
      {user.avatarUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- user upload / Google photo, sized by CSS
        <img
          src={user.avatarUrl}
          alt={user.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </span>
  );
}
