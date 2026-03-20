import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, Play, Clock, ChevronDown, ChevronUp, Search } from 'lucide-react';
import './History.css';

export default function History() {
    const { state, deleteSession } = useApp();
    const [expandedId, setExpandedId] = useState(null);
    const [search, setSearch] = useState('');
    const [filterDiff, setFilterDiff] = useState('all');

    const sessions = state.sessions;

    const filtered = sessions.filter(s => {
        const matchSearch = s.topic.toLowerCase().includes(search.toLowerCase());
        const matchDiff = filterDiff === 'all' || s.difficulty === filterDiff;
        return matchSearch && matchDiff;
    });

    function formatDate(iso) {
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }

    function formatTime(iso) {
        return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    function formatDuration(sec) {
        if (!sec) return '60s';
        return sec >= 60 ? '60s' : `${sec}s`;
    }

    return (
        <div className="page history-page">
            <div className="container">
                <div className="page-header animate-fadeIn">
                    <h1><Clock size={26} style={{ color: 'var(--accent-secondary)' }} /> Session History</h1>
                    <p>Review your past sessions and listen to your recordings.</p>
                </div>

                {/* Filters */}
                <div className="history-filters animate-fadeIn">
                    <div className="search-wrapper">
                        <Search size={15} className="search-icon" />
                        <input
                            className="input search-input"
                            placeholder="Search topics…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="filter-tabs">
                        {['all', 'easy', 'medium', 'hard'].map(d => (
                            <button
                                key={d}
                                className={`filter-tab ${filterDiff === d ? 'active' : ''}`}
                                onClick={() => setFilterDiff(d)}
                            >
                                {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                {filtered.length === 0 ? (
                    <div className="history-empty animate-fadeInScale">
                        <div className="empty-icon animate-float">📂</div>
                        <h3>{sessions.length === 0 ? 'No sessions yet' : 'No sessions match your search'}</h3>
                        <p>{sessions.length === 0 ? 'Complete your first speaking challenge to see it here.' : 'Try adjusting your filters.'}</p>
                    </div>
                ) : (
                    <div className="history-list animate-fadeIn">
                        <div className="history-count">{filtered.length} session{filtered.length !== 1 ? 's' : ''}</div>
                        {filtered.map(s => (
                            <div key={s.id} className={`history-item card ${expandedId === s.id ? 'expanded' : ''}`}>
                                <div className="history-row" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                                    <div className="history-left">
                                        <div className="history-topic">{s.topic}</div>
                                        <div className="history-meta">
                                            <span className={`chip difficulty-${s.difficulty}`}>{s.difficulty}</span>
                                            <span className="history-date">{formatDate(s.timestamp)}</span>
                                            <span className="history-time">{formatTime(s.timestamp)}</span>
                                        </div>
                                    </div>
                                    <div className="history-right">
                                        <div className="history-points chip chip-purple">+{s.points} pts</div>
                                        <div className="history-dur">
                                            <Clock size={12} /> {formatDuration(s.duration)}
                                        </div>
                                        <button className="expand-btn">
                                            {expandedId === s.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded section */}
                                {expandedId === s.id && (
                                    <div className="history-expanded">
                                        <div className="divider" style={{ margin: '12px 0' }} />
                                        {s.audioDataUrl ? (
                                            <div className="audio-section">
                                                <p className="audio-label">🎙️ Your Recording</p>
                                                <audio controls src={s.audioDataUrl} className="audio-player" />
                                            </div>
                                        ) : (
                                            <p className="no-audio">No recording saved for this session.</p>
                                        )}
                                        <div className="history-actions">
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                style={{ color: 'var(--accent-danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                                                onClick={() => { deleteSession(s.id); if (expandedId === s.id) setExpandedId(null); }}
                                            >
                                                <Trash2 size={13} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
