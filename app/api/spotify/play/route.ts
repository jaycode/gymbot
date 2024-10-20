import { NextRequest, NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../lib/session';

export async function POST(request: NextRequest) {
  const session = await getIronSession(request, NextResponse.next(), sessionOptions);
  const accessToken = session.accessToken;

  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(accessToken);

  try {
    const { trackUri, playlistUri } = await request.json();
    console.log("HELLO1");

    console.log(trackUri);
    console.log(playlistUri);
    // Handle Playlist Playback
    if (playlistUri) {
      // Play the playlist
      await spotifyApi.play({ context_uri: playlistUri });
      return NextResponse.json({ message: 'Playlist playback started successfully' });
    }

    // Handle Track Playback
    if (trackUri) {
      // Play the selected track
      await spotifyApi.play({ uris: [trackUri] });
      return NextResponse.json({ message: 'Track playback started successfully' });
    }

    return NextResponse.json({ error: 'No track or playlist URI provided' }, { status: 400 });
  } catch (error) {
    console.error('Error playing on Spotify:', error);
    return NextResponse.json({ error: 'Failed to start playback' }, { status: 500 });
  }
}
