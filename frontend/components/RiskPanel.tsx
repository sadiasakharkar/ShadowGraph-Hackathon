import { motion } from 'framer-motion';

export default function RiskPanel({ risk }: { risk: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4">
      <h3 className="mb-3 text-lg font-semibold">Threat Simulation Engine</h3>
      <div className="space-y-2 text-sm">
        <p>Identity Duplication: {(risk?.identity_duplication_probability ?? 0) * 100}%</p>
        <p>Content Misuse: {(risk?.content_misuse_probability ?? 0) * 100}%</p>
        <p>Deepfake Indicators: {(risk?.deepfake_risk_indicators ?? 0) * 100}%</p>
        <p>Network Anomaly: {(risk?.network_anomaly_signals ?? 0) * 100}%</p>
      </div>
      <p className="mt-4 text-xl font-semibold uppercase text-danger">{risk?.category ?? 'unknown'} risk</p>
      <p className="text-2xl font-bold text-neon">Score: {risk?.overall_risk_score ?? 0}</p>
    </motion.div>
  );
}
