export default function NodeInspector({ node }: { node: any }) {
  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="mb-2 text-lg font-semibold">Identity Metadata</h3>
      {node ? (
        <>
          <p className="text-neon">{node.label}</p>
          <p className="text-sm text-slate-300">Type: {node.node_type}</p>
          <p className="text-sm text-slate-300">Suspicious: {String(node.suspicious)}</p>
          <p className="text-sm text-slate-300">Confidence: {node.confidence_score ?? 'n/a'}</p>
          <p className="text-sm text-slate-300">Source: {node.source ?? 'n/a'}</p>
          <p className="text-sm text-slate-300">Timestamp: {node.timestamp ?? 'n/a'}</p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-black/30 p-2 text-xs text-slate-200">
            {JSON.stringify(node.metadata || {}, null, 2)}
          </pre>
        </>
      ) : (
        <p className="text-sm text-slate-300">Click a node in the 3D graph.</p>
      )}
    </div>
  );
}
