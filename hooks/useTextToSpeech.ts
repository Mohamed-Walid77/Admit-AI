
import { useState, useCallback, useRef, useEffect } from 'react';
import { generateSpeech, decode, decodeAudioData } from '../services/geminiService';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Initialize AudioContext only once and only in the browser.
    if (!audioContextRef.current && typeof window !== 'undefined') {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        }
    }

    return () => {
      // Cleanup on unmount
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  const speak = useCallback(async (text: string) => {
    if (!text || isSpeaking) return;

    const audioContext = audioContextRef.current;
    if (!audioContext) {
        console.error("AudioContext is not supported or initialized.");
        return;
    }

    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    setIsSpeaking(true);

    try {
        const base64Audio = await generateSpeech(text);
        if (base64Audio) {
            const decodedBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
            
            if (sourceRef.current) {
                sourceRef.current.stop();
            }

            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.onended = () => {
                setIsSpeaking(false);
                sourceRef.current = null;
            };
            source.start();
            sourceRef.current = source;
        } else {
            setIsSpeaking(false);
        }
    } catch (error) {
        console.error("Speech synthesis failed:", error);
        setIsSpeaking(false);
    }
  }, [isSpeaking]);

  const cancel = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  return { speak, cancel, isSpeaking };
};
