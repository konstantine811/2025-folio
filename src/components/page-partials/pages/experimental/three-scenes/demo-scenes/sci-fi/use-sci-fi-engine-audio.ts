import { useCallback, useEffect, useRef } from "react";
import { useSoundEnabledStore } from "@/storage/soundEnabled";

/** A quiet filtered engine drone. Created only from the intro's user gesture. */
export function useSciFiEngineAudio() {
  const audio = useRef<AudioContext | null>(null);
  const gain = useRef<GainNode | null>(null);
  const enabled = useSoundEnabledStore((state) => state.isSoundEnabled);

  const stop = useCallback(() => {
    const context = audio.current;
    audio.current = null;
    gain.current = null;
    if (context && context.state !== "closed") void context.close();
  }, []);

  const start = useCallback(() => {
    stop();
    if (typeof AudioContext === "undefined") return;
    const context = new AudioContext();
    audio.current = context;
    const output = context.createGain();
    gain.current = output;
    output.gain.value = useSoundEnabledStore.getState().isSoundEnabled ? 0.12 : 0;
    output.connect(context.destination);
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0, context.currentTime);
    envelope.gain.linearRampToValueAtTime(0.65, context.currentTime + 4);
    envelope.gain.linearRampToValueAtTime(0.4, context.currentTime + 13);
    envelope.gain.linearRampToValueAtTime(0, context.currentTime + 22);
    envelope.connect(output);
    for (const frequency of [38, 57, 76]) {
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(envelope);
      oscillator.start();
    }
    const noise = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const source = context.createBufferSource();
    source.buffer = noise;
    source.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 180;
    source.connect(filter).connect(envelope);
    source.start();
    void context.resume().catch(stop);
  }, [stop]);

  useEffect(() => {
    if (audio.current && gain.current) {
      gain.current.gain.setTargetAtTime(enabled ? 0.12 : 0, audio.current.currentTime, 0.08);
    }
  }, [enabled]);
  useEffect(() => {
    const visibilityChanged = () => {
      const context = audio.current;
      if (!context || context.state === "closed") return;
      if (document.visibilityState === "hidden") void context.suspend().catch(() => {});
      else void context.resume().catch(() => {});
    };
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      document.removeEventListener("visibilitychange", visibilityChanged);
      stop();
    };
  }, [stop]);
  return { start, stop };
}
