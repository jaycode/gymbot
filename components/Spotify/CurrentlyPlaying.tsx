'use client';

import { useEffect, useState } from 'react';

interface TrackInfo {
  trackName: string;
  artistName: string;
  albumArt: string;
  albumName: string;
  duration: number;
  progress: number;
  is_playing: boolean;
}

interface CurrentlyPlayingProps {
  small?: boolean; // Optional prop to control compact view
}

export default function CurrentlyPlaying({ small = false }: CurrentlyPlayingProps) {
  const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);
  const [timePlayed, setTimePlayed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // To track whether something is playing

  const fetchCurrentlyPlaying = async () => {
    const res = await fetch('/api/spotify/currently-playing');
    const data = await res.json();
    if (res.ok && data.trackName) {
      setTrackInfo(data);
      setTimePlayed(data.progress);
      setIsPlaying(true); // Mark as playing
    } else {
      setTrackInfo(null);
      setIsPlaying(false); // Nothing is playing
    }
  };

  useEffect(() => {
    // Fetch initially
    fetchCurrentlyPlaying();

    // Poll the API every 10 seconds to check for updates
    const interval = setInterval(fetchCurrentlyPlaying, 10000);

    // Clean up the interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      // Update every second to reduce the time left
      const interval = setInterval(() => {
        setTimePlayed((prev) => Math.min(prev + 1000, trackInfo?.duration || 0));
      }, 1000);

      return () => clearInterval(interval); // Clear interval when not playing
    }
  }, [isPlaying]);

  if (!trackInfo) {
    return <p>No track is currently playing</p>;
  }

  // Convert milliseconds to minutes and seconds
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className={`flex items-center justify-between ${small ? 'text-sm' : 'text-base'} bg-gray-100 p-2 rounded-md shadow-sm`}>
      {/* Left side: Track and Artist info */}
      <div className="flex items-center">
        <figure>
            <img src={trackInfo.albumArt} alt={trackInfo.albumName} className="album-art rounded-md mr-2" />
            <figcaption>{trackInfo.albumName}</figcaption>
        </figure>
        <div>
          <h3 className={`font-bold ${small ? 'text-sm' : 'text-lg'}`}>{trackInfo.trackName}</h3>
          <p className={`text-gray-600 ${small ? 'text-xs' : 'text-sm'}`}>{trackInfo.artistName}</p>
        </div>
      </div>

      {/* Right side: Time information */}
      <div className={`text-right ${small ? 'text-xs' : 'text-sm'}`}>
        <p>Time Played: {formatTime(timePlayed)}</p>
        <p>Duration: {formatTime(trackInfo.duration)}</p>
      </div>
    </div>
  );
}
