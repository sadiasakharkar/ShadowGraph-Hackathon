import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import IdentityGraphScene from '../three-visualization/IdentityGraphScene';
import RiskPanel from '../components/RiskPanel';
import AlertsPanel from '../components/AlertsPanel';
import NodeInspector from '../components/NodeInspector';
import ThreatSimulationPanel from '../components/ThreatSimulationPanel';
import { DEMO_ALERTS, DEMO_ANALYSIS, DEMO_GRAPH, DEMO_RISK, DEMO_STEPS } from '../services/demoSeed';

const missionTimeline = [
  'Ingest public identity signals from selected platforms',
  'Normalize identity artifacts and assign confidence scores',
  'Build Neo4j graph snapshot with version metadata',
  'Compute username, image, and text similarity correlations',
  'Simulate impersonation propagation and blast radius',
  'Trigger autonomous defense recommendations and alerts'
];

const analystModules = [
  {
    name: 'Digital Twin Engine',
    detail: 'Reconstructs fragmented online identity into a connected intelligence model.'
  },
  {
    name: 'Graph Intelligence',
    detail: 'Finds suspicious communities, relationship anomalies, and trust pivots.'
  },
  {
    name: 'AI Fingerprinting',
    detail: 'Correlates handles, profile images, and writing style for impersonation scoring.'
  },
  {
    name: 'Threat Simulation',
    detail: 'Projects attack expansion paths and likely downstream impact.'
  },
  {
    name: 'Autonomous Defense',
    detail: 'Converts risk signals into response playbooks with lifecycle tracking.'
  }
];

export default function Dashboard() {
  const ready = useAuth();
  const router = useRouter();
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [risk, setRisk] = useState<any>({});
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [graphVersionId, setGraphVersionId] = useState<string>('');
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null);
  const [attackPathKeys, setAttackPathKeys] = useState<string[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [loadingScan, setLoadingScan] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [offlineFallback, setOfflineFallback] = useState(false);

  const demoQueryMode = useMemo(() => router.query.demo === '1', [router.query.demo]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const persisted = localStorage.getItem('sg_demo_mode') === '1';
    setDemoMode(demoQueryMode || persisted);
  }, [demoQueryMode]);

  useEffect(() => {
    if (!ready) return;

    const runGuidedDemo = async () => {
      setLoadingScan(true);
      setDemoStep(0);
      setNodes([]);
      setEdges([]);
      setAlerts([]);
      setRisk({});
      setRiskAnalysis(null);
      for (let i = 0; i < DEMO_STEPS.length; i += 1) {
        setDemoStep(i);
        await new Promise((resolve) => setTimeout(resolve, 620));
      }
      setNodes(DEMO_GRAPH.nodes);
      setEdges(DEMO_GRAPH.edges);
      setGraphVersionId(DEMO_GRAPH.graph_version_id);
      setRisk(DEMO_RISK);
      setRiskAnalysis(DEMO_ANALYSIS);
      setAlerts(DEMO_ALERTS);
      setAttackPathKeys((DEMO_ANALYSIS.attack_paths || []).map((p: any) => `${p.source}|${p.target}`));
      setLoadingScan(false);
    };

    const loadAll = async () => {
      try {
        const [graphRes, riskRes, alertsRes, analysisRes] = await Promise.all([
          api.get('/graph/latest'),
          api.get('/api/identity/risk'),
          api.get('/alerts'),
          api.get('/risk/analysis')
        ]);
        setOfflineFallback(false);
        setNodes(graphRes.data.nodes || []);
        setEdges(graphRes.data.edges || []);
        setGraphVersionId(graphRes.data.graph_version_id || '');
        setRisk(riskRes.data.risk || {});
        setAlerts(alertsRes.data.alerts || []);
        const analysis = analysisRes.data?.analysis || null;
        setRiskAnalysis(analysis);
        setAttackPathKeys((analysis?.attack_paths || []).map((p: any) => `${p.source}|${p.target}`));
      } catch {
        setOfflineFallback(true);
        setDemoMode(true);
        setNodes(DEMO_GRAPH.nodes);
        setEdges(DEMO_GRAPH.edges);
        setGraphVersionId(DEMO_GRAPH.graph_version_id);
        setRisk(DEMO_RISK);
        setRiskAnalysis(DEMO_ANALYSIS);
        setAlerts(DEMO_ALERTS);
        setAttackPathKeys((DEMO_ANALYSIS.attack_paths || []).map((p: any) => `${p.source}|${p.target}`));
      }
    };

    if (demoMode) {
      runGuidedDemo();
      return;
    }

    loadAll();
    const every = Number(process.env.NEXT_PUBLIC_GRAPH_POLL_SECONDS || 8) * 1000;
    const timer = setInterval(loadAll, every);
    return () => clearInterval(timer);
  }, [ready, demoMode]);

  const acknowledgeAlert = async (alertId: string) => {
    if (demoMode) {
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, state: 'acknowledged' } : a)));
      return;
    }
    const res = await api.post(`/alerts/${alertId}/acknowledge`);
    const updated = res.data?.alert;
    if (!updated) return;
    setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const resolveAlert = async (alertId: string) => {
    if (demoMode) {
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, state: 'resolved' } : a)));
      return;
    }
    const res = await api.post(`/alerts/${alertId}/resolve`);
    const updated = res.data?.alert;
    if (!updated) return;
    setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  if (!ready) return null;

  const toggleDemoMode = () => {
    const next = !demoMode;
    setDemoMode(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sg_demo_mode', next ? '1' : '0');
    }
  };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 flex flex-col gap-3 rounded-2xl border border-cyan-400/20 bg-slate-950/40 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-cyan-300">{demoMode ? 'Guided Demo Mode' : 'Live Analysis Mode'}</p>
          <p className="text-sm text-slate-300">
            {demoMode ? `Deterministic scenario: ${DEMO_STEPS[Math.min(demoStep, DEMO_STEPS.length - 1)]}` : 'Streaming latest graph intelligence and autonomous defense alerts.'}
          </p>
          {offlineFallback ? <p className="mt-1 text-xs text-amber-200">Offline fallback active: using seeded demo data.</p> : null}
        </div>
        <button
          onClick={toggleDemoMode}
          className="rounded-lg border border-cyan-400/40 px-4 py-2 text-sm text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-400/10"
        >
          {demoMode ? 'Exit Demo Mode' : 'Start Guided Demo'}
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-xl font-semibold">Identity Graph Intelligence</h2>
          {graphVersionId ? <p className="mb-2 text-xs text-slate-400">Graph Version: {graphVersionId}</p> : null}
          <div className="relative">
            <IdentityGraphScene nodes={nodes} edges={edges} onSelect={setSelectedNode} attackPathKeys={attackPathKeys} demoMode={demoMode} />
            {loadingScan ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/70 backdrop-blur-sm"
              >
                <div className="w-72 rounded-2xl border border-cyan-400/30 bg-black/40 p-4">
                  <p className="text-sm font-semibold text-cyan-200">Simulating Identity Scan</p>
                  <p className="mt-1 text-xs text-slate-300">{DEMO_STEPS[Math.min(demoStep, DEMO_STEPS.length - 1)]}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${((demoStep + 1) / DEMO_STEPS.length) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>
        <div className="space-y-4">
          <RiskPanel risk={risk} />
          <ThreatSimulationPanel analysis={riskAnalysis} />
          <NodeInspector node={selectedNode} />
        </div>
      </motion.div>
      <div className="mt-4">
        <AlertsPanel alerts={alerts} onAcknowledge={acknowledgeAlert} onResolve={resolveAlert} />
      </div>

      <section className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {[
          { label: 'Entities Mapped', value: `${nodes.length || 0}`, hint: 'Accounts, artifacts, images, repositories' },
          { label: 'Relationships', value: `${edges.length || 0}`, hint: 'Similarity and network links' },
          { label: 'Open Alerts', value: `${alerts.filter((a) => a.state !== 'resolved').length}`, hint: 'Pending operator action items' }
        ].map((metric) => (
          <motion.article
            key={metric.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-5"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-100">{metric.value}</p>
            <p className="mt-2 text-xs text-slate-300">{metric.hint}</p>
          </motion.article>
        ))}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Operator Runbook</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-100">Recommended Demo Sequence</h3>
          <div className="mt-5 space-y-3">
            {[
              'Start in Guided Demo Mode and explain deterministic seeded intelligence.',
              'Select suspicious nodes to open metadata and confidence indicators.',
              'Show risk analysis factors and attack path projection in context.',
              'Acknowledge and resolve alerts to demonstrate defense lifecycle.',
              'Switch to live mode to show backend-driven polling updates.'
            ].map((step, idx) => (
              <div key={step} className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-900/35 p-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-300/20 text-xs font-semibold text-cyan-100">
                  {idx + 1}
                </span>
                <p className="text-sm text-slate-200">{step}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Threat Lens</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-100">Attack Surface Breakdown</h3>
          <div className="mt-5 grid grid-cols-1 gap-3">
            {[
              { t: 'Username Impersonation', d: 'Near-match handles and typo-squatted aliases across social platforms.' },
              { t: 'Image Reuse Signals', d: 'Embedding similarity and profile image duplication on unknown nodes.' },
              { t: 'Stylometric Drift', d: 'Text pattern anomalies suggesting synthetic or copied writing behavior.' },
              { t: 'Cluster Outliers', d: 'Unexpected graph neighborhoods and suspicious connectivity spikes.' }
            ].map((item) => (
              <div key={item.t} className="rounded-xl border border-cyan-300/20 bg-black/25 p-4">
                <p className="text-sm font-semibold text-cyan-100">{item.t}</p>
                <p className="mt-1 text-xs text-slate-300">{item.d}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mt-8 pb-6">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-3xl p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Autonomous Defense</p>
          <h3 className="mt-3 text-3xl font-semibold text-slate-100">Actionable Playbooks, Not Just Alerts</h3>
          <p className="mt-4 max-w-4xl text-sm text-slate-300">
            ShadowGraph translates graph and AI outputs into immediate operator actions: report suspicious profiles, lock exposed accounts, enable MFA, and
            monitor high-risk propagation paths. This closes the loop from detection to mitigation.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              'Report suspicious account on source platform',
              'Enable MFA and rotate high-risk credentials',
              'Harden profile privacy and monitor clone vectors'
            ].map((action) => (
              <div key={action} className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-200">
                {action}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mt-8">
        <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Live Operations Timeline</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-100">End-To-End Identity Intelligence Cycle</h3>
            <div className="mt-5 space-y-3">
              {missionTimeline.map((step, idx) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-start gap-3 rounded-xl border border-cyan-300/20 bg-slate-900/35 p-3"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-300/20 text-xs font-semibold text-cyan-100">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-slate-200">{step}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Scan Confidence</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-100">Platform Coverage Meter</h3>
            <div className="mt-5 space-y-3">
              {[
                { p: 'GitHub', s: 94 },
                { p: 'LinkedIn', s: 97 },
                { p: 'X / Twitter', s: 89 },
                { p: 'Research Artifacts', s: 86 }
              ].map((item) => (
                <div key={item.p} className="rounded-xl border border-slate-700 bg-black/25 p-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                    <span>{item.p}</span>
                    <span className="text-cyan-200">{item.s}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.s}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7 }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Module Stack</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-100">Core Engines Active In This Session</h3>
          <div className="mt-5 grid grid-cols-1 gap-3">
            {analystModules.map((module) => (
              <div key={module.name} className="rounded-xl border border-cyan-300/20 bg-slate-900/35 p-4">
                <p className="text-sm font-semibold text-cyan-100">{module.name}</p>
                <p className="mt-1 text-xs text-slate-300">{module.detail}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Judge Walkthrough</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-100">60-Second High-Impact Demo</h3>
          <div className="mt-5 space-y-3">
            {[
              'Show graph center and click suspicious node metadata.',
              'Highlight risk panel factors and simulation attack paths.',
              'Demonstrate alert acknowledge and resolve transitions.',
              'Explain autonomous recommendations and real-world mitigation.',
              'Switch guided/live mode to show deterministic and realtime behavior.'
            ].map((line, idx) => (
              <div key={line} className="rounded-xl border border-slate-700 bg-black/25 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Stage {idx + 1}</p>
                <p className="mt-1 text-sm text-slate-200">{line}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mt-8 pb-12">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-3xl p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Impact Statement</p>
          <h3 className="mt-3 text-3xl font-semibold text-slate-100">Built To Protect Real Digital Lives</h3>
          <p className="mt-4 max-w-5xl text-sm text-slate-300">
            ShadowGraph addresses public impersonation risk where trust can be exploited at scale: recruitment scams, reputation hijacking, fake advisor
            profiles, and identity cloning across communities. The platform turns fragmented evidence into an explainable and actionable defense layer.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
            {[
              { k: 'Detection Speed', v: 'Real-time' },
              { k: 'Graph Explainability', v: 'High' },
              { k: 'Threat Coverage', v: 'Multi-vector' },
              { k: 'Response Readiness', v: 'Actionable' }
            ].map((card) => (
              <div key={card.k} className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">{card.k}</p>
                <p className="mt-2 text-lg font-semibold text-slate-100">{card.v}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </Layout>
  );
}
