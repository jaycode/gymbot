'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Adjust based on your Button component

import CurrentlyPlaying from './CurrentlyPlaying';

type QueryType = 'query' | 'playlist';

export default function SpotifyPlayer() {
  const [queryType, setQueryType] = useState<QueryType>('query');
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [albumName, setAlbumName] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // Track if a song is currently playing
  const [searchResults, setSearchResults] = useState<any[]>([]); // Store search results
  const [selectedTrackUri, setSelectedTrackUri] = useState<string | null>(null);

  // Fetch current playback state to initialize isPlaying state
  useEffect(() => {
    const fetchCurrentPlayback = async () => {
      const res = await fetch('/api/spotify/currently-playing');
      const data = await res.json();
      if (data && data.is_playing) {
        setIsPlaying(true); // Set isPlaying to true if something is playing
      } else {
        setIsPlaying(false);
      }
    };

    fetchCurrentPlayback();
  }, []);

  // Handle form submission and search for songs or playlists
  const handleSearch = async () => {
    setLoading(true);
    setResponse(null);
    setSearchResults([]);

    try {
      const searchData = queryType === 'query' ? {
        songName,
        artistName,
        albumName,
      } : { playlistName: playlistName || '' };

      const res = await fetch('/api/spotify/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData),
      });

      const data = await res.json();
      console.log("DATA:");
      console.log(data);

      if (res.ok) {
        // Update search results with tracks or playlists
        setSearchResults(queryType === 'query' || playlistName.toLowerCase() === 'liked songs' ? data.tracks : data.playlists);
      } else {
        setResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      setResponse('Error: Could not perform the search');
    } finally {
      setLoading(false);
    }
  };

  // Handle the radio button selection of track
  const handleTrackSelection = (uri: string) => {
    setSelectedTrackUri(uri);
  };

  const handlePlay = async () => {
    console.log("1")
    if (!selectedTrackUri) return;

    console.log("2")
    setLoading(true);
    setResponse(null);
    console.log("3")

    try {
      console.log("4")

      const res = await fetch('/api/spotify/play', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryType === 'query' || playlistName.toLowerCase() === 'liked songs' ? { trackUri: selectedTrackUri } : { playlistUri: selectedTrackUri }),
      });
      console.log("5");
      console.log(res);

      if (res.ok) {
        setIsPlaying(true); // Set isPlaying to true when something is played
      } else {
        const data = await res.json();
        setResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      setResponse('Error: Could not play the track');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/spotify/pause', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        setIsPlaying(false); // Set isPlaying to false when the track is paused
      } else {
        const data = await res.json();
        setResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      setResponse('Error: Could not pause the track');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md shadow-md w-full">
      <div className="mb-4">
        <CurrentlyPlaying small />
      </div>

      <div className="space-y-4">
        {/* Dropdown for selecting play type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Query Type</label>
          <select
            value={queryType}
            onChange={(e) => setQueryType(e.target.value as QueryType)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="query">Query</option>
            <option value="playlist">Playlist</option>
          </select>
        </div>

        {/* Conditional Inputs Based on Query Type */}
        {queryType === 'query' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Song Name</label>
              <input
                type="text"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                placeholder="Enter song name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Artist Name</label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Enter artist name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Album Name</label>
              <input
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                placeholder="Enter album name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700">Playlist Name</label>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Enter playlist name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        )}

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          className="mt-4 w-full"
          disabled={loading || (queryType === 'query' && !songName && !artistName && !albumName)}
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>

        {/* Display Search Results */}
        {searchResults && searchResults.length > 0 && (
          <div className="mt-4">
            <p className="text-lg font-bold mb-2">Search Results:</p>
            {searchResults.map((result, index) => (
              <div key={result.uri} className="flex items-center space-x-3 mb-2">
                <input
                  type="radio"
                  name="selectedTrack"
                  value={result.uri}
                  onChange={() => handleTrackSelection(result.uri)}
                  className="form-radio"
                />
                {result.artists ? (
                  // Display track details if queryType is 'query'
                  <p>
                    {result.name} - {result.album} - {result.artists.join(', ')} ({Math.floor(result.duration_ms / 60000)}:
                    {(result.duration_ms % 60000) / 1000 < 10 ? '0' : ''}{Math.floor((result.duration_ms % 60000) / 1000)})
                  </p>
                ) : (
                  // Display playlist details if queryType is 'playlist'
                  <p>{result.name} - {result.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Play/Pause button */}
      <Button
        onClick={isPlaying ? handlePause : handlePlay}
        className="mt-4 w-full"
      >
        {loading ? 'Processing...' : isPlaying ? 'Pause' : 'Play'}
      </Button>

      {/* Response message */}
      {response && <p className="mt-4 text-center">{response}</p>}
    </div>
  );
}
