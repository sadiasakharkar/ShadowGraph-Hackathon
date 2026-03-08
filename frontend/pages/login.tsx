import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const router = useRouter();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem('sg_token', `demo-${Date.now()}`);
    localStorage.setItem('sg_user_email', form.email || 'demo@shadowgraph.ai');
    router.push('/setup');
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-20">
      <div className="particles pointer-events-none absolute inset-0 -z-20 opacity-90" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(46,230,255,0.22),transparent_34%),radial-gradient(circle_at_76%_22%,rgba(122,92,255,0.26),transparent_40%),radial-gradient(circle_at_50%_88%,rgba(255,79,163,0.18),transparent_36%)]" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-6 px-5 py-6 md:px-10 lg:grid-cols-[1.2fr_1fr]"
      >
        <motion.section
          initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="glass relative hidden overflow-hidden rounded-[2rem] p-10 lg:flex lg:flex-col lg:justify-between"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-12 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">ShadowGraph Access</p>
            <h1 className="mt-6 text-5xl font-semibold leading-tight text-slate-100">Enter The Identity Command Center</h1>
            <p className="mt-5 max-w-xl text-slate-300">
              Filmic authentication interface for identity intelligence operations. Sign in to monitor threat vectors and digital twin integrity.
            </p>
          </div>
          <div className="mt-10 space-y-3 text-sm text-slate-300">
            <p className="rounded-2xl border border-cyan-300/20 bg-slate-950/45 px-4 py-4">Real-time identity graph telemetry</p>
            <p className="rounded-2xl border border-cyan-300/20 bg-slate-950/45 px-4 py-4">Autonomous defense alert lifecycle</p>
            <p className="rounded-2xl border border-cyan-300/20 bg-slate-950/45 px-4 py-4">Threat simulation and propagation analytics</p>
          </div>
        </motion.section>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, x: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.08, ease: 'easeOut' }}
          className="glass relative flex min-h-[78vh] flex-col justify-center rounded-[2rem] p-7 md:p-10"
        >
          <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-cyan-300/15" />
          <div className="pointer-events-none absolute -right-16 top-8 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Welcome Back</p>
          <h2 className="mt-2 text-4xl font-semibold text-slate-100">Login</h2>

          <div className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-slate-300">Email</label>
              <input
                className="w-full rounded-2xl border border-slate-700/80 bg-black/35 px-4 py-3.5 text-slate-100 outline-none transition focus:border-cyan-300/60 focus:shadow-neon"
                placeholder="you@domain.com"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-slate-300">Password</label>
              <input
                type="password"
                className="w-full rounded-2xl border border-slate-700/80 bg-black/35 px-4 py-3.5 text-slate-100 outline-none transition focus:border-cyan-300/60 focus:shadow-neon"
                placeholder="Your password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.015, boxShadow: '0 0 28px rgba(46,230,255,0.4)' }}
            whileTap={{ scale: 0.99 }}
            className="mt-7 w-full rounded-2xl bg-neon px-4 py-3.5 font-semibold text-black transition"
          >
            Login
          </motion.button>

          <p className="mt-7 text-center text-sm text-slate-300">
            New to ShadowGraph?{' '}
            <Link href="/signup" className="text-cyan-300 transition hover:text-cyan-200">
              Create an account
            </Link>
          </p>
        </motion.form>
      </motion.div>

      <section className="mx-auto mt-8 max-w-7xl px-5 md:px-10">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-3xl p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Mission Context</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-100">Why Login Matters For Identity Intelligence</h2>
          <p className="mt-4 max-w-4xl text-slate-300">
            ShadowGraph session context links scan events, graph versions, and defense actions to a single operator workflow. This enables rapid triage,
            reproducible demos, and clear decision traces during hackathon judging.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { title: 'Session-scoped scans', body: 'Track each identity scan run and response sequence.' },
              { title: 'Risk continuity', body: 'Keep risk posture changes visible as graph updates stream in.' },
              { title: 'Defense lifecycle', body: 'Move alerts across open, acknowledged, resolved states quickly.' }
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                <p className="text-sm font-semibold text-cyan-100">{item.title}</p>
                <p className="mt-2 text-xs text-slate-300">{item.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl px-5 md:px-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            'Sign in and start identity setup in under 30 seconds.',
            'Run guided demo mode for deterministic judge presentation.',
            'Switch to live mode to show backend-connected intelligence.',
            'Walk through risk factors and recommended defense playbooks.'
          ].map((line, i) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-4"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Demo Step {i + 1}</p>
              <p className="mt-2 text-sm text-slate-200">{line}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
