import { NextRequest, NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../lib/session';
import { refreshAccessToken, isTokenExpired } from '../../../lib/spotify';

export async function GET(request: NextRequest) {
  const session = await getIronSession(request, NextResponse.next(), sessionOptions);
  let accessToken = session.accessToken;

  // Refresh the access token if it's almost expired
  if (isTokenExpired(session)) {
    console.log('Token will expire soon. Refreshing token...');
    accessToken = await refreshAccessToken(session);
    if (!accessToken) {
      const response = NextResponse.redirect(new URL('/', request.url)); // Redirect to homepage after logout
      const session = await getIronSession(request, response, sessionOptions);
      session.destroy(); // Clear the session
      await session.save();
      return response;
    }
  }

  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(accessToken);

  try {
    // Get currently playing track from Spotify
    const currentlyPlayingResponse = await spotifyApi.getMyCurrentPlayingTrack();

    if (!currentlyPlayingResponse.body || !currentlyPlayingResponse.body.item) {
      return NextResponse.json({ message: 'No track is currently playing' });
    }

    const track = currentlyPlayingResponse.body.item;
    const progress = currentlyPlayingResponse.body.progress_ms;
    const duration = track.duration_ms;
    const isPlaying = currentlyPlayingResponse.body.is_playing;

    return NextResponse.json({
      trackName: track.name,
      artistName: track.artists.map((artist) => artist.name).join(', '),
      albumArt: track.album.images[0]?.url,
      albumName: track?.album.name || '',
      duration,
      progress,
      is_playing: isPlaying,
    });
  } catch (error) {
    console.error('Error fetching currently playing track:', error);
    return NextResponse.json({ error: 'Failed to retrieve currently playing track' }, { status: 500 });
  }
}
