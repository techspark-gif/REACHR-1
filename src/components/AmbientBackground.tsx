import React, { useEffect, useState } from 'react';

export const AmbientBackground: React.FC = () => {
  const [spotPos, setSpotPos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setSpotPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Rich Colour Edition Morphing Blobs - ZERO GRID */}
      <div className="blobs">
        <i className="b b1" />
        <i className="b b2" />
        <i className="b b3" />
        <i className="b b4" />
      </div>

      {/* Interactive Cursor Spotlight */}
      <div
        className="spot"
        style={{
          left: `${spotPos.x}px`,
          top: `${spotPos.y}px`,
        }}
      />
    </div>
  );
};
