import { useApp } from '../context/AppContext';
import { BADGES } from '../data/words';
import { BarChart2, Flame, Trophy, Clock, Target, Zap } from 'lucide-react';
import './Dashboard.css';

function BadgeCard({ badge, earned }) {
    return (
        <div className={`badge-card ${earned ? 'earned' : 'locked'}`}>
            <div className="badge-icon">{earned ? badge.icon : '🔒'}</div>
            <div className="badge-label">{badge.label}</div>
            <div className="badge-desc">{badge.description}</div>
        </div>
    );
}

function MiniBar({ value, max, color }) {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    return (
        <div className="mini-bar-track">
            <div className="mini-bar-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
    );
}

export default function Dashboard() {
    const { state, earnedBadgeIds } = useApp();

    const sessions = state.sessions;
    const totalSessions = sessions.length;
    const totalPoints = state.totalPoints;
    const streak = state.streak;
    const longestStreak = state.longestStreak;

    // Stats by difficulty
    const byCounts = { easy: 0, medium: 0, hard: 0 };
    sessions.forEach(s => { if (byCounts[s.difficulty] !== undefined) byCounts[s.difficulty]++; });

    // Per-week chart: last 7 days
    const today = new Date();
    const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return d;
    });
    const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const weekBars = last7.map(d => ({
        label: dayLabels[d.getDay()],
        count: sessions.filter(s => {
            const sd = new Date(s.timestamp);
            return sd.getFullYear() === d.getFullYear() &&
                sd.getMonth() === d.getMonth() &&
                sd.getDate() === d.getDate();
        }).length,
    }));
    const weekMax = Math.max(...weekBars.map(b => b.count), 1);

    // Next badge
    const nextBadge = BADGES.find(b => !earnedBadgeIds.includes(b.id));

    return (
        <div className="page dashboard-page">
            <div className="container">
                <div className="page-header animate-fadeIn">
                    <h1><BarChart2 className="page-header-icon" size={28} /> Progress Dashboard</h1>
                    <p>Track your speaking journey and achievements.</p>
                </div>

                {/* KPI row */}
                <div className="kpi-grid animate-fadeIn">
                    {[
                        { icon: <Target size={20} />, value: totalSessions, label: 'Total Sessions', color: '#7c3aed' },
                        { icon: <Flame size={20} />, value: streak, label: 'Current Streak 🔥', color: '#f59e0b' },
                        { icon: <Trophy size={20} />, value: longestStreak, label: 'Best Streak', color: '#10b981' },
                        { icon: <Zap size={20} />, value: totalPoints, label: 'Total Points', color: '#a855f7' },
                    ].map(k => (
                        <div key={k.label} className="kpi-card stat-box">
                            <div className="kpi-icon" style={{ color: k.color }}>{k.icon}</div>
                            <div className="stat-value">{k.value}</div>
                            <div className="stat-label">{k.label}</div>
                        </div>
                    ))}
                </div>

                <div className="dash-grid animate-fadeIn">
                    {/* Weekly bar chart */}
                    <div className="card weekly-card">
                        <h3 className="card-title">This Week</h3>
                        <div className="bar-chart">
                            {weekBars.map((b, i) => (
                                <div key={i} className="bar-col">
                                    <div className="bar-value">{b.count > 0 ? b.count : ''}</div>
                                    <div
                                        className="bar-fill"
                                        style={{
                                            height: `${(b.count / weekMax) * 80}px`,
                                            background: b.count > 0
                                                ? 'linear-gradient(to top, #7c3aed, #a855f7)'
                                                : 'var(--border-subtle)',
                                        }}
                                    />
                                    <div className="bar-label">{b.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty breakdown */}
                    <div className="card diff-card">
                        <h3 className="card-title">By Difficulty</h3>
                        <div className="diff-list">
                            {[
                                { key: 'easy', label: '🟢 Easy', color: '#10b981' },
                                { key: 'medium', label: '🟡 Medium', color: '#f59e0b' },
                                { key: 'hard', label: '🔴 Hard', color: '#ef4444' },
                            ].map(d => (
                                <div key={d.key} className="diff-row">
                                    <span className="diff-row-label">{d.label}</span>
                                    <MiniBar value={byCounts[d.key]} max={totalSessions || 1} color={d.color} />
                                    <span className="diff-row-count">{byCounts[d.key]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Next badge */}
                {nextBadge && (
                    <div className="next-badge-banner animate-fadeIn">
                        <div>
                            <div className="next-badge-label">Next Badge</div>
                            <div className="next-badge-name">{nextBadge.icon} {nextBadge.label}</div>
                            <div className="next-badge-desc">{nextBadge.description}</div>
                        </div>
                        <div className="next-badge-progress">
                            <div className="progress-bar-track" style={{ width: '120px' }}>
                                <div
                                    className="progress-bar-fill"
                                    style={{
                                        width: `${Math.min(100,
                                            nextBadge.type === 'sessions' ? (totalSessions / nextBadge.requirement) * 100 :
                                                nextBadge.type === 'streak' ? (longestStreak / nextBadge.requirement) * 100 :
                                                    nextBadge.type === 'points' ? (totalPoints / nextBadge.requirement) * 100 :
                                                        0
                                        )}%`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Badges */}
                <section className="animate-fadeIn">
                    <h2 className="section-heading">Achievements ({earnedBadgeIds.length}/{BADGES.length})</h2>
                    <div className="badges-grid">
                        {BADGES.map(b => (
                            <BadgeCard key={b.id} badge={b} earned={earnedBadgeIds.includes(b.id)} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
