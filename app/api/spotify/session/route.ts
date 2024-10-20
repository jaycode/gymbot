import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../lib/session';

export async function GET(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession(request, response, sessionOptions);
  const { accessToken } = session;

  // Send back the session data, including whether they have an access token
  return NextResponse.json({ accessToken });
}
