"use client";

import Image from "next/image";
import { openMojiPath } from "@/lib/openmoji";

type Props = {
  code: string;
  alt: string;
  size: number;
  className?: string;
};

export function OpenMojiImage({ code, alt, size, className }: Props) {
  return (
    <Image
      src={openMojiPath(code)}
      alt={alt}
      width={size}
      height={size}
      className={className}
      loading="lazy"
      decoding="async"
      unoptimized
    />
  );
}
