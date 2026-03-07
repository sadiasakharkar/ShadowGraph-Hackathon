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
    </Layout>
  );
}
