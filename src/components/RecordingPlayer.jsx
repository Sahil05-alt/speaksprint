import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import './RecordingPlayer.css';

export default function RecordingPlayer({ src, type = 'audio' }) {
    const mediaRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [dragging, setDragging] = useState(false);
    const progressRef = useRef(null);

    useEffect(() => {
        const el = mediaRef.current;
        if (!el) return;
        const onTime = () => !dragging && setCurrentTime(el.currentTime);
        const onLoaded = () => setDuration(el.duration || 0);
        const onEnded = () => { setPlaying(false); setCurrentTime(0); };
        el.addEventListener('timeupdate', onTime);
        el.addEventListener('loadedmetadata', onLoaded);
        el.addEventListener('ended', onEnded);
        return () => {
            el.removeEventListener('timeupdate', onTime);
            el.removeEventListener('loadedmetadata', onLoaded);
            el.removeEventListener('ended', onEnded);
        };
    }, [dragging]);

    function togglePlay() {
        const el = mediaRef.current;
        if (!el) return;
        if (playing) { el.pause(); setPlaying(false); }
        else { el.play(); setPlaying(true); }
    }

    function restart() {
        const el = mediaRef.current;
        if (!el) return;
        el.currentTime = 0;
        setCurrentTime(0);
        el.play();
        setPlaying(true);
    }

    function seek(e) {
        if (!progressRef.current || !mediaRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const newT = pct * (duration || 0);
        mediaRef.current.currentTime = newT;
        setCurrentTime(newT);
    }

    function fmt(s) {
        if (!s || isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    }

    const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={`rp-card ${type === 'video' ? 'rp-video-mode' : 'rp-audio-mode'}`}>
            {/* Hidden/visible media element */}
            {type === 'video' ? (
                <video
                    ref={mediaRef}
                    src={src}
                    className="rp-video"
                    playsInline
                    onClick={togglePlay}
                />
            ) : (
                <audio ref={mediaRef} src={src} preload="metadata" />
            )}

            {/* Waveform-style decoration (audio only) */}
            {type === 'audio' && (
                <div className="rp-waveform" aria-hidden>
                    {Array.from({ length: 32 }).map((_, i) => {
                        // pseudo-random heights for visual interest, seeded by index
                        const h = 20 + Math.abs(Math.sin(i * 2.3 + 1.5) * 60);
                        const active = pct > 0 && (i / 32) * 100 < pct;
                        return (
                            <div
                                key={i}
                                className={`rp-bar ${active ? 'active' : ''} ${playing && active ? 'pulse' : ''}`}
                                style={{ height: `${h}%` }}
                            />
                        );
                    })}
                </div>
            )}

            {/* Video play overlay */}
            {type === 'video' && !playing && (
                <div className="rp-video-overlay" onClick={togglePlay}>
                    <div className="rp-overlay-btn"><Play size={24} /></div>
                </div>
            )}

            {/* Controls */}
            <div className="rp-controls">
                <button className="rp-play-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
                    {playing ? <Pause size={18} /> : <Play size={18} />}
                </button>

                {/* Progress */}
                <div
                    className="rp-progress"
                    ref={progressRef}
                    onClick={seek}
                    role="progressbar"
                    aria-valuenow={Math.round(pct)}
                >
                    <div className="rp-progress-track">
                        <div className="rp-progress-fill" style={{ width: `${pct}%` }} />
                        <div className="rp-progress-thumb" style={{ left: `${pct}%` }} />
                    </div>
                </div>

                {/* Time */}
                <div className="rp-time">
                    <span>{fmt(currentTime)}</span>
                    <span className="rp-time-sep">/</span>
                    <span>{fmt(duration)}</span>
                </div>

                <button className="rp-restart-btn" onClick={restart} aria-label="Restart">
                    <RotateCcw size={13} />
                </button>
            </div>

            {/* Type badge */}
            <div className="rp-type-badge">
                {type === 'video' ? '🎥 Video' : '🎙️ Audio'} · {fmt(duration)}
            </div>
        </div>
    );
}
