'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { audioSystem } from '@/lib/audio-system';

type SoundKey = keyof typeof SOUNDS;

const SOUNDS = {
  click:      () => audioSystem.playButtonClick(),
  hover:      () => audioSystem.playHover(),
  service:    () => audioSystem.playServiceChange(),
  counter:    () => audioSystem.playCounterTick(),
  manifesto:  () => audioSystem.playManifestoReveal(),
  cta:        () => audioSystem.playFinalCTA(),
  radar:      () => audioSystem.playButtonClick(),
  atmosphere: () => audioSystem.playServicesAtmosphere(),
} as const;

interface AudioContextValue {
  enabled: boolean;
  toggle:  () => void;
  play:    (sound: SoundKey) => void;
}

const AudioCtx = createContext<AudioContextValue>({
  enabled: false,
  toggle:  () => {},
  play:    () => {},
});

export function AudioProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  const toggle = useCallback(() => {
    const next = audioSystem.toggle();
    setEnabled(next);
  }, []);

  const play = useCallback((sound: SoundKey) => {
    SOUNDS[sound]?.();
  }, []);

  return (
    <AudioCtx.Provider value={{ enabled, toggle, play }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  return useContext(AudioCtx);
}
