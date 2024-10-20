import { SessionOptions } from 'iron-session';

export const sessionOptions: SessionOptions = {
  password: process.env.SPOTIFY_CLIENT_SECRET!,
  cookieName: 'spotify_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

declare module 'iron-session' {
  interface IronSessionData {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number; // Timestamp in milliseconds
  }
}
