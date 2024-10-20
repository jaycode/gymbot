// Note: No longer needed, but I just like to keep this around for a bit.

import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
  const { clientId, clientSecret } = await req.json();

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Client ID and Client Secret are required' }, { status: 400 });
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await tokenResponse.json();

    if (data.access_token) {
      // Calculate the expiration time (current time + expires_in)
      const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;

      // Create response object
      const response = NextResponse.json({
        access_token: data.access_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
      });

      // Set cookies for access token and expiration time
      response.headers.append(
        'Set-Cookie',
        serialize('spotify_access_token', data.access_token, {
          httpOnly: false, // Set to false to access on client-side
          secure: process.env.NODE_ENV === 'production',
          maxAge: data.expires_in,
          path: '/',
        })
      );

      response.headers.append(
        'Set-Cookie',
        serialize('spotify_token_expires_at', expiresAt.toString(), {
          httpOnly: false, // Set to false to access on client-side
          secure: process.env.NODE_ENV === 'production',
          maxAge: data.expires_in,
          path: '/',
        })
      );

      return response;
    } else {
      return NextResponse.json({ error: data.error_description || 'Failed to get token' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
