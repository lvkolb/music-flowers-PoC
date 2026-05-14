import React, { useState, useRef, useEffect } from 'react';
import { AudioEngine } from './audio';
import Plant from './Plant';
import Sequencer from './Sequencer';
import { Power, Volume2, Plus, Trash2, LayoutGrid, Flower2 } from 'lucide-react';

function App() {
  const [isOn, setIsOn] = useState(false);
  const [viewMode, setViewMode] = useState('garden'); // 'garden' or 'sequencer'
  const [volume, setVolume] = useState(0.8);
  const [bpm, setBpm] = useState(75);
  const basketRef = useRef(null);

  const [items, setItems] = useState([]);

  useEffect(() => {
    AudioEngine.setMasterVolume(volume);
  }, []);

  const handlePower = async () => {
    if (!isOn) {
      await AudioEngine.start();
      setIsOn(true);
    } else {
      AudioEngine.stop();
      setIsOn(false);
    }
  };

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    AudioEngine.setMasterVolume(val);
  };

  const handleBpm = (e) => {
    const val = parseFloat(e.target.value);
    setBpm(val);
    if (isOn) AudioEngine.setBpm(val);
  };

  const spawnItem = (type) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2 - 100;
    const offsetX = (Math.random() - 0.5) * 150;
    const offsetY = (Math.random() - 0.5) * 150;

    let color = '#fff';
    if (type === 'lavender') color = '#c084fc';
    if (type === 'daisy') color = '#f8fafc';
    if (type === 'rose') color = '#f43f5e';
    if (type === 'tulip') color = '#fbbf24';
    if (type === 'grass') color = '#34d399';
    if (type === 'sunflower') color = '#eab308';
    if (type === 'orchid') color = '#d946ef';
    if (type === 'lotus') color = '#06b6d4';
    if (type === 'lily') color = '#f97316';
    if (type === 'sakura') color = '#fbcfe8';
    if (type === 'reed') color = '#92400e';
    if (type === 'fern') color = '#84cc16';
    if (type === 'bush') color = '#14b8a6';

    const newItem = {
      id: Date.now() + Math.random(),
      type,
      color,
      pos: { x: centerX + offsetX, y: centerY + offsetY }
    };
    
    setItems([...items, newItem]);
  };

  const handleRemove = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      
      {/* Header Controls */}
      <div className="glass-panel" style={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
        padding: '16px 32px', borderRadius: '30px', display: 'flex', gap: '30px', alignItems: 'center', zIndex: 100
      }}>
        <button 
          onClick={handlePower}
          style={{
            background: isOn ? 'var(--basket-color)' : 'transparent',
            border: `1px solid ${isOn ? '#10b981' : 'var(--panel-border)'}`,
            color: isOn ? '#10b981' : '#fff',
            padding: '10px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: isOn ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none'
          }}
        >
          <Power size={24} />
        </button>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', padding: '4px' }}>
          <button
            onClick={() => setViewMode('garden')}
            style={{
              background: viewMode === 'garden' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none', color: viewMode === 'garden' ? '#fff' : 'var(--text-muted)',
              padding: '8px 16px', borderRadius: '16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            <Flower2 size={16} /> Garden
          </button>
          <button
            onClick={() => setViewMode('sequencer')}
            style={{
              background: viewMode === 'sequencer' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none', color: viewMode === 'sequencer' ? '#fff' : 'var(--text-muted)',
              padding: '8px 16px', borderRadius: '16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            <LayoutGrid size={16} /> Sequencer
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '150px' }}>
          <Volume2 size={20} color="#fff" />
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolume} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '150px' }}>
          <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#fff', width: '30px' }}>{bpm}</span>
          <input type="range" min="40" max="140" step="1" value={bpm} onChange={handleBpm} />
        </div>
      </div>

      {viewMode === 'garden' ? (
        <>
          {/* Garden Area (Left Side) - Spawner */}
          <div style={{
        position: 'absolute', top: 0, left: 0, width: '220px', height: '100%',
        borderRight: '1px solid var(--panel-border)',
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 20px',
        zIndex: 50,
        overflowY: 'auto'
      }}>
        <h2 style={{ color: 'var(--text-muted)', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>
          The Garden
        </h2>
        
        <p style={{ color: '#888', fontSize: '11px', textAlign: 'center', marginBottom: '30px' }}>
          Click to plant in basket.<br/>Click flower head for effects.<br/>Drag outside to remove.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', paddingBottom: '50px' }}>
          <button className="glass-panel" onClick={() => spawnItem('lavender')} style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #c084fc', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(192, 132, 252, 0.1)', fontSize: '12px' }}>
            <Plus size={14} color="#c084fc" /> Lavender (Arp)
          </button>
          
          <button className="glass-panel" onClick={() => spawnItem('daisy')} style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #f8fafc', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(248, 250, 252, 0.1)', fontSize: '12px' }}>
            <Plus size={14} color="#f8fafc" /> Daisy (Lead)
          </button>

          <button className="glass-panel" onClick={() => spawnItem('rose')} style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #f43f5e', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(244, 63, 94, 0.1)', fontSize: '12px' }}>
            <Plus size={14} color="#f43f5e" /> Rose (Pad)
          </button>

          <button className="glass-panel" onClick={() => spawnItem('tulip')} style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #fbbf24', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(251, 191, 36, 0.1)', fontSize: '12px' }}>
            <Plus size={14} color="#fbbf24" /> Tulip (Marimba)
          </button>

          <button className="glass-panel" onClick={() => spawnItem('sunflower')} style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #eab308', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(234, 179, 8, 0.1)', fontSize: '12px' }}>
            <Plus size={14} color="#eab308" /> Sunflower (Bass)
          </button>

          <button className="glass-panel" onClick={() => spawnItem('orchid')} style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #d946ef', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(217, 70, 239, 0.1)', fontSize: '12px' }}>
            <Plus size={14} color="#d946ef" /> Orchid (Bells)
          </button>

          <button className="glass-panel" onClick={() => spawnItem('lotus')} style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #06b6d4', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(6, 182, 212, 0.1)', fontSize: '12px' }}>
            <Plus size={14} color="#06b6d4" /> Lotus (Drone)
          </button>

          <button className="glass-panel" onClick={() => spawnItem('lily')} style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #f97316', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(249, 115, 22, 0.1)', fontSize: '12px' }}>
            <Plus size={14} color="#f97316" /> Lily (Glide)
          </button>

          <button className="glass-panel" onClick={() => spawnItem('sakura')} style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #fbcfe8', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(251, 207, 232, 0.1)', fontSize: '12px' }}>
            <Plus size={14} color="#fbcfe8" /> Sakura (Flutter)
          </button>

          <div style={{ width: '100%', height: '1px', background: 'var(--panel-border)', margin: '5px 0' }} />

          <button className="glass-panel" onClick={() => spawnItem('grass')} style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #34d399', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(52, 211, 153, 0.1)', fontSize: '12px' }}>
            <Plus size={14} color="#34d399" /> Grass (Shakers)
          </button>

          <button className="glass-panel" onClick={() => spawnItem('reed')} style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #92400e', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(146, 64, 14, 0.1)', fontSize: '12px' }}>
            <Plus size={14} color="#92400e" /> Reed (Kick)
          </button>

          <button className="glass-panel" onClick={() => spawnItem('fern')} style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #84cc16', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(132, 204, 22, 0.1)', fontSize: '12px' }}>
            <Plus size={14} color="#84cc16" /> Fern (Cymbal)
          </button>

          <button className="glass-panel" onClick={() => spawnItem('bush')} style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #14b8a6', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(20, 184, 166, 0.1)', fontSize: '12px' }}>
            <Plus size={14} color="#14b8a6" /> Bush (Snare)
          </button>
        </div>
      </div>

      {/* Basket Area (Center) */}
      <div 
        ref={basketRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '750px',
          height: '750px',
          borderRadius: '50%',
          border: `2px dashed ${isOn ? 'var(--basket-border)' : 'var(--panel-border)'}`,
          background: isOn ? 'var(--basket-color)' : 'transparent',
          transition: 'all 1s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isOn ? 'inset 0 0 50px rgba(16, 185, 129, 0.1), 0 0 100px rgba(16, 185, 129, 0.05)' : 'none',
          pointerEvents: 'none'
        }}
      >
        <div style={{
          position: 'absolute',
          opacity: 0.05,
          fontSize: '32px',
          letterSpacing: '12px',
          textTransform: 'uppercase',
          color: '#fff'
        }}>
          Basket
        </div>
      </div>

      {/* Trash / Remove Area Visual Hint */}
      <div style={{
        position: 'absolute', bottom: 30, right: 30, 
        color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px',
        opacity: 0.5
      }}>
        <Trash2 size={24} /> Drag here to remove
      </div>

      {/* Plants */}
      {items.map(item => (
        <Plant 
          key={item.id}
          id={item.id}
          type={item.type}
          color={item.color}
          initialPos={item.pos}
          isActive={true}
          isOn={isOn}
          onRemove={handleRemove}
        />
      ))}
        </>
      ) : (
        <Sequencer isOn={isOn} />
      )}

    </div>
  );
}

export default App;
