'use client';

import { animated, useSprings } from '@react-spring/web';
import { useMemo } from 'react';

export default function FloatingNodes() {
  const nodes = useMemo(() => new Array(18).fill(0).map((_, i) => ({ id: i, x: Math.random() * 100, y: Math.random() * 100 })), []);

  const [springs] = useSprings(nodes.length, (index) => ({
    from: { transform: `translate3d(${nodes[index].x}vw, ${nodes[index].y}vh, 0px) scale(0.6)` },
    to: async (next) => {
      while (true) {
        await next({ transform: `translate3d(${nodes[index].x + (Math.random() - 0.5) * 10}vw, ${nodes[index].y + (Math.random() - 0.5) * 10}vh, 0px) scale(${0.6 + Math.random() * 0.8})` });
      }
    },
    config: { tension: 22, friction: 18 }
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      {springs.map((style, idx) => (
        <animated.div
          key={nodes[idx].id}
          style={style}
          className="absolute h-1.5 w-1.5 rounded-full bg-pink-300/70 shadow-[0_0_18px_rgba(255,79,163,0.7)]"
        />
      ))}
    </div>
  );
}
