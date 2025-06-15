"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface PseudocodeRendererProps {
  code: string;
  title?: string;
  className?: string;
}

export function PseudocodeRenderer({
  code: initialCode,
  title = "Pseudocode",
  className = "",
}: PseudocodeRendererProps) {
  const [code] = useState(initialCode);
  const codeTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (codeTextareaRef.current) {
      codeTextareaRef.current.style.height = "auto";
      codeTextareaRef.current.style.height = `${codeTextareaRef.current.scrollHeight}px`;
    }
  }, [code]);

  return (
    <div className={`pseudocode-renderer-container ${className}`}>
      {/* Pseudocode Display */}
      <Card className="border rounded-md overflow-hidden">
        <div className="relative">
          <textarea
            ref={codeTextareaRef}
            value={code}
            readOnly
            spellCheck={false}
            className="w-full font-mono text-sm p-4 resize-none bg-background cursor-default focus:outline-none"
            style={{
              lineHeight: "1.5",
              tabSize: 2,
            }}
          />
        </div>
      </Card>
    </div>
  );
}
