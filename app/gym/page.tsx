"use client";

import React, { useEffect, useRef, useState } from "react";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { LLMHelper } from "realtime-ai";
import { DailyVoiceClient } from "realtime-ai-daily";
import { VoiceClientAudio, VoiceClientProvider } from "realtime-ai-react";
import { AppProvider } from "@/components/context";
import Header from "@/components/Header";
import App from "@/components/App";
import { BOT_READY_TIMEOUT, defaultConfig, defaultServices } from "@/rtvi.config";

const GymSession: React.FC = () => {
  const [isClientReady, setIsClientReady] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false); // Camera state from Session component
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const voiceClientRef = useRef<DailyVoiceClient | null>(null);

  useEffect(() => {
    // Initialize the voice client
    if (!voiceClientRef.current) {
      const voiceClient = new DailyVoiceClient({
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "/api",
        services: defaultServices,
        config: defaultConfig,
        timeout: BOT_READY_TIMEOUT,
      });
      const llmHelper = new LLMHelper({});
      voiceClient.registerHelper("llm", llmHelper);

      voiceClientRef.current = voiceClient;
    }
    setIsClientReady(true);
  }, []);

  useEffect(() => {
    // Control the webcam based on the state passed from the Session component
    if (isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error accessing webcam: ", err);
        });
    } else if (videoRef.current) {
      // Stop the webcam if the camera is off
      if (videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isCameraOn]);

  if (!isClientReady) {
    return <div>Loading voice client...</div>;
  }

  return (
    <VoiceClientProvider voiceClient={voiceClientRef.current!}>
      <AppProvider>
        <TooltipProvider>
          <main>
            <Header />
            <div id="app">
              {/* Display the webcam feed here */}
              <div className="video-container">
                <video
                  ref={videoRef}
                  width="640"
                  height="480"
                  autoPlay
                  playsInline
                  style={{ transform: "scaleX(-1)" }} // Mirror the video
                  className={isCameraOn ? "video-on" : "video-off"}
                />
              </div>

              {/* Pass down the camera state setter to the App */}
              <App setIsCameraOn={setIsCameraOn} />
            </div>
          </main>
          <aside id="tray" />
        </TooltipProvider>
      </AppProvider>
      <VoiceClientAudio />
    </VoiceClientProvider>
  );
};

export default GymSession;
