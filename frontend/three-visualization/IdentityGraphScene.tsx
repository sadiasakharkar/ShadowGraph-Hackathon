import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html, Stars } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

function GraphNode({ node, index, onSelect }: { node: any; index: number; onSelect: (n: any) => void }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  const pos = useMemo(() => {
    const angle = (index / 12) * Math.PI * 2;
    return [Math.cos(angle) * (2 + (index % 3)), Math.sin(angle * 1.3) * 1.5, Math.sin(angle) * (2 + (index % 3))] as [number, number, number];
  }, [index]);

  useFrame((state) => {
    const t = Math.max(0, state.clock.elapsedTime - index * 0.07);
    const appear = Math.min(1, t * 2.3);
    const hoverScale = hovered ? 1.14 : 1;
    meshRef.current.position.y = pos[1] + Math.sin(state.clock.elapsedTime + index) * 0.08;
    meshRef.current.scale.setScalar(appear * hoverScale);
    meshRef.current.rotation.y += 0.006;
    glowRef.current.position.copy(meshRef.current.position);
    const pulse = 0.92 + Math.sin(state.clock.elapsedTime * 2.5 + index) * 0.12;
    glowRef.current.scale.setScalar(Math.max(0.1, appear) * pulse * (node.suspicious ? 1.9 : 1.5));
  });

  const color = node.suspicious ? '#ff355e' : node.verified ? '#38ff9c' : '#2be4ff';
  const glowColor = node.suspicious ? '#ff355e' : '#2be4ff';

  return (
    <group>
      <mesh ref={glowRef} position={pos}>
        <sphereGeometry args={[0.24 + (node.suspicious ? 0.08 : 0), 18, 18]} />
        <meshBasicMaterial color={glowColor} transparent opacity={node.suspicious ? 0.3 : 0.18} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh
        ref={meshRef}
        position={pos}
        onClick={() => onSelect(node)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.14 + (node.suspicious ? 0.06 : 0), 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={node.suspicious ? 1.6 : 0.85} />
        {hovered ? (
          <Html distanceFactor={10}>
            <div className="rounded border border-cyan-300/40 bg-black/80 px-2 py-1 text-xs text-white">
              {node.label} ({node.node_type})
            </div>
          </Html>
        ) : null}
      </mesh>
    </group>
  );
}

function GraphEdges({ nodes, edges, attackPaths }: { nodes: any[]; edges: any[]; attackPaths?: Set<string> }) {
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
        const key = `${e.source}|${e.target}`;
        const reverse = `${e.target}|${e.source}`;
        const isAttackPath = attackPaths?.has(key) || attackPaths?.has(reverse);
        const color = isAttackPath ? '#ff355e' : String(e.relation || '').toLowerCase().includes('similar') ? '#ff7b95' : '#2be4ff';
        return <AnimatedEdge key={i} points={[a, b]} color={color} delay={i * 0.04} attack={Boolean(isAttackPath)} />;
      })}
    </>
  );
}

function AnimatedEdge({ points, color, delay, attack }: { points: [number, number, number][]; color: string; delay: number; attack: boolean }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<any>(null);
  useFrame((state) => {
    if (!visible && state.clock.elapsedTime >= delay) setVisible(true);
    if (ref.current) {
      ref.current.material.opacity = visible ? 0.9 : 0;
    }
  });
  if (!visible) return null;
  return <Line ref={ref} points={points} color={color} lineWidth={attack ? 2.2 : 1.2} transparent />;
}

function CameraRig({ demoMode }: { demoMode?: boolean }) {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const radius = demoMode ? 7.4 : 7;
    const target = new THREE.Vector3(Math.cos(t * 0.12) * radius, 1.2 + Math.sin(t * 0.2) * 0.4, Math.sin(t * 0.12) * radius);
    state.camera.position.lerp(target, demoMode ? 0.04 : 0.02);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function IdentityGraphScene({
  nodes,
  edges,
  onSelect,
  attackPathKeys,
  demoMode
}: {
  nodes: any[];
  edges: any[];
  onSelect: (n: any) => void;
  attackPathKeys?: string[];
  demoMode?: boolean;
}) {
  const attackPaths = useMemo(() => new Set(attackPathKeys || []), [attackPathKeys]);
  return (
    <div className="glass h-[520px] w-full overflow-hidden rounded-2xl shadow-neon">
      <Canvas camera={{ position: [0, 1, 7], fov: 52 }}>
        <fog attach="fog" args={['#061321', 7, 16]} />
        <ambientLight intensity={0.8} />
        <pointLight position={[4, 4, 4]} intensity={2} color="#2be4ff" />
        <pointLight position={[-4, -2, 1]} intensity={1.5} color="#ff355e" />
        <CameraRig demoMode={demoMode} />
        <Stars radius={40} depth={30} count={1500} factor={2} saturation={0} />
        <GraphEdges nodes={nodes} edges={edges} attackPaths={attackPaths} />
        {nodes.map((node, i) => (
          <GraphNode node={node} index={i} key={node.id} onSelect={onSelect} />
        ))}
        <OrbitControls autoRotate autoRotateSpeed={demoMode ? 0.85 : 0.45} enablePan={false} enableZoom />
      </Canvas>
    </div>
  );
}
