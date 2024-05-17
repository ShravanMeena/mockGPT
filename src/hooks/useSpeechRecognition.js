import { useState, useEffect, useRef } from "react";

export const useSpeechRecognition = (onResult) => {
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef(""); // Using a ref to hold the final transcript
  const [startLoading, setStartLoading] = useState(false);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert(
        "Your browser does not support the Web Speech API. Please use a supported browser like Google Chrome."
      );
      return;
    }
    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true; // Allow interim results to accumulate the final transcript
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(interimTranscript);
      console.log("Interim transcript:", interimTranscript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Error occurred in recognition:", event.error);
    };

    recognitionRef.current.onend = () => {
      onResult(finalTranscriptRef.current);
      setInterimTranscript("");
      finalTranscriptRef.current = "";
    };
  }, [onResult]);

  const [interimTranscript, setInterimTranscript] = useState("");

  const startRecognition = () => {
      setStartLoading(true);

    if (recognitionRef.current) {
      recognitionRef.current.start();
      console.log("Voice recognition started.");
    }
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      console.log("Voice recognition stopped.");
    }
    setStartLoading(false);
  };

  return {
    finalTranscript: finalTranscriptRef.current,
    interimTranscript,
    startLoading,
    startRecognition,
    stopRecognition,
  };
};
