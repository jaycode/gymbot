import React, { useEffect, useState } from "react";
import { Book } from "lucide-react";
import Link from "next/link"; // Import Next.js Link
import { Button } from "@/components/ui/button";
import SpotifyPlayer from '@/components/Spotify/SpotifyPlayer';

export const Splash: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Fetch session data from the server
    async function fetchSession() {
      const res = await fetch('/api/spotify/session');
      if (res.ok) {
        const data = await res.json();
        setAccessToken(data.accessToken); // Check if the user has a valid access token
      }
    }
    fetchSession();
  }, []);

  return (
    <div className="flex flex-col gap-4 lg:gap-12 items-center max-w-full lg:max-w-3xl">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-balance text-left">
        Gym Bot
      </h1>

      <p className="text-primary-500 text-xl font-semibold leading-relaxed">
        To get advice on improving your workout posture, Start a Gym Session, turn on the camera, and turn on pose estimation.<br />
        To view your progress, go to My Gym Log.
      </p>

      <Button asChild>
        <Link href="/gym">Start a Gym Session</Link>
      </Button>
      
      <Button asChild>
        <Link href="/gym-log">My Gym Log</Link>
      </Button>

      {accessToken ? (
        <div>
          <p className="text-green-600">You are logged in with Spotify! While doing a Gym Session, you may ask GymBot to play a song, an album, any song from an artist, or your playlists.</p>
          {/* Spotify functionality will be added here */}
          <Button onClick={() => window.location.href = '/api/spotify/logout'} className="mt-4">
            Logout from Spotify
          </Button>
          <div className="mt-4">
            <SpotifyPlayer />
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-red-600">Login to Spotify if you want GymBot to play music as you exercise!</p>
          <Button onClick={() => window.location.href = '/api/spotify/login'} className="mt-4">
            Login with Spotify
          </Button>
        </div>
      )}

      <div className="h-[1px] bg-primary-300 w-full" />

      <footer className="flex flex-col lg:gap-2">
        <Button variant="light" asChild>
          <a
            href="https://github.com/daily-demos/daily-bots-web-demo"
            className="text-indigo-600"
          >
            <Book className="size-6" />
            Source code
          </a>
        </Button>
      </footer>
    </div>
  );
};

export default Splash;
