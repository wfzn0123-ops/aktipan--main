/**
 * Premium Web Audio Synthesizer for AKTIPAN SAAS
 * Generates zero-dependency, rich, multi-voice, high-fidelity sound effects
 * with custom envelope shaping, detuned oscillators, and dynamic filters.
 */

class SoundEngine {
  private get ctx(): AudioContext | null {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;
      // AudioContext is lazy-loaded to comply with browser autoplay security policies
      return new AudioContextClass();
    } catch {
      return null;
    }
  }

  public get isEnabled(): boolean {
    return localStorage.getItem('aktipan_sound_disabled') !== 'true';
  }

  public setEnabled(enabled: boolean) {
    localStorage.setItem('aktipan_sound_disabled', enabled ? 'false' : 'true');
  }

  private createGainEnvelope(ctx: AudioContext, points: { time: number; value: number }[]): GainNode {
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    points.forEach((p, index) => {
      if (index === 0) {
        gainNode.gain.setValueAtTime(p.value, ctx.currentTime + p.time);
      } else {
        gainNode.gain.exponentialRampToValueAtTime(Math.max(p.value, 0.0001), ctx.currentTime + p.time);
      }
    });
    return gainNode;
  }

  /**
   * Snappy click for buttons and selections
   */
  public playClick() {
    if (!this.isEnabled) return;
    const context = this.ctx;
    if (!context) return;

    const osc = context.createOscillator();
    const gainNode = context.createGain();
    const filter = context.createBiquadFilter();

    osc.type = 'sine';
    // Fast frequency glide for tactile click feel
    osc.frequency.setValueAtTime(800, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, context.currentTime + 0.06);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, context.currentTime);

    gainNode.gain.setValueAtTime(0.08, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.06);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(context.destination);

    osc.start();
    osc.stop(context.currentTime + 0.06);
  }

  /**
   * Extremely soft plip for hover interactions
   */
  public playHover() {
    if (!this.isEnabled) return;
    const context = this.ctx;
    if (!context) return;

    const osc = context.createOscillator();
    const gainNode = context.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, context.currentTime);

    gainNode.gain.setValueAtTime(0.005, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.03);

    osc.connect(gainNode);
    gainNode.connect(context.destination);

    osc.start();
    osc.stop(context.currentTime + 0.03);
  }

  /**
   * Majestic major arpeggio chime for successful actions, level-ups, or saves
   */
  public playSuccess() {
    if (!this.isEnabled) return;
    const context = this.ctx;
    if (!context) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
    const now = context.currentTime;

    notes.forEach((freq, idx) => {
      const osc = context.createOscillator();
      const gainNode = context.createGain();
      const delay = idx * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);
      
      // Add subtle vibrato
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      lfo.frequency.setValueAtTime(8, now);
      lfoGain.gain.setValueAtTime(4, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now + delay);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.setValueAtTime(0.08, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);

      osc.connect(gainNode);
      gainNode.connect(context.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.4);
      lfo.stop(now + delay + 0.4);
    });
  }

  /**
   * Multi-tone TV game show style buzzer (detuned oscillators for thickness)
   */
  public playBuzzer() {
    if (!this.isEnabled) return;
    const context = this.ctx;
    if (!context) return;

    const now = context.currentTime;
    const frequencies = [330, 333, 440, 444]; // Detuned pairs (E4 and A4)

    frequencies.forEach((freq, idx) => {
      const osc = context.createOscillator();
      const gainNode = context.createGain();
      const filter = context.createBiquadFilter();

      // Alternating sawtooth and triangle for a rich retro texture
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq - 15, now + 0.28);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.Q.setValueAtTime(3, now);

      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(context.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    });
  }

  /**
   * Upward magical sweep for generator or bonus unlocks
   */
  public playSparkle() {
    if (!this.isEnabled) return;
    const context = this.ctx;
    if (!context) return;

    const now = context.currentTime;
    const osc = context.createOscillator();
    const gainNode = context.createGain();
    const filter = context.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(3200, now + 0.6);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(2800, now + 0.6);

    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(context.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  /**
   * Friendly error buzzer or "try again" sound
   */
  public playFail() {
    if (!this.isEnabled) return;
    const context = this.ctx;
    if (!context) return;

    const now = context.currentTime;
    const frequencies = [220, 218]; // Heavy low A3

    frequencies.forEach((freq) => {
      const osc = context.createOscillator();
      const gainNode = context.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.35); // downward sweep

      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gainNode);
      gainNode.connect(context.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  /**
   * Airy lowpass swoop representing a transition or tab navigation
   */
  public playSwoosh() {
    if (!this.isEnabled) return;
    const context = this.ctx;
    if (!context) return;

    const now = context.currentTime;
    const osc = context.createOscillator();
    const gainNode = context.createGain();
    const filter = context.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.25);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, now);
    filter.frequency.exponentialRampToValueAtTime(1500, now + 0.25);
    filter.Q.setValueAtTime(4, now);

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(context.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Elegant double-tap chime for toast announcements
   */
  public playToast() {
    if (!this.isEnabled) return;
    const context = this.ctx;
    if (!context) return;

    const now = context.currentTime;
    const playChime = (timeOffset: number, pitch: number) => {
      const osc = context.createOscillator();
      const gainNode = context.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now + timeOffset);

      gainNode.gain.setValueAtTime(0.1, now + timeOffset);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.2);

      osc.connect(gainNode);
      gainNode.connect(context.destination);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.2);
    };

    playChime(0, 1046.50); // C6
    playChime(0.08, 1318.51); // E6
  }

  /**
   * Snappy mechanical clock tick
   */
  public playTick() {
    if (!this.isEnabled) return;
    const context = this.ctx;
    if (!context) return;

    const osc = context.createOscillator();
    const gainNode = context.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, context.currentTime);

    gainNode.gain.setValueAtTime(0.04, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.02);

    osc.connect(gainNode);
    gainNode.connect(context.destination);

    osc.start();
    osc.stop(context.currentTime + 0.02);
  }

  /**
   * Bright, glorious fanfare for final results or game victory
   */
  public playFanfare() {
    if (!this.isEnabled) return;
    const context = this.ctx;
    if (!context) return;

    const now = context.currentTime;
    const chord = [392.00, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
    
    chord.forEach((pitch, index) => {
      const osc = context.createOscillator();
      const gainNode = context.createGain();
      const onset = index * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, now + onset);

      gainNode.gain.setValueAtTime(0.06, now + onset);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + onset + 0.6);

      osc.connect(gainNode);
      gainNode.connect(context.destination);

      osc.start(now + onset);
      osc.stop(now + onset + 0.6);
    });
  }
}

export const sound = new SoundEngine();
