import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LineChart, Loader2, LogOut, Settings, StopCircle, Video } from "lucide-react"; // Added Video icon
import {
  PipecatMetrics,
  TransportState,
  VoiceClientConfigOption,
  VoiceEvent,
} from "realtime-ai";
import { useVoiceClient, useVoiceClientEvent } from "realtime-ai-react";

import StatsAggregator from "../../utils/stats_aggregator";
import { Configure } from "../Setup";
import { Button } from "../ui/button";
import * as Card from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

import Agent from "./Agent";
import Stats from "./Stats";
import UserMicBubble from "./UserMicBubble";

let stats_aggregator: StatsAggregator;

interface SessionProps {
  state: TransportState;
  onLeave: () => void;
  openMic?: boolean;
  startAudioOff?: boolean;
  setIsCameraOn: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Session = React.memo(
  ({ state, onLeave, startAudioOff = false, setIsCameraOn }: SessionProps) => {
    const voiceClient = useVoiceClient()!;
    const [hasStarted, setHasStarted] = useState<boolean>(false);
    const [showConfig, setShowConfig] = useState<boolean>(false);
    const [showStats, setShowStats] = useState<boolean>(false);
    const [muted, setMuted] = useState(startAudioOff);
    const [runtimeConfigUpdate, setRuntimeConfigUpdate] = useState<
      VoiceClientConfigOption[] | null
    >(null);
    const [updatingConfig, setUpdatingConfig] = useState<boolean>(false);

    // Camera control state
    const [isCameraOn, setIsCameraOnLocal] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const modalRef = useRef<HTMLDialogElement>(null);

    function toggleCamera() {
      setIsCameraOnLocal((prev) => !prev);
      setIsCameraOn((prev) => !prev); // Update the state in the parent component
    }

    useVoiceClientEvent(
      VoiceEvent.Metrics,
      useCallback((metrics: PipecatMetrics) => {
        metrics?.ttfb?.map((m: { processor: string; value: number }) => {
          stats_aggregator.addStat([m.processor, "ttfb", m.value, Date.now()]);
        });
      }, [])
    );

    useVoiceClientEvent(
      VoiceEvent.BotStoppedSpeaking,
      useCallback(() => {
        if (hasStarted) return;
        setHasStarted(true);
      }, [hasStarted])
    );

    useVoiceClientEvent(
      VoiceEvent.UserStoppedSpeaking,
      useCallback(() => {
        if (hasStarted) return;
        setHasStarted(true);
      }, [hasStarted])
    );

    useEffect(() => {
      setHasStarted(false);
    }, []);

    useEffect(() => {
      if (!hasStarted || startAudioOff) return;
      voiceClient.enableMic(true);
    }, [voiceClient, startAudioOff, hasStarted]);

    useEffect(() => {
      stats_aggregator = new StatsAggregator();
    }, []);

    useEffect(() => {
      if (state === "error") {
        onLeave();
      }
    }, [state, onLeave]);

    useEffect(() => {
      const current = modalRef.current;
      if (current && showConfig) {
        current.inert = true;
        current.showModal();
        current.inert = false;
      }
      return () => current?.close();
    }, [showConfig]);

    const onConfigUpdate = useCallback((config: VoiceClientConfigOption[]) => {
      setRuntimeConfigUpdate(config);
    }, []);

    function toggleMute() {
      voiceClient.enableMic(muted);
      setMuted(!muted);
    }

    return (
      <>
        <dialog ref={modalRef}>
          <Card.Card className="w-svw max-w-full md:max-w-md lg:max-w-lg">
            <Card.CardHeader>
              <Card.CardTitle>Configuration</Card.CardTitle>
            </Card.CardHeader>
            <Card.CardContent>
              <Configure
                state={state}
                inSession={true}
                handleConfigUpdate={onConfigUpdate}
              />
            </Card.CardContent>
            <Card.CardFooter isButtonArray>
              <Button variant="outline" onClick={() => setShowConfig(false)}>
                Cancel
              </Button>
              <Button
                variant="success"
                disabled={updatingConfig || runtimeConfigUpdate === null}
                onClick={async () => {
                  if (!runtimeConfigUpdate) return;
                  setUpdatingConfig(true);
                  await voiceClient.updateConfig(runtimeConfigUpdate);
                  setUpdatingConfig(false);
                  setRuntimeConfigUpdate(null);
                  setShowConfig(false);
                }}
              >
                {updatingConfig && <Loader2 className="animate-spin" />}
                {updatingConfig ? "Updating..." : "Save Changes"}
              </Button>
            </Card.CardFooter>
          </Card.Card>
        </dialog>

        {showStats &&
          createPortal(
            <Stats
              statsAggregator={stats_aggregator}
              handleClose={() => setShowStats(false)}
            />,
            document.getElementById("tray")!
          )}

        <div className="mb-5 w-full flex flex-row mt-auto self-end md:w-auto">
          <div className="flex flex-row justify-between gap-3 w-full md:w-auto">
            <Tooltip>
              <TooltipContent>Interrupt bot</TooltipContent>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    voiceClient.action({
                      service: "tts",
                      action: "interrupt",
                      arguments: [],
                    });
                  }}
                >
                  <StopCircle />
                </Button>
              </TooltipTrigger>
            </Tooltip>

            {/* Toggle Camera Button */}
            <Tooltip>
              <TooltipContent>Toggle Camera</TooltipContent>
              <TooltipTrigger asChild>
                <Button
                  variant={isCameraOn ? "light" : "ghost"}
                  size="icon"
                  onClick={toggleCamera}
                >
                  <Video />
                </Button>
              </TooltipTrigger>
            </Tooltip>

            <Tooltip>
              <TooltipContent>Configure</TooltipContent>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setRuntimeConfigUpdate(null);
                    setShowConfig(true);
                  }}
                >
                  <Settings />
                </Button>
              </TooltipTrigger>
            </Tooltip>

            <Button onClick={() => onLeave()} className="ml-auto">
              <LogOut size={16} />
              End
            </Button>
          </div>
        </div>
        <footer className="flex-1 flex flex-col items-center justify-center w-full">
          <Card.Card
            fullWidthMobile={false}
            className="mb-5 w-full max-w-[240px] sm:max-w-[320px] mt-auto shadow-long"
          >
            <Agent
              isReady={state === "ready"}
              statsAggregator={stats_aggregator}
            />
          </Card.Card>
          <UserMicBubble
            active={hasStarted}
            muted={muted}
            handleMute={() => toggleMute()}
          />
        </footer>
      </>
    );
  },
  (p, n) => p.state === n.state
);

Session.displayName = "Session";

export default Session;
