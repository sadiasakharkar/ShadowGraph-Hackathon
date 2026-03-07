import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Line, OrbitControls, Stars } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type SGNode = {
  id: string;
  label: string;
  node_type: string;
  confidence?: number;
  suspicious?: boolean;
  trusted?: boolean;
};

type SGEdge = {
  source: string;
  target: string;
  relation: string;
  suspicious?: boolean;
};

function SceneNode({
  node,
  position,
  index,
  interactive,
  onHover,
  onClick
}: {
  node: SGNode;
  position: [number, number, number];
  index: number;
  interactive: boolean;
  onHover?: (node: SGNode | null) => void;
  onClick?: (node: SGNode) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    meshRef.current.position.y = position[1] + Math.sin(t * 0.9 + index) * 0.08;
    meshRef.current.scale.setScalar(1 + Math.sin(t * 1.4 + index) * 0.03);
    meshRef.current.rotation.y += 0.004;
  });

  const color = node.suspicious ? '#ff355e' : node.trusted ? '#2be4ff' : '#5b6cff';

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => {
        if (!interactive) return;
        setHovered(true);
        onHover?.(node);
      }}
      onPointerOut={() => {
        if (!interactive) return;
        setHovered(false);
        onHover?.(null);
      }}
      onClick={() => interactive && onClick?.(node)}
    >
      <sphereGeometry args={[node.suspicious ? 0.15 : 0.12, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={node.suspicious ? 1.6 : 1.0} />
      {hovered ? (
        <Html distanceFactor={11}>
          <div className="rounded bg-black/85 px-2 py-1 text-xs text-white">
            {node.label}
            <br />
            Confidence: {Math.round((node.confidence || 0.9) * 100)}%
          </div>
        </Html>
      ) : null}
    </mesh>
  );
}

function PulsingEdge({
  edge,
  index,
  points
}: {
  edge: SGEdge;
  index: number;
  points: [[number, number, number], [number, number, number]];
}) {
  const ref = useRef<any>(null);

  useFrame((state) => {
    if (!ref.current?.material) return;
    const t = state.clock.elapsedTime;
    const wave = (Math.sin(t * 1.2 + index * 1.4) + 1) / 2;
    ref.current.material.opacity = edge.suspicious ? 0.25 + wave * 0.75 : 0.1 + wave * 0.6;
  });

  return (
    <Line
      ref={ref}
      points={points}
      color={edge.suspicious ? '#ff355e' : '#45d8ff'}
      lineWidth={1.2}
      transparent
      opacity={0.7}
    />
  );
}

function SceneEdges({ edges, positions }: { edges: SGEdge[]; positions: Map<string, [number, number, number]> }) {
  return (
    <>
      {edges.map((edge, i) => {
        const a = positions.get(edge.source);
        const b = positions.get(edge.target);
        if (!a || !b) return null;
        return <PulsingEdge key={`${edge.source}-${edge.target}-${i}`} edge={edge} index={i} points={[a, b]} />;
      })}
    </>
  );
}

export default function LandingGraphScene({
  nodes,
  edges,
  interactive = false,
  onNodeClick,
  onNodeHover
}: {
  nodes: SGNode[];
  edges: SGEdge[];
  interactive?: boolean;
  onNodeClick?: (node: SGNode) => void;
  onNodeHover?: (node: SGNode | null) => void;
}) {
  const positions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    nodes.forEach((node, idx) => {
      const ring = 2 + (idx % 4) * 0.8;
      const angle = (idx / Math.max(nodes.length, 1)) * Math.PI * 2;
      map.set(node.id, [Math.cos(angle) * ring, Math.sin(angle * 1.6) * 1.4, Math.sin(angle) * ring]);
    });
    return map;
  }, [nodes]);

  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [0, 1.5, 8], fov: 54 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[4, 4, 4]} intensity={2.4} color="#2be4ff" />
        <pointLight position={[-3, -2, 2]} intensity={1.8} color="#5868ff" />
        <pointLight position={[0, 2, -5]} intensity={1.4} color="#ff355e" />
        <Stars radius={60} depth={40} count={1800} factor={2} saturation={0} speed={0.4} />
        <SceneEdges edges={edges} positions={positions} />
        {nodes.map((node, idx) => (
          <SceneNode
            key={node.id}
            node={node}
            index={idx}
            position={positions.get(node.id) || [0, 0, 0]}
            interactive={interactive}
            onHover={onNodeHover}
            onClick={onNodeClick}
          />
        ))}
        <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={interactive} enablePan={false} />
      </Canvas>
    </div>
  );
}
