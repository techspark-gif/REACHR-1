import React from 'react';

export const AmbientBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Subtle warm organic ambient glow inspired by b-egg.farm */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#EAB640]/8 blur-[100px] rounded-full" />
    </div>
  );
};
