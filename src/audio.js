import * as Tone from 'tone';

// Master Effects
const masterReverb = new Tone.Reverb({ decay: 8, wet: 0.6 }).toDestination();
const masterCompressor = new Tone.Compressor({ threshold: -24, ratio: 4, attack: 0.01, release: 0.1 }).connect(masterReverb);

// Global Coherent Ambient Scale (C Lydian for a bright, floating, ethereal feel)
const LYDIAN_SCALE = ['C3', 'D3', 'E3', 'F#3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'E5', 'G5'];

// Chords built from the scale for Pads
const CHORDS = [
  ['C3', 'E3', 'G3', 'B3'],   // Cmaj7
  ['D3', 'F#3', 'A3', 'C4'],  // D7
  ['E3', 'G3', 'B3', 'D4'],   // Emin7
  ['G3', 'B3', 'D4', 'F#4']   // Gmaj7
];

export class OrganicAudio {
  constructor(type) {
    this.type = type;
    
    // Panner for side variation
    this.panner = new Tone.Panner(0);
    
    this.scheduledEvents = []; // Store IDs of scheduled Transport events

    // Default params
    this.p1 = 0.5;
    this.p2 = 0.5;

    this.setupSynth();
  }

  setupSynth() {
    if (this.type === 'lavender') {
      // Plucky, fast, granular feel
      this.synth = new Tone.FMSynth({
        harmonicity: 3,
        modulationIndex: 10,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 },
        modulationEnvelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
      });
      this.delay = new Tone.PingPongDelay('16n', 0.4);
      this.synth.chain(this.delay, this.panner, masterCompressor);

    } else if (this.type === 'daisy') {
      // Warm Electric Piano
      this.synth = new Tone.FMSynth({
        harmonicity: 1,
        modulationIndex: 1,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 1.5, sustain: 0.2, release: 2 }
      });
      this.filter = new Tone.Filter(2000, 'lowpass');
      this.synth.chain(this.filter, this.panner, masterCompressor);

    } else if (this.type === 'rose') {
      // Deep, Lush Pad
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 1, decay: 1, sustain: 0.8, release: 4 }
      });
      this.filter = new Tone.Filter(800, 'lowpass');
      this.chorus = new Tone.Chorus(4, 2.5, 0.5).start();
      this.synth.chain(this.chorus, this.filter, this.panner, masterCompressor);

    } else if (this.type === 'tulip') {
      // Hollow, Resonant (Marimba/Vibraphone vibe)
      this.synth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.5, sustain: 0.1, release: 1 }
      });
      this.vibrato = new Tone.Vibrato(5, 0.1);
      this.filter = new Tone.Filter(1500, 'lowpass');
      this.synth.chain(this.vibrato, this.filter, this.panner, masterCompressor);

    } else if (this.type === 'grass') {
      // Percussive Drums / Shakers
      this.synth = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
      });
      this.filter = new Tone.Filter(5000, 'highpass');
      this.synth.chain(this.filter, this.panner, masterCompressor);

    } else if (this.type === 'sunflower') {
      // Plucky Bass
      this.synth = new Tone.FMSynth({
        harmonicity: 0.5, modulationIndex: 2,
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.2 }
      });
      this.filter = new Tone.Filter(800, 'lowpass');
      this.synth.chain(this.filter, this.panner, masterCompressor);

    } else if (this.type === 'orchid') {
      // Glassy Bells
      this.synth = new Tone.FMSynth({
        harmonicity: 3.2, modulationIndex: 10,
        oscillator: { type: 'sine' },
        modulation: { type: 'square' },
        envelope: { attack: 0.001, decay: 1.4, sustain: 0, release: 0.2 }
      });
      this.delay = new Tone.FeedbackDelay('8n', 0.5);
      this.synth.chain(this.delay, this.panner, masterCompressor);

    } else if (this.type === 'lotus') {
      // Drone / Sub-bass
      this.synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 2, decay: 1, sustain: 1, release: 3 }
      });
      this.chorus = new Tone.Chorus(2, 4, 1).start();
      this.synth.chain(this.chorus, this.panner, masterCompressor);

    } else if (this.type === 'lily') {
      // Portamento Lead
      this.synth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 1 },
        portamento: 0.2
      });
      this.filter = new Tone.Filter(1200, 'lowpass');
      this.synth.chain(this.filter, this.panner, masterCompressor);

    } else if (this.type === 'sakura') {
      // Granular textures (Fast AM modulation)
      this.synth = new Tone.AMSynth({
        harmonicity: 2.5,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.5, sustain: 0.5, release: 1 },
        modulation: { type: 'square' }
      });
      this.tremolo = new Tone.Tremolo(9, 0.8).start();
      this.synth.chain(this.tremolo, this.panner, masterCompressor);

    } else if (this.type === 'reed') {
      // Kick Drum
      this.synth = new Tone.MembraneSynth({
        pitchDecay: 0.05, octaves: 4,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: 'exponential' }
      });
      this.synth.chain(this.panner, masterCompressor);

    } else if (this.type === 'fern') {
      // Cymbals / Hats
      this.synth = new Tone.MetalSynth({
        frequency: 200, envelope: { attack: 0.001, decay: 0.5, release: 0.01 },
        harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5
      });
      this.filter = new Tone.Filter(2000, 'highpass');
      this.synth.chain(this.filter, this.panner, masterCompressor);
      
    } else if (this.type === 'bush') {
      // Snare Drum
      this.synth = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
      });
      this.synth2 = new Tone.MembraneSynth({
        pitchDecay: 0.05, octaves: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
      });
      this.synth.chain(this.panner, masterCompressor);
      this.synth2.chain(this.panner, masterCompressor);
    }
  }

  setParams(p1, p2) {
    this.p1 = p1; // 0 to 1
    this.p2 = p2; // 0 to 1

    if (this.type === 'lavender') {
      // p1: Delay feedback, p2: Modulation index (brightness)
      if (this.delay) this.delay.feedback.rampTo(p1 * 0.8, 0.1);
      if (this.synth) this.synth.modulationIndex.rampTo(p2 * 20, 0.1);
    } else if (this.type === 'daisy') {
      // p1: Harmonicity, p2: Filter cutoff
      if (this.synth) this.synth.harmonicity.rampTo(1 + p1 * 3, 0.1);
      if (this.filter) this.filter.frequency.rampTo(500 + p2 * 4000, 0.1);
    } else if (this.type === 'rose') {
      // p1: Filter Cutoff, p2: Chorus depth
      if (this.filter) this.filter.frequency.rampTo(300 + p1 * 2000, 0.1);
      if (this.chorus) this.chorus.depth = p2;
    } else if (this.type === 'tulip') {
      // p1: Filter Resonance (Q), p2: Vibrato Depth
      if (this.filter) this.filter.Q.rampTo(p1 * 20, 0.1);
      if (this.vibrato) this.vibrato.depth.rampTo(p2 * 0.5, 0.1);
    } else if (this.type === 'grass') {
      // p1: Filter Cutoff, p2: Decay time
      if (this.filter) this.filter.frequency.rampTo(1000 + p1 * 8000, 0.1);
      if (this.synth) this.synth.envelope.decay = 0.05 + p2 * 0.3;
    } else if (this.type === 'sunflower') {
      if (this.synth) this.synth.modulationIndex.rampTo(p1 * 10, 0.1);
      if (this.filter) this.filter.frequency.rampTo(500 + p2 * 2000, 0.1);
    } else if (this.type === 'orchid') {
      if (this.synth) this.synth.modulationIndex.rampTo(p1 * 30, 0.1);
      if (this.delay) this.delay.feedback.rampTo(p2 * 0.8, 0.1);
    } else if (this.type === 'lotus') {
      if (this.chorus) this.chorus.depth = p1 * 2;
      if (this.synth) this.synth.envelope.release = 1 + p2 * 5;
    } else if (this.type === 'lily') {
      if (this.synth) this.synth.portamento = p1 * 0.5;
      if (this.filter) this.filter.frequency.rampTo(500 + p2 * 3000, 0.1);
    } else if (this.type === 'sakura') {
      if (this.tremolo) this.tremolo.frequency.rampTo(2 + p1 * 15, 0.1);
      if (this.synth) this.synth.harmonicity.rampTo(0.5 + p2 * 5, 0.1);
    } else if (this.type === 'reed') {
      if (this.synth) this.synth.pitchDecay = 0.01 + p1 * 0.2;
      if (this.synth) this.synth.envelope.decay = 0.1 + p2 * 0.8;
    } else if (this.type === 'fern') {
      if (this.filter) this.filter.frequency.rampTo(1000 + p1 * 5000, 0.1);
      if (this.synth) this.synth.envelope.decay = 0.1 + p2 * 1.5;
    } else if (this.type === 'bush') {
      if (this.synth) this.synth.envelope.decay = 0.05 + p1 * 0.4;
      if (this.synth2) this.synth2.envelope.decay = 0.05 + p2 * 0.2;
    }
  }

  playNote(time, value) {
    Tone.Draw.schedule(() => {
      if (value.onHit) value.onHit();
    }, time);

    const pitchNormalized = value.pitch; // 0 to 1
    
    // Spatial variation: Pan left (-0.5) or right (0.5) based on stem side
    this.panner.pan.setValueAtTime(value.side === 'right' ? 0.5 : -0.5, time);

    if (this.type === 'rose') {
      // Chords
      const chordIdx = Math.floor(pitchNormalized * (CHORDS.length - 1));
      this.synth.triggerAttackRelease(CHORDS[chordIdx] || CHORDS[0], '2n', time, value.velocity * 0.6);
    } else if (this.type === 'lotus') {
      // Sub-bass Chords
      const chordIdx = Math.floor(pitchNormalized * (CHORDS.length - 1));
      const subChord = (CHORDS[chordIdx] || CHORDS[0]).map(note => Tone.Frequency(note).transpose(-12).toNote());
      this.synth.triggerAttackRelease(subChord[0], '1m', time, value.velocity * 0.8);
    } else if (this.type === 'grass') {
      // Drums
      this.synth.triggerAttackRelease('16n', time, value.velocity);
    } else if (this.type === 'reed') {
      // Kick drum
      this.synth.triggerAttackRelease('C1', '8n', time, value.velocity);
    } else if (this.type === 'fern') {
      // Cymbal
      this.synth.triggerAttackRelease('16n', time, value.velocity);
    } else if (this.type === 'bush') {
      // Snare
      this.synth.triggerAttackRelease('16n', time, value.velocity * 0.8);
      if (this.synth2) this.synth2.triggerAttackRelease('G2', '16n', time, value.velocity);
    } else {
      // Melodies (Lavender, Daisy, Tulip, Sunflower, Orchid, Lily, Sakura)
      const noteIdx = Math.floor(pitchNormalized * (LYDIAN_SCALE.length - 1));
      let note = LYDIAN_SCALE[noteIdx] || LYDIAN_SCALE[0];
      
      // Octave shifts
      if (this.type === 'sunflower') note = Tone.Frequency(note).transpose(-12).toNote();
      if (this.type === 'sakura' || this.type === 'orchid') note = Tone.Frequency(note).transpose(12).toNote();
      
      this.synth.triggerAttackRelease(note, '8n', time, value.velocity);
    }
  }

  setLeaves(leaves) {
    // Clear old scheduled events
    if (this.scheduledEvents) {
      this.scheduledEvents.forEach(id => Tone.Transport.clear(id));
    }
    this.scheduledEvents = [];
    
    leaves.forEach(leaf => {
      // Schedule event directly on the transport timeline
      const id = Tone.Transport.schedule((time) => {
        this.playNote(time, leaf);
      }, leaf.time);
      this.scheduledEvents.push(id);
    });
  }

  dispose() {
    if (this.scheduledEvents) {
      this.scheduledEvents.forEach(id => Tone.Transport.clear(id));
    }
    if (this.synth) this.synth.dispose();
    if (this.synth2) this.synth2.dispose();
    if (this.filter) this.filter.dispose();
    if (this.chorus) this.chorus.dispose();
    if (this.delay) this.delay.dispose();
    if (this.vibrato) this.vibrato.dispose();
    if (this.tremolo) this.tremolo.dispose();
    if (this.panner) this.panner.dispose();
  }
}

export const AudioEngine = {
  isStarted: false,
  async start() {
    await Tone.start();
    Tone.Transport.bpm.value = 75; // Slower, more ambient
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = 0;
    Tone.Transport.loopEnd = '2m';
    Tone.Transport.start();
    this.isStarted = true;
  },
  stop() {
    Tone.Transport.stop();
    this.isStarted = false;
  },
  setMasterVolume(val) {
    const db = val === 0 ? -Infinity : 20 * Math.log10(val);
    Tone.getDestination().volume.rampTo(db, 0.1);
  },
  setBpm(val) {
    Tone.Transport.bpm.rampTo(val, 0.5);
  },
  getLoopProgress() {
    if (!this.isStarted) return 0;
    const ticks = Tone.Transport.ticks;
    const ticksPerLoop = Tone.Time('2m').toTicks();
    return (ticks % ticksPerLoop) / ticksPerLoop;
  }
};
