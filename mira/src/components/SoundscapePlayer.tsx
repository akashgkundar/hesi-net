'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX, CloudRain, Waves, Sparkles, Leaf, ExternalLink, Music2, Radio } from 'lucide-react';
import { soundscape } from '../utils/audioSynthesizer';

type SoundType = 'off' | 'green' | 'rain' | 'ocean' | 'zen';
type TabType = 'synth' | 'spotify';

interface SpotifyPlaylist {
  title: string;
  desc: string;
  embedId: string;
  url: string;
}

const SPOTIFY_GREEN_PLAYLISTS: SpotifyPlaylist[] = [
  {
    title: 'Green Noise & Sleep Sounds',
    desc: 'Official nature mid-frequency soundscapes for deep rest',
    embedId: '37i9dQZF1DWZd79rJ6a7lp',
    url: 'https://open.spotify.com/search/green%20noise/playlists',
  },
  {
    title: 'Peaceful Ambient & Green Frequencies',
    desc: 'Gentle organic ambience for focus and meditation',
    embedId: '37i9dQZF1DX4sWSpwq3LiO',
    url: 'https://open.spotify.com/search/green%20noise%2010%20hours/playlists',
  },
  {
    title: 'Nature Rain & Foliage',
    desc: 'Raindrops through woodland canopies',
    embedId: '37i9dQZF1DX8Uebhn9wzrS',
    url: 'https://open.spotify.com/search/green%20noise%20nature/playlists',
  }
];

export default function SoundscapePlayer() {
  const [activeSound, setActiveSound] = useState<SoundType>('off');
  const [volume, setVolume] = useState<number>(0.5);
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<TabType>('synth');
  const [selectedSpotifyId, setSelectedSpotifyId] = useState<string>(SPOTIFY_GREEN_PLAYLISTS[0].embedId);

  useEffect(() => {
    return () => {
      if (soundscape) soundscape.stop();
    };
  }, []);

  const handleSelectSound = (type: SoundType) => {
    if (!soundscape) return;
    if (type === activeSound || type === 'off') {
      soundscape.stop();
      setActiveSound('off');
    } else {
      soundscape.setVolume(volume);
      soundscape.play(type);
      setActiveSound(type);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (soundscape) soundscape.setVolume(newVol);
  };

  const isGreenActive = activeSound === 'green';

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button
        className="header-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          color: activeSound !== 'off' ? 'var(--accent-2)' : undefined,
          borderColor: activeSound !== 'off' ? 'rgba(91, 200, 200, 0.4)' : undefined,
          background: activeSound !== 'off' ? 'var(--accent-2-glow)' : undefined,
        }}
        title="Ambient Calming Sounds & Spotify Green Noise"
      >
        {activeSound === 'off' ? (
          <VolumeX size={15} />
        ) : (
          <Volume2 size={15} className="animate-pulse" />
        )}
        <span style={{ fontSize: '12px', fontWeight: 600 }}>
          {activeSound === 'off' ? 'Audio & Green Noise' : activeSound.toUpperCase()}
        </span>
      </button>

      {/* Audio Panel Dropdown */}
      {isOpen && (
        <div
          className="glass settings-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '320px',
            padding: '18px',
            borderRadius: 'var(--radius-xl)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
          }}
        >
          {/* Header & Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Relaxation Audio
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setTab('synth')}
                style={{
                  padding: '3px 9px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  background: tab === 'synth' ? 'var(--accent-glow)' : 'transparent',
                  color: tab === 'synth' ? 'var(--accent-soft)' : 'var(--text-muted)',
                }}
              >
                Built-in
              </button>
              <button
                onClick={() => setTab('spotify')}
                style={{
                  padding: '3px 9px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  background: tab === 'spotify' ? 'rgba(30, 215, 96, 0.2)' : 'transparent',
                  color: tab === 'spotify' ? '#1ed760' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Music2 size={11} /> Spotify
              </button>
            </div>
          </div>

          {tab === 'synth' ? (
            /* Built-in Procedural Audio */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Highlighted Green Noise Preset */}
              <button
                onClick={() => handleSelectSound('green')}
                className={`mode-pill ${isGreenActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  justifyContent: 'flex-start',
                  borderColor: isGreenActive ? 'rgba(91, 200, 200, 0.6)' : 'rgba(91, 200, 200, 0.25)',
                  background: isGreenActive ? 'rgba(91, 200, 200, 0.2)' : 'rgba(91, 200, 200, 0.05)',
                }}
              >
                <Leaf size={16} color="#5bc8c8" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#5bc8c8' }}>
                    🌿 Pure Green Noise (500Hz)
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Natural forest canopy & stream frequencies
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSelectSound('rain')}
                className={`mode-pill ${activeSound === 'rain' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', justifyContent: 'flex-start' }}
              >
                <CloudRain size={14} /> Soft Rainfall
              </button>

              <button
                onClick={() => handleSelectSound('ocean')}
                className={`mode-pill ${activeSound === 'ocean' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', justifyContent: 'flex-start' }}
              >
                <Waves size={14} /> Ocean Waves (9s swell)
              </button>

              <button
                onClick={() => handleSelectSound('zen')}
                className={`mode-pill ${activeSound === 'zen' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', justifyContent: 'flex-start' }}
              >
                <Sparkles size={14} /> 432Hz Zen Meditation Drone
              </button>

              {activeSound !== 'off' && (
                <button
                  onClick={() => handleSelectSound('off')}
                  className="mode-pill"
                  style={{ color: '#ff7675', borderColor: 'rgba(255, 118, 117, 0.3)', padding: '7px 12px', marginTop: '2px' }}
                >
                  Turn off sound
                </button>
              )}

              {/* Volume Slider */}
              {activeSound !== 'off' && (
                <div style={{ marginTop: '6px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>Volume</span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  />
                </div>
              )}
            </div>
          ) : (
            /* Spotify Green Noise Hub */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Browse curated <strong>Green Noise</strong> on Spotify. Play previews below or open in your Spotify app for 10-hour uninterrupted streams:
              </div>

              {/* Embedded Mini Player */}
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <iframe
                  style={{ borderRadius: '12px', display: 'block' }}
                  src={`https://open.spotify.com/embed/playlist/${selectedSpotifyId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title="Spotify Green Noise Player"
                />
              </div>

              {/* Playlist Selection Pill Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                {SPOTIFY_GREEN_PLAYLISTS.map((p) => (
                  <button
                    key={p.embedId}
                    onClick={() => setSelectedSpotifyId(p.embedId)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: selectedSpotifyId === p.embedId ? 'rgba(30, 215, 96, 0.5)' : 'var(--glass-border)',
                      background: selectedSpotifyId === p.embedId ? 'rgba(30, 215, 96, 0.12)' : 'rgba(255,255,255,0.02)',
                      color: selectedSpotifyId === p.embedId ? '#1ed760' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '11px',
                      textAlign: 'left',
                    }}
                  >
                    <span>{p.title}</span>
                    <Radio size={12} opacity={selectedSpotifyId === p.embedId ? 1 : 0.4} />
                  </button>
                ))}
              </div>

              {/* Direct Link to Explore More Green Noise on Spotify */}
              <a
                href="https://open.spotify.com/search/green%20noise/playlists"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(30, 215, 96, 0.15)',
                  border: '1px solid rgba(30, 215, 96, 0.4)',
                  color: '#1ed760',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  marginTop: '4px',
                  transition: 'all 0.2s',
                }}
              >
                <span>Search more Green Noise on Spotify</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
