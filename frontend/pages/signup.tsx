import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
 

export default function Signup() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const router = useRouter();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem('sg_token', `demo-${Date.now()}`);
    localStorage.setItem('sg_user_name', form.full_name || 'Demo User');
    localStorage.setItem('sg_user_email', form.email || 'demo@shadowgraph.ai');
    router.push('/setup');
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-20">
      <div className="particles pointer-events-none absolute inset-0 -z-20 opacity-90" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_26%,rgba(122,92,255,0.26),transparent_36%),radial-gradient(circle_at_80%_18%,rgba(46,230,255,0.2),transparent_34%),radial-gradient(circle_at_50%_86%,rgba(255,79,163,0.18),transparent_36%)]" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-6 px-5 py-6 md:px-10 lg:grid-cols-[1fr_1.2fr]"
      >
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, x: -24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="glass order-2 flex min-h-[78vh] flex-col justify-center rounded-[2rem] p-7 md:p-10 lg:order-1"
        >
          <div className="pointer-events-none absolute -left-20 top-8 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Create Identity</p>
          <h2 className="mt-2 text-4xl font-semibold text-slate-100">Create ShadowGraph Account</h2>

          <div className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-slate-300">Full Name</label>
              <input
                className="w-full rounded-2xl border border-slate-700/80 bg-black/35 px-4 py-3.5 text-slate-100 outline-none transition focus:border-cyan-300/60 focus:shadow-neon"
                placeholder="Your full name"
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
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
                placeholder="Create a strong password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.015, boxShadow: '0 0 28px rgba(46,230,255,0.4)' }}
            whileTap={{ scale: 0.99 }}
            className="mt-7 w-full rounded-2xl bg-neon px-4 py-3.5 font-semibold text-black transition"
          >
            Sign Up
          </motion.button>

          <p className="mt-7 text-center text-sm text-slate-300">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-300 transition hover:text-cyan-200">
              Login
            </Link>
          </p>
        </motion.form>

        <motion.section
          initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.08, ease: 'easeOut' }}
          className="glass relative order-1 hidden overflow-hidden rounded-[2rem] p-10 lg:order-2 lg:flex lg:flex-col lg:justify-between"
        >
          <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-pink-400/15 blur-3xl" />
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Cyber Identity Onboarding</p>
            <h1 className="mt-6 text-5xl font-semibold leading-tight text-slate-100">Build Your Digital Twin Profile</h1>
            <p className="mt-5 max-w-xl text-slate-300">
              Full-screen onboarding flow designed for cinematic cybersecurity identity intelligence.
            </p>
          </div>
          <div className="mt-10 space-y-3 text-sm text-slate-300">
            <p className="rounded-2xl border border-cyan-300/20 bg-slate-950/45 px-4 py-4">Aggregate public identity signals</p>
            <p className="rounded-2xl border border-cyan-300/20 bg-slate-950/45 px-4 py-4">Map network clusters and risk correlations</p>
            <p className="rounded-2xl border border-cyan-300/20 bg-slate-950/45 px-4 py-4">Activate autonomous defense playbooks</p>
          </div>
        </motion.section>
      </motion.div>

      <section className="mx-auto mt-8 max-w-7xl px-5 md:px-10">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-3xl p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Onboarding Flow</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-100">Identity Twin Creation Journey</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              { t: 'Profile Seed', d: 'Start with a minimal identity anchor.' },
              { t: 'Signal Discovery', d: 'Collect public account and artifact metadata.' },
              { t: 'Graph Mapping', d: 'Generate linked identity topology snapshots.' },
              { t: 'Defense Activation', d: 'Produce alerts and recommendations.' }
            ].map((x) => (
              <div key={x.t} className="rounded-xl border border-slate-700 bg-slate-900/35 p-4">
                <p className="text-sm font-semibold text-cyan-100">{x.t}</p>
                <p className="mt-1 text-xs text-slate-300">{x.d}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl px-5 md:px-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            'No OAuth friction in demo mode: fast sign-up for hackathon walkthrough.',
            'Immediately route to setup where scans and graph generation begin.',
            'Use guided data path for deterministic graph output in presentations.',
            'Transition to dashboard to show risk scoring and alert lifecycle.'
          ].map((line, i) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-4"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Flow Block {i + 1}</p>
              <p className="mt-2 text-sm text-slate-200">{line}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
