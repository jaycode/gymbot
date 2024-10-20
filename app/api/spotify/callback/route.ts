import { NextRequest, NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../lib/session';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=No code received', request.url));
  }

  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID!,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI!,
  });

  try {
    // Exchange the authorization code for an access token
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;

    console.log('Access Token:', access_token);
    console.log('Refresh Token:', refresh_token);

    // Set the access token and refresh token in session
    const response = NextResponse.redirect(new URL('/', request.url));
    const session = await getIronSession(request, response, sessionOptions);
    session.accessToken = access_token;
    session.refreshToken = refresh_token;
    session.expiresAt = Date.now() + expires_in * 1000; // Expires in milliseconds

    console.log('Session Data:', session);

    await session.save();

    return response;
  } catch (error) {
    console.error('Error exchanging code for token:', error.message);
    return NextResponse.redirect(new URL('/?error=Authentication failed', request.url));
  }
}
