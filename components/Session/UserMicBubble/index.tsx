import React, { useCallback, useRef } from "react";
import clsx from "clsx";
import { Mic, MicOff, Pause } from "lucide-react";
import { VoiceEvent } from "realtime-ai";
import { useVoiceClientEvent } from "realtime-ai-react";

import styles from "./styles.module.css";

const AudioIndicatorBubble: React.FC = () => {
  const volRef = useRef<HTMLDivElement>(null);

  useVoiceClientEvent(
    VoiceEvent.LocalAudioLevel,
    useCallback((volume: number) => {
      if (volRef.current) {
        const v = Number(volume) * 1.75;
        volRef.current.style.transform = `scale(${Math.max(0.1, v)})`;
      }
    }, [])
  );

  return <div ref={volRef} className={styles.volume} />;
};

interface Props {
  active: boolean;
  muted: boolean;
  handleMute: () => void;
}

export default function UserMicBubble({
  active,
  muted = false,
  handleMute,
}: Props) {
  const canTalk = !muted && active;

  const cx = clsx(
    muted && active && styles.muted,
    !active && styles.blocked,
    canTalk && styles.canTalk
  );

  return (
    <div className={`${styles.bubbleContainer}`}>
      <div className={`${styles.bubble} ${cx}`} onClick={() => handleMute()}>
        <div className={styles.icon}>
          {!active ? (
            <Pause size={32} className="size-6 md:size-10" />
          ) : canTalk ? (
            <Mic size={32} className="size-6 md:size-10" />
          ) : (
            <MicOff size={32} className="size-6 md:size-10" />
          )}
        </div>
        {canTalk && <AudioIndicatorBubble />}
      </div>
    </div>
  );
}
