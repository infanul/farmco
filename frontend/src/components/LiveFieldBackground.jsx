import React from 'react';

export default function LiveFieldBackground({ intensity = 'farmer' }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-white">
      {/* Subtle Top Soft Agricultural Green Accent Gradient */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#F1F8E9] via-[#F9FBE7] to-transparent opacity-80" />

      {/* Subtle Crop-Row Geometry Accent Lines */}
      <svg 
        className="absolute top-0 right-0 w-full max-w-4xl h-96 opacity-30 text-[#C8E6C9]"
        preserveAspectRatio="none"
        viewBox="0 0 800 300"
      >
        <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" d="M 100 0 Q 300 150 800 100" />
        <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" d="M 200 0 Q 400 200 800 180" />
        <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" d="M 300 0 Q 500 250 800 240" />
      </svg>
    </div>
  );
}
