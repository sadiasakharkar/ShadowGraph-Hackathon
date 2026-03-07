import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import IdentityGraphScene from '../three-visualization/IdentityGraphScene';
import RiskPanel from '../components/RiskPanel';
import AlertsPanel from '../components/AlertsPanel';
import NodeInspector from '../components/NodeInspector';
import ThreatSimulationPanel from '../components/ThreatSimulationPanel';

export default function Dashboard() {
  const ready = useAuth();
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [risk, setRisk] = useState<any>({});
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [graphVersionId, setGraphVersionId] = useState<string>('');
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null);
  const [attackPathKeys, setAttackPathKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!ready) return;

    const loadAll = async () => {
      const [graphRes, riskRes, alertsRes, analysisRes] = await Promise.all([
        api.get('/graph/latest'),
        api.get('/api/identity/risk'),
        api.get('/alerts'),
        api.get('/risk/analysis')
      ]);
      setNodes(graphRes.data.nodes || []);
      setEdges(graphRes.data.edges || []);
      setGraphVersionId(graphRes.data.graph_version_id || '');
      setRisk(riskRes.data.risk || {});
      setAlerts(alertsRes.data.alerts || []);
      const analysis = analysisRes.data?.analysis || null;
      setRiskAnalysis(analysis);
      setAttackPathKeys((analysis?.attack_paths || []).map((p: any) => `${p.source}|${p.target}`));
    };

    loadAll();
    const every = Number(process.env.NEXT_PUBLIC_GRAPH_POLL_SECONDS || 8) * 1000;
    const timer = setInterval(loadAll, every);
    return () => clearInterval(timer);
  }, [ready]);

  const acknowledgeAlert = async (alertId: string) => {
    const res = await api.post(`/alerts/${alertId}/acknowledge`);
    const updated = res.data?.alert;
    if (!updated) return;
    setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const resolveAlert = async (alertId: string) => {
    const res = await api.post(`/alerts/${alertId}/resolve`);
    const updated = res.data?.alert;
    if (!updated) return;
    setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  if (!ready) return null;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-xl font-semibold">Identity Graph Intelligence</h2>
          {graphVersionId ? <p className="mb-2 text-xs text-slate-400">Graph Version: {graphVersionId}</p> : null}
          <IdentityGraphScene nodes={nodes} edges={edges} onSelect={setSelectedNode} attackPathKeys={attackPathKeys} />
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
