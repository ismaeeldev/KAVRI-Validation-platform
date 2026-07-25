import React from "react";

export function KAVRIWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-heading font-black tracking-widest text-lg uppercase select-none ${className}`}>
      KAVRI<span className="text-kavri-signal font-normal">.</span>
    </span>
  );
}
