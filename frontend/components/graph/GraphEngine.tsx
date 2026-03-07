'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { GraphEdge, GraphNode } from '../../lib/graphUtils';
import { useGraphPhysics } from './GraphPhysics';
import NodeRenderer from './NodeRenderer';
import EdgeRenderer from './EdgeRenderer';

function CameraParallax({ intensity = 0.08 }: { intensity?: number }) {
  const target = useRef(new THREE.Vector3());
  useFrame((state) => {
    const mx = (state.pointer.x || 0) * 1.8;
    const my = (state.pointer.y || 0) * 1.4;
    target.current.set(mx * 6 * intensity, my * 4 * intensity, state.camera.position.z);
    state.camera.position.lerp(target.current, 0.02);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene({ nodes, edges, onSelect, mode }: { nodes: GraphNode[]; edges: GraphEdge[]; onSelect: (n: GraphNode) => void; mode: 'hero' | 'dashboard' }) {
  const intensity = mode === 'dashboard' ? 1.18 : 0.88;
  const { nodes: simNodes, edges: simEdges } = useGraphPhysics(nodes, edges, intensity);

  return (
    <>
      <fog attach="fog" args={['#070b18', 40, 120]} />
      <ambientLight intensity={0.62} />
      <pointLight position={[12, 10, 8]} intensity={2.2} color="#2ee6ff" />
      <pointLight position={[-10, -8, 6]} intensity={1.4} color="#ff4fa3" />
      <pointLight position={[0, 0, -15]} intensity={1.3} color="#7a5cff" />
      <Stars radius={180} depth={120} count={2600} factor={4} saturation={0} />
      <EdgeRenderer nodes={simNodes} edges={simEdges} />
      <NodeRenderer nodes={simNodes} onSelect={onSelect} />
      <CameraParallax intensity={mode === 'dashboard' ? 0.14 : 0.1} />
      <OrbitControls autoRotate={mode === 'hero'} autoRotateSpeed={mode === 'hero' ? 0.35 : 0.15} enablePan={mode === 'dashboard'} enableZoom />
    </>
  );
}

export default function GraphEngine({
  nodes,
  edges,
  mode = 'hero',
  onNodeSelect,
  className = ''
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  mode?: 'hero' | 'dashboard';
  onNodeSelect?: (node: GraphNode) => void;
  className?: string;
}) {
  const safeOnSelect = useMemo(() => onNodeSelect || (() => undefined), [onNodeSelect]);

  return (
    <div className={`relative h-full w-full overflow-hidden rounded-3xl ${className}`}>
      <Canvas dpr={[1, 1.8]} camera={{ position: [0, 0, mode === 'hero' ? 45 : 52], fov: mode === 'hero' ? 48 : 54 }}>
        <Scene nodes={nodes} edges={edges} onSelect={safeOnSelect} mode={mode} />
      </Canvas>
    </div>
  );
}
