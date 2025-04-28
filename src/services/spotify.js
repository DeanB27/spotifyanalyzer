/**
 * Spotify API Service 
 * 
 * This service handles all Spotify API interactions including:
 * - Authentication via implicit grant flow (for client-side apps)
 * - Fetching playlist data
 * - Getting audio features
 * - Retrieving recommendations
 */

// Constants for Spotify API
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const API_ENDPOINT = "https://api.spotify.com/v1";
const SCOPES = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-read-private"
].join("%20");

// Create a service object
const SpotifyService = {
  /**
   * Initialize the Spotify service with your application credentials
   * NOTE: In a production environment, you would NOT expose your client ID directly
   * in the frontend code. This example uses GitHub's environment variables approach.
   */
  init() {
    // The client ID will be injected at build time from environment variables
    this.clientId = process.env.VUE_APP_SPOTIFY_CLIENT_ID;
    
    // For GitHub Pages, we need to set the redirect URI to the deployed page
    this.redirectUri = process.env.VUE_APP_REDIRECT_URI || 
                      `${window.location.origin}/spotifyanalyzer/callback`;
                      
    // Check if we already have a token
    this.accessToken = this.getTokenFromUrl() || localStorage.getItem('spotify_access_token');
    
    // Remove token from URL if present (for security)
    if (this.getTokenFromUrl()) {
      window.history.replaceState({}, document.title, '/');
    }
  },
  
  /**
   * Extract access token from URL (for redirect callback)
   */
  getTokenFromUrl() {
    const hash = window.location.hash;
    if (!hash) return null;
    
    const tokenMatch = hash.match(/#access_token=([^&]*)/);
    return tokenMatch ? tokenMatch[1] : null;
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.accessToken;
  },
  
  /**
   * Begin the Spotify authentication flow
   */
  authenticate() {
    const authUrl = `${AUTH_ENDPOINT}?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${SCOPES}&response_type=token&show_dialog=true`;
    window.location.href = authUrl;
  },
  
  /**
   * Save the access token to localStorage
   */
  setAccessToken(token) {
    this.accessToken = token;
    localStorage.setItem('spotify_access_token', token);
  },
  
  /**
   * Clear the access token (log out)
   */
  logout() {
    this.accessToken = null;
    localStorage.removeItem('spotify_access_token');
  },
  
  /**
   * Make a request to the Spotify API
   */
  async apiRequest(endpoint, method = 'GET', body = null) {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }
    
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`
    };
    
    if (body && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }
    
    const options = {
      method,
      headers
    };
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_ENDPOINT}${endpoint}`, options);
    
    // Handle token expiration
    if (response.status === 401) {
      this.logout();
      throw new Error('Your session has expired. Please log in again.');
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message || 'An error occurred with the Spotify API');
    }
    
    return response.json();
  },
  
  /**
   * Extract playlist ID from Spotify URL
   */
  getPlaylistIdFromUrl(url) {
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  },
  
  /**
   * Get playlist data
   */
  async getPlaylist(playlistId) {
    return this.apiRequest(`/playlists/${playlistId}`);
  },
  
  /**
   * Get all tracks from a playlist (handles pagination)
   */
  async getPlaylistTracks(playlistId) {
    let tracks = [];
    let url = `/playlists/${playlistId}/tracks`;
    let hasMore = true;
    
    while (hasMore) {
      const data = await this.apiRequest(url);
      tracks = [...tracks, ...data.items];
      
      if (data.next) {
        // Extract the relative URL from the full next URL
        url = data.next.replace(API_ENDPOINT, '');
      } else {
        hasMore = false;
      }
    }
    
    return tracks;
  },
  
  /**
   * Get audio features for multiple tracks
   */
  async getAudioFeatures(trackIds) {
    // Spotify API limits to 100 IDs per request
    const results = [];
    
    for (let i = 0; i < trackIds.length; i += 100) {
      const batch = trackIds.slice(i, i + 100);
      const data = await this.apiRequest(`/audio-features?ids=${batch.join(',')}`);
      results.push(...data.audio_features);
    }
    
    return results;
  },
  
  /**
   * Get artist details including genres
   */
  async getArtist(artistId) {
    return this.apiRequest(`/artists/${artistId}`);
  },
  
  /**
   * Get multiple artists at once
   */
  async getArtists(artistIds) {
    // Spotify API limits to 50 IDs per request
    const results = [];
    
    for (let i = 0; i < artistIds.length; i += 50) {
      const batch = artistIds.slice(i, i + 50);
      const data = await this.apiRequest(`/artists?ids=${batch.join(',')}`);
      results.push(...data.artists);
    }
    
    return results;
  },
  
  /**
   * Get recommendations based on seed tracks
   */
  async getRecommendations(seedTracks, limit = 20) {
    // Take up to 5 seed tracks (Spotify API limit)
    const seeds = seedTracks.slice(0, 5);
    return this.apiRequest(`/recommendations?seed_tracks=${seeds.join(',')}&limit=${limit}`);
  },
  
  /**
   * Determine mood based on audio features (similar to your Python implementation)
   */
  determineMood(features) {
    if (features.valence > 0.7 && features.energy > 0.6) {
      return 'Happy';
    } else if (features.valence < 0.3 && features.energy < 0.4) {
      return 'Sad';
    } else if (features.energy > 0.7) {
      return 'Energetic';
    } else if (features.tempo < 100) {
      return 'Chill';
    } else {
      return 'Neutral';
    }
  },
  
  /**
   * Normalize genre names to broader categories (similar to your Python implementation)
   */
  normalizeGenre(genre) {
    if (genre.includes('country')) return 'Country';
    if (genre.includes('rock')) return 'Rock';
    if (genre.includes('rap')) return 'Rap';
    if (genre.includes('pop')) return 'Pop';
    if (genre.includes('hip hop')) return 'Hip hop';
    if (genre.includes('jazz')) return 'Jazz';
    if (genre.includes('soul')) return 'Soul';
    if (genre.includes('metal')) return 'Metal';
    if (genre.includes('funk')) return 'Funk';
    if (genre.includes('indie')) return 'Indie';
    if (genre.includes('techno')) return 'Techno';
    if (genre.includes('dubstep')) return 'Dubstep';
    if (genre.includes('alternative')) return 'Alt';
    if (genre.includes('folk')) return 'Folk';
    return 'Other';
  }
};

export default SpotifyService;