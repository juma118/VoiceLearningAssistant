"use client";

import { FormEvent, useRef, useState } from "react";
import { askAssistant } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AssistantResponse } from "@/lib/types";

function microphoneErrorMessage(caught: unknown) {
  if (!(caught instanceof DOMException)) {
    return "Could not start the microphone. Check that an audio input device is connected and try again.";
  }

  const messages: Record<string, string> = {
    NotFoundError: "No microphone was found. Connect a microphone or headset, then try Start Mic again.",
    NotAllowedError: "Microphone access is blocked. Allow microphone permission in your browser settings and try again.",
    NotReadableError: "Your microphone is already in use by another app. Close the other app and try again.",
    OverconstrainedError: "The selected microphone settings are not available on this device.",
    SecurityError: "Microphone access is only available on secure pages or localhost.",
    AbortError: "The microphone could not start. Please try again.",
  };

  return messages[caught.name] ?? "Could not start the microphone. Check your audio device and browser permissions.";
}

function speechText(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, " code example omitted from spoken playback. ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export default function AssistantPage() {
  const { token } = useAuth();
  const [message, setMessage] = useState("Explain how APIs connect apps using a Python example.");
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [micStatus, setMicStatus] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!token) {
      setError("Login first to use the assistant.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setResponse(await askAssistant(token, { message, target_language: "en", include_audio: true }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Assistant request failed");
    } finally {
      setLoading(false);
    }
  }

  async function startRecording() {
    setError("");
    setMicStatus("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser does not support microphone recording. Try Chrome, Edge, or Firefox.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder.current = new MediaRecorder(stream);
      recorder.current.start();
      setMicStatus("Recording started. Speak your question, then press Stop Mic.");
    } catch (caught) {
      setError(microphoneErrorMessage(caught));
    }
  }

  function stopRecording() {
    if (!recorder.current || recorder.current.state === "inactive") {
      setError("No active recording found. Press Start Mic after connecting a microphone.");
      return;
    }
    recorder.current.stop();
    recorder.current.stream.getTracks().forEach((track) => track.stop());
    setMessage("Voice recording captured. Send it to the FastWhisper endpoint from the API.");
    setMicStatus("Recording stopped. Your voice input is ready to send.");
  }

  function playSpokenAnswer() {
    if (!response?.answer) {
      setError("Ask the tutor first, then play the spoken answer.");
      return;
    }
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
      setError("Your browser does not support built-in speech playback.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText(response.answer));
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      setError("Speech playback failed. Check your browser audio output settings.");
    };
    setError("");
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function stopSpokenAnswer() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="card p-6">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-600">Voice assistant</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">Ask a programming question.</h1>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <textarea className="input min-h-40" value={message} onChange={(event) => setMessage(event.target.value)} />
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" disabled={loading} type="submit">
              {loading ? "Thinking..." : "Ask Tutor"}
            </button>
            <button className="btn-secondary" type="button" onClick={startRecording}>
              Start Mic
            </button>
            <button className="btn-secondary" type="button" onClick={stopRecording}>
              Stop Mic
            </button>
          </div>
        </form>
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        {micStatus && <p className="mt-4 rounded-xl bg-mint-100 p-3 text-sm font-semibold text-brand-700">{micStatus}</p>}
      </section>

      <section className="card p-6">
        <h2 className="text-2xl font-black text-slate-950">AI Explanation</h2>
        {response ? (
          <div className="mt-5 space-y-6">
            <p className="whitespace-pre-wrap leading-8 text-slate-700">{response.answer}</p>
            {response.audio_base64 && (
              <audio controls src={`data:audio/mpeg;base64,${response.audio_base64}`} className="w-full">
                <track kind="captions" />
              </audio>
            )}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-mint-50 p-4">
              <button className="btn-primary py-2 text-sm" onClick={playSpokenAnswer} type="button">
                {speaking ? "Speaking..." : "Play Spoken Answer"}
              </button>
              <button className="btn-secondary py-2 text-sm" onClick={stopSpokenAnswer} type="button">
                Stop Audio
              </button>
              {!response.audio_base64 && (
                <p className="text-sm font-semibold text-slate-600">
                  Browser speech is used when ElevenLabs audio is not configured.
                </p>
              )}
            </div>
            <div>
              <h3 className="font-black text-slate-950">Sources</h3>
              <div className="mt-3 space-y-3">
                {response.citations.map((citation, index) => (
                  <div key={`${citation.title}-${index}`} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-bold text-slate-950">{citation.title}</p>
                    <p className="mt-1 line-clamp-3 text-sm text-slate-600">{citation.snippet}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-black text-slate-950">Follow-up Questions</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {response.suggested_followups.map((item) => (
                  <button key={item} className="rounded-full bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700" onClick={() => setMessage(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-slate-600">Answers, citations, audio playback, and suggested follow-ups appear here.</p>
        )}
      </section>
    </main>
  );
}
