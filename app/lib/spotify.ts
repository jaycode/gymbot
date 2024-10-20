import SpotifyWebApi from 'spotify-web-api-node';
import { IronSession } from 'iron-session';

export async function refreshAccessToken(session: IronSession) {
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID!,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
  });
  spotifyApi.setRefreshToken(session.refreshToken!);

  try {
    const data = await spotifyApi.refreshAccessToken();
    const { access_token, expires_in } = data.body;

    session.accessToken = access_token;
    session.expiresAt = Date.now() + expires_in * 1000;
    await session.save();

    return access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
}


export function isTokenExpired(session: IronSession) {
  const expiresAt = session.expiresAt || 0;
  const timeLeft = expiresAt - Date.now();
  // If less than 5 minutes (300,000 ms) is left, consider it expired
  return timeLeft <= 300000; 
}