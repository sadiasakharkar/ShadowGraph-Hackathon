'use client';

import { useEffect, useState } from 'react';
import GlassCard from '../ui/GlassCard';

const seedSignals = [
  'Ingested GitHub profile metadata: confidence 0.97',
  'Linked domain ownership via DNS cross-reference',
  'Detected near-match alias on professional network',
  'Computed stylometric similarity (0.81) to baseline',
  'Merged cluster graph snapshot to command timeline'
];

export default function SignalStream() {
  const [signals, setSignals] = useState<string[]>(seedSignals.slice(0, 3));

  useEffect(() => {
    const timer = setInterval(() => {
      setSignals((prev) => {
        const next = seedSignals[Math.floor(Math.random() * seedSignals.length)];
        return [next, ...prev].slice(0, 5);
      });
    }, 2200);

    return () => clearInterval(timer);
  }, []);

  return (
    <GlassCard title="Signal Stream">
      <ul className="space-y-2">
        {signals.map((signal, idx) => (
          <li key={`${signal}-${idx}`} className="rounded-md bg-slate-900/60 px-3 py-2 text-xs text-slate-200">
            {signal}
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
