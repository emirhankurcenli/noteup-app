import { useRef } from "react";
import { NativeBridge } from "../services/nativeBridge";

const useSpeechTranscription = ({ lang, setLiveTranscription }) => {
  const speechRecognitionRef = useRef(null);
  const speechListenerRef = useRef(null);
  const transcribedTextRef = useRef("");

  const startTranscription = async () => {
    transcribedTextRef.current = "";

    if (NativeBridge.isNative()) {
      if (speechListenerRef.current) {
        try {
          speechListenerRef.current.remove();
        } catch (e) {}
        speechListenerRef.current = null;
      }
      speechListenerRef.current = await NativeBridge.addSpeechListener(
        (data) => {
          if (data && data.transcript) {
            const newText = data.transcript;
            if (data.isFinal) {
              transcribedTextRef.current =
                (transcribedTextRef.current
                  ? transcribedTextRef.current + " "
                  : "") + newText;
            }
            const currentFull =
              (transcribedTextRef.current
                ? transcribedTextRef.current + " "
                : "") + (data.isFinal ? "" : newText);
            setLiveTranscription(currentFull.trim());
          }
        },
      );

      try {
        await NativeBridge.startSpeechRecognition(
          lang === "tr" ? "tr-TR" : "en-US",
        );
      } catch (srErr) {
        console.warn("startSpeechRecognition failed:", srErr);
      }
    } else {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = lang === "tr" ? "tr-TR" : "en-US";
          recognition.onresult = (event) => {
            let transcript = "";
            for (let i = 0; i < event.results.length; i++)
              transcript += event.results[i][0].transcript;
            transcribedTextRef.current = transcript;
            setLiveTranscription(transcript);
          };
          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (srErr) {}
      }
    }
  };

  const stopTranscription = () => {
    if (NativeBridge.isNative()) {
      try {
        NativeBridge.stopSpeechRecognition();
      } catch (err) {}
      if (speechListenerRef.current) {
        try {
          speechListenerRef.current.remove();
        } catch (e) {}
        speechListenerRef.current = null;
      }
    } else {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (err) {}
        speechRecognitionRef.current = null;
      }
    }
  };

  const resumeWebTranscription = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang === "tr" ? "tr-TR" : "en-US";
        const baseTranscript = transcribedTextRef.current
          ? transcribedTextRef.current + " "
          : "";
        recognition.onresult = (event) => {
          let transcript = "";
          for (let i = 0; i < event.results.length; i++)
            transcript += event.results[i][0].transcript;
          const fullTranscript = baseTranscript + transcript;
          transcribedTextRef.current = fullTranscript;
          setLiveTranscription(fullTranscript);
        };
        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (srErr) {}
    }
  };

  return {
    speechRecognitionRef,
    speechListenerRef,
    transcribedTextRef,
    startTranscription,
    stopTranscription,
    resumeWebTranscription,
  };
};

export default useSpeechTranscription;
