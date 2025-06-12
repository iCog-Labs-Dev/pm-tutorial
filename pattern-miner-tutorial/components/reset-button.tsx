"use client"

import { Button } from "@/components/ui/button";

export function ResetButton() {
  const handleReset = async () => {
    try {
      await fetch("http://localhost:5000/reset-atomspace", {
        method: "POST",
      });
      alert("AtomSpace has been reset.");
    } catch (error) {
      console.error("Failed to reset AtomSpace:", error);
      alert("Failed to reset AtomSpace.");
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleReset}>
      Reset AtomSpace
    </Button>
  );
}
