import { useEffect, useRef, useState } from 'react';
import './Timer.css';

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const TOTAL_SECONDS = 60;

export default function Timer({ timeLeft, isRunning, isPaused }) {
    const progress = timeLeft / TOTAL_SECONDS;
    const dashOffset = CIRCUMFERENCE * (1 - progress);

    const urgentColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : null;

    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');

    return (
        <div className={`timer-wrapper ${isRunning && !isPaused ? 'running' : ''} ${timeLeft <= 10 ? 'urgent' : ''}`}>
            <svg
                className="timer-svg"
                width="220"
                height="220"
                viewBox="0 0 220 220"
                aria-label={`${minutes}:${seconds} remaining`}
            >
                {/* Background ring */}
                <circle
                    cx="110"
                    cy="110"
                    r={RADIUS}
                    fill="none"
                    stroke="var(--border-subtle)"
                    strokeWidth="10"
                />

                {/* Progress ring */}
                <circle
                    cx="110"
                    cy="110"
                    r={RADIUS}
                    fill="none"
                    stroke={urgentColor || 'url(#timerGradient)'}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 110 110)"
                    className="timer-progress"
                    style={{ transition: isRunning ? 'stroke-dashoffset 1s linear, stroke 0.3s ease' : 'stroke-dashoffset 0.3s ease' }}
                />

                {/* Gradient def */}
                <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#666666" />
                    </linearGradient>
                </defs>

                {/* Glow circle at progress head */}
                {isRunning && !isPaused && progress > 0 && (
                    <circle
                        cx={110 + RADIUS * Math.cos(-Math.PI / 2 + 2 * Math.PI * (1 - progress))}
                        cy={110 + RADIUS * Math.sin(-Math.PI / 2 + 2 * Math.PI * (1 - progress))}
                        r="6"
                        fill={urgentColor || '#ffffff'}
                        className="timer-dot"
                    />
                )}
            </svg>

            {/* Center display */}
            <div className="timer-center">
                <div className={`timer-digits ${timeLeft <= 10 ? 'urgent-text' : ''}`}>
                    {minutes}:{seconds}
                </div>
                <div className="timer-status">
                    {!isRunning && timeLeft === TOTAL_SECONDS ? 'Ready' :
                        isPaused ? 'Paused' :
                            isRunning ? 'Speaking…' : 'Done'}
                </div>
            </div>
        </div>
    );
}
