import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function Setup() {
  const ready = useAuth();
  const [username, setUsername] = useState('demoanalyst');
  const [status, setStatus] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['github', 'x', 'linkedin']);
  const [scanDepth, setScanDepth] = useState<'standard' | 'deep'>('standard');
  const router = useRouter();
  const coreRoutes: Record<string, string> = {
    'CORE-01': 'core-01',
    'CORE-02': 'core-02',
    'CORE-03': 'core-03',
    'CORE-04': 'core-04',
    'CORE-05': 'core-05',
    'CORE-06': 'core-06'
  };

  if (!ready) return null;

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) => (prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]));
  };

  const runScan = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('Building digital identity twin...');
    try {
      await api.post('/api/identity/scan', {
        root_username: username,
        seed_platforms: platforms.length ? platforms : ['github', 'x', 'linkedin'],
        scan_depth: scanDepth
      });
      setStatus('Scan complete. Opening dashboard...');
    } catch {
      // Demo fallback when backend is unavailable.
      setStatus('Backend unavailable. Opening dashboard in demo mode...');
      if (typeof window !== 'undefined') {
        localStorage.setItem('sg_demo_mode', '1');
      }
    }
    setTimeout(() => router.push('/dashboard'), 800);
  };

  return (
    <Layout>
      <div className="relative overflow-hidden rounded-3xl pb-6">
        <div className="particles pointer-events-none absolute inset-0 -z-10 opacity-70" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <motion.form
            onSubmit={runScan}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-6 md:p-8"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Identity Twin Bootstrap</p>
            <h2 className="mt-2 text-3xl font-semibold">Initialize Your Command Profile</h2>
            <p className="mt-3 text-sm text-slate-300">
              Configure scan parameters and launch identity intelligence mapping across public networks.
            </p>

            <div className="mt-6">
              <label className="mb-2 block text-xs uppercase tracking-wider text-slate-300">Anchor Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-black/35 p-3 outline-none transition focus:border-cyan-300/60 focus:shadow-neon"
                placeholder="Primary username"
              />
            </div>

            <div className="mt-6">
              <p className="mb-2 text-xs uppercase tracking-wider text-slate-300">Target Platforms</p>
              <div className="flex flex-wrap gap-2">
                {['github', 'x', 'linkedin', 'instagram', 'medium', 'reddit'].map((platform) => {
                  const active = platforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`rounded-lg border px-3 py-2 text-xs uppercase tracking-wider transition ${
                        active
                          ? 'border-cyan-300 bg-cyan-300/20 text-cyan-100 shadow-neon'
                          : 'border-slate-600 bg-slate-900/40 text-slate-300 hover:border-cyan-300/40'
                      }`}
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-2 text-xs uppercase tracking-wider text-slate-300">Scan Depth</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScanDepth('standard')}
                  className={`rounded-xl border p-3 text-left transition ${
                    scanDepth === 'standard' ? 'border-cyan-300 bg-cyan-300/15' : 'border-slate-700 bg-slate-900/40'
                  }`}
                >
                  <p className="text-sm font-semibold">Standard</p>
                  <p className="mt-1 text-xs text-slate-300">Fast scan for demo-speed startup</p>
                </button>
                <button
                  type="button"
                  onClick={() => setScanDepth('deep')}
                  className={`rounded-xl border p-3 text-left transition ${
                    scanDepth === 'deep' ? 'border-cyan-300 bg-cyan-300/15' : 'border-slate-700 bg-slate-900/40'
                  }`}
                >
                  <p className="text-sm font-semibold">Deep</p>
                  <p className="mt-1 text-xs text-slate-300">Extended relationship and anomaly probing</p>
                </button>
              </div>
            </div>

            <button className="mt-7 w-full rounded-xl bg-neon p-3 font-semibold text-black transition hover:scale-[1.01] hover:shadow-neon">
              Launch Identity Scan
            </button>
            {status ? <p className="mt-4 text-sm text-neon">{status}</p> : null}
          </motion.form>

          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-3xl p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Live Pipeline</p>
              <div className="mt-4 space-y-3">
                {[
                  'Signal ingestion adapters primed',
                  'Graph schema ready in Neo4j',
                  'AI fingerprinting endpoints active',
                  'Threat simulation and defense engines armed'
                ].map((line, i) => (
                  <div key={line} className="rounded-lg border border-cyan-300/20 bg-slate-950/45 px-3 py-2 text-xs text-slate-200">
                    {i + 1}. {line}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 }} className="glass rounded-3xl p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Expected Output</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-slate-700 bg-slate-900/45 p-3">
                  <p className="text-xl font-semibold text-cyan-100">150+</p>
                  <p className="text-xs text-slate-300">Identity signals</p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-900/45 p-3">
                  <p className="text-xl font-semibold text-cyan-100">40+</p>
                  <p className="text-xs text-slate-300">Graph entities</p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-900/45 p-3">
                  <p className="text-xl font-semibold text-cyan-100">3</p>
                  <p className="text-xs text-slate-300">Threat scenarios</p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-900/45 p-3">
                  <p className="text-xl font-semibold text-cyan-100">Real-time</p>
                  <p className="text-xs text-slate-300">Defense actions</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <section className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {[
          { title: 'Digital Twin Engine', body: 'Aggregates identity signals into a unified intelligence profile.', tag: 'CORE-01' },
          { title: 'Graph Intelligence', body: 'Builds relationship topology across accounts, media, posts, and artifacts.', tag: 'CORE-02' },
          { title: 'AI Fingerprinting', body: 'Scores username, image, and text similarity with anomaly detection overlays.', tag: 'CORE-03' },
          { title: 'Threat Simulation', body: 'Projects attack spread paths and quantifies blast radius.', tag: 'CORE-04' },
          { title: 'Autonomous Defense', body: 'Creates actionable response playbooks with lifecycle tracking.', tag: 'CORE-05' },
          { title: 'Realtime Command UX', body: 'Cinematic dashboard designed for analyst-grade situational awareness.', tag: 'CORE-06' }
        ].map((item, idx) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.04 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="glass rounded-2xl p-5"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{item.tag}</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-100">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{item.body}</p>
            <Link
              href={`/core/${coreRoutes[item.tag] || 'core-01'}`}
              className="mt-4 inline-block rounded-lg border border-cyan-300/40 bg-black/25 px-3 py-2 text-xs uppercase tracking-[0.14em] text-cyan-100 transition hover:shadow-neon"
            >
              Open Module Demo
            </Link>
          </motion.article>
        ))}
      </section>

      <section className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-6"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Pipeline Timeline</p>
          <div className="mt-5 space-y-4">
            {[
              'Collect public identity signals',
              'Normalize and score confidence',
              'Generate graph snapshot version',
              'Run AI similarity + anomaly models',
              'Compute threat simulation metrics',
              'Emit defense alerts and recommendations'
            ].map((step, i) => (
              <div key={step} className="flex items-start gap-3">
                <div className="mt-0.5 h-6 w-6 rounded-full bg-cyan-300/20 text-center text-xs font-semibold leading-6 text-cyan-100">{i + 1}</div>
                <p className="text-sm text-slate-200">{step}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-6"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">AI Layer Breakdown</p>
          <div className="mt-5 grid grid-cols-1 gap-3">
            <div className="rounded-xl border border-slate-700 bg-slate-900/45 p-4">
              <p className="text-sm font-semibold text-slate-100">Username Similarity</p>
              <p className="mt-1 text-xs text-slate-300">Detects near-match impersonation aliases and typo-squatted handles.</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/45 p-4">
              <p className="text-sm font-semibold text-slate-100">Image Identity</p>
              <p className="mt-1 text-xs text-slate-300">Uses embedding similarity for profile image reuse and clone detection.</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/45 p-4">
              <p className="text-sm font-semibold text-slate-100">Stylometric Text</p>
              <p className="mt-1 text-xs text-slate-300">Compares writing style features to identify account-level mimicry.</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/45 p-4">
              <p className="text-sm font-semibold text-slate-100">Anomaly Detection</p>
              <p className="mt-1 text-xs text-slate-300">Flags suspicious identity clusters with outlier scoring.</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-6 md:p-8"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Hackathon Impact Narrative</p>
          <h3 className="mt-3 text-3xl font-semibold text-slate-100">Why This Matters In Real Life</h3>
          <p className="mt-4 max-w-4xl text-slate-300">
            Identity abuse is no longer only about stolen passwords. Attackers clone usernames, reuse profile photos, mimic writing style, and build trust
            through fake social presence. ShadowGraph gives users and analysts a unified, explainable command center to see these risks before major harm
            occurs.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { k: 'Impersonation', v: 'Early detection of fake account vectors' },
              { k: 'Reputation', v: 'Protection of public digital identity trust' },
              { k: 'Response', v: 'Actionable defense playbooks, not just alerts' },
              { k: 'Clarity', v: 'Graph-native explainability for decisions' }
            ].map((x) => (
              <div key={x.k} className="rounded-xl border border-cyan-300/20 bg-black/30 p-4">
                <p className="text-sm font-semibold text-cyan-100">{x.k}</p>
                <p className="mt-1 text-xs text-slate-300">{x.v}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-6"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Live Threat Storyboard</p>
          <h4 className="mt-3 text-2xl font-semibold text-slate-100">How A Fake Identity Attack Unfolds</h4>
          <div className="mt-5 space-y-3">
            {[
              'Clone username appears on a secondary platform.',
              'Reused profile image is detected with high embedding similarity.',
              'Stylometric model spots writing-style mimicry in outbound messages.',
              'Risk engine projects spread path into recruiter and collaborator networks.',
              'Autonomous defense module raises response playbook and prioritizes action.'
            ].map((event, idx) => (
              <div key={event} className="rounded-xl border border-slate-700/80 bg-slate-950/40 p-3">
                <p className="text-xs uppercase tracking-wider text-cyan-200">Phase {idx + 1}</p>
                <p className="mt-1 text-sm text-slate-200">{event}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-6"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Command KPIs</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { label: 'Graph Refresh Time', value: '< 3s', tone: 'text-cyan-100' },
              { label: 'Signal Confidence Avg', value: '92%', tone: 'text-emerald-100' },
              { label: 'Impersonation Match', value: '0.87', tone: 'text-rose-100' },
              { label: 'Alert Triage Speed', value: 'Real-time', tone: 'text-violet-100' },
              { label: 'Scan Coverage', value: 'Multi-platform', tone: 'text-sky-100' },
              { label: 'Defense Automation', value: 'Enabled', tone: 'text-lime-100' }
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-cyan-300/20 bg-black/25 p-4">
                <p className={`text-xl font-semibold ${kpi.tone}`}>{kpi.value}</p>
                <p className="mt-1 text-xs text-slate-300">{kpi.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-cyan-300/25 bg-cyan-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Judge Demo Tip</p>
            <p className="mt-1 text-sm text-slate-200">
              Start with Guided Demo for deterministic graph behavior, then switch to Live Dashboard to show real scan flow.
            </p>
          </div>
        </motion.div>
      </section>

      <section className="mt-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-6 md:p-8"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">System Deep Dive</p>
          <h4 className="mt-3 text-3xl font-semibold text-slate-100">Why ShadowGraph Stands Out In Hackathons</h4>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                title: 'End-to-End Identity Intelligence',
                body: 'From signal ingestion to graph construction to autonomous defense, every layer is integrated and demo-ready.'
              },
              {
                title: 'Explainable Risk Engine',
                body: 'Risk output is transparent with factors, affected nodes, and playbooks instead of opaque black-box scoring.'
              },
              {
                title: 'Cinematic Command UX',
                body: 'A graph-first interface with motion and depth creates immediate “wow” while preserving analytical clarity.'
              },
              {
                title: 'Real Threat Focus',
                body: 'Directly addresses impersonation, deepfake-adjacent profile cloning, and trust exploitation in public networks.'
              }
            ].map((block) => (
              <div key={block.title} className="rounded-2xl border border-slate-700 bg-slate-900/35 p-5">
                <h5 className="text-lg font-semibold text-slate-100">{block.title}</h5>
                <p className="mt-2 text-sm text-slate-300">{block.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mt-10 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 text-center"
        >
          <h3 className="text-3xl font-semibold text-slate-100">Ready To Enter The Command Dashboard?</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300">
            Launch your scan now or jump directly to guided demo mode for a deterministic presentation flow.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={() => router.push('/dashboard')} className="rounded-xl border border-cyan-300/45 bg-cyan-300/15 px-6 py-3 text-sm font-semibold text-cyan-100 transition hover:shadow-neon">
              Open Live Dashboard
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') localStorage.setItem('sg_demo_mode', '1');
                router.push('/dashboard?demo=1');
              }}
              className="rounded-xl border border-violet-300/45 bg-violet-300/10 px-6 py-3 text-sm font-semibold text-violet-100 transition hover:shadow-neon"
            >
              Open Guided Demo
            </button>
          </div>
        </motion.div>
      </section>
    </Layout>
  );
}
