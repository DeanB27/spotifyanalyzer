<!-- src/views/Home.vue -->
<template>
    <div class="home">
      <div class="hero">
        <h1>Analyze Your Spotify Playlists</h1>
        <p>Discover insights about your music taste with detailed analytics and visualizations</p>
        
        <div v-if="!isAuthenticated" class="auth-container">
          <button @click="loginWithSpotify" class="spotify-button">
            Connect with Spotify
          </button>
        </div>
        
        <div v-else class="playlist-input">
          <div class="input-container">
            <input 
              type="text" 
              v-model="playlistUrl" 
              placeholder="Enter Spotify playlist URL" 
              class="playlist-url-input"
            />
            <button @click="analyzePlaylist" :disabled="!isValidUrl" class="spotify-button">
              Analyze
            </button>
          </div>
          <p v-if="urlError" class="error-message">{{ urlError }}</p>
          
          <div v-if="isLoading" class="loading-container">
            <div class="loading-bar">
              <div class="loading-bar-progress"></div>
            </div>
            <p>Loading playlist data...</p>
          </div>
        </div>
      </div>
      
      <div v-if="isAuthenticated && userPlaylists.length > 0" class="user-playlists">
        <h2>Your Playlists</h2>
        <div class="playlist-grid">
          <div 
            v-for="playlist in userPlaylists" 
            :key="playlist.id" 
            class="playlist-card"
            @click="selectPlaylist(playlist.external_urls.spotify)"
          >
            <img 
              :src="playlist.images[0]?.url || '/images/default-playlist.png'" 
              :alt="playlist.name"
              class="playlist-cover"
            />
            <div class="playlist-info">
              <h3>{{ playlist.name }}</h3>
              <p>{{ playlist.tracks.total }} tracks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import SpotifyService from '@/services/spotify';
  
  export default {
    name: 'HomeView',
    data() {
      return {
        isAuthenticated: false,
        playlistUrl: '',
        urlError: '',
        isLoading: false,
        userPlaylists: []
      };
    },
    computed: {
      isValidUrl() {
        return this.playlistUrl.includes('spotify.com/playlist/');
      }
    },
    created() {
      // Check if user is already authenticated
      SpotifyService.init();
      this.isAuthenticated = SpotifyService.isAuthenticated();
      
      if (this.isAuthenticated) {
        this.fetchUserPlaylists();
      }
    },
    methods: {
      loginWithSpotify() {
        SpotifyService.authenticate();
      },
      async fetchUserPlaylists() {
        try {
          const response = await SpotifyService.apiRequest('/me/playlists?limit=50');
          this.userPlaylists = response.items;
        } catch (error) {
          console.error('Error fetching playlists:', error);
        }
      },
      selectPlaylist(url) {
        this.playlistUrl = url;
        this.analyzePlaylist();
      },
      async analyzePlaylist() {
        if (!this.isValidUrl) {
          this.urlError = 'Please enter a valid Spotify playlist URL';
          return;
        }
        
        this.urlError = '';
        this.isLoading = true;
        
        try {
          const playlistId = SpotifyService.getPlaylistIdFromUrl(this.playlistUrl);
          
          if (!playlistId) {
            throw new Error('Could not extract playlist ID from URL');
          }
          
          // Navigate to the dashboard with the playlist ID
          this.$router.push(`/dashboard/${playlistId}`);
        } catch (error) {
          console.error('Error:', error);
          this.urlError = error.message || 'An error occurred while processing the playlist';
          this.isLoading = false;
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .home {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .hero {
    text-align: center;
    margin: 2rem 0 4rem;
    max-width: 800px;
  }
  
  .hero h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  .hero p {
    font-size: 1.2rem;
    color: var(--spotify-light-gray);
    margin-bottom: 2rem;
  }
  
  .auth-container {
    margin: 2rem 0;
  }
  
  .playlist-input {
    width: 100%;
    max-width: 600px;
  }
  
  .input-container {
    display: flex;
    margin-bottom: 1rem;
  }
  
  .playlist-url-input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 4px 0 0 4px;
    font-size: 1rem;
    background-color: #333;
    color: white;
  }
  
  .input-container .spotify-button {
    border-radius: 0 4px 4px 0;
  }
  
  .error-message {
    color: #e74c3c;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
  
  .loading-container {
    margin-top: 1rem;
  }
  
  .user-playlists {
    width: 100%;
    margin-top: 2rem;
  }
  
  .user-playlists h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .playlist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }
  
  .playlist-card {
    background-color: #282828;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .playlist-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }
  
  .playlist-cover {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
  }
  
  .playlist-info {
    padding: 1rem;
  }
  
  .playlist-info h3 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .playlist-info p {
    font-size: 0.8rem;
    color: var(--spotify-light-gray);
  }
  </style>