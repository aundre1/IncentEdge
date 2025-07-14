import React from "react";
import { cn } from "@/lib/utils";
import logoImage from "@assets/incentedge-logo.jpeg";

interface IncentEdgeImageLogoProps {
  className?: string;
}

export default function IncentEdgeImageLogo({ className }: IncentEdgeImageLogoProps) {
  return (
    <img
      src={logoImage}
      alt="IncentEdge"
      className={cn("h-8 w-auto object-contain", className)}
      style={{
        filter: "drop-shadow(0 0 0 transparent)",
        background: "transparent"
      }}
    />
  );
}