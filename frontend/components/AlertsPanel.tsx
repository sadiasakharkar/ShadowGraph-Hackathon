type AlertsPanelProps = {
  alerts: any[];
  onAcknowledge: (id: string) => Promise<void>;
  onResolve: (id: string) => Promise<void>;
};

const stateClass: Record<string, string> = {
  open: 'text-red-300',
  acknowledged: 'text-amber-300',
  resolved: 'text-emerald-300'
};

export default function AlertsPanel({ alerts, onAcknowledge, onResolve }: AlertsPanelProps) {
  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="mb-3 text-lg font-semibold">Autonomous Identity Defense</h3>
      <div className="space-y-3">
        {alerts?.length ? (
          alerts.map((a) => (
            <div key={a.id} className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-3">
              <p className="font-semibold text-neon">{a.title}</p>
              <p className="text-xs uppercase text-danger">Severity: {a.severity}</p>
              <p className={`text-xs uppercase ${stateClass[a.state] || 'text-slate-300'}`}>State: {a.state}</p>
              <p className="text-sm text-slate-200">{a.recommendation}</p>
              <div className="mt-2 flex gap-2">
                <button
                  className="rounded-md border border-amber-400/50 px-3 py-1 text-xs text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={a.state !== 'open'}
                  onClick={() => onAcknowledge(a.id)}
                >
                  Acknowledge
                </button>
                <button
                  className="rounded-md border border-emerald-400/50 px-3 py-1 text-xs text-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={a.state === 'resolved'}
                  onClick={() => onResolve(a.id)}
                >
                  Resolve
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-300">No active alerts.</p>
        )}
      </div>
    </div>
  );
}
