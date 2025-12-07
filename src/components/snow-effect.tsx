'use client';

import { useEffect, useState } from 'react';

export const SnowEffect = () => {
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: number; animationDuration: number; opacity: number }>>([]);

  useEffect(() => {
    const flakeCount = 50;
    const newSnowflakes = Array.from({ length: flakeCount }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // Random horizontal position 0-100%
      animationDuration: Math.random() * 3 + 2, // Random duration 2-5s
      opacity: Math.random(),
    }));
    setSnowflakes(newSnowflakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute top-[-10px] w-2 h-2 bg-white rounded-full opacity-80"
          style={{
            left: `${flake.left}%`,
            opacity: flake.opacity,
            animation: `fall ${flake.animationDuration}s linear infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh);
          }
          100% {
            transform: translateY(110vh);
          }
        }
      `}</style>
    </div>
  );
};
