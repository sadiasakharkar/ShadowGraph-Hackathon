'use client';

import { useState } from 'react';
import PageTransitions from '../components/animations/PageTransitions';
import HeroScene from '../components/landing/HeroScene';
import CommandCenter from '../components/dashboard/CommandCenter';

export default function HomePage() {
  const [entered, setEntered] = useState(false);

  return (
    <PageTransitions pageKey={entered ? 'command' : 'hero'}>
      {entered ? <CommandCenter /> : <HeroScene onEnter={() => setEntered(true)} />}
    </PageTransitions>
  );
}
