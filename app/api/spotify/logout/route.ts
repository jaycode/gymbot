import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../lib/session';

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url)); // Redirect to homepage after logout
  const session = await getIronSession(request, response, sessionOptions);
  session.destroy(); // Clear the session
  return response;
}
