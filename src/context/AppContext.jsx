import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BADGES, POINTS_PER_SESSION } from '../data/words';

const AppContext = createContext(null);

const DEFAULT_STATE = {
    sessions: [],        // Array of session objects
    streak: 0,
    longestStreak: 0,
    totalPoints: 0,
    hardSessions: 0,
    lastSessionDate: null,
    theme: 'dark',
};

function loadState() {
    try {
        const raw = localStorage.getItem('speaksprint_state');
        return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
    } catch { return DEFAULT_STATE; }
}

function saveState(state) {
    try { localStorage.setItem('speaksprint_state', JSON.stringify(state)); } catch { }
}

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

function isYesterday(date, today) {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return isSameDay(new Date(date), yesterday);
}

export function AppProvider({ children }) {
    const [state, setState] = useState(loadState);

    // Persist on change
    useEffect(() => { saveState(state); }, [state]);

    // Compute earned badge ids
    const earnedBadgeIds = BADGES.filter(b => {
        if (b.type === 'sessions') return state.sessions.length >= b.requirement;
        if (b.type === 'streak') return state.longestStreak >= b.requirement;
        if (b.type === 'points') return state.totalPoints >= b.requirement;
        if (b.type === 'hard_sessions') return state.hardSessions >= b.requirement;
        return false;
    }).map(b => b.id);

    const toggleTheme = useCallback(() => {
        setState(s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }));
    }, []);

    const addSession = useCallback((session) => {
        // session: { topic, difficulty, duration, recordingBlob, timestamp }
        const now = new Date();
        const points = POINTS_PER_SESSION[session.difficulty] || 10;

        setState(prev => {
            const lastDate = prev.lastSessionDate ? new Date(prev.lastSessionDate) : null;
            let newStreak = prev.streak;

            if (!lastDate || isYesterday(prev.lastSessionDate, now)) {
                newStreak = prev.streak + 1;
            } else if (!isSameDay(lastDate, now)) {
                newStreak = 1; // reset
            }
            // Same day keeps streak same

            const longestStreak = Math.max(prev.longestStreak, newStreak);

            // Build session record (store audio as base64 if exists)
            const record = {
                id: Date.now(),
                topic: session.topic,
                difficulty: session.difficulty,
                duration: session.duration,
                timestamp: now.toISOString(),
                points,
                audioDataUrl: session.audioDataUrl || null,
            };

            return {
                ...prev,
                sessions: [record, ...prev.sessions],
                streak: newStreak,
                longestStreak,
                totalPoints: prev.totalPoints + points,
                hardSessions: prev.hardSessions + (session.difficulty === 'hard' ? 1 : 0),
                lastSessionDate: now.toISOString(),
            };
        });

        return points;
    }, []);

    const deleteSession = useCallback((id) => {
        setState(prev => ({ ...prev, sessions: prev.sessions.filter(s => s.id !== id) }));
    }, []);

    return (
        <AppContext.Provider value={{ state, earnedBadgeIds, toggleTheme, addSession, deleteSession }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
