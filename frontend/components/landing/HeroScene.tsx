'use client';

import { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import GlowButton from '../ui/GlowButton';
import ParticleField from './ParticleField';
import FloatingNodes from './FloatingNodes';
import GlowingTopology from './GlowingTopology';

export default function HeroScene({ onEnter }: { onEnter: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleChars = useMemo(() => 'ShadowGraph'.split(''), []);
  const splineScene = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL || '';

  const handleEnter = () => {
    if (!rootRef.current) {
      onEnter();
      return;
    }
    const timeline = gsap.timeline({ onComplete: onEnter });
    timeline
      .to(rootRef.current.querySelector('.hero-topology'), { scale: 1.24, duration: 1.1, ease: 'power2.inOut' })
      .to(rootRef.current.querySelector('.hero-overlay'), { opacity: 0, duration: 0.8, ease: 'power1.out' }, '<0.22');
  };

  return (
    <div ref={rootRef} className="command-surface relative h-screen w-screen overflow-hidden">
      <div className="hero-topology absolute inset-0">
        <GlowingTopology />
      </div>
      <ParticleField />
      <FloatingNodes />
      {splineScene ? (
        <div className="pointer-events-none absolute right-6 top-6 hidden h-44 w-44 overflow-hidden rounded-xl border border-cyan-300/25 opacity-40 lg:block">
          <iframe src={splineScene} className="h-full w-full border-0" title="Spline Preview" />
        </div>
      ) : null}

      <div className="hero-overlay absolute inset-0 flex flex-col items-center justify-center px-4">
        <motion.h1 className="mb-4 flex text-5xl font-semibold tracking-[0.08em] text-cyan-100 md:text-7xl" initial="hidden" animate="show">
          {titleChars.map((char, idx) => (
            <motion.span
              key={`${char}-${idx}`}
              variants={{ hidden: { opacity: 0, y: 22, textShadow: '0 0 0 rgba(46,230,255,0)' }, show: { opacity: 1, y: 0, textShadow: '0 0 26px rgba(46,230,255,0.48)' } }}
              transition={{ delay: idx * 0.04, duration: 0.42 }}
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>
        <motion.p className="mb-8 max-w-2xl text-center text-base text-slate-200 md:text-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          Mapping the hidden identity web of the internet.
        </motion.p>
        <GlowButton onClick={handleEnter}>ENTER SHADOWGRAPH</GlowButton>
      </div>
    </div>
  );
}
