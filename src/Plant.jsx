import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';
import * as Tone from 'tone';
import { OrganicAudio, AudioEngine } from './audio';
import { Settings2, X } from 'lucide-react';

const STEM_HEIGHT = 220;
const STEM_WIDTH = 60;

export default function Plant({ id, type, initialPos, color, isActive, isOn, onRemove }) {
  const [leaves, setLeaves] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [p1, setP1] = useState(0.5);
  const [p2, setP2] = useState(0.5);
  
  const audioRef = useRef(null);
  const stemRef = useRef(null);
  const playheadRef = useRef(null);

  // Drag to stretch state
  const startPos = useRef({ x: 0, y: 0 });
  const baseScale = useRef({ x: 1, y: 1 });

  useEffect(() => {
    if (isActive && isOn && !audioRef.current) {
      audioRef.current = new OrganicAudio(type);
      updateAudioLeaves(leaves);
      audioRef.current.setParams(p1, p2);
    } else if ((!isActive || !isOn) && audioRef.current) {
      audioRef.current.dispose();
      audioRef.current = null;
    }
    return () => {
      if (audioRef.current) audioRef.current.dispose();
    };
  }, [isActive, isOn, type]);

  const updateAudioLeaves = (currentLeaves) => {
    if (!audioRef.current) return;
    const audioLeaves = currentLeaves.map(leaf => {
      const timeNormalized = 1 - (leaf.y / STEM_HEIGHT); 
      // Use Exact Ticks 'i' for robust scheduling that instantly updates
      const ticks = Math.floor(timeNormalized * Tone.Time('2m').toTicks());
      return {
        id: leaf.id,
        time: ticks + 'i',
        pitch: leaf.x,
        side: leaf.x > 0.5 ? 'right' : 'left',
        velocity: 0.7 + (Math.random() * 0.3),
        onHit: () => pulseLeaf(leaf.id)
      };
    });
    audioRef.current.setLeaves(audioLeaves);
  };

  const handleParamChange = (paramNum, val) => {
    if (paramNum === 1) {
      setP1(val);
      if (audioRef.current) audioRef.current.setParams(val, p2);
    } else {
      setP2(val);
      if (audioRef.current) audioRef.current.setParams(p1, val);
    }
  };

  const handleHeadClick = (e) => {
    e.stopPropagation();
    setIsEditing(!isEditing);
  };

  const handleHeadPointerDown = (e) => {
    if (!isEditing) return; // Only stretch if in edit mode
    e.stopPropagation(); // Prevent any other interactions
    startPos.current = { x: e.clientX, y: e.clientY };
    baseScale.current = { x: scaleX, y: scaleY };

    const handlePointerMove = (ev) => {
      const dx = ev.clientX - startPos.current.x;
      const dy = ev.clientY - startPos.current.y;
      
      // 100px drag = 1.0 scale change
      let newSx = Math.max(0.5, Math.min(2.0, baseScale.current.x + dx / 100));
      let newSy = Math.max(0.5, Math.min(2.0, baseScale.current.y - dy / 100)); // Pull up to stretch taller
      
      setScaleX(newSx);
      setScaleY(newSy);
      
      // Map scale 0.5 -> 2.0 to p1/p2 0.0 -> 1.0
      const newP1 = Math.max(0, Math.min(1, (newSx - 0.5) / 1.5));
      const newP2 = Math.max(0, Math.min(1, (newSy - 0.5) / 1.5));
      
      setP1(newP1);
      setP2(newP2);
      if (audioRef.current) audioRef.current.setParams(newP1, newP2);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const pulseLeaf = (leafId) => {
    const el = document.getElementById(`leaf-${id}-${leafId}`);
    if (el) {
      el.style.transform = 'scale(2)';
      el.style.filter = `brightness(2) drop-shadow(0 0 12px ${color})`;
      setTimeout(() => {
        el.style.transform = 'scale(1)';
        el.style.filter = 'brightness(1) drop-shadow(0 0 0px transparent)';
      }, 300);
    }
  };

  const handleStemClick = (e) => {
    if (!isActive) return;
    const rect = stemRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const xRaw = e.clientX - rect.left;
    const xNorm = xRaw / rect.width;

    const newLeaf = {
      id: Date.now(),
      y: Math.max(0, Math.min(y, STEM_HEIGHT)),
      x: Math.max(0, Math.min(xNorm, 1))
    };
    
    const newLeaves = [...leaves, newLeaf];
    setLeaves(newLeaves);
    updateAudioLeaves(newLeaves);
  };

  const removeLeaf = (e, leafId) => {
    e.stopPropagation();
    const newLeaves = leaves.filter(l => l.id !== leafId);
    setLeaves(newLeaves);
    updateAudioLeaves(newLeaves);
  };

  useAnimationFrame(() => {
    if (isActive && isOn && playheadRef.current) {
      const progress = AudioEngine.getLoopProgress();
      const yPos = STEM_HEIGHT - (progress * STEM_HEIGHT);
      playheadRef.current.style.transform = `translateY(${yPos}px)`;
    }
  });

  const renderSVG = () => {
    switch (type) {
      case 'lavender':
        return (
          <svg width="60" height="80" viewBox="0 0 100 120" style={{ overflow: 'visible' }}>
            <circle cx="50" cy="20" r="8" fill={color} opacity="0.9" />
            <circle cx="40" cy="35" r="7" fill={color} opacity="0.8" />
            <circle cx="60" cy="40" r="8" fill={color} opacity="0.9" />
            <circle cx="45" cy="55" r="7" fill={color} opacity="0.7" />
            <circle cx="55" cy="65" r="8" fill={color} opacity="0.8" />
            <circle cx="50" cy="80" r="6" fill={color} opacity="0.6" />
          </svg>
        );
      case 'daisy':
        return (
          <svg width="70" height="70" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
            <g fill="#f8fafc" stroke="rgba(0,0,0,0.1)">
              <ellipse cx="50" cy="20" rx="10" ry="20" />
              <ellipse cx="50" cy="80" rx="10" ry="20" />
              <ellipse cx="20" cy="50" rx="20" ry="10" />
              <ellipse cx="80" cy="50" rx="20" ry="10" />
              <ellipse cx="28" cy="28" rx="18" ry="10" transform="rotate(45 28 28)" />
              <ellipse cx="72" cy="72" rx="18" ry="10" transform="rotate(45 72 72)" />
              <ellipse cx="72" cy="28" rx="18" ry="10" transform="rotate(-45 72 28)" />
              <ellipse cx="28" cy="72" rx="18" ry="10" transform="rotate(-45 28 72)" />
            </g>
            <circle cx="50" cy="50" r="16" fill="#fbbf24" />
          </svg>
        );
      case 'rose':
        return (
          <svg width="70" height="70" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
            <path d="M50,80 C20,80 10,50 30,30 C50,10 80,20 80,50 C80,70 60,80 50,80 Z" fill="#9f1239" opacity="0.9"/>
            <path d="M45,70 C25,70 20,45 35,35 C50,20 70,30 65,55 C60,65 50,70 45,70 Z" fill="#e11d48" />
            <path d="M40,60 C30,60 30,45 40,40 C50,35 60,45 55,55 C50,60 45,60 40,60 Z" fill="#f43f5e" />
          </svg>
        );
      case 'tulip':
        return (
          <svg width="60" height="70" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
            <path d="M20,20 C20,60 40,90 50,90 C60,90 80,60 80,20 C70,40 60,40 50,25 C40,40 30,40 20,20 Z" fill={color} />
          </svg>
        );
      case 'sunflower':
        return (
          <svg width="80" height="80" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
            <g fill={color}>
              {[...Array(12)].map((_, i) => (
                <ellipse key={i} cx="50" cy="20" rx="6" ry="25" transform={`rotate(${i * 30} 50 50)`} />
              ))}
            </g>
            <circle cx="50" cy="50" r="22" fill="#713f12" />
            <circle cx="50" cy="50" r="18" fill="#422006" stroke="#854d0e" strokeWidth="2" strokeDasharray="2,2" />
          </svg>
        );
      case 'orchid':
        return (
          <svg width="80" height="80" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
            <path d="M50,50 C10,20 20,80 50,50 Z" fill={color} opacity="0.8" transform="rotate(-30 50 50)" />
            <path d="M50,50 C90,20 80,80 50,50 Z" fill={color} opacity="0.8" transform="rotate(30 50 50)" />
            <path d="M50,50 C30,0 70,0 50,50 Z" fill="#fdf4ff" opacity="0.9" />
            <circle cx="50" cy="55" r="10" fill="#a21caf" />
            <circle cx="50" cy="55" r="5" fill="#fdf4ff" />
          </svg>
        );
      case 'lotus':
        return (
          <svg width="90" height="60" viewBox="0 0 100 80" style={{ overflow: 'visible' }}>
            <path d="M50,70 C10,60 0,30 50,10 C100,30 90,60 50,70 Z" fill={color} opacity="0.5" />
            <path d="M50,70 C20,65 15,40 50,20 C85,40 80,65 50,70 Z" fill={color} opacity="0.8" />
            <path d="M50,70 C35,68 30,50 50,30 C70,50 65,68 50,70 Z" fill="#cffafe" />
          </svg>
        );
      case 'lily':
        return (
          <svg width="70" height="80" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
            <path d="M50,90 C40,60 10,20 30,10 C50,40 50,40 50,40 C50,40 50,40 70,10 C90,20 60,60 50,90 Z" fill={color} />
            <path d="M50,90 C45,60 30,30 50,20 C70,30 55,60 50,90 Z" fill="#fed7aa" />
            <line x1="50" y1="50" x2="45" y2="25" stroke="#c2410c" strokeWidth="2" />
            <line x1="50" y1="50" x2="55" y2="25" stroke="#c2410c" strokeWidth="2" />
          </svg>
        );
      case 'sakura':
        return (
          <svg width="80" height="80" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
            <g transform="translate(30, 30) scale(0.6)">
              {[...Array(5)].map((_, i) => (
                <path key={i} d="M50,50 C30,20 70,20 50,50 Z" fill={color} transform={`rotate(${i * 72} 50 50)`} />
              ))}
              <circle cx="50" cy="50" r="5" fill="#db2777" />
            </g>
            <g transform="translate(60, 50) scale(0.5)">
              {[...Array(5)].map((_, i) => (
                <path key={i} d="M50,50 C30,20 70,20 50,50 Z" fill={color} transform={`rotate(${i * 72} 50 50)`} />
              ))}
              <circle cx="50" cy="50" r="5" fill="#db2777" />
            </g>
            <g transform="translate(20, 60) scale(0.4)">
              {[...Array(5)].map((_, i) => (
                <path key={i} d="M50,50 C30,20 70,20 50,50 Z" fill={color} transform={`rotate(${i * 72} 50 50)`} />
              ))}
              <circle cx="50" cy="50" r="5" fill="#db2777" />
            </g>
          </svg>
        );
      case 'grass':
        return null; // Handled specially
      case 'reed':
        return null;
      case 'fern':
        return null;
      case 'bush':
        return null;
      default: return null;
    }
  };



  return (
    <motion.div
      drag
      dragListener={!isEditing}
      dragMomentum={false}
      initial={initialPos}
      onDragEnd={(e, info) => {
        if (info.point.x < 250) onRemove(id);
      }}
      style={{
        position: 'absolute',
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: isActive ? 10 : 1,
        opacity: isActive ? 1 : 0.6
      }}
    >
      {/* Flower Head & Interaction */}
      <div style={{ position: 'relative', marginBottom: '-10px', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Helper text */}
        {isActive && isEditing && (
          <div style={{ position: 'absolute', top: '-25px', fontSize: '9px', color: '#fff', whiteSpace: 'nowrap', pointerEvents: 'none', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px' }}>
            Drag to shape sound
          </div>
        )}

        {/* Remove Button */}
        {isActive && isEditing && (
          <div 
            onClick={(e) => { e.stopPropagation(); onRemove(id); }}
            style={{
              position: 'absolute', top: 0, right: '-25px', width: '20px', height: '20px',
              background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10
            }}
          >
            <X size={12} color="#ef4444" />
          </div>
        )}

        {!['grass', 'reed', 'fern', 'bush'].includes(type) && (
          <div 
            onClick={handleHeadClick}
            onPointerDown={handleHeadPointerDown}
            style={{ 
              cursor: isEditing ? 'nwse-resize' : 'pointer',
              filter: isActive ? `drop-shadow(0 0 ${isEditing ? '25px' : '15px'} ${color})` : 'none',
              transform: `scale(${scaleX}, ${scaleY})`,
              transformOrigin: 'bottom center',
              willChange: 'transform'
            }}
          >
            {renderSVG()}
          </div>
        )}

        {['grass', 'reed', 'fern', 'bush'].includes(type) && (
          <div 
            onClick={handleHeadClick}
            onPointerDown={handleHeadPointerDown}
            style={{ 
              cursor: isEditing ? 'nwse-resize' : 'pointer',
              width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#34d399', fontSize: '10px', textTransform: 'uppercase',
              border: `1px solid ${isEditing ? '#34d399' : 'rgba(52, 211, 153, 0.3)'}`, borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              marginBottom: '10px',
              transform: `scale(${scaleX}, ${scaleY})`,
              willChange: 'transform',
              boxShadow: isEditing ? '0 0 15px rgba(52, 211, 153, 0.5)' : 'none'
            }}
          >
            {type === 'grass' ? 'Grass' : type === 'reed' ? 'Reed' : type === 'fern' ? 'Fern' : 'Bush'}
          </div>
        )}
      </div>

      {/* Stem Sequencer */}
      <div 
        ref={stemRef}
        onClick={handleStemClick}
        style={{
          width: `${STEM_WIDTH}px`,
          height: `${STEM_HEIGHT}px`,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          cursor: isActive ? 'crosshair' : 'grab'
        }}
      >
        {/* The Stem line */}
        {!['grass', 'reed', 'fern', 'bush'].includes(type) ? (
          <div style={{
            width: '4px',
            height: '100%',
            background: `linear-gradient(to bottom, ${color}, rgba(255,255,255,0.05))`,
            borderRadius: '2px',
            boxShadow: `0 0 10px ${color}`
          }} />
        ) : (
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
            <path d={`M${STEM_WIDTH/2 - 2},${STEM_HEIGHT} Q${STEM_WIDTH/2 + 20},${STEM_HEIGHT/2} ${STEM_WIDTH/2},0 Q${STEM_WIDTH/2 - 10},${STEM_HEIGHT/2} ${STEM_WIDTH/2 + 2},${STEM_HEIGHT} Z`} fill={color} opacity="0.8" />
            <path d={`M${STEM_WIDTH/2},${STEM_HEIGHT} Q${STEM_WIDTH/2 - 30},${STEM_HEIGHT/1.5} ${STEM_WIDTH/2 - 20},${STEM_HEIGHT/4} Q${STEM_WIDTH/2 - 10},${STEM_HEIGHT/1.5} ${STEM_WIDTH/2},${STEM_HEIGHT} Z`} fill={color} opacity="0.6" />
            <path d={`M${STEM_WIDTH/2},${STEM_HEIGHT} Q${STEM_WIDTH/2 + 30},${STEM_HEIGHT/1.5} ${STEM_WIDTH/2 + 20},${STEM_HEIGHT/4} Q${STEM_WIDTH/2 + 10},${STEM_HEIGHT/1.5} ${STEM_WIDTH/2},${STEM_HEIGHT} Z`} fill={color} opacity="0.6" />
          </svg>
        )}

        {/* Glowing Playhead */}
        {isActive && isOn && (
          <div 
            ref={playheadRef}
            style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '24px',
              height: '20px',
              background: '#fff',
              borderRadius: '50%',
              boxShadow: `0 0 20px 10px ${color}`,
              filter: 'blur(4px)',
              pointerEvents: 'none',
              zIndex: 3,
              opacity: 0.9
            }}
          />
        )}

        {/* Leaves (Notes) */}
        {leaves.map(leaf => {
          // Adjust leaf look based on plant type
          const isGrass = ['grass', 'reed', 'fern', 'bush'].includes(type);
          const leafStyle = isGrass 
            ? { width: '8px', height: '16px', background: '#fff', borderRadius: '50%', transform: `translate(-50%, -50%) rotate(${leaf.x > 0.5 ? '20deg' : '-20deg'})` }
            : { width: '14px', height: '14px', background: '#fff', borderRadius: '50% 0 50% 50%', transform: `translate(-50%, -50%) rotate(${leaf.x > 0.5 ? '45deg' : '225deg'})` }; // Point left or right based on side of stem
            
          return (
            <div
              key={leaf.id}
              id={`leaf-${id}-${leaf.id}`}
              onClick={(e) => removeLeaf(e, leaf.id)}
              style={{
                position: 'absolute',
                top: `${leaf.y}px`,
                left: `${leaf.x * 100}%`,
                cursor: 'pointer',
                boxShadow: `0 0 10px ${color}`,
                transition: 'transform 0.1s ease-out, filter 0.1s ease-out',
                zIndex: 4,
                ...leafStyle
              }}
            />
          );
        })}
      </div>
      
    </motion.div>
  );
}
