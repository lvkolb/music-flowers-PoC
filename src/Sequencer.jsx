import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';
import * as Tone from 'tone';
import { OrganicAudio, AudioEngine } from './audio';
import { Plus, Trash2, Settings2, X, ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';

const PLANT_TYPES = [
  { id: 'lavender', name: 'Lavender (Arp)', color: '#c084fc', isMelodic: true },
  { id: 'daisy', name: 'Daisy (Lead)', color: '#f8fafc', isMelodic: true },
  { id: 'rose', name: 'Rose (Pad)', color: '#f43f5e', isMelodic: true },
  { id: 'tulip', name: 'Tulip (Marimba)', color: '#fbbf24', isMelodic: true },
  { id: 'sunflower', name: 'Sunflower (Bass)', color: '#eab308', isMelodic: true },
  { id: 'orchid', name: 'Orchid (Bells)', color: '#d946ef', isMelodic: true },
  { id: 'lotus', name: 'Lotus (Drone)', color: '#06b6d4', isMelodic: true },
  { id: 'lily', name: 'Lily (Glide)', color: '#f97316', isMelodic: true },
  { id: 'sakura', name: 'Sakura (Flutter)', color: '#fbcfe8', isMelodic: true },
  { id: 'grass', name: 'Grass (Shakers)', color: '#34d399', isMelodic: false },
  { id: 'reed', name: 'Reed (Kick)', color: '#92400e', isMelodic: false },
  { id: 'fern', name: 'Fern (Cymbal)', color: '#84cc16', isMelodic: false },
  { id: 'bush', name: 'Bush (Snare)', color: '#14b8a6', isMelodic: false },
];

const generateSteps = (activeIndices, length = 32) => {
  const steps = Array(length).fill(false);
  activeIndices.forEach(i => { if (i < length) steps[i] = true; });
  return steps;
};

const PRESETS = [
  {
    name: "1: Summer Bloom (House)",
    bpm: 120,
    tracks: [
      { type: 'reed', pitch: 0.5, p1: 0.5, p2: 0.5, velocity: 0.9, steps: generateSteps([0, 4, 8, 12, 16, 20, 24, 28]) },
      { type: 'fern', pitch: 0.5, p1: 0.5, p2: 0.5, velocity: 0.6, steps: generateSteps([2, 6, 10, 14, 18, 22, 26, 30]) },
      { type: 'bush', pitch: 0.5, p1: 0.5, p2: 0.5, velocity: 0.8, steps: generateSteps([4, 12, 20, 28]) },
      { type: 'grass', pitch: 0.5, p1: 0.4, p2: 0.4, velocity: 0.4, steps: generateSteps([0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16, 17, 19, 20, 21, 23, 24, 25, 27, 28, 29, 31]) },
      { type: 'sunflower', pitch: 0.3, p1: 0.6, p2: 0.4, velocity: 0.8, steps: generateSteps([0, 3, 6, 8, 11, 14, 16, 19, 22, 24, 27, 30]) },
      { type: 'rose', pitch: 0.3, p1: 0.4, p2: 0.8, velocity: 0.7, steps: generateSteps([0, 8, 16, 24]) },
      { type: 'lotus', pitch: 0.2, p1: 0.5, p2: 0.8, velocity: 0.8, steps: generateSteps([0]) },
      { type: 'lavender', pitch: 0.6, p1: 0.7, p2: 0.4, velocity: 0.6, steps: generateSteps([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]) },
      { type: 'tulip', pitch: 0.7, p1: 0.5, p2: 0.5, velocity: 0.8, steps: generateSteps([14, 15, 30, 31]) },
      { type: 'daisy', pitch: 0.8, p1: 0.6, p2: 0.4, velocity: 0.7, steps: generateSteps([8, 24]) }
    ]
  },
  {
    name: "2: Midnight Zen (Ambient)",
    bpm: 65,
    tracks: [
      { type: 'reed', pitch: 0.5, p1: 0.4, p2: 0.7, velocity: 0.8, steps: generateSteps([0, 16]) },
      { type: 'grass', pitch: 0.5, p1: 0.3, p2: 0.8, velocity: 0.4, steps: generateSteps([0, 8, 16, 24]) },
      { type: 'fern', pitch: 0.5, p1: 0.4, p2: 0.4, velocity: 0.3, steps: generateSteps([4, 12, 20, 28]) },
      { type: 'lotus', pitch: 0.1, p1: 0.5, p2: 0.9, velocity: 0.8, steps: generateSteps([0]) },
      { type: 'rose', pitch: 0.3, p1: 0.5, p2: 0.9, velocity: 0.7, steps: generateSteps([0, 16]) },
      { type: 'orchid', pitch: 0.6, p1: 0.7, p2: 0.8, velocity: 0.7, steps: generateSteps([0, 12, 24]) },
      { type: 'lavender', pitch: 0.4, p1: 0.8, p2: 0.6, velocity: 0.5, steps: generateSteps([4, 10, 16, 22]) },
      { type: 'lily', pitch: 0.5, p1: 0.6, p2: 0.8, velocity: 0.6, steps: generateSteps([8, 24]) },
      { type: 'sakura', pitch: 0.7, p1: 0.7, p2: 0.6, velocity: 0.6, steps: generateSteps([2, 18]) }
    ]
  },
  {
    name: "3: Spring Awakening (Lo-Fi)",
    bpm: 85,
    tracks: [
      { type: 'reed', pitch: 0.5, p1: 0.6, p2: 0.6, velocity: 0.9, steps: generateSteps([0, 6, 10, 16, 22]) },
      { type: 'bush', pitch: 0.5, p1: 0.4, p2: 0.4, velocity: 0.8, steps: generateSteps([8, 24]) },
      { type: 'fern', pitch: 0.5, p1: 0.3, p2: 0.3, velocity: 0.5, steps: generateSteps([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]) },
      { type: 'grass', pitch: 0.5, p1: 0.4, p2: 0.5, velocity: 0.4, steps: generateSteps([1, 5, 9, 13, 17, 21, 25, 29]) },
      { type: 'sunflower', pitch: 0.4, p1: 0.5, p2: 0.5, velocity: 0.8, steps: generateSteps([0, 6, 10, 16, 22]) },
      { type: 'tulip', pitch: 0.4, p1: 0.7, p2: 0.6, velocity: 0.7, steps: generateSteps([2, 6, 14, 18, 22, 30]) },
      { type: 'daisy', pitch: 0.6, p1: 0.8, p2: 0.5, velocity: 0.7, steps: generateSteps([8, 11, 24, 27]) },
      { type: 'orchid', pitch: 0.7, p1: 0.6, p2: 0.6, velocity: 0.6, steps: generateSteps([14, 30]) },
      { type: 'sakura', pitch: 0.5, p1: 0.5, p2: 0.5, velocity: 0.6, steps: generateSteps([0, 16]) },
      { type: 'rose', pitch: 0.4, p1: 0.8, p2: 0.8, velocity: 0.6, steps: generateSteps([0, 8, 16, 24]) }
    ]
  }
];

export default function Sequencer({ isOn, timeSignature, onBpmChange }) {
  const numSteps = (timeSignature || 4) * 4 * 2;
  const [tracks, setTracks] = useState([]);
  const [expandedTrack, setExpandedTrack] = useState(null);
  const audioRefs = useRef({});
  const playheadRef = useRef(null);

  // Initialize and cleanup audio instances
  useEffect(() => {
    // Check for newly added tracks
    tracks.forEach(track => {
      if (isOn && !audioRefs.current[track.id]) {
        audioRefs.current[track.id] = new OrganicAudio(track.type);
        updateTrackAudio(track);
      }
    });

    // Check for removed tracks or powered off
    Object.keys(audioRefs.current).forEach(trackId => {
      if (!isOn || !tracks.find(t => t.id === trackId)) {
        audioRefs.current[trackId].dispose();
        delete audioRefs.current[trackId];
      }
    });

    return () => {
      if (!isOn) return; // Keep instances alive if unmounting isn't happening, but we do want cleanup on unmount
    };
  }, [tracks, isOn]);

  // Update audio instances when tracks change
  useEffect(() => {
    if (!isOn) return;
    tracks.forEach(track => {
      updateTrackAudio(track);
    });
  }, [tracks, isOn]);

  useEffect(() => {
    return () => {
      // Full cleanup on unmount
      Object.values(audioRefs.current).forEach(audio => audio.dispose());
      audioRefs.current = {};
    };
  }, []);

  // Adjust steps when time signature changes
  useEffect(() => {
    setTracks(prev => prev.map(track => {
      let newSteps = [...track.steps];
      if (newSteps.length > numSteps) {
        newSteps = newSteps.slice(0, numSteps);
      } else if (newSteps.length < numSteps) {
        newSteps = [...newSteps, ...Array(numSteps - newSteps.length).fill(false)];
      }
      return { ...track, steps: newSteps };
    }));
  }, [numSteps]);

  const updateTrackAudio = (track) => {
    const audio = audioRefs.current[track.id];
    if (!audio) return;

    const leaves = [];
    if (!track.isMuted) {
      track.steps.forEach((isActive, i) => {
        if (isActive) {
          // Calculate exact ticks for this 16th note step
          // 2m = 2 bars = 32 * 16th notes
          // 16n ticks = Tone.Time('16n').toTicks()
          const stepTicks = Math.floor(i * Tone.Time('16n').toTicks());
          leaves.push({
            id: `seq-${track.id}-${i}`,
            time: stepTicks + 'i',
            pitch: track.pitch, // Use track's global pitch
            side: i % 2 === 0 ? 'left' : 'right',
            velocity: track.velocity || 0.8
          });
        }
      });
    }
    audio.setLeaves(leaves);
    audio.setParams(track.p1, track.p2);
  };

  const addTrack = (type) => {
    const plantDef = PLANT_TYPES.find(p => p.id === type);
    const newTrack = {
      id: Date.now().toString(),
      type: type,
      color: plantDef.color,
      name: plantDef.name,
      isMelodic: plantDef.isMelodic,
      steps: Array(numSteps).fill(false),
      isMuted: false,
      pitch: 0.5,
      p1: 0.5,
      p2: 0.5,
      velocity: 0.8
    };
    setTracks([...tracks, newTrack]);
  };

  const loadPreset = (presetIndex) => {
    const preset = PRESETS[presetIndex];
    if (!preset) return;
    
    if (preset.bpm && onBpmChange) {
      onBpmChange(preset.bpm);
    }

    const newTracks = preset.tracks.map((t, idx) => {
      const plantDef = PLANT_TYPES.find(p => p.id === t.type);
      
      let steps = [...t.steps];
      if (steps.length > numSteps) steps = steps.slice(0, numSteps);
      else if (steps.length < numSteps) steps = [...steps, ...Array(numSteps - steps.length).fill(false)];

      return {
        id: `preset-${Date.now()}-${idx}`,
        type: t.type,
        color: plantDef.color,
        name: plantDef.name,
        isMelodic: plantDef.isMelodic,
        steps: steps,
        isMuted: false,
        pitch: t.pitch,
        p1: t.p1,
        p2: t.p2,
        velocity: t.velocity
      };
    });
    setTracks(newTracks);
  };

  const removeTrack = (id) => {
    setTracks(tracks.filter(t => t.id !== id));
  };

  const toggleStep = (trackId, stepIndex) => {
    setTracks(tracks.map(t => {
      if (t.id === trackId) {
        const newSteps = [...t.steps];
        newSteps[stepIndex] = !newSteps[stepIndex];
        return { ...t, steps: newSteps };
      }
      return t;
    }));
  };

  const toggleMute = (trackId) => {
    setTracks(tracks.map(t => {
      if (t.id === trackId) {
        return { ...t, isMuted: !t.isMuted };
      }
      return t;
    }));
  };

  const updateTrackParam = (trackId, param, value) => {
    setTracks(tracks.map(t => {
      if (t.id === trackId) {
        return { ...t, [param]: parseFloat(value) };
      }
      return t;
    }));
  };

  useAnimationFrame(() => {
    if (isOn && playheadRef.current) {
      const progress = AudioEngine.getLoopProgress();
      playheadRef.current.style.left = `${progress * 100}%`;
    }
  });

  return (
    <div style={{
      width: '100%', height: '100%', padding: '100px 40px 40px',
      display: 'flex', flexDirection: 'column', gap: '20px',
      overflowY: 'auto', overflowX: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Loop Machine</h2>
        
        {/* Controls Menu */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            className="glass-panel"
            style={{ padding: '8px 12px', borderRadius: '8px', color: '#fff', outline: 'none', border: '1px solid var(--panel-border)' }}
            onChange={(e) => { if(e.target.value !== "") { loadPreset(parseInt(e.target.value)); e.target.value = ""; } }}
            defaultValue=""
          >
            <option value="" disabled>Load Example Beat...</option>
            {PRESETS.map((p, idx) => (
              <option key={idx} value={idx}>{p.name}</option>
            ))}
          </select>

          <select 
            className="glass-panel"
            style={{ padding: '8px 12px', borderRadius: '8px', color: '#fff', outline: 'none', border: '1px solid var(--panel-border)' }}
            onChange={(e) => { if(e.target.value) { addTrack(e.target.value); e.target.value = ""; } }}
            defaultValue=""
          >
            <option value="" disabled>+ Add Track</option>
            {PLANT_TYPES.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ 
        flex: 1, borderRadius: '12px', padding: '20px', 
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
        position: 'relative'
      }}>
        
        {tracks.length === 0 ? (
          <div style={{ margin: 'auto', color: 'var(--text-muted)', opacity: 0.5 }}>
            Add a track to start sequencing.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '1000px' }}>
            
            {/* Timeline Header */}
            <div style={{ display: 'flex', marginBottom: '10px' }}>
              <div style={{ width: '200px', flexShrink: 0 }}></div>
              <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
                {[...Array(numSteps)].map((_, i) => (
                  <div key={i} style={{ 
                    flex: 1, textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)',
                    borderLeft: i % 4 === 0 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                    paddingLeft: '4px'
                  }}>
                    {i % 4 === 0 ? (i / 4) + 1 : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Tracks Container */}
            <div style={{ position: 'relative' }}>
              
              {/* Playhead */}
              {isOn && (
                <div style={{
                  position: 'absolute', top: 0, bottom: 0, left: '200px', right: 0,
                  pointerEvents: 'none', zIndex: 10
                }}>
                  <div 
                    ref={playheadRef}
                    style={{
                      position: 'absolute', top: 0, bottom: 0, left: 0,
                      width: '2px', background: 'rgba(16, 185, 129, 0.8)',
                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                    }}
                  />
                </div>
              )}

              {/* Tracks List */}
              {tracks.map(track => (
                <div key={track.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                  
                  {/* Track Row */}
                  <div style={{ display: 'flex', alignItems: 'stretch', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                    
                    {/* Track Info */}
                    <div style={{ 
                      width: '200px', flexShrink: 0, padding: '10px', 
                      borderRight: '1px solid var(--panel-border)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: track.color }} />
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{track.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button 
                          onClick={() => toggleMute(track.id)}
                          style={{ background: 'none', border: 'none', color: track.isMuted ? '#ef4444' : 'var(--text-muted)', cursor: 'pointer' }}
                          title={track.isMuted ? "Unmute" : "Mute"}
                        >
                          {track.isMuted ? <VolumeX size={16}/> : <Volume2 size={16}/>}
                        </button>
                        <button 
                          onClick={() => setExpandedTrack(expandedTrack === track.id ? null : track.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          {expandedTrack === track.id ? <ChevronUp size={16}/> : <Settings2 size={16}/>}
                        </button>
                        <button onClick={() => removeTrack(track.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Step Grid */}
                    <div style={{ flex: 1, display: 'flex', opacity: track.isMuted ? 0.3 : 1 }}>
                      {track.steps.map((isActive, i) => (
                        <div 
                          key={i}
                          onClick={() => toggleStep(track.id, i)}
                          style={{
                            flex: 1,
                            borderRight: i % 4 === 3 ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.02)',
                            background: isActive ? track.color : (i % 8 < 4 ? 'rgba(255,255,255,0.02)' : 'transparent'),
                            opacity: isActive ? 0.9 : 1,
                            cursor: 'pointer',
                            transition: 'background 0.1s',
                            boxShadow: isActive ? `0 0 10px ${track.color}40` : 'none',
                            margin: '2px 1px',
                            borderRadius: '2px'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Expanded Track Settings */}
                  {expandedTrack === track.id && (
                    <div style={{ 
                      marginLeft: '200px', padding: '10px 20px', 
                      background: 'rgba(0,0,0,0.3)', borderRadius: '6px',
                      display: 'flex', gap: '30px', alignItems: 'center'
                    }}>
                      {track.isMelodic && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '200px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pitch</span>
                          <input type="range" min="0" max="1" step="0.01" value={track.pitch} onChange={(e) => updateTrackParam(track.id, 'pitch', e.target.value)} />
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '200px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Velocity</span>
                        <input type="range" min="0" max="1" step="0.01" value={track.velocity} onChange={(e) => updateTrackParam(track.id, 'velocity', e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '200px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>P1</span>
                        <input type="range" min="0" max="1" step="0.01" value={track.p1} onChange={(e) => updateTrackParam(track.id, 'p1', e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '200px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>P2</span>
                        <input type="range" min="0" max="1" step="0.01" value={track.p2} onChange={(e) => updateTrackParam(track.id, 'p2', e.target.value)} />
                      </div>
                    </div>
                  )}

                </div>
              ))}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
