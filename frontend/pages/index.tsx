import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

const LandingGraphScene = dynamic(() => import('../three-visualization/LandingGraphScene'), { ssr: false });

const graphNodes = [
  { id: 'root', label: 'You (Digital Twin Core)', node_type: 'identity', trusted: true, confidence: 0.99 },
  { id: 'linkedin', label: 'LinkedIn Profile', node_type: 'social', trusted: true, confidence: 0.97 },
  { id: 'github', label: 'GitHub Account', node_type: 'repository', trusted: true, confidence: 0.94 },
  { id: 'arxiv', label: 'Research Paper', node_type: 'research', trusted: true, confidence: 0.9 },
  { id: 'avatar', label: 'Profile Image', node_type: 'image', trusted: true, confidence: 0.96 },
  { id: 'fake', label: 'sadia.sakharkarr', node_type: 'social', suspicious: true, confidence: 0.82 },
  { id: 'ig', label: 'Instagram Profile', node_type: 'social', trusted: false, confidence: 0.75 },
  { id: 'x', label: 'X Profile', node_type: 'social', trusted: true, confidence: 0.88 }
];

const graphEdges = [
  { source: 'root', target: 'linkedin', relation: 'profile_link' },
  { source: 'root', target: 'github', relation: 'ownership' },
  { source: 'root', target: 'arxiv', relation: 'citation' },
  { source: 'root', target: 'avatar', relation: 'image_similarity' },
  { source: 'root', target: 'x', relation: 'username_similarity' },
  { source: 'fake', target: 'root', relation: 'impersonation_vector', suspicious: true },
  { source: 'fake', target: 'avatar', relation: 'image_reuse', suspicious: true },
  { source: 'ig', target: 'root', relation: 'network_neighbor' }
];

const features = [
  {
    title: 'Digital Identity Twin',
    body: 'AI reconstructs your online presence into a living identity graph.'
  },
  {
    title: 'Identity Graph Intelligence',
    body: 'Graph algorithms detect suspicious identity clusters and unusual link patterns.'
  },
  {
    title: 'AI Identity Fingerprinting',
    body: 'Face embeddings and stylometric signatures expose impersonation attempts.'
  },
  {
    title: 'Threat Simulation Engine',
    body: 'Simulates spread paths of fake profiles across real-world trust networks.'
  },
  {
    title: 'Autonomous Identity Defense',
    body: 'Generates tactical recommendations and response actions in real time.'
  }
];

export default function Home() {
  const router = useRouter();
  const [hoverNode, setHoverNode] = useState<any | null>(null);
  const [launching, setLaunching] = useState(false);
  const [attackPhase, setAttackPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setAttackPhase((p) => (p + 1) % 4), 1800);
    return () => clearInterval(timer);
  }, []);

  const launchScan = () => {
    setLaunching(true);
    setTimeout(() => router.push('/setup'), 650);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-20">
      <div className="particles pointer-events-none absolute inset-0 -z-10" />

      <header className="fixed left-0 right-0 top-0 z-40 mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
        <div className="glass rounded-xl px-4 py-2 text-sm tracking-[0.3em] text-neon">SHADOWGRAPH</div>
        <nav className="glass flex items-center gap-4 rounded-xl px-4 py-2 text-sm text-slate-200">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/login">Login</Link>
        </nav>
      </header>

      <section className="relative flex min-h-screen items-center pt-16">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-5 md:px-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            <p className="mb-4 inline-block rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
              AI Digital Twin & Identity Intelligence Platform
            </p>
            <h1 className="text-5xl font-semibold leading-tight md:text-7xl">
              ShadowGraph
              <span className="block bg-gradient-to-r from-cyan-200 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Build Your Digital Twin.
              </span>
              <span className="block text-slate-100">Defend Your Identity Across the Internet.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-300">
              An AI-powered platform that maps, analyzes, and protects your digital identity before threats emerge.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={launchScan}
                className="rounded-xl border border-cyan-300 bg-cyan-300 px-6 py-3 font-semibold text-slate-950 transition hover:scale-[1.03] hover:shadow-neon"
              >
                Start Identity Scan
              </button>
              <button
                onClick={() => document.getElementById('visual-preview')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-xl border border-cyan-300/45 bg-slate-950/40 px-6 py-3 text-cyan-200 transition hover:shadow-neon"
              >
                Explore the Demo
              </button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="glass h-[520px] overflow-hidden rounded-3xl">
            <LandingGraphScene nodes={graphNodes} edges={graphEdges} />
          </motion.div>
        </div>
      </section>

      <section id="visual-preview" className="mx-auto mt-10 max-w-7xl px-5 md:px-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: -40 }} viewport={{ once: true }} className="glass h-[440px] rounded-3xl">
            <LandingGraphScene nodes={graphNodes} edges={graphEdges} interactive onNodeHover={setHoverNode} />
          </motion.div>
          <motion.div whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: 40 }} viewport={{ once: true }} className="flex flex-col justify-center">
            <h2 className="text-3xl font-semibold">Identity Visualization Preview</h2>
            <p className="mt-4 text-slate-300">
              ShadowGraph reconstructs your online presence using AI. Every account, image, and digital artifact becomes part of your identity graph.
            </p>
            <div className="mt-5 space-y-3">
              <div className="glass rounded-xl p-3">LinkedIn Profile - Confidence: 97%</div>
              <div className="glass rounded-xl p-3">GitHub Account - Confidence: 94%</div>
              <div className="glass rounded-xl p-3 text-red-300">Suspicious Mirror Node - Confidence: 82%</div>
            </div>
            <div className="mt-5 rounded-xl border border-cyan-300/25 bg-black/30 p-3 text-sm text-cyan-100">
              {hoverNode ? `${hoverNode.label} | ${Math.round((hoverNode.confidence || 0.9) * 100)}% confidence` : 'Hover a node to reveal identity metadata.'}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-7xl px-5 md:px-10">
        <h2 className="text-3xl font-semibold">Threat Simulation Engine</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="glass relative h-[320px] overflow-hidden rounded-3xl p-5">
            <div className="absolute left-8 top-20 h-4 w-4 rounded-full bg-cyan-300 shadow-neon" />
            <div className="absolute left-[180px] top-14 h-4 w-4 rounded-full bg-cyan-300 shadow-neon" />
            <motion.div
              animate={{ opacity: attackPhase >= 1 ? 1 : 0, scale: attackPhase >= 1 ? 1 : 0.7 }}
              className="absolute left-[120px] top-[170px] h-5 w-5 rounded-full bg-danger shadow-danger"
            />
            <motion.div
              animate={{ opacity: attackPhase >= 2 ? 1 : 0 }}
              className="absolute left-[86px] top-[145px] h-px w-[65px] bg-danger"
            />
            <motion.div
              animate={{ opacity: attackPhase >= 2 ? 1 : 0 }}
              className="absolute left-[138px] top-[146px] h-px w-[58px] rotate-[24deg] bg-danger"
            />
            <motion.p animate={{ opacity: attackPhase >= 1 ? 1 : 0 }} className="absolute left-[102px] top-[200px] text-sm text-red-200">
              sadia.sakharkarr
            </motion.p>
            <motion.p animate={{ opacity: attackPhase >= 1 ? 1 : 0 }} className="absolute left-5 top-5 text-red-300">
              Possible Impersonation Detected
            </motion.p>
            <motion.p animate={{ opacity: attackPhase === 3 ? 1 : 0 }} className="absolute bottom-5 left-5 text-cyan-200">
              Threat Neutralized.
            </motion.p>
          </div>
          <div className="glass rounded-3xl p-5 text-slate-200">
            <p className="text-lg text-cyan-200">Simulated attack propagation:</p>
            <p className="mt-3">Fake LinkedIn profile -> recruiter network</p>
            <p>Fake Instagram account -> follower network</p>
            <p className="mt-5 text-sm text-slate-300">
              ShadowGraph predicts spread paths from suspicious nodes, quantifies impact, and initiates autonomous containment actions.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-7xl px-5 md:px-10">
        <h2 className="text-3xl font-semibold">Core Capability Stack</h2>
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((f) => (
            <motion.article
              key={f.title}
              whileHover={{ rotateX: -3, rotateY: 4, y: -6 }}
              transition={{ type: 'spring', stiffness: 180, damping: 16 }}
              className="glass rounded-2xl p-5 [transform-style:preserve-3d]"
            >
              <div className="mb-4 h-1.5 w-16 rounded bg-gradient-to-r from-cyan-300 to-indigo-400" />
              <h3 className="text-xl font-semibold text-cyan-100">{f.title}</h3>
              <p className="mt-2 text-slate-300">{f.body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-7xl px-5 md:px-10">
        <h2 className="text-3xl font-semibold">The Control Center</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="glass rounded-3xl p-4">
            <div className="h-[280px] rounded-2xl border border-cyan-300/20 bg-black/30">
              <LandingGraphScene nodes={graphNodes.slice(0, 6)} edges={graphEdges.slice(0, 6)} />
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Digital Identity Risk Score</p>
            <div className="mt-3 text-4xl font-semibold">34 / 100</div>
            <div className="mt-4 h-3 w-full overflow-hidden rounded bg-slate-800">
              <motion.div initial={{ width: 0 }} whileInView={{ width: '34%' }} viewport={{ once: true }} className="h-full bg-gradient-to-r from-cyan-300 to-indigo-500" />
            </div>
            <div className="mt-6 space-y-2 text-slate-300">
              <p>Impersonation Risk: <span className="text-amber-300">Medium</span></p>
              <p>Content Misuse Risk: <span className="text-emerald-300">Low</span></p>
              <p>Deepfake Risk: <span className="text-emerald-300">Low</span></p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-5xl px-5 text-center md:px-10">
        <h2 className="text-3xl font-semibold">Digital Identity Intelligence</h2>
        <p className="mt-5 text-lg text-slate-300">
          Every day, millions of identities are copied, impersonated, and manipulated online. ShadowGraph combines AI, graph analytics, and cybersecurity to transform fragmented digital footprints into a protected and intelligent identity system.
        </p>
      </section>

      <section className="mx-auto mt-24 max-w-4xl px-5 pb-16 text-center md:px-10">
        <div className="glass rounded-3xl p-10">
          <h2 className="text-4xl font-semibold">See Your Digital Identity Like Never Before.</h2>
          <button onClick={launchScan} className="mt-8 rounded-xl bg-cyan-300 px-8 py-4 font-semibold text-slate-950 transition hover:scale-[1.03] hover:shadow-neon">
            Launch Identity Scan
          </button>
        </div>
      </section>

      {launching ? (
        <motion.div
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.1 }}
          className="pointer-events-none fixed inset-0 z-50 bg-[radial-gradient(circle,_rgba(43,228,255,0.45),_rgba(4,7,15,0.98)_50%)]"
        />
      ) : null}
    </div>
  );
}
