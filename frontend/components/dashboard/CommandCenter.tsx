'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import GraphEngine from '../graph/GraphEngine';
import { createTopologyData, GraphNode } from '../../lib/graphUtils';
import ThreatPanel from './ThreatPanel';
import RiskMeter from './RiskMeter';
import SignalStream from './SignalStream';
import GlassCard from '../ui/GlassCard';

function HoloLoader() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="scan-lines rounded-2xl border border-cyan-300/30 bg-cyan-300/5 px-8 py-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Initializing Command Mesh</p>
        <div className="mt-4 h-1.5 w-56 overflow-hidden rounded-full bg-slate-800">
          <motion.div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500" initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} />
        </div>
      </div>
    </div>
  );
}

export default function CommandCenter() {
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);
  const data = useMemo(() => createTopologyData(720, 909), []);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="command-surface relative min-h-screen p-4 md:p-6">
      <div className="absolute inset-0 particles opacity-70" />
      <div className="relative grid min-h-[92vh] grid-cols-1 gap-4 lg:grid-cols-[300px_1fr_320px]">
        <div className="space-y-4">
          <ThreatPanel />
          <RiskMeter score={67} />
          <SignalStream />
        </div>

        <div className="glass relative rounded-3xl border border-cyan-300/20 p-2 shadow-glow-cyan">
          <GraphEngine nodes={data.nodes} edges={data.edges} mode="dashboard" onNodeSelect={setSelected} className="h-[85vh]" />
          {loading ? <HoloLoader /> : null}
        </div>

        <GlassCard title="Identity Clusters" className="h-fit">
          <div className="space-y-2 text-sm text-slate-300">
            <p>Cluster Alpha: Professional accounts</p>
            <p>Cluster Sigma: Content mirrors</p>
            <p>Cluster Theta: Threat propagation nodes</p>
          </div>
        </GlassCard>
      </div>

      <AnimatePresence>
        {selected ? (
          <motion.aside
            initial={{ x: 340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 340, opacity: 0 }}
            className="glass fixed right-4 top-4 z-30 w-[320px] rounded-2xl border border-cyan-300/20 p-4"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Node Metadata</p>
            <h3 className="mt-2 text-lg text-cyan-100">{selected.label}</h3>
            <div className="mt-3 space-y-1 text-sm text-slate-300">
              <p>Type: {selected.type}</p>
              <p>Risk Score: {Math.round(selected.risk * 100)}%</p>
              <p>Confidence: {Math.round(selected.confidence * 100)}%</p>
              <p>Source: {selected.source}</p>
              <p>Linked Cluster: {selected.cluster}</p>
            </div>
            <button className="mt-4 rounded-lg border border-cyan-400/40 px-3 py-2 text-xs text-cyan-100" onClick={() => setSelected(null)}>
              Close Panel
            </button>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
