"use client";

import React, { useRef } from "react";

/**
 * Wraps any content in a button that opens the image picker and hands the
 * chosen file to `onPick`. The input is reset so the same file can be re-picked.
 */
export function ImagePickerButton({
  onPick,
  disabled,
  className,
  label,
  children,
}: {
  onPick: (file: File) => void;
  disabled?: boolean;
  className?: string;
  label: string;
  children: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        aria-label={label}
        title={label}
        className={className}
      >
        {children}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onPick(file);
        }}
      />
    </>
  );
}
