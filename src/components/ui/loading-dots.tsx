import React from "react";

export function LoadingDots({ className = "", size = 8, color = "#fff" }) {
  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block rounded-full animate-bounce"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
} 