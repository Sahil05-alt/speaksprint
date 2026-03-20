// src/utils/analyzeSpeech.js
// Free, pure JS analysis — no API calls.

const FILLER_WORDS = [
    'um', 'uh', 'like', 'you know', 'basically', 'actually',
    'literally', 'right', 'so', 'kind of', 'sort of', 'i mean',
];

/**
 * Tokenize transcript into words (lowercase, alpha only)
 */
function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z\s]/g, '')
        .split(/\s+/)
        .filter(Boolean);
}

/**
 * Count multi-word filler phrases first, then single-word fillers
 * to avoid double-counting "you know" as "you" + "know".
 */
function countFillers(text) {
    const lower = text.toLowerCase();
    let count = 0;
    const hits = {}; // track per-filler count

    // multi-word fillers first
    const multiWord = FILLER_WORDS.filter(f => f.includes(' '));
    const singleWord = FILLER_WORDS.filter(f => !f.includes(' '));

    for (const filler of multiWord) {
        const regex = new RegExp(`\\b${filler}\\b`, 'gi');
        const matches = lower.match(regex) || [];
        count += matches.length;
        hits[filler] = matches.length;
    }

    // strip matched phrases before single-word pass
    let stripped = lower;
    for (const filler of multiWord) {
        stripped = stripped.replace(new RegExp(`\\b${filler}\\b`, 'gi'), '');
    }

    for (const filler of singleWord) {
        const regex = new RegExp(`\\b${filler}\\b`, 'gi');
        const matches = stripped.match(regex) || [];
        count += matches.length;
        hits[filler] = (hits[filler] || 0) + matches.length;
    }

    // Only return fillers that were actually found
    const found = Object.entries(hits)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1]);

    return { count, found };
}

/**
 * Score logic (1–10)
 * Starts at 10, deducts for issues, floors at 1.
 */
function calcScore({ wordCount, fillerCount, wpm, durationSec }) {
    let score = 10;

    // Penalise for very low content
    if (wordCount < 10) score -= 4;
    else if (wordCount < 30) score -= 2;

    // Penalise for filler ratio
    const fillerRatio = wordCount > 0 ? fillerCount / wordCount : 0;
    if (fillerRatio > 0.25) score -= 3;
    else if (fillerRatio > 0.15) score -= 2;
    else if (fillerRatio > 0.08) score -= 1;

    // Reward good speaking pace (ideal: 120–160 WPM)
    if (wpm >= 120 && wpm <= 160) score += 0;        // perfect
    else if (wpm >= 90 && wpm < 120) score -= 1;     // a bit slow
    else if (wpm > 160 && wpm <= 190) score -= 1;    // a bit fast
    else if (wpm < 60 || wpm > 200) score -= 2;     // too slow / too fast

    // Bonus for speaking for nearly the full duration
    if (durationSec >= 55) score += 1;

    return Math.max(1, Math.min(10, Math.round(score)));
}

/**
 * @param {string} transcript - final transcript text
 * @param {number} durationSec - actual seconds the user spoke (0–60)
 * @returns {{wordCount, fillerCount, fillerBreakdown, wpm, score, tips}}
 */
export function analyzeSpeech(transcript, durationSec = 60) {
    if (!transcript || !transcript.trim()) {
        return { wordCount: 0, fillerCount: 0, fillerBreakdown: [], wpm: 0, score: 0, tips: [] };
    }

    const words = tokenize(transcript);
    const wordCount = words.length;
    const { count: fillerCount, found: fillerBreakdown } = countFillers(transcript);
    const minutes = Math.max(durationSec, 1) / 60;
    const wpm = Math.round(wordCount / minutes);
    const score = calcScore({ wordCount, fillerCount, wpm, durationSec });

    // Personalised improvement tips
    const tips = [];
    if (fillerCount > 3) tips.push(`You used filler words ${fillerCount} times. Pause instead of saying "um" or "like".`);
    if (wpm < 90) tips.push('Your pace was slow — try speaking with more energy and confidence.');
    if (wpm > 180) tips.push('You spoke quite fast. Slow down to let your words land.');
    if (wordCount < 30) tips.push('You could elaborate more — aim for fuller sentences and more detail.');
    if (score >= 8) tips.push('Excellent session! Keep practising daily to maintain this level.');
    else if (score >= 5) tips.push('Good effort! Focus on reducing fillers and maintaining a steady pace.');
    if (tips.length === 0) tips.push('Solid performance. Keep building on your speaking habits every day.');

    return { wordCount, fillerCount, fillerBreakdown, wpm, score, tips };
}

/**
 * Highlight filler words inside a transcript string → HTML string.
 */
export function highlightFillers(transcript) {
    let result = transcript;
    // multi-word first
    const sorted = [...FILLER_WORDS].sort((a, b) => b.length - a.length);
    for (const filler of sorted) {
        const regex = new RegExp(`\\b(${filler})\\b`, 'gi');
        result = result.replace(regex, `<mark class="filler-mark">$1</mark>`);
    }
    return result;
}
