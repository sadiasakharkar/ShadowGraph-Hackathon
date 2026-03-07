import { ReactNode } from 'react';
import GradientBorder from './GradientBorder';

export default function GlassCard({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <GradientBorder className={className}>
      <div className="glass rounded-2xl p-4">
        {title ? <p className="mb-3 text-xs uppercase tracking-[0.22em] text-cyan-200/80">{title}</p> : null}
        {children}
      </div>
    </GradientBorder>
  );
}
