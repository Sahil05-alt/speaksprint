// src/services/nvidiaTranscription.js
// Sends a recorded audio Blob to NVIDIA NIM's Parakeet model for transcription.
// API reference: https://build.nvidia.com/nvidia/parakeet-ctc-1_1b-asr

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/audio/transcriptions';
const MODEL = 'nvidia/canary-1b';   // NVIDIA's best ASR model on NIM
const API_KEY = import.meta.env.VITE_NVIDIA_API_KEY;

/**
 * Transcribe an audio Blob using NVIDIA NIM Parakeet.
 *
 * @param {Blob}   audioBlob   - Raw audio blob from MediaRecorder (webm/ogg/wav)
 * @param {string} language    - BCP-47 language tag, default 'en'
 * @returns {Promise<{transcript: string, error: string|null}>}
 */
export async function transcribeWithNvidia(audioBlob, language = 'en') {
    if (!API_KEY) {
        return { transcript: '', error: 'NVIDIA API key not configured.' };
    }

    try {
        // Convert webm → file with a recognisable extension
        // NVIDIA accepts audio/wav, audio/flac, audio/webm, audio/ogg etc.
        const file = new File([audioBlob], 'recording.webm', { type: audioBlob.type || 'audio/webm' });

        const form = new FormData();
        form.append('file', file);
        form.append('model', MODEL);
        form.append('language', language);
        form.append('response_format', 'json');

        const res = await fetch(NVIDIA_API_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                // Content-Type is set automatically by fetch for FormData
            },
            body: form,
        });

        if (!res.ok) {
            const errText = await res.text().catch(() => res.statusText);
            console.error('[NVIDIA STT] Error:', res.status, errText);
            return { transcript: '', error: `API error ${res.status}: ${errText}` };
        }

        const data = await res.json();

        // Normalise response — NVIDIA uses OpenAI-compatible format: { text: "..." }
        const transcript = data?.text || data?.results?.[0]?.transcript || '';
        return { transcript: transcript.trim(), error: null };

    } catch (err) {
        console.error('[NVIDIA STT] Network error:', err);
        return { transcript: '', error: err.message };
    }
}
