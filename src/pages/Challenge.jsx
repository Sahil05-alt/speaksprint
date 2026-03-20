import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TOPICS } from '../data/words';
import Timer from '../components/Timer';
import { Mic, Video, VideoOff, Play, Pause, RotateCcw, CheckCircle, RefreshCw } from 'lucide-react';
import RecordingPlayer from '../components/RecordingPlayer';
import './Challenge.css';

const TOTAL_SECONDS = 60;

export default function Challenge() {
    const { addSession } = useApp();
    const navigate = useNavigate();

    const [difficulty, setDifficulty] = useState('medium');
    const [topic, setTopic] = useState(null);
    const [phase, setPhase] = useState('idle'); // idle | countdown | running | paused | done
    const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
    const [countdownVal, setCountdownVal] = useState(3);

    // Recording mode
    const [recordingMode, setRecordingMode] = useState('audio'); // 'audio' | 'video'
    const [isRecording, setIsRecording] = useState(false);
    const [mediaDataUrl, setMediaDataUrl] = useState(null);
    const [mediaType, setMediaType] = useState(null); // 'audio' | 'video'

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const streamRef = useRef(null);
    const videoPreviewRef = useRef(null);
    const intervalRef = useRef(null);

    const [earnedPoints, setEarnedPoints] = useState(null);

    function pickTopic() {
        const pool = TOPICS[difficulty];
        setTopic(pool[Math.floor(Math.random() * pool.length)]);
        setPhase('idle');
        setTimeLeft(TOTAL_SECONDS);
        setMediaDataUrl(null);
        setMediaType(null);
        setEarnedPoints(null);
        stopMedia();
    }

    async function startSession() {
        if (!topic) return;
        setPhase('countdown');
        setCountdownVal(3);
    }

    // 3-2-1 countdown
    useEffect(() => {
        if (phase !== 'countdown') return;
        if (countdownVal <= 0) { setPhase('running'); beginRecording(); return; }
        const t = setTimeout(() => setCountdownVal(v => v - 1), 1000);
        return () => clearTimeout(t);
    }, [phase, countdownVal]);

    // Timer tick
    useEffect(() => {
        if (phase !== 'running') { clearInterval(intervalRef.current); return; }
        intervalRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { clearInterval(intervalRef.current); finishSession(); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [phase]);

    function pauseSession() {
        setPhase('paused');
        mediaRecorderRef.current?.state === 'recording' && mediaRecorderRef.current.pause();
    }

    function resumeSession() {
        setPhase('running');
        mediaRecorderRef.current?.state === 'paused' && mediaRecorderRef.current.resume();
    }

    async function finishSession() {
        setPhase('done');
        await stopMedia();
    }

    async function beginRecording() {
        try {
            const constraints = recordingMode === 'video'
                ? { audio: true, video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } }
                : { audio: true };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            chunksRef.current = [];

            // Show live preview if video
            if (recordingMode === 'video' && videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = stream;
                videoPreviewRef.current.play().catch(() => { });
            }

            const mimeType = recordingMode === 'video'
                ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm')
                : 'audio/webm';

            const mr = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mr;
            mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            mr.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                const reader = new FileReader();
                reader.onloadend = () => {
                    setMediaDataUrl(reader.result);
                    setMediaType(recordingMode);
                };
                // Only read blob if it's audio (video blobs too large for localStorage)
                if (recordingMode === 'audio') {
                    reader.readAsDataURL(blob);
                } else {
                    // For video: create object URL for playback only (not persisted)
                    const objUrl = URL.createObjectURL(blob);
                    setMediaDataUrl(objUrl);
                    setMediaType('video');
                }
                stream.getTracks().forEach(t => t.stop());
                setIsRecording(false);
                if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
            };
            mr.start();
            setIsRecording(true);
        } catch (err) {
            console.warn('Media not available:', err);
        }
    }

    function stopMedia() {
        return new Promise(resolve => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                const originalStop = mediaRecorderRef.current.onstop;
                mediaRecorderRef.current.onstop = async (...args) => {
                    if (originalStop) await originalStop(...args);
                    resolve();
                };
                mediaRecorderRef.current.stop();
            } else resolve();
        });
    }

    async function handleFinishEarly() {
        clearInterval(intervalRef.current);
        await finishSession();
    }

    function saveAndContinue() {
        const pts = addSession({
            topic,
            difficulty,
            duration: TOTAL_SECONDS - timeLeft,
            // Only save audio data URLs (video too large for localStorage)
            audioDataUrl: mediaType === 'audio' ? mediaDataUrl : null,
        });
        setEarnedPoints(pts);
    }

    function reset() {
        setPhase('idle'); setTimeLeft(TOTAL_SECONDS);
        setTopic(null); setMediaDataUrl(null);
        setMediaType(null); setEarnedPoints(null);
    }

    const diffLabels = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

    return (
        <div className="page challenge-page">
            <div className="container">

                {/* Header */}
                <div className="challenge-header animate-fadeIn">
                    <h1>Speaking Challenge</h1>
                    <p>Pick a topic, hit start, and speak for 60 seconds.</p>
                </div>

                {/* Controls row: difficulty + recording mode */}
                {phase === 'idle' && !earnedPoints && (
                    <div className="settings-row animate-fadeIn">
                        {/* Difficulty */}
                        <div className="setting-group">
                            <span className="setting-label">Difficulty</span>
                            <div className="seg-control">
                                {['easy', 'medium', 'hard'].map(d => (
                                    <button
                                        key={d}
                                        className={`seg-btn ${difficulty === d ? 'active' : ''}`}
                                        onClick={() => { setDifficulty(d); setTopic(null); }}
                                    >
                                        {d === 'easy' ? '🟢' : d === 'medium' ? '🟡' : '🔴'} {diffLabels[d]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recording mode */}
                        <div className="setting-group">
                            <span className="setting-label">Record</span>
                            <div className="seg-control">
                                <button
                                    className={`seg-btn ${recordingMode === 'audio' ? 'active' : ''}`}
                                    onClick={() => setRecordingMode('audio')}
                                >
                                    <Mic size={13} /> Audio
                                </button>
                                <button
                                    className={`seg-btn ${recordingMode === 'video' ? 'active' : ''}`}
                                    onClick={() => setRecordingMode('video')}
                                >
                                    <Video size={13} /> Video
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Arena */}
                <div className="challenge-arena">

                    {/* Topic card */}
                    {phase !== 'countdown' && (
                        <div className={`topic-card card ${topic ? 'has-topic' : ''} animate-fadeInScale`}>
                            {topic
                                ? <>
                                    <span className={`chip difficulty-${difficulty}`}>{diffLabels[difficulty]}</span>
                                    <div className="topic-word">{topic}</div>
                                    <p className="topic-hint">Speak about this for 60 seconds</p>
                                </>
                                : <div className="topic-empty">
                                    <div className="topic-icon animate-float">🎯</div>
                                    <p>Press <strong>Generate Topic</strong> to begin</p>
                                </div>
                            }
                        </div>
                    )}

                    {/* 3-2-1 countdown */}
                    {phase === 'countdown' && (
                        <div className="countdown-overlay animate-fadeInScale">
                            <div className="countdown-number animate-bounce-in" key={countdownVal}>
                                {countdownVal > 0 ? countdownVal : '🎤'}
                            </div>
                            <p>Get ready…</p>
                        </div>
                    )}

                    {/* Live video preview */}
                    {(phase === 'running' || phase === 'paused') && recordingMode === 'video' && (
                        <div className="video-preview-wrap">
                            <video
                                ref={videoPreviewRef}
                                className="video-preview"
                                muted
                                playsInline
                                autoPlay
                            />
                            {isRecording && (
                                <div className="video-rec-badge">
                                    <span className="rec-dot" /> REC
                                </div>
                            )}
                        </div>
                    )}

                    {/* Timer */}
                    {(phase === 'running' || phase === 'paused' || phase === 'done') && (
                        <div className="timer-section animate-fadeIn">
                            <Timer
                                timeLeft={timeLeft}
                                isRunning={phase === 'running'}
                                isPaused={phase === 'paused'}
                            />
                            <div className="progress-bar-track" style={{ width: '220px' }}>
                                <div className="progress-bar-fill" style={{ width: `${(timeLeft / TOTAL_SECONDS) * 100}%` }} />
                            </div>
                        </div>
                    )}

                    {/* Done card */}
                    {phase === 'done' && (
                        <div className="done-card animate-bounce-in">
                            <div className="done-icon">🎉</div>
                            <h2>Session complete!</h2>
                            <p>You spoke about <strong>"{topic}"</strong></p>

                            {earnedPoints !== null ? (
                                <div className="done-actions">
                                    <div className="points-badge">+{earnedPoints} pts earned</div>
                                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
                                        View Progress
                                    </button>
                                    <button className="btn btn-ghost" onClick={reset}>New Session</button>
                                </div>
                            ) : (
                                <div className="done-actions">
                                    {/* Playback */}
                                    {mediaDataUrl && (
                                        <RecordingPlayer src={mediaDataUrl} type={mediaType} />
                                    )}
                                    {mediaDataUrl && mediaType === 'video' && (
                                        <p className="video-note">Video is session-only and won't be saved to history.</p>
                                    )}
                                    <button className="btn btn-primary btn-lg" onClick={saveAndContinue}>
                                        <CheckCircle size={16} /> Save Session
                                    </button>
                                    <button className="btn btn-ghost" onClick={reset}>Discard</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Controls */}
                    {phase !== 'done' && (
                        <div className="controls-row">
                            {phase === 'idle' && (
                                <>
                                    <button className="btn btn-ghost" onClick={pickTopic}>
                                        <RefreshCw size={15} /> {topic ? 'New Topic' : 'Generate Topic'}
                                    </button>
                                    {topic && (
                                        <button className="btn btn-primary btn-lg" onClick={startSession}>
                                            <Play size={16} /> Start Speaking
                                        </button>
                                    )}
                                </>
                            )}
                            {phase === 'running' && (
                                <>
                                    <button className="btn btn-ghost" onClick={pauseSession}><Pause size={15} /> Pause</button>
                                    <button className="btn btn-danger" onClick={handleFinishEarly}><VideoOff size={15} /> Finish Early</button>
                                </>
                            )}
                            {phase === 'paused' && (
                                <>
                                    <button className="btn btn-primary" onClick={resumeSession}><Play size={15} /> Resume</button>
                                    <button className="btn btn-danger" onClick={handleFinishEarly}><VideoOff size={15} /> Finish</button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Recording indicator (audio only, video has on-screen badge) */}
                {isRecording && recordingMode === 'audio' && (
                    <div className="recording-bar">
                        <span className="rec-dot" />
                        <Mic size={13} /> Recording…
                    </div>
                )}
            </div>
        </div>
    );
}
