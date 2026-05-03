'use client';

import * as Tone from 'tone';

class FractalAudioSystem {
  private enabled     = false;
  private initialized = false;

  private master!:       Tone.Volume;
  private reverb!:       Tone.Reverb;
  private ambientDrone!: Tone.Oscillator;
  private ambientFilter!:Tone.Filter;
  private ambientGain!:  Tone.Volume;

  async init() {
    if (this.initialized) return;
    await Tone.start();

    this.master = new Tone.Volume(-14).toDestination();

    this.reverb = new Tone.Reverb({ decay: 3.2, wet: 0.4 });
    this.reverb.connect(this.master);

    /* ambient sub-drone — barely audible, just presence */
    this.ambientGain   = new Tone.Volume(-44);
    this.ambientFilter = new Tone.Filter({ frequency: 80, type: 'lowpass' });
    this.ambientDrone  = new Tone.Oscillator({ frequency: 40, type: 'sine' });
    this.ambientDrone.connect(this.ambientFilter);
    this.ambientFilter.connect(this.ambientGain);
    this.ambientGain.connect(this.master);

    this.initialized = true;
  }

  /* ── UI micro-feedback ── */
  playButtonClick() {
    if (!this.enabled) return;
    const synth = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope:   { attack: 0.001, decay: 0.06, sustain: 0, release: 0.04 },
      volume: -26,
    });
    synth.connect(this.master);
    synth.triggerAttackRelease('C5', '32n', Tone.now());
    setTimeout(() => synth.dispose(), 400);
  }

  playHover() {
    if (!this.enabled) return;
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope:   { attack: 0.005, decay: 0.10, sustain: 0, release: 0.05 },
      volume: -30,
    });
    synth.connect(this.master);
    synth.triggerAttackRelease('G4', '32n', Tone.now());
    setTimeout(() => synth.dispose(), 400);
  }

  /* ── Service panel switch ── */
  playServiceChange() {
    if (!this.enabled) return;
    const now    = Tone.now();
    const synth  = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope:   { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.4 },
      volume: -26,
    });
    const filter = new Tone.Filter({ frequency: 2400, type: 'lowpass', rolloff: -24 });
    synth.connect(filter);
    filter.connect(this.reverb);
    synth.triggerAttackRelease(['C3', 'G3'], '8n', now);
    setTimeout(() => { synth.dispose(); filter.dispose(); }, 1000);
  }

  /* ── Number counter tick ── */
  playCounterTick() {
    if (!this.enabled) return;
    const synth = new Tone.MetalSynth({
      envelope:      { attack: 0.001, decay: 0.04, release: 0.01 },
      harmonicity:   5.1,
      modulationIndex: 32,
      resonance:     4000,
      octaves:       1.5,
      volume:        -32,
    });
    synth.frequency.value = 400;
    synth.connect(this.master);
    synth.triggerAttackRelease('16n', Tone.now());
    setTimeout(() => synth.dispose(), 300);
  }

  /* ── Manifesto — one-time entrance ── */
  playManifestoReveal() {
    if (!this.enabled) return;
    const now    = Tone.now();
    const synth  = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope:   { attack: 0.04, decay: 0.6, sustain: 0.1, release: 1.0 },
      volume: -22,
    });
    synth.connect(this.reverb);
    synth.triggerAttackRelease(['E3', 'B3', 'E4'], '2n', now);
    setTimeout(() => synth.dispose(), 3000);
  }

  /* ── Services atmosphere — mysterious mission pad ── */
  playServicesAtmosphere() {
    if (!this.enabled) return;
    const now = Tone.now();

    const deepReverb = new Tone.Reverb({ decay: 8, wet: 0.82 });
    deepReverb.connect(this.master);

    /* main chord: E minor — dark, spatial */
    const pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 1.4, decay: 2.2, sustain: 0.08, release: 5.0 },
      volume: -29,
    });
    pad.connect(deepReverb);
    pad.triggerAttackRelease(['E2', 'B2', 'E3'], '2n', now);

    /* upper shimmer — delayed, barely audible */
    const shimmer = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 2.0, decay: 3.0, sustain: 0.05, release: 6.0 },
      volume: -36,
    });
    shimmer.connect(deepReverb);
    shimmer.triggerAttackRelease(['B3', 'E4'], '2n', now + 0.8);

    setTimeout(() => {
      pad.dispose();
      shimmer.dispose();
      deepReverb.dispose();
    }, 14000);
  }

  /* ── CTA — one-time entrance ── */
  playFinalCTA() {
    if (!this.enabled) return;
    const now   = Tone.now();
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope:   { attack: 0.02, decay: 0.5, sustain: 0.2, release: 0.8 },
      volume: -22,
    });
    synth.connect(this.reverb);
    synth.triggerAttackRelease(['C4', 'E4', 'G4', 'B4'], '4n', now);
    setTimeout(() => synth.dispose(), 2000);
  }

  /* ── Ambient lifecycle ── */
  startAmbient() {
    if (!this.initialized || !this.enabled) return;
    try { this.ambientDrone.start(); } catch { /* already started */ }
  }

  stopAmbient() {
    if (!this.initialized) return;
    try { this.ambientDrone.stop(); } catch { /* not started */ }
  }

  async enable() {
    await this.init();
    this.enabled = true;
    this.startAmbient();
  }

  disable() {
    this.enabled = false;
    this.stopAmbient();
  }

  toggle() {
    if (this.enabled) this.disable();
    else this.enable();
    return this.enabled;
  }

  isEnabled() { return this.enabled; }
}

export const audioSystem = new FractalAudioSystem();
