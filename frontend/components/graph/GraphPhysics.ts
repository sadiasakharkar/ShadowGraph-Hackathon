'use client';

import { forceCenter, forceLink, forceManyBody, forceSimulation, Simulation, SimulationNodeDatum } from 'd3';
import { useEffect, useMemo, useState } from 'react';
import { GraphEdge, GraphNode } from '../../lib/graphUtils';

type PhysicsNode = GraphNode & SimulationNodeDatum;
type PhysicsEdge = GraphEdge & { source: string | PhysicsNode; target: string | PhysicsNode };

export function useGraphPhysics(nodesInput: GraphNode[], edgesInput: GraphEdge[], intensity = 1) {
  const nodes = useMemo(() => nodesInput.map((n) => ({ ...n })) as PhysicsNode[], [nodesInput]);
  const edges = useMemo(() => edgesInput.map((e) => ({ ...e })) as PhysicsEdge[], [edgesInput]);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!nodes.length) return;

    const simulation: Simulation<PhysicsNode, PhysicsEdge> = forceSimulation(nodes)
      .force('charge', forceManyBody().strength(-42 * intensity))
      .force(
        'link',
        forceLink(edges)
          .id((d) => (d as PhysicsNode).id)
          .distance((d) => 14 + (1 - d.strength) * 26)
          .strength((d) => 0.2 + d.strength * 0.6)
      )
      .force('center', forceCenter(0, 0))
      .alpha(1)
      .alphaDecay(0.024);

    const drift = () => {
      for (const n of nodes) {
        const c = n.cluster ?? 0;
        n.vz = (n.vz ?? 0) + Math.sin((n.x ?? 0) * 0.02 + c) * 0.0018 + ((Math.random() - 0.5) * 0.002);
        n.z = (n.z ?? 0) + (n.vz ?? 0);
        n.vz *= 0.98;
      }
    };

    simulation.on('tick', () => {
      drift();
      setTick((v) => (v + 1) % 100000);
    });

    return () => {
      simulation.stop();
    };
  }, [edges, intensity, nodes]);

  return { nodes, edges };
}
