import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Play, Zap, Calendar, Trophy, ArrowRight } from 'lucide-react';
import './Home.css';

export default function Home() {
    const { state, earnedBadgeIds } = useApp();
    const navigate = useNavigate();

    const sessionCount = state.sessions.length;
    const recentTopics = state.sessions.slice(0, 3);

    return (
        <div className="page home-page">
            <div className="container">

                {/* Hero */}
                <section className="hero animate-fadeIn">
                    <div className="hero-badge chip chip-purple">🎤 AI-Powered Speaking Coach</div>
                    <h1 className="hero-title">
                        Become a<br />
                        <span className="gradient-text">Confident Speaker</span>
                    </h1>
                    <p className="hero-sub">
                        Practice speaking on random topics for 60 seconds a day.
                        Build fluency, confidence, and earn badges along the way.
                    </p>
                    <div className="hero-actions">
                        <button className="btn btn-primary btn-lg" onClick={() => navigate('/challenge')}>
                            <Play size={20} /> Start Speaking
                        </button>
                        {sessionCount > 0 && (
                            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/dashboard')}>
                                My Progress <ArrowRight size={16} />
                            </button>
                        )}
                    </div>
                </section>

                {/* Stats bar */}
                <div className="stats-bar animate-fadeIn">
                    <div className="stat-box">
                        <span className="stat-value">{sessionCount}</span>
                        <span className="stat-label">Sessions</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{state.streak}</span>
                        <span className="stat-label">🔥 Streak</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{state.totalPoints}</span>
                        <span className="stat-label">⚡ Points</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{earnedBadgeIds.length}</span>
                        <span className="stat-label">🏅 Badges</span>
                    </div>
                </div>

                <div className="divider" />

                {/* Feature cards */}
                <section className="features-section animate-fadeIn">
                    <h2 className="section-title">How It Works</h2>
                    <div className="features-grid">
                        {[
                            { icon: '🎯', title: 'Get a Topic', desc: 'A random word or topic is generated from 3 difficulty levels.' },
                            { icon: '⏱️', title: '60 Second Timer', desc: 'A visual countdown ring tracks your speaking session.' },
                            { icon: '🎙️', title: 'Voice Record', desc: 'Your speech is recorded for self-review and improvement.' },
                            { icon: '📊', title: 'Track Progress', desc: 'Earn points, maintain streaks, and unlock achievement badges.' },
                        ].map(f => (
                            <div key={f.title} className="feature-card card">
                                <div className="feature-icon">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent sessions */}
                {recentTopics.length > 0 && (
                    <>
                        <div className="divider" />
                        <section className="recent-section animate-fadeIn">
                            <div className="section-header">
                                <h2 className="section-title">Recent Sessions</h2>
                                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/history')}>
                                    View All <ArrowRight size={14} />
                                </button>
                            </div>
                            <div className="recent-list">
                                {recentTopics.map(s => (
                                    <div key={s.id} className="recent-item card">
                                        <div className="recent-topic">{s.topic}</div>
                                        <div className="recent-meta">
                                            <span className={`chip difficulty-${s.difficulty}`}>{s.difficulty}</span>
                                            <span className="chip chip-purple">+{s.points} pts</span>
                                            <span className="recent-date">
                                                {new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {/* CTA */}
                <div className="cta-banner animate-fadeIn">
                    <div className="cta-content">
                        <h2>Ready to find your voice?</h2>
                        <p>Start your first 60-second challenge right now.</p>
                    </div>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/challenge')}>
                        <Play size={18} /> Begin Challenge
                    </button>
                </div>
            </div>
        </div>
    );
}
