import { NextRequest, NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../lib/session';

export async function PUT(request: NextRequest) {
  const session = await getIronSession(request, NextResponse.next(), sessionOptions);
  const accessToken = session.accessToken;

  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(accessToken);

  try {
    // Pause the currently playing track
    await spotifyApi.pause();
    return NextResponse.json({ message: 'Playback paused successfully' });
  } catch (error) {
    console.error('Error pausing Spotify:', error);
    return NextResponse.json({ error: 'Error pausing playback' }, { status: 500 });
  }
}
