"use client";

import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export function ResetButton() {
  const handleReset = async () => {
    try {
      await fetch("https://pm-tutorial-2.onrender.com/reset-atomspace", {
        method: "POST",
      });
      alert("AtomSpace has been reset.");
    } catch (error) {
      console.error("Failed to reset AtomSpace:", error);
      alert("Failed to reset AtomSpace.");
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleReset}>
      {/* Icon for small screens (hidden on md and up) */}
      <RefreshCcw className="h-4 w-4 md:hidden" />

      {/* Text for medium screens and up */}
      <span className="hidden md:inline">Reset AtomSpace</span>
    </Button>
  );
}
