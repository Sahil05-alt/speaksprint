import { useMemo } from 'react';
import { highlightFillers } from '../utils/analyzeSpeech';
import { MessageSquare, Zap, Clock, Star, AlertCircle, ChevronRight } from 'lucide-react';
import './SpeechAnalysis.css';

const SCORE_LABELS = ['', 'Needs Work', 'Needs Work', 'Developing', 'Developing', 'Fair', 'Good', 'Good', 'Great', 'Excellent', 'Outstanding'];
const SCORE_COLORS = ['', '#ff4444', '#ff4444', '#f5a623', '#f5a623', '#f5a623', '#50e3c2', '#50e3c2', '#50e3c2', '#fff', '#fff'];

function ScoreRing({ score }) {
    const radius = 40;
    const circ = 2 * Math.PI * radius;
    const pct = score / 10;
    const offset = circ * (1 - pct);
    const color = SCORE_COLORS[score] || '#888';

    return (
        <div className="score-ring-wrap">
            <svg width="104" height="104" viewBox="0 0 104 104">
                <circle cx="52" cy="52" r={radius} fill="none" stroke="var(--border-subtle)" strokeWidth="7" />
                <circle
                    cx="52" cy="52" r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    transform="rotate(-90 52 52)"
                    style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.4s ease', filter: `drop-shadow(0 0 6px ${color}66)` }}
                />
            </svg>
            <div className="score-ring-center">
                <div className="score-number" style={{ color }}>{score}</div>
                <div className="score-label">/10</div>
            </div>
        </div>
    );
}

function StatPill({ icon, value, label, color }) {
    return (
        <div className="stat-pill">
            <div className="stat-pill-icon" style={{ color }}>{icon}</div>
            <div className="stat-pill-value">{value}</div>
            <div className="stat-pill-label">{label}</div>
        </div>
    );
}

export default function SpeechAnalysis({ analysis, transcript, supported }) {
    const { wordCount, fillerCount, wpm, score, fillerBreakdown, tips } = analysis;
    const highlightedHtml = useMemo(() => highlightFillers(transcript || ''), [transcript]);

    if (!supported) {
        return (
            <div className="analysis-unsupported">
                <AlertCircle size={16} />
                <span>Speech-to-text is not supported in this browser. Try Chrome or Edge for transcript analysis.</span>
            </div>
        );
    }

    if (!transcript || wordCount === 0) {
        return (
            <div className="analysis-empty">
                <MessageSquare size={16} />
                <span>No transcript detected. Make sure your microphone is allowed and you spoke during the session.</span>
            </div>
        );
    }

    return (
        <div className="speech-analysis animate-fadeIn">

            {/* Header */}
            <div className="analysis-header">
                <h3 className="analysis-title">Speech Analysis</h3>
                <span className="analysis-powered">powered by Web Speech API</span>
            </div>

            {/* Score + Stats row */}
            <div className="analysis-top">
                <div className="score-section">
                    <ScoreRing score={score} />
                    <div className="score-verdict" style={{ color: SCORE_COLORS[score] }}>
                        {SCORE_LABELS[score]}
                    </div>
                </div>

                <div className="stats-grid">
                    <StatPill
                        icon={<MessageSquare size={14} />}
                        value={wordCount}
                        label="Words"
                        color="var(--text-secondary)"
                    />
                    <StatPill
                        icon={<Zap size={14} />}
                        value={wpm}
                        label="WPM"
                        color={wpm >= 120 && wpm <= 160 ? '#50e3c2' : '#f5a623'}
                    />
                    <StatPill
                        icon={<AlertCircle size={14} />}
                        value={fillerCount}
                        label="Fillers"
                        color={fillerCount <= 2 ? '#50e3c2' : fillerCount <= 5 ? '#f5a623' : '#ff4444'}
                    />
                    <StatPill
                        icon={<Star size={14} />}
                        value={`${score}/10`}
                        label="Score"
                        color={SCORE_COLORS[score]}
                    />
                </div>
            </div>

            {/* Filler breakdown */}
            {fillerBreakdown.length > 0 && (
                <div className="filler-breakdown">
                    <div className="analysis-section-label">Top Fillers</div>
                    <div className="filler-tags">
                        {fillerBreakdown.slice(0, 5).map(([word, count]) => (
                            <span key={word} className="filler-tag">
                                "{word}" <span className="filler-tag-count">×{count}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Tips */}
            <div className="tips-section">
                <div className="analysis-section-label">Improvement Tips</div>
                <ul className="tips-list">
                    {tips.map((tip, i) => (
                        <li key={i} className="tip-item">
                            <ChevronRight size={12} className="tip-icon" />
                            <span>{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Transcript */}
            <div className="transcript-section">
                <div className="analysis-section-label">Your Transcript</div>
                <div
                    className="transcript-body"
                    dangerouslySetInnerHTML={{ __html: highlightedHtml || '<em>No words detected.</em>' }}
                />
                <div className="transcript-legend">
                    <span className="filler-mark">highlighted</span> = filler word
                </div>
            </div>
        </div>
    );
}
