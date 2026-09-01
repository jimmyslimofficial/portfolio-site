import React from 'react';

/**
 * Responsive dynamic atmospheric ambient background tailored to active themes.
 */
const TechBackground = ({ themeName }) => {
  if (themeName === 'Frutiger Aero') {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-gradient-to-b from-sky-200 via-sky-50 to-emerald-50">
        {/* Luminous Water Sunburst & Floating Aurora Orbs */}
        <div className="absolute -top-[15%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-white/70 to-sky-300/30 blur-[90px] animate-pulse duration-[7000ms]" />
        <div className="absolute top-[40%] -left-[10%] w-[45vw] h-[45vw] rounded-full bg-emerald-300/25 blur-[100px] animate-bounce duration-[12000ms]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[55vw] h-[55vw] rounded-full bg-sky-400/20 blur-[110px]" />
        
        {/* Soft Glass Raylines */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.9) 0%, transparent 60%)'
          }}
        />
      </div>
    );
  }

  if (themeName === 'Neo-Tokyo Synthwave') {
    return (
      <div className="fixed inset-0 -z-10 bg-[#090514] overflow-hidden pointer-events-none">
        {/* Neon Magenta & Violet Atmospheric Blooms */}
        <div className="absolute top-[-10%] left-[10%] w-[70vw] h-[70vw] rounded-full bg-fuchsia-600/10 blur-[140px] animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[65vw] h-[65vw] rounded-full bg-cyan-500/10 blur-[140px] animate-pulse duration-[10000ms]" />
        
        {/* Perspective Grid Floor */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(236,72,153,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(168,85,247,0.2) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>
    );
  }

  if (themeName === 'Liquid Titanium') {
    return (
      <div className="fixed inset-0 -z-10 bg-[#0b0c10] overflow-hidden pointer-events-none">
        {/* Specular Titanium Soft Ambient Sheen */}
        <div className="absolute top-[-25%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-slate-500/10 blur-[150px] animate-pulse duration-[9000ms]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-sky-900/10 blur-[150px]" />
        
        {/* Subdued Micro Dot Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)', 
            backgroundSize: '32px 32px' 
          }}
        />
      </div>
    );
  }

  if (themeName === 'Swiss Industrial') {
    return (
      <div className="fixed inset-0 -z-10 bg-[#f4f4f5] overflow-hidden pointer-events-none">
        {/* Razor Dot Matrix Matrix */}
        <div 
          className="absolute inset-0 opacity-[0.07]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, #000000 1.5px, transparent 0)', 
            backgroundSize: '24px 24px' 
          }}
        />
      </div>
    );
  }

  // Default Bleeding-Edge Cyber / Holo-Tech
  return (
    <div className="fixed inset-0 -z-10 bg-[#06090e] overflow-hidden pointer-events-none">
      {/* Structural ambient laser orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-cyan-500/10 blur-[140px] animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[75vw] h-[75vw] rounded-full bg-emerald-500/10 blur-[140px] animate-pulse duration-[12000ms]" />
      
      {/* Precision Telemetry Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.035]" 
        style={{ 
          backgroundImage: 'linear-gradient(to right, rgba(6,182,212,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.4) 1px, transparent 1px)', 
          backgroundSize: '32px 32px' 
        }}
      />
    </div>
  );
};

export default TechBackground;