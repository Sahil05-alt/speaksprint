// src/services/nvidiaTranscription.js
// Sends recorded audio to NVIDIA NIM for high-quality transcription.

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/audio/transcriptions';
const API_KEY = import.meta.env.VITE_NVIDIA_API_KEY;

// NVIDIA NIM model options (try in order until one works)
const MODEL_CANDIDATES = [
    'nvidia/parakeet-ctc-1_1b-asr',  // Parakeet CTC 1.1B — best accuracy
    'nvidia/canary-1b',               // Canary 1B — multilingual fallback
];

/**
 * Transcribe an audio Blob using NVIDIA NIM.
 *
 * @param {Blob}   audioBlob   - Raw audio blob from MediaRecorder
 * @param {string} language    - Language code, default 'en'
 * @returns {Promise<{transcript: string, error: string|null, model: string|null}>}
 */
export async function transcribeWithNvidia(audioBlob, language = 'en') {
    if (!API_KEY) {
        console.warn('[NVIDIA STT] API key not set — set VITE_NVIDIA_API_KEY in .env');
        return { transcript: '', error: 'NVIDIA API key not configured.', model: null };
    }

    for (const model of MODEL_CANDIDATES) {
        try {
            const file = new File(
                [audioBlob],
                'recording.webm',
                { type: audioBlob.type || 'audio/webm' },
            );

            const form = new FormData();
            form.append('file', file);
            form.append('model', model);
            form.append('language', language);
            form.append('response_format', 'json');

            console.log(`[NVIDIA STT] Trying model: ${model}`);

            const res = await fetch(NVIDIA_API_URL, {
                method: 'POST',
                headers: { Authorization: `Bearer ${API_KEY}` },
                body: form,
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => res.statusText);
                console.warn(`[NVIDIA STT] ${model} → ${res.status}: ${errText}`);
                // Try next model if it's a model-not-found error (404/422)
                if (res.status === 404 || res.status === 422) continue;
                return { transcript: '', error: `API error ${res.status}`, model };
            }

            const data = await res.json();
            console.log('[NVIDIA STT] Response:', data);

            // NVIDIA NIM returns OpenAI-compatible { text: "..." }
            const transcript =
                data?.text ??
                data?.results?.[0]?.transcript ??
                data?.transcript ??
                '';

            if (transcript) {
                console.log(`[NVIDIA STT] Success with ${model}: "${transcript.slice(0, 60)}…"`);
                return { transcript: transcript.trim(), error: null, model };
            }

            // Empty text — try next model
            console.warn(`[NVIDIA STT] ${model} returned empty transcript`);

        } catch (err) {
            console.error(`[NVIDIA STT] Network error with ${model}:`, err);
        }
    }

    return { transcript: '', error: 'All NVIDIA models failed or returned empty.', model: null };
}
