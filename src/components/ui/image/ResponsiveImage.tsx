"use client";

import * as React from "react";
import Image, { ImageProps } from "next/image";

export interface ResponsiveImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string;
  alt: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = (props) => {
  const { loading, priority, className, unoptimized, ...rest } = props;

  // If priority is true, Next.js requires loading to be undefined (it will default to eager)
  const resolvedLoading = priority ? undefined : loading ?? "lazy";

  // Automatically disable optimization for local backend uploads
  // This avoids issues with next/image trying to optimize images from localhost:3001
  // or when the frontend tries to fetch from itself (3000) but the file isn't there.
  const isLocalUpload = 
    props.src.includes('localhost:3001') || 
    props.src.includes('127.0.0.1:3001') ||
    props.src.includes('/uploads/'); // Catch-all for uploads folder

  const shouldUnoptimize = unoptimized ?? isLocalUpload;

  return (
    <Image
      {...rest}
      src={props.src}
      alt={props.alt}
      className={`rounded-md object-cover ${className ?? ""}`}
      placeholder={props.placeholder ?? "empty"}
      loading={resolvedLoading}
      priority={priority}
      unoptimized={shouldUnoptimize}
    />
  );
};
