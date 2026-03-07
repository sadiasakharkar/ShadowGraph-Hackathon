export const DEMO_STEPS = [
  'Collecting public identity signals',
  'Resolving username similarities',
  'Running image reuse analysis',
  'Building identity graph snapshot',
  'Simulating attack propagation'
];

export const DEMO_GRAPH = {
  graph_version_id: 'demo-gv-001',
  nodes: [
    { id: 'u-core', label: 'Sadia S.', node_type: 'useridentity', verified: true, suspicious: false, confidence_score: 0.99, source: 'demo', metadata: { platform: 'core' } },
    { id: 'acc-gh', label: 'GitHub @sadia-sec', node_type: 'account', verified: true, suspicious: false, confidence_score: 0.97, source: 'demo', metadata: { platform: 'github' } },
    { id: 'acc-li', label: 'LinkedIn Profile', node_type: 'account', verified: true, suspicious: false, confidence_score: 0.95, source: 'demo', metadata: { platform: 'linkedin' } },
    { id: 'acc-ig', label: 'Instagram @sadia.ai', node_type: 'account', verified: true, suspicious: false, confidence_score: 0.94, source: 'demo', metadata: { platform: 'instagram' } },
    { id: 'repo-sg', label: 'ShadowGraph Repo', node_type: 'repository', verified: true, suspicious: false, confidence_score: 0.93, source: 'demo', metadata: { platform: 'github' } },
    { id: 'img-main', label: 'Primary Avatar', node_type: 'image', verified: true, suspicious: false, confidence_score: 0.96, source: 'demo', metadata: { platform: 'github' } },
    { id: 'acc-fake', label: 'LinkedIn @sadia.sakharkarr', node_type: 'account', verified: false, suspicious: true, confidence_score: 0.78, source: 'demo', metadata: { platform: 'linkedin' } },
    { id: 'img-reuse', label: 'Reused Avatar', node_type: 'image', verified: false, suspicious: true, confidence_score: 0.83, source: 'demo', metadata: { platform: 'linkedin', image_reuse: true } }
  ],
  edges: [
    { source: 'u-core', target: 'acc-gh', relation: 'HAS_ACCOUNT', confidence_score: 0.98 },
    { source: 'u-core', target: 'acc-li', relation: 'HAS_ACCOUNT', confidence_score: 0.95 },
    { source: 'u-core', target: 'acc-ig', relation: 'HAS_ACCOUNT', confidence_score: 0.94 },
    { source: 'acc-gh', target: 'repo-sg', relation: 'CONNECTED_TO', confidence_score: 0.92 },
    { source: 'acc-gh', target: 'img-main', relation: 'HAS_IMAGE', confidence_score: 0.96 },
    { source: 'acc-fake', target: 'u-core', relation: 'SIMILAR_USERNAME', confidence_score: 0.87 },
    { source: 'acc-fake', target: 'img-reuse', relation: 'HAS_IMAGE', confidence_score: 0.84 },
    { source: 'img-reuse', target: 'img-main', relation: 'SIMILAR_IMAGE', confidence_score: 0.9 }
  ]
};

export const DEMO_RISK = {
  identity_duplication_probability: 0.78,
  content_misuse_probability: 0.44,
  deepfake_risk_indicators: 0.3,
  network_anomaly_signals: 0.58,
  overall_risk_score: 0.563,
  category: 'high'
};

export const DEMO_ANALYSIS = {
  overall_risk_score: 0.692,
  attack_likelihood: 0.63,
  blast_radius: 0.78,
  target_platform_impact: { linkedin: 0.5, github: 0.3, instagram: 0.2 },
  risk_factors: ['fake account creation vectors', 'image reuse relationships', 'username impersonation edges'],
  affected_nodes: ['u-core', 'acc-fake', 'img-reuse', 'img-main'],
  recommended_actions: [
    'report suspicious accounts to platform trust team',
    'enable mandatory MFA on primary identity accounts',
    'file takedown requests for reused images'
  ],
  attack_paths: [
    { source: 'acc-fake', target: 'u-core', relation: 'SIMILAR_USERNAME', confidence_score: 0.87 },
    { source: 'img-reuse', target: 'img-main', relation: 'SIMILAR_IMAGE', confidence_score: 0.9 }
  ],
  scenarios: [
    { type: 'fake_account_creation', risk_score: 0.72, affected_nodes: ['acc-fake'], attack_paths: [{ source: 'acc-fake', target: 'u-core', relation: 'SIMILAR_USERNAME', confidence_score: 0.87 }] },
    { type: 'image_reuse', risk_score: 0.69, affected_nodes: ['img-reuse'], attack_paths: [{ source: 'img-reuse', target: 'img-main', relation: 'SIMILAR_IMAGE', confidence_score: 0.9 }] },
    { type: 'username_impersonation', risk_score: 0.73, affected_nodes: ['acc-fake', 'u-core'], attack_paths: [{ source: 'acc-fake', target: 'u-core', relation: 'SIMILAR_USERNAME', confidence_score: 0.87 }] }
  ]
};

export const DEMO_ALERTS = [
  {
    id: 'demo-alert-1',
    title: 'Report Impersonation Accounts',
    severity: 'high',
    state: 'open',
    recommendation: 'Submit abuse report for @sadia.sakharkarr and include verified identity profile links.'
  },
  {
    id: 'demo-alert-2',
    title: 'Enable Multi-Factor Authentication',
    severity: 'medium',
    state: 'acknowledged',
    recommendation: 'Enable MFA on LinkedIn, GitHub, and primary email recovery channels.'
  },
  {
    id: 'demo-alert-3',
    title: 'Secure Exposed Profiles',
    severity: 'medium',
    state: 'open',
    recommendation: 'Remove unnecessary public contact metadata and pin verified profile references.'
  }
];
