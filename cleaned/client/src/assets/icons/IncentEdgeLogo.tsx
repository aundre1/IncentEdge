import React from "react";
import { cn } from "@/lib/utils";

interface IncentEdgeLogoProps {
  className?: string;
}

export default function IncentEdgeLogo({ className }: IncentEdgeLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="IncentEdge"
      className={cn("h-36 w-auto", className)}
    />
  );
}
