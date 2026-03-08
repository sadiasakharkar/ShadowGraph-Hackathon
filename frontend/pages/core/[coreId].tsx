import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import { CORE_PLAYBOOKS } from '../../services/corePlaybooks';

export default function CoreDemoPage() {
  const router = useRouter();
  const coreId = String(router.query.coreId || '').toLowerCase();
  const core = CORE_PLAYBOOKS[coreId];

  if (!core) {
    return (
      <Layout>
        <div className="glass rounded-3xl p-8 text-center">
          <h2 className="text-3xl font-semibold">Module Not Found</h2>
          <p className="mt-3 text-slate-300">This demo module does not exist.</p>
          <Link href="/setup" className="mt-6 inline-block rounded-xl border border-cyan-300/50 px-5 py-2 text-cyan-200">
            Back To Setup
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="particles pointer-events-none absolute inset-0 -z-10 opacity-70" />
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">{core.tag} Module Demo</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-100">{core.title}</h1>
        <p className="mt-3 max-w-4xl text-slate-300">{core.summary}</p>
        <p className="mt-2 max-w-4xl text-sm text-slate-400">Mission: {core.mission}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard?demo=1" className="rounded-xl bg-neon px-5 py-2.5 text-sm font-semibold text-black transition hover:shadow-neon">
            Launch Guided Dashboard Demo
          </Link>
          <Link href="/setup" className="rounded-xl border border-cyan-300/45 bg-black/30 px-5 py-2.5 text-sm text-cyan-100">
            Back To Core Modules
          </Link>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {core.liveSignals.map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-4"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{item.label}</p>
            <p className="mt-2 text-sm text-slate-100">{item.value}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500" style={{ width: `${item.confidence}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-300">Confidence: {item.confidence}%</p>
          </motion.div>
        ))}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Threat Representation</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-100">Simulation Flow</h3>
          <div className="mt-5 space-y-3">
            {core.threatFlow.map((step, idx) => (
              <div key={step} className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-900/40 p-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-400/20 text-xs font-semibold text-red-200">
                  {idx + 1}
                </span>
                <p className="text-sm text-slate-200">{step}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Risk Telemetry</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-100">Live Module Metrics</h3>
          <div className="mt-5 space-y-3">
            {core.kpis.map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-slate-700 bg-black/25 p-3">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                  <span>{kpi.label}</span>
                  <span className="text-cyan-200">{kpi.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${kpi.score}%` }} viewport={{ once: true }} className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mt-8 pb-6">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Defense Output</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-100">Alerts and Playbooks</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-red-400/25 bg-red-400/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-red-200">Active Alert</p>
              {core.alerts.map((alert) => (
                <p key={alert} className="mt-2 text-sm text-slate-200">
                  • {alert}
                </p>
              ))}
            </div>
            <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Recommended Actions</p>
              {core.playbooks.map((item) => (
                <p key={item} className="mt-2 text-sm text-slate-200">
                  • {item}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </Layout>
  );
}
