// src/hooks/useSpeechRecognition.js
// Browser-native Web Speech API — no API keys required.
// Fixes: auto-restarts when browser stops recognition mid-session (common in Chrome).

import { useState, useRef, useCallback, useEffect } from 'react';

const SpeechRecognitionAPI =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

export function useSpeechRecognition() {
    const [finalTranscript, setFinalTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);

    const recognitionRef = useRef(null);
    const shouldRunRef = useRef(false); // true while session is active
    const finalAccumRef = useRef('');   // keep running total outside state
    const supported = Boolean(SpeechRecognitionAPI);

    function createAndStart() {
        if (!shouldRunRef.current) return;

        const sr = new SpeechRecognitionAPI();
        sr.continuous = true;
        sr.interimResults = true;
        sr.lang = 'en-US';
        sr.maxAlternatives = 1;

        sr.onresult = (event) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const text = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += text + ' ';
                } else {
                    interim += text;
                }
            }
            if (final) {
                finalAccumRef.current += final;
                setFinalTranscript(finalAccumRef.current);
            }
            setInterimTranscript(interim);
        };

        sr.onerror = (e) => {
            // Ignore expected "no-speech" and "aborted" (our own stop() call)
            if (e.error === 'no-speech' || e.error === 'aborted') return;
            console.warn('[SpeechRecognition] error:', e.error);
            setError(e.error);
        };

        // KEY FIX: auto-restart if we're still supposed to be listening
        sr.onend = () => {
            setInterimTranscript('');
            if (shouldRunRef.current) {
                // Browser stopped recognition (silence timeout, etc.) — restart immediately
                try { createAndStart(); } catch (_) { }
            } else {
                setIsListening(false);
            }
        };

        recognitionRef.current = sr;
        try {
            sr.start();
            setIsListening(true);
        } catch (e) {
            // If already started, ignore
            if (!e.message.includes('already started')) {
                setError(e.message);
            }
        }
    }

    const start = useCallback(() => {
        if (!supported) { setError('Speech recognition not supported in this browser.'); return; }

        // Reset
        finalAccumRef.current = '';
        setFinalTranscript('');
        setInterimTranscript('');
        setError(null);
        shouldRunRef.current = true;

        createAndStart();
    }, [supported]);

    const stop = useCallback(() => {
        shouldRunRef.current = false;
        setInterimTranscript('');
        setIsListening(false);
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (_) { }
            recognitionRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => () => {
        shouldRunRef.current = false;
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (_) { }
        }
    }, []);

    return {
        supported,
        isListening,
        finalTranscript,
        interimTranscript,
        liveTranscript: (finalTranscript + interimTranscript).trim(),
        error,
        start,
        stop,
    };
}
