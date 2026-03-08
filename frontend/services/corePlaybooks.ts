export type CoreDemo = {
  id: string;
  tag: string;
  title: string;
  summary: string;
  mission: string;
  liveSignals: Array<{ label: string; value: string; confidence: number }>;
  threatFlow: string[];
  kpis: Array<{ label: string; value: string; score: number }>;
  alerts: string[];
  playbooks: string[];
};

export const CORE_PLAYBOOKS: Record<string, CoreDemo> = {
  'core-01': {
    id: 'core-01',
    tag: 'CORE-01',
    title: 'Digital Twin Engine',
    summary: 'Aggregates identity signals into a unified intelligence profile.',
    mission: 'Collect and normalize public identity traces into a persistent user digital twin.',
    liveSignals: [
      { label: 'GitHub Profile', value: 'shadowgraph-analyst', confidence: 96 },
      { label: 'LinkedIn Entity', value: 'Sadia S. - Security Research', confidence: 94 },
      { label: 'Avatar Reuse Signal', value: 'Matched across 2 accounts', confidence: 88 }
    ],
    threatFlow: ['Signal ingestion started', 'Normalization complete', 'Twin snapshot generated', 'Outlier account attached for monitoring'],
    kpis: [
      { label: 'Signals Ingested', value: '162', score: 91 },
      { label: 'Profile Coverage', value: '5 platforms', score: 86 },
      { label: 'Twin Confidence', value: '0.92', score: 92 }
    ],
    alerts: ['Mirror profile discovered with near-identical display metadata'],
    playbooks: ['Validate ownership links', 'Pin verified profile URLs', 'Monitor new platform mentions']
  },
  'core-02': {
    id: 'core-02',
    tag: 'CORE-02',
    title: 'Graph Intelligence',
    summary: 'Builds relationship topology across accounts, media, posts, and artifacts.',
    mission: 'Map identity entities and relationship paths in versioned Neo4j graph snapshots.',
    liveSignals: [
      { label: 'Node Types', value: 'Account, Image, TextArtifact, Repository', confidence: 97 },
      { label: 'Edge Class', value: 'SIMILAR_USERNAME + SIMILAR_IMAGE', confidence: 93 },
      { label: 'Cluster Flag', value: 'Recruiter-network overlap', confidence: 84 }
    ],
    threatFlow: ['Graph version created', 'Suspicious cluster detected', 'Trust-proximity path projected', 'High-risk edge highlighted'],
    kpis: [
      { label: 'Nodes', value: '48', score: 89 },
      { label: 'Edges', value: '113', score: 87 },
      { label: 'Anomaly Density', value: '0.22', score: 78 }
    ],
    alerts: ['Suspicious node connected to high-trust recruiter subgraph'],
    playbooks: ['Isolate suspicious cluster', 'Require manual verification for high-trust links', 'Increase scan frequency']
  },
  'core-03': {
    id: 'core-03',
    tag: 'CORE-03',
    title: 'AI Fingerprinting',
    summary: 'Scores username, image, and text similarity with anomaly detection overlays.',
    mission: 'Correlate multi-modal identity fingerprints to score impersonation likelihood.',
    liveSignals: [
      { label: 'Username Similarity', value: 'sadia.sakharkarr vs sadia.sakharkar', confidence: 98 },
      { label: 'Image Similarity', value: 'Profile photo embedding match', confidence: 99 },
      { label: 'Stylometric Similarity', value: 'Author mimicry pattern', confidence: 86 }
    ],
    threatFlow: ['Similarity models executed', 'Cross-modal confidence fused', 'Anomaly overlay generated', 'Risk factors passed to simulation engine'],
    kpis: [
      { label: 'Username F1', value: '0.976', score: 97 },
      { label: 'Text F1', value: '0.859', score: 86 },
      { label: 'Image F1', value: '0.998', score: 99 }
    ],
    alerts: ['High-confidence profile clone signal from image+username fusion'],
    playbooks: ['Trigger rapid takedown workflow', 'Lock exposed profile metadata', 'Escalate for human review']
  },
  'core-04': {
    id: 'core-04',
    tag: 'CORE-04',
    title: 'Threat Simulation',
    summary: 'Projects attack spread paths and quantifies blast radius.',
    mission: 'Estimate how impersonation can propagate across trust networks before damage occurs.',
    liveSignals: [
      { label: 'Attack Seed', value: 'Fake LinkedIn identity node', confidence: 91 },
      { label: 'Propagation Path', value: 'Recruiter network + follower chain', confidence: 84 },
      { label: 'Blast Radius', value: '3 communities / 126 reachable contacts', confidence: 79 }
    ],
    threatFlow: [
      'Fake node appears',
      'SIMILAR_USERNAME edge activates',
      'Image reuse path expands to social clusters',
      'Attack likelihood rises to Medium-High',
      'Containment actions injected'
    ],
    kpis: [
      { label: 'Attack Likelihood', value: '0.71', score: 71 },
      { label: 'Blast Radius', value: 'Medium', score: 63 },
      { label: 'Target Impact', value: 'LinkedIn > Instagram', score: 74 }
    ],
    alerts: ['Impersonation path intersects high-trust hiring community'],
    playbooks: ['Notify impacted contacts', 'Report fake node on source platform', 'Run high-priority rescan after containment']
  },
  'core-05': {
    id: 'core-05',
    tag: 'CORE-05',
    title: 'Autonomous Defense',
    summary: 'Creates actionable response playbooks with lifecycle tracking.',
    mission: 'Convert risk insights into practical and traceable mitigation actions.',
    liveSignals: [
      { label: 'Alert State', value: 'open -> acknowledged -> resolved', confidence: 95 },
      { label: 'Recommendation Engine', value: 'Playbook generated in <2s', confidence: 92 },
      { label: 'Response Scope', value: 'Account + content + network hardening', confidence: 88 }
    ],
    threatFlow: ['Alert generated', 'Defense playbook attached', 'Operator acknowledges', 'Actions completed', 'Alert resolved with evidence trail'],
    kpis: [
      { label: 'Open Alerts', value: '3', score: 64 },
      { label: 'Resolved Today', value: '12', score: 90 },
      { label: 'Playbook Coverage', value: '94%', score: 94 }
    ],
    alerts: ['Unresolved lookalike profile on secondary platform'],
    playbooks: ['Enable MFA everywhere', 'Rotate high-risk credentials', 'Publish verified identity links']
  },
  'core-06': {
    id: 'core-06',
    tag: 'CORE-06',
    title: 'Realtime Command UX',
    summary: 'Cinematic dashboard designed for analyst-grade situational awareness.',
    mission: 'Present identity intelligence as an interactive command center for rapid decisions.',
    liveSignals: [
      { label: 'Graph Render Mode', value: 'Interactive + threat-path glow', confidence: 97 },
      { label: 'Demo Stability', value: 'Deterministic guided mode', confidence: 96 },
      { label: 'Latency', value: 'Sub-second panel updates', confidence: 88 }
    ],
    threatFlow: ['User enters dashboard', 'Node click reveals metadata', 'Risk widgets animate', 'Alert workflow updates live'],
    kpis: [
      { label: 'UI Readability', value: 'High', score: 92 },
      { label: 'Interaction Depth', value: 'Graph + panels + playbooks', score: 90 },
      { label: 'Demo Reliability', value: '99%', score: 99 }
    ],
    alerts: ['Dashboard switched to guided demo fallback due API timeout'],
    playbooks: ['Use guided mode for judges', 'Switch to live mode for backend proof', 'Capture final risk snapshot']
  }
};
