import * as React from "react";
import Image from "next/image";

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt = "", size = 40 }) => {
  if (!src) {
    return (
      <div
        className="rounded-full bg-rose-50 flex items-center justify-center text-xs text-rose-400"
        style={{ width: size, height: size }}
      >
        {alt?.charAt(0) ?? ""}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover"
    />
  );
};

