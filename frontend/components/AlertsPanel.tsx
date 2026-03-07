export default function AlertsPanel({ alerts }: { alerts: any[] }) {
  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="mb-3 text-lg font-semibold">Autonomous Identity Defense</h3>
      <div className="space-y-3">
        {alerts?.length ? (
          alerts.map((a, idx) => (
            <div key={idx} className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-3">
              <p className="font-semibold text-neon">{a.title}</p>
              <p className="text-xs uppercase text-danger">Severity: {a.severity}</p>
              <p className="text-sm text-slate-200">{a.recommendation}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-300">No active alerts.</p>
        )}
      </div>
    </div>
  );
}
