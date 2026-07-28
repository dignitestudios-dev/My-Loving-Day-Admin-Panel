import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  alt?: string;
}

export function Logo({ size = 24, className, alt = "My Loving Day" }: LogoProps) {
  return (
    <Image
      src="/images/logo.png"
      alt={alt}
      width={size}
      height={size}
      className={cn("object-contain", className)}
      priority
    />
  );
}
