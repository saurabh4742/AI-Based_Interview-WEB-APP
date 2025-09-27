import React from "react";

export default function RoseLoader() {
  return (
    <div className="flex justify-center items-center h-full">
      <svg
        className="animate-spin"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="#e11d48" // rose-600
          strokeWidth="6"
          strokeDasharray="100 40"
          strokeLinecap="round"
          opacity="0.7"
        />
        <circle
          cx="24"
          cy="24"
          r="14"
          stroke="#f43f5e" // rose-400
          strokeWidth="4"
          strokeDasharray="60 30"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
