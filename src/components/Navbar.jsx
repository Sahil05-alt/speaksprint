import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mic, BarChart2, Clock, Sun, Moon, Zap } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
    const { state, toggleTheme } = useApp();
    const location = useLocation();
    const path = location.pathname;

    const links = [
        { to: '/', label: 'Practice', icon: <Mic size={18} /> },
        { to: '/dashboard', label: 'Progress', icon: <BarChart2 size={18} /> },
        { to: '/history', label: 'History', icon: <Clock size={18} /> },
    ];

    return (
        <nav className="navbar">
            <div className="container nav-inner">
                {/* Logo */}
                <Link to="/" className="nav-logo">
                    <span className="logo-icon">🎤</span>
                    <span className="logo-text">Speak<span className="">Sprint</span></span>
                </Link>

                {/* Center links */}
                <div className="nav-links">
                    {links.map(l => (
                        <Link
                            key={l.to}
                            to={l.to}
                            className={`nav-link ${path === l.to ? 'active' : ''}`}
                        >
                            {l.icon}
                            <span>{l.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Right actions */}
                <div className="nav-actions">
                    <div className="nav-points">
                        <Zap size={14} />
                        <span>{state.totalPoints} pts</span>
                    </div>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        title="Toggle dark/light mode"
                    >
                        {state.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </div>

            {/* Mobile bottom nav */}
            <div className="mobile-nav">
                {links.map(l => (
                    <Link key={l.to} to={l.to} className={`mobile-nav-link ${path === l.to ? 'active' : ''}`}>
                        {l.icon}
                        <span>{l.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
