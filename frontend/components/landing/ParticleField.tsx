'use client';

import { useMemo } from 'react';

export default function ParticleField() {
  const particles = useMemo(
    () =>
      new Array(90).fill(0).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 1 + Math.random() * 3,
        delay: Math.random() * 8,
        duration: 8 + Math.random() * 12
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-cyan-200/40"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            boxShadow: '0 0 12px rgba(46,230,255,0.3)',
            animation: `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite alternate`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes floatParticle {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0.25;
          }
          100% {
            transform: translate3d(22px, -24px, 0);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}
