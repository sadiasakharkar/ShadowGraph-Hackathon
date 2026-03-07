'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { GraphNode } from '../../lib/graphUtils';
import { nodeColorByType } from '../../lib/colorUtils';
import { nodePulse } from '../animations/NodePulse';

type MeshRef = THREE.InstancedMesh;

function TypeLayer({
  nodes,
  type,
  geo,
  onHover,
  onSelect,
  hoveredId,
  timeSeed
}: {
  nodes: GraphNode[];
  type: GraphNode['type'];
  geo: THREE.BufferGeometry;
  onHover: (id: string | null) => void;
  onSelect: (node: GraphNode) => void;
  hoveredId: string | null;
  timeSeed: number;
}) {
  const filtered = useMemo(() => nodes.filter((n) => n.type === type), [nodes, type]);
  const ref = useRef<MeshRef>(null!);
  const glowRef = useRef<MeshRef>(null!);
  const tmp = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!ref.current) return;
    filtered.forEach((node, i) => {
      const scale = node.type === 'identity' ? 1.5 : node.type === 'threat' ? 1.2 : 0.9;
      const pulse = nodePulse(state.clock.elapsedTime + timeSeed, i * 0.35, 0.88, node.type === 'threat' ? 1.45 : 1.18);
      const hoverBoost = hoveredId === node.id ? 1.45 : 1;

      tmp.position.set(node.x ?? 0, node.y ?? 0, node.z ?? 0);
      tmp.scale.setScalar(scale * pulse * hoverBoost);
      tmp.updateMatrix();
      ref.current.setMatrixAt(i, tmp.matrix);

      tmp.scale.setScalar(scale * pulse * (node.type === 'threat' ? 1.85 : 1.55));
      tmp.updateMatrix();
      glowRef.current.setMatrixAt(i, tmp.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    glowRef.current.instanceMatrix.needsUpdate = true;
  });

  const color = nodeColorByType(type);

  return (
    <>
      <instancedMesh
        ref={glowRef}
        args={[geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: type === 'threat' ? 0.34 : 0.18, blending: THREE.AdditiveBlending }), filtered.length]}
      />
      <instancedMesh
        ref={ref}
        args={[geo, new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: type === 'threat' ? 1.5 : 0.85 }), filtered.length]}
        onPointerMove={(e) => {
          e.stopPropagation();
          const id = filtered[e.instanceId ?? 0]?.id;
          onHover(id ?? null);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          const n = filtered[e.instanceId ?? 0];
          if (n) onSelect(n);
        }}
      />
    </>
  );
}

export default function NodeRenderer({ nodes, onSelect }: { nodes: GraphNode[]; onSelect: (node: GraphNode) => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const sphere = useMemo(() => new THREE.SphereGeometry(0.35, 12, 12), []);
  const small = useMemo(() => new THREE.SphereGeometry(0.24, 10, 10), []);
  const hex = useMemo(() => new THREE.IcosahedronGeometry(0.3, 0), []);
  const threat = useMemo(() => new THREE.OctahedronGeometry(0.34, 0), []);

  return (
    <group>
      <TypeLayer nodes={nodes} type="identity" geo={sphere} onHover={setHoveredId} onSelect={onSelect} hoveredId={hoveredId} timeSeed={0.3} />
      <TypeLayer nodes={nodes} type="account" geo={small} onHover={setHoveredId} onSelect={onSelect} hoveredId={hoveredId} timeSeed={1.2} />
      <TypeLayer nodes={nodes} type="domain" geo={hex} onHover={setHoveredId} onSelect={onSelect} hoveredId={hoveredId} timeSeed={2.1} />
      <TypeLayer nodes={nodes} type="threat" geo={threat} onHover={setHoveredId} onSelect={onSelect} hoveredId={hoveredId} timeSeed={3.4} />
    </group>
  );
}
