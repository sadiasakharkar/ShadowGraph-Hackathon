'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { GraphEdge, GraphNode } from '../../lib/graphUtils';

type EdgeRendererProps = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export default function EdgeRenderer({ nodes, edges }: EdgeRendererProps) {
  const lineRef = useRef<THREE.LineSegments>(null!);
  const flowRef = useRef<THREE.InstancedMesh>(null!);
  const temp = useMemo(() => new THREE.Object3D(), []);

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const positions = useMemo(() => new Float32Array(Math.max(edges.length, 1) * 6), [edges.length]);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const flowLinks = useMemo(() => edges.slice(0, Math.min(120, edges.length)), [edges]);

  useFrame((state) => {
    for (let i = 0; i < edges.length; i += 1) {
      const e = edges[i];
      const a = nodeMap.get(e.source);
      const b = nodeMap.get(e.target);
      if (!a || !b) continue;
      const offset = i * 6;
      positions[offset] = a.x ?? 0;
      positions[offset + 1] = a.y ?? 0;
      positions[offset + 2] = a.z ?? 0;
      positions[offset + 3] = b.x ?? 0;
      positions[offset + 4] = b.y ?? 0;
      positions[offset + 5] = b.z ?? 0;
    }
    (lineRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    flowLinks.forEach((edge, i) => {
      const a = nodeMap.get(edge.source);
      const b = nodeMap.get(edge.target);
      if (!a || !b) return;
      const t = (state.clock.elapsedTime * (0.08 + edge.strength * 0.08) + i * 0.13) % 1;
      temp.position.set((a.x ?? 0) + ((b.x ?? 0) - (a.x ?? 0)) * t, (a.y ?? 0) + ((b.y ?? 0) - (a.y ?? 0)) * t, (a.z ?? 0) + ((b.z ?? 0) - (a.z ?? 0)) * t);
      temp.scale.setScalar(0.12 + edge.strength * 0.1);
      temp.updateMatrix();
      flowRef.current.setMatrixAt(i, temp.matrix);
    });
    flowRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <lineSegments ref={lineRef} geometry={geo}>
        <lineBasicMaterial color="#2ee6ff" transparent opacity={0.38} />
      </lineSegments>
      <instancedMesh
        ref={flowRef}
        args={[
          new THREE.SphereGeometry(0.1, 8, 8),
          new THREE.MeshBasicMaterial({ color: '#7a5cff', transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending }),
          flowLinks.length
        ]}
      />
    </group>
  );
}
