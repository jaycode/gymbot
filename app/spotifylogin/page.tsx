'use client';
// Note: No longer needed, but I just like to keep this around for a bit.

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import * as Card from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import SpotifyPlayer from '@/components/Spotify/SpotifyPlayer';

export default function Home() {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);

  // Check if the access token exists in cookies on page load
  useEffect(() => {
    const token = Cookies.get('spotify_access_token');
    const expiresAt = Cookies.get('spotify_token_expires_at');
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

    // If token exists and hasn't expired, set it in state
    if (token && expiresAt && parseInt(expiresAt, 10) > currentTime) {
      setAccessToken(token);
      setExpiresAt(new Date(parseInt(expiresAt, 10) * 1000).toLocaleString()); // Convert epoch to human-readable time
    } else {
      // Clear any stale cookies (in case they exist but have expired)
      Cookies.remove('spotify_access_token');
      Cookies.remove('spotify_token_expires_at');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null); // Clear any previous response

    try {
      // Send the POST request to the API to get a new access token
      const res = await fetch('/api/get-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientId, clientSecret }),
      });

      const data = await res.json();

      if (res.ok) {
        // Set access token and expiry in state and cookies
        setAccessToken(data.access_token);
        setExpiresAt(new Date(Date.now() + data.expires_in * 1000).toLocaleString()); // Set new expiry time

        // Store access token and expiry in cookies
        Cookies.set('spotify_access_token', data.access_token, { expires: data.expires_in / 86400 }); // Expiry in days
        Cookies.set('spotify_token_expires_at', (Date.now() / 1000 + data.expires_in).toString(), {
          expires: data.expires_in / 86400, // Expiry in days
        });

        // Display success message
        setResponse('Access Token fetched successfully!');
      } else {
        setResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      setResponse('Error: Could not retrieve token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Remove the cookies and log the user out
    Cookies.remove('spotify_access_token');
    Cookies.remove('spotify_token_expires_at');
    setAccessToken(null);
    setExpiresAt(null);
    setResponse('Logged out successfully!');
  };

  return (
    <Card.Card shadow className="animate-appear max-w-lg">
      <Card.CardHeader>
        <Card.CardTitle>Spotify Access Token Login</Card.CardTitle>
      </Card.CardHeader>
      <Card.CardContent stack>
        {accessToken ? (
          <div>
            <p className="mb-4 text-green-600">You are logged in!</p>
            <div className="bg-gray-100 p-4 rounded-md text-gray-800">
              <p className="font-bold">Access Token:</p>
              <p className="break-all whitespace-normal bg-gray-50 p-2 rounded-md">{accessToken}</p>
              <p className="mt-4 font-bold">Expires At:</p>
              <p>{expiresAt}</p>
            </div>
            {/* Render SpotifyPlayer component if logged in */}
            <SpotifyPlayer accessToken={accessToken} />
          </div>          
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client ID</label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your Spotify Client ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Secret</label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your Spotify Client Secret"
              />
            </div>
          </form>
        )}
      </Card.CardContent>
      <Card.CardFooter isButtonArray>
        {accessToken ? (
          <Button key="logout" onClick={handleLogout} className="w-full flex justify-center py-2 px-4">
            Logout
          </Button>
        ) : (
          <Button key="start" onClick={handleSubmit} disabled={loading} className="w-full flex justify-center py-2 px-4">
            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Get Access Token'}
          </Button>
        )}
      </Card.CardFooter>
      {response && (
        <div className="mt-4">
          <Card.CardContent stack>
            <p>{response}</p>
          </Card.CardContent>
        </div>
      )}
    </Card.Card>
  );
}
