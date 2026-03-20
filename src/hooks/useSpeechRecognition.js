// src/hooks/useSpeechRecognition.js
// Uses the browser-native Web Speech API — no API keys, no cost.

import { useState, useRef, useCallback, useEffect } from 'react';

const SpeechRecognitionAPI =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

export function useSpeechRecognition() {
    const [finalTranscript, setFinalTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);

    const recognitionRef = useRef(null);
    const supported = Boolean(SpeechRecognitionAPI);

    // Build a new recognition instance each session
    function buildRecognition() {
        if (!supported) return null;
        const sr = new SpeechRecognitionAPI();
        sr.continuous = true;   // keep listening until we stop it
        sr.interimResults = true;   // stream partial results live
        sr.lang = 'en-US';
        sr.maxAlternatives = 1;
        return sr;
    }

    const start = useCallback(() => {
        if (!supported) { setError('Speech recognition not supported in this browser.'); return; }

        // Reset state
        setFinalTranscript('');
        setInterimTranscript('');
        setError(null);

        const sr = buildRecognition();

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
            if (final) setFinalTranscript(prev => prev + final);
            setInterimTranscript(interim);
        };

        sr.onerror = (e) => {
            // 'no-speech' is expected when user is quiet; don't surface as a UI error
            if (e.error !== 'no-speech') {
                setError(e.error);
            }
        };

        sr.onend = () => {
            setIsListening(false);
            setInterimTranscript('');
        };

        recognitionRef.current = sr;
        try {
            sr.start();
            setIsListening(true);
        } catch (e) {
            setError(e.message);
        }
    }, [supported]);

    const stop = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
        setInterimTranscript('');
    }, []);

    // Hard-stop on unmount
    useEffect(() => () => stop(), [stop]);

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
