export default function ThreatSimulationPanel({ analysis }: { analysis: any }) {
  if (!analysis) {
    return (
      <div className="glass rounded-2xl p-4">
        <h3 className="mb-2 text-lg font-semibold">Threat Simulation Engine</h3>
        <p className="text-sm text-slate-300">No simulation available yet.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="mb-2 text-lg font-semibold">Threat Simulation Engine</h3>
      <p className="text-sm text-slate-300">Attack Likelihood: {(analysis.attack_likelihood * 100).toFixed(1)}%</p>
      <p className="text-sm text-slate-300">Blast Radius: {(analysis.blast_radius * 100).toFixed(1)}%</p>
      <p className="text-sm text-danger">Risk Score: {analysis.overall_risk_score}</p>

      <div className="mt-3 space-y-2 text-sm">
        {(analysis.scenarios || []).map((s: any) => (
          <div key={s.type} className="rounded-xl border border-red-500/25 bg-black/30 p-2">
            <p className="font-semibold text-red-300">{s.type.replaceAll('_', ' ')}</p>
            <p>Scenario Risk: {s.risk_score}</p>
            <p>Affected: {(s.affected_nodes || []).slice(0, 3).join(', ') || 'none'}</p>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <p className="text-sm font-semibold text-neon">Recommended Actions</p>
        <ul className="mt-1 list-disc pl-5 text-xs text-slate-300">
          {(analysis.recommended_actions || []).slice(0, 5).map((r: string) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
