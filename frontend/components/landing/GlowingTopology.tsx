'use client';

import { useMemo } from 'react';
import GraphEngine from '../graph/GraphEngine';
import { createTopologyData } from '../../lib/graphUtils';

export default function GlowingTopology({ onNodeSelect }: { onNodeSelect?: (node: any) => void }) {
  const data = useMemo(() => createTopologyData(220, 77), []);

  return <GraphEngine nodes={data.nodes} edges={data.edges} mode="hero" onNodeSelect={onNodeSelect} />;
}
