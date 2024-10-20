import { NextRequest, NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';

export async function GET(request: NextRequest) {
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID!,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI!,
  });

  const scopes = ['user-read-playback-state', 'user-modify-playback-state', 'user-library-read']; 
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, undefined, true);

  return NextResponse.redirect(authorizeURL);
}
