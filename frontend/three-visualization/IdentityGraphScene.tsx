import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html, Stars } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

function GraphNode({ node, index, onSelect }: { node: any; index: number; onSelect: (n: any) => void }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  const pos = useMemo(() => {
    const angle = (index / 12) * Math.PI * 2;
    return [Math.cos(angle) * (2 + (index % 3)), Math.sin(angle * 1.3) * 1.5, Math.sin(angle) * (2 + (index % 3))] as [number, number, number];
  }, [index]);

  useFrame((state) => {
    meshRef.current.position.y = pos[1] + Math.sin(state.clock.elapsedTime + index) * 0.08;
    meshRef.current.rotation.y += 0.006;
  });

  const color = node.suspicious ? '#ff355e' : node.verified ? '#38ff9c' : '#2be4ff';

  return (
    <mesh
      ref={meshRef}
      position={pos}
      onClick={() => onSelect(node)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.14 + (node.suspicious ? 0.06 : 0), 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={node.suspicious ? 1.4 : 0.7} />
      {hovered ? (
        <Html distanceFactor={10}>
          <div className="rounded bg-black/80 px-2 py-1 text-xs text-white">
            {node.label} ({node.node_type})
          </div>
        </Html>
      ) : null}
    </mesh>
  );
}

function GraphEdges({ nodes, edges }: { nodes: any[]; edges: any[] }) {
  const nodePos = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    nodes.forEach((n, index) => {
      const angle = (index / 12) * Math.PI * 2;
      map.set(n.id, [Math.cos(angle) * (2 + (index % 3)), Math.sin(angle * 1.3) * 1.5, Math.sin(angle) * (2 + (index % 3))]);
    });
    return map;
  }, [nodes]);

  return (
    <>
      {edges.map((e, i) => {
        const a = nodePos.get(e.source);
        const b = nodePos.get(e.target);
        if (!a || !b) return null;
        return <Line key={i} points={[a, b]} color={e.relation.includes('similarity') ? '#ff7b95' : '#2be4ff'} lineWidth={1} />;
      })}
    </>
  );
}

export default function IdentityGraphScene({ nodes, edges, onSelect }: { nodes: any[]; edges: any[]; onSelect: (n: any) => void }) {
  return (
    <div className="glass h-[520px] w-full overflow-hidden rounded-2xl shadow-neon">
      <Canvas camera={{ position: [0, 1, 7], fov: 52 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[4, 4, 4]} intensity={2} color="#2be4ff" />
        <pointLight position={[-4, -2, 1]} intensity={1.5} color="#ff355e" />
        <Stars radius={40} depth={30} count={1500} factor={2} saturation={0} />
        <GraphEdges nodes={nodes} edges={edges} />
        {nodes.map((node, i) => (
          <GraphNode node={node} index={i} key={node.id} onSelect={onSelect} />
        ))}
        <OrbitControls autoRotate autoRotateSpeed={0.6} enablePan={false} />
      </Canvas>
    </div>
  );
}
