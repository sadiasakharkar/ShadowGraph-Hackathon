'use client';

import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';

const items = [
  { id: 'T-901', label: 'Username impersonation cluster detected', severity: 'high' },
  { id: 'T-633', label: 'Avatar reuse anomaly linked to unknown domain', severity: 'critical' },
  { id: 'T-412', label: 'Behavioral overlap with synthetic posting ring', severity: 'medium' }
];

export default function ThreatPanel() {
  return (
    <GlassCard title="Threat Intelligence Feed">
      <div className="space-y-3">
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="rounded-lg border border-pink-400/20 bg-slate-900/60 p-3"
          >
            <p className="text-xs uppercase tracking-widest text-pink-200/80">{item.id}</p>
            <p className="text-sm text-slate-100">{item.label}</p>
            <p className="mt-1 text-xs uppercase text-danger">{item.severity}</p>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
