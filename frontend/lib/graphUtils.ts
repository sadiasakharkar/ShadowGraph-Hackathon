import { ShadowNodeType } from './colorUtils';

export type GraphNode = {
  id: string;
  type: ShadowNodeType;
  label: string;
  risk: number;
  confidence: number;
  source: string;
  cluster: number;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  relation: 'similarity' | 'behavior' | 'ownership';
  strength: number;
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function createTopologyData(nodeCount = 180, seed = 42): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const rand = seededRandom(seed);
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const nodeTypes: ShadowNodeType[] = ['identity', 'account', 'domain', 'threat'];

  for (let i = 0; i < nodeCount; i += 1) {
    const type = i === 0 ? 'identity' : nodeTypes[Math.floor(rand() * nodeTypes.length)];
    nodes.push({
      id: `n-${i}`,
      type,
      label: `${type.toUpperCase()}-${i}`,
      risk: Number((rand() * (type === 'threat' ? 1 : 0.7)).toFixed(2)),
      confidence: Number((0.55 + rand() * 0.45).toFixed(2)),
      source: type === 'domain' ? 'dns-crawl' : type === 'account' ? 'public-profile' : 'identity-twin',
      cluster: Math.floor(rand() * 8),
      x: (rand() - 0.5) * 50,
      y: (rand() - 0.5) * 50,
      z: (rand() - 0.5) * 50
    });
  }

  let edgeId = 0;
  for (let i = 1; i < nodes.length; i += 1) {
    const target = Math.max(0, i - 1 - Math.floor(rand() * 8));
    edges.push({
      id: `e-${edgeId++}`,
      source: nodes[i].id,
      target: nodes[target].id,
      relation: rand() > 0.66 ? 'ownership' : rand() > 0.33 ? 'similarity' : 'behavior',
      strength: Number((0.4 + rand() * 0.6).toFixed(2))
    });
    if (rand() > 0.65) {
      const extra = Math.floor(rand() * i);
      edges.push({
        id: `e-${edgeId++}`,
        source: nodes[i].id,
        target: nodes[extra].id,
        relation: rand() > 0.5 ? 'similarity' : 'behavior',
        strength: Number((0.35 + rand() * 0.6).toFixed(2))
      });
    }
  }

  return { nodes, edges };
}

export function edgeKey(a: string, b: string): string {
  return `${a}::${b}`;
}
