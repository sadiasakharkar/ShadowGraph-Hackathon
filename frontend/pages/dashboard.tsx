import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import IdentityGraphScene from '../three-visualization/IdentityGraphScene';
import RiskPanel from '../components/RiskPanel';
import AlertsPanel from '../components/AlertsPanel';
import NodeInspector from '../components/NodeInspector';

export default function Dashboard() {
  const ready = useAuth();
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [risk, setRisk] = useState<any>({});
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [graphVersionId, setGraphVersionId] = useState<string>('');

  useEffect(() => {
    if (!ready) return;

    const loadAll = async () => {
      const [graphRes, riskRes, alertsRes] = await Promise.all([
        api.get('/graph/latest'),
        api.get('/api/identity/risk'),
        api.get('/api/alerts')
      ]);
      setNodes(graphRes.data.nodes || []);
      setEdges(graphRes.data.edges || []);
      setGraphVersionId(graphRes.data.graph_version_id || '');
      setRisk(riskRes.data.risk || {});
      setAlerts(alertsRes.data.alerts || []);
    };

    loadAll();
    const every = Number(process.env.NEXT_PUBLIC_GRAPH_POLL_SECONDS || 8) * 1000;
    const timer = setInterval(loadAll, every);
    return () => clearInterval(timer);
  }, [ready]);

  if (!ready) return null;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-xl font-semibold">Identity Graph Intelligence</h2>
          {graphVersionId ? <p className="mb-2 text-xs text-slate-400">Graph Version: {graphVersionId}</p> : null}
          <IdentityGraphScene nodes={nodes} edges={edges} onSelect={setSelectedNode} />
        </div>
        <div className="space-y-4">
          <RiskPanel risk={risk} />
          <NodeInspector node={selectedNode} />
        </div>
      </motion.div>
      <div className="mt-4">
        <AlertsPanel alerts={alerts} />
      </div>
    </Layout>
  );
}
