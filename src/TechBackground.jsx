import React from 'react';

const TechBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-[#080b11] overflow-hidden">
      {/* Structural ambient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-emerald-500/5 blur-[130px] animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-blue-600/5 blur-[130px] animate-pulse duration-[12000ms]"></div>
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', 
          backgroundSize: '28px 28px' 
        }}
      ></div>
    </div>
  );
};

export default TechBackground;