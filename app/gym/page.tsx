"use client";

import React, { useEffect, useRef, useState } from "react";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { FunctionCallParams, LLMHelper } from "realtime-ai";
import { DailyVoiceClient } from "realtime-ai-daily";
import { VoiceClientAudio, VoiceClientProvider } from "realtime-ai-react";
import { AppProvider } from "@/components/context";
import Header from "@/components/Header";
import App from "@/components/App";
import { BOT_READY_TIMEOUT, defaultConfig, defaultServices } from "@/rtvi.config";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

const GymSession: React.FC = () => {
  const [isClientReady, setIsClientReady] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false); // Camera state from Session component
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const voiceClientRef = useRef<DailyVoiceClient | null>(null);
  
  const [spotifyPlayByArtist, setSpotifyPlayByArtist] = useState(false);
  const [spotiyPlayLikedSongs, setSpotifyPlayLikedSongs] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // Canvas to draw pose landmarks
  const [isPoseActive, setIsPoseActive] = useState(false); // Pose Landmarker state
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    // Initialize the voice client
    if (!voiceClientRef.current) {
      const voiceClient = new DailyVoiceClient({
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "/api",
        services: defaultServices,
        config: defaultConfig,
        timeout: BOT_READY_TIMEOUT,
      });
      console.log("SETUP");
      const llmHelper = new LLMHelper({
        callbacks: {
          onLLMResponse: (response) => {
            // For debugging LLM output
            console.log("LLM Response: ", response);
          },
          onError: (response) => {
            // For debugging ERROR
            console.log("ERROR: ", response);
          },
          onLLMFunctionCall: (fn) => {
            console.log("CALLING A FUNCTION");
            switch (fn.functionName) {
              case "spotify_play_by_artist":
                setSpotifyPlayByArtist(true);
              case "spotify_play_liked_songs":
                setSpotifyPlayLikedSongs(true);
            }
          }
        }
      });

      voiceClient.registerHelper("llm", llmHelper);

      llmHelper.handleFunctionCall(async (fn: FunctionCallParams) => {
        const args = fn.arguments as any;
        if (fn.functionName === "spotify_play_by_artist") {
          if (args.artist) {

            const searchData = {songName: "", artistName: args.artist, albumName: ""};
      
            const searchRes = await fetch('/api/spotify/search', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(searchData),
            });

            const data = await searchRes.json();
            console.log("PROCESSING! SONGS:");
            console.log(data);

            const playRes = await fetch('/api/spotify/play', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ trackUri: data.tracks }),
            });

            setSpotifyPlayByArtist(false);

          } else {
            setSpotifyPlayByArtist(false);
            return { error: "Artist name(s) not provided" };
          }
        }
      });


      voiceClientRef.current = voiceClient;
    }
    setIsClientReady(true);
  }, []);


  // Initialize Mediapipe Pose once
  useEffect(() => {
    if (!poseRef.current && videoRef.current && canvasRef.current) {
      poseRef.current = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      poseRef.current.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      poseRef.current.onResults(onPoseResults);
    }
  }, [isPoseActive]);

  // Control pose detection and camera start/stop
  useEffect(() => {
    if (isPoseActive && videoRef.current && canvasRef.current) {
      if (!cameraRef.current) {
        cameraRef.current = new Camera(videoRef.current, {
          onFrame: async () => {
            if (poseRef.current) {
              await poseRef.current.send({ image: videoRef.current! });
            }
          },
          width: 640,
          height: 480,
        });
        cameraRef.current.start();
      }
    } else if (!isPoseActive && cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null; // Reset the camera
      clearCanvas();
    }
  }, [isPoseActive]);


  // Function to clear the canvas
  const clearCanvas = () => {
    const canvasCtx = canvasRef.current!.getContext("2d");
    if (canvasCtx) {
      canvasCtx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    }
  };

  // Function to process Pose Landmarker results
  const onPoseResults = (results: any) => {
    const canvasCtx = canvasRef.current!.getContext("2d");

    if (canvasCtx && videoRef.current) {
      canvasCtx.save(); // Save the current state of the canvas
      canvasCtx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

      // Apply the mirroring transformation for both the video and landmarks
      canvasCtx.translate(canvasRef.current!.width, 0); // Move the origin to the right edge
      canvasCtx.scale(-1, 1); // Flip the canvas horizontally

      // Draw the mirrored video
      canvasCtx.drawImage(videoRef.current, 0, 0, canvasRef.current!.width, canvasRef.current!.height);

      // Draw pose connections (lines between the landmarks)
      if (results.poseLandmarks) {
        canvasCtx.strokeStyle = "green";
        canvasCtx.lineWidth = 2;

        for (const connection of POSE_CONNECTIONS) {
          const [startIdx, endIdx] = connection;
          const startLandmark = results.poseLandmarks[startIdx];
          const endLandmark = results.poseLandmarks[endIdx];

          canvasCtx.beginPath();
          canvasCtx.moveTo(startLandmark.x * canvasRef.current!.width, startLandmark.y * canvasRef.current!.height);
          canvasCtx.lineTo(endLandmark.x * canvasRef.current!.width, endLandmark.y * canvasRef.current!.height);
          canvasCtx.stroke();
        }

        // Draw individual landmarks
        for (const landmark of results.poseLandmarks) {
          canvasCtx.beginPath();
          canvasCtx.arc(landmark.x * canvasRef.current!.width, landmark.y * canvasRef.current!.height, 5, 0, 2 * Math.PI);
          canvasCtx.fillStyle = "red";
          canvasCtx.fill();
        }
      }

      canvasCtx.restore(); // Restore the original state of the canvas
    }
  };

  // Webcam control logic
  useEffect(() => {
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
      if (videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isCameraOn]);


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
                {/* Canvas to draw the pose landmarks */}
                <canvas
                  ref={canvasRef}
                  width="640"
                  height="480"
                  style={{ position: "absolute", top: 0, left: 0, display: isPoseActive ? "block" : "none" }}
                ></canvas>
              </div>
              
              {/* Toggle buttons */}
              <button onClick={() => setIsPoseActive((prev) => !prev)} className="mt-4">
                {isPoseActive ? "Stop Pose Detection" : "Start Pose Detection"}
              </button>

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
