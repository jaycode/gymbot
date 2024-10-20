import { NextRequest, NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../lib/session';
import { refreshAccessToken, isTokenExpired } from '../../../lib/spotify';

export async function POST(request: NextRequest) {
  const session = await getIronSession(request, NextResponse.next(), sessionOptions);
  let accessToken = session.accessToken;

  // Check if token is expired and refresh if necessary
  if (isTokenExpired(session)) {
    accessToken = await refreshAccessToken(session);
    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to refresh access token' }, { status: 401 });
    }
  }

  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(accessToken);

  try {
    const { songName, artistName, albumName, playlistName } = await request.json();

    
    if (playlistName === '') {
      // If no playlistName is provided, get all playlists for the user
      const playlistsResult = await spotifyApi.getUserPlaylists();
      const playlists = playlistsResult.body.items.map(playlist => ({
        name: playlist.name,
        uri: playlist.uri,
        description: playlist.description || 'No description available',
      }));

      return NextResponse.json({ playlists });
    }
    else if (playlistName && playlistName.toLowerCase() === 'liked songs') {
      // If "liked songs" is submitted, fetch the user's saved tracks (Liked Songs) 
      let allTracks = [];
      let limit = 50;
      let offset = 0;
      let total = 0;

      // Fetch the first page of liked songs
      const firstPage = await spotifyApi.getMySavedTracks({ limit, offset });
      total = firstPage.body.total; // Get the total number of liked tracks
      allTracks = firstPage.body.items.map(item => ({
        name: item.track.name,
        uri: item.track.uri,
        album: item.track.album.name,
        artists: item.track.artists.map(artist => artist.name),
        duration_ms: item.track.duration_ms,
      }));

      // If there are more than 50 tracks, fetch the next pages
      while (allTracks.length < total) {
        offset += limit; // Increment the offset to get the next page of results
        const nextPage = await spotifyApi.getMySavedTracks({ limit, offset });
        const nextPageTracks = nextPage.body.items.map(item => ({
          name: item.track.name,
          uri: item.track.uri,
          album: item.track.album.name,
          artists: item.track.artists.map(artist => artist.name),
          duration_ms: item.track.duration_ms,
        }));

        allTracks = [...allTracks, ...nextPageTracks];
      }
      console.log("HELLO");
      console.log(allTracks);

      return NextResponse.json({ tracks: allTracks });
    }
    else if (playlistName) {
    // Search by playlist
    const playlistResult = await spotifyApi.searchPlaylists(playlistName);
      const playlists = playlistResult.body.playlists.items.map(playlist => ({
        name: playlist.name,
        uri: playlist.uri,
        description: playlist.description,
      }));

      return NextResponse.json({ playlists });
    }
    else {
        // Construct the search query for tracks
        let query = '';
        if (songName) query += `track:${songName} `;
        if (artistName) query += `artist:${artistName} `;
        if (albumName) query += `album:${albumName}`;

        const trackResult = await spotifyApi.searchTracks(query);
        console.log("HELLO");
        console.log(trackResult.body.tracks.items);
        const tracks = trackResult.body.tracks.items.map(track => ({
        name: track.name,
        uri: track.uri,
        album: track.album.name,
        artists: track.artists.map(artist => artist.name),
        duration_ms: track.duration_ms,
        }));

        console.log(tracks);

        return NextResponse.json({ tracks });
    }

  } catch (error) {
    console.error('Error searching Spotify:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
