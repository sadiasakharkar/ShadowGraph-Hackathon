'use client';

import { useSpring, animated } from '@react-spring/web';
import GlassCard from '../ui/GlassCard';

export default function RiskMeter({ score = 68 }: { score?: number }) {
  const progress = useSpring({
    value: score,
    from: { value: 0 },
    config: { mass: 1.5, tension: 70, friction: 20 }
  });

  return (
    <GlassCard title="Risk Score Meter">
      <div className="space-y-3">
        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <animated.div
            className="h-full bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500"
            style={{ width: progress.value.to((v) => `${Math.max(6, Math.min(100, v))}%`) }}
          />
        </div>
        <animated.p className="text-3xl font-semibold text-cyan-100">{progress.value.to((v) => `${Math.round(v)}/100`)}</animated.p>
        <p className="text-xs uppercase tracking-[0.2em] text-pink-200">Elevated impersonation pressure</p>
      </div>
    </GlassCard>
  );
}
