<!-- src/views/Dashboard.vue -->
<template>
    <div class="dashboard">
      <div v-if="isLoading" class="loading-screen">
        <div class="spinner"></div>
        <h2>Analyzing Playlist...</h2>
        <p>{{ loadingMessage }}</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <h2>Error</h2>
        <p>{{ error }}</p>
        <button @click="$router.push('/')" class="spotify-button">Go Back</button>
      </div>
      
      <div v-else class="dashboard-content">
        <PlaylistInfo 
          :playlist="playlist" 
          :trackCount="playlistTracks.length"
          :totalDuration="totalDuration"
        />
        
        <div class="dashboard-grid">
          <div class="dashboard-item">
            <PopularityChart :popularityData="popularityData" />
          </div>
          
          <div class="dashboard-item">
            <BivariateChart :trackData="playlistAnalysis" />
          </div>
          
          <div class="dashboard-item">
            <GenreChart :genreData="genrePercentages" />
          </div>
          
          <div class="dashboard-item">
            <MoodChart :moodData="moodPercentages" />
          </div>
          
          <div class="dashboard-item">
            <TopArtistsChart :artistData="topArtists" />
          </div>
          
          <div class="dashboard-item">
            <TopSongsChart :songData="topSongs" />
          </div>
        </div>
        
        <TrackList :tracks="playlistAnalysis" />
        
        <Recommendations 
          v-if="recommendations.length > 0"
          :recommendations="recommendations" 
        />
      </div>
    </div>
  </template>
  
  <script>
  import SpotifyService from '@/services/spotify';
  import PlaylistInfo from '@/components/PlaylistInfo.vue';
  import TrackList from '@/components/TrackList.vue';
  import PopularityChart from '@/components/PopularityChart.vue';
  import GenreChart from '@/components/GenreChart.vue';
  import MoodChart from '@/components/MoodChart.vue';
  import TopArtistsChart from '@/components/TopArtistsChart.vue';
  import TopSongsChart from '@/components/TopSongsChart.vue';
  import BivariateChart from '@/components/BivariateChart.vue';
  import Recommendations from '@/components/Recommendations.vue';
  
  export default {
    name: 'DashboardView',
    components: {
      PlaylistInfo,
      TrackList,
      PopularityChart,
      GenreChart,
      MoodChart,
      TopArtistsChart,
      TopSongsChart,
      BivariateChart,
      Recommendations
    },
    data() {
      return {
        isLoading: true,
        loadingMessage: 'Fetching playlist data...',
        error: null,
        playlist: null,
        playlistTracks: [],
        audioFeatures: {},
        artistGenres: {},
        playlistAnalysis: [],
        genrePercentages: {},
        moodPercentages: {},
        popularityData: {},
        topArtists: [],
        topSongs: [],
        recommendations: [],
        totalDuration: 0
      };
    },
    computed: {
      playlistId() {
        return this.$route.params.id;
      }
    },
    async created() {
      if (!SpotifyService.isAuthenticated()) {
        this.$router.push('/');
        return;
      }
      
      try {
        await this.fetchPlaylistData();
        await this.fetchAudioFeatures();
        await this.fetchArtistGenres();
        await this.analyzePlaylistData();
        await this.fetchRecommendations();
        
        this.isLoading = false;
      } catch (error) {
        console.error('Error analyzing playlist:', error);
        this.error = error.message || 'An error occurred while analyzing the playlist';
        this.isLoading = false;
      }
    },
    methods: {
      async fetchPlaylistData() {
        this.loadingMessage = 'Fetching playlist information...';
        
        // Get the playlist details
        this.playlist = await SpotifyService.getPlaylist(this.playlistId);
        
        // Get all tracks from the playlist (handles pagination)
        this.loadingMessage = 'Fetching playlist tracks...';
        this.playlistTracks = await SpotifyService.getPlaylistTracks(this.playlistId);
        
        // Calculate total duration
        this.totalDuration = this.playlistTracks.reduce((total, item) => {
          return total + (item.track?.duration_ms || 0);
        }, 0);
      },
      
      async fetchAudioFeatures() {
        this.loadingMessage = 'Analyzing audio features...';
        
        // Get all valid track IDs
        const trackIds = this.playlistTracks
          .map(item => item.track?.id)
          .filter(id => id);
        
        // Fetch audio features for all tracks
        const features = await SpotifyService.getAudioFeatures(trackIds);
        
        // Map features to track IDs
        features.forEach(feature => {
          if (feature && feature.id) {
            this.audioFeatures[feature.id] = feature;
          }
        });
      },
      
      async fetchArtistGenres() {
        this.loadingMessage = 'Fetching artist information...';
        
        // Extract all unique artist IDs
        const artistIds = new Set();
        this.playlistTracks.forEach(item => {
          if (item.track && item.track.artists) {
            item.track.artists.forEach(artist => {
              if (artist.id) {
                artistIds.add(artist.id);
              }
            });
          }
        });
        
        // Fetch artist details including genres
        const artists = await SpotifyService.getArtists([...artistIds]);
        
        // Map genres to artist IDs
        artists.forEach(artist => {
          if (artist && artist.id) {
            this.artistGenres[artist.id] = {
              name: artist.name,
              genres: artist.genres || []
            };
          }
        });
      },
      
      analyzePlaylistData() {
        this.loadingMessage = 'Analyzing playlist data...';
        
        // Prepare the playlist analysis data
        this.playlistAnalysis = this.playlistTracks.map(item => {
          const track = item.track;
          if (!track) return null;
          
          // Calculate song duration in minutes and seconds
          const durationMs = track.duration_ms;
          const minutes = Math.floor(durationMs / 60000);
          const seconds = Math.floor((durationMs % 60000) / 1000);
          
          // Get audio features for the track
          const features = this.audioFeatures[track.id] || {};
          
          // Determine mood based on audio features
          const mood = features.id ? SpotifyService.determineMood(features) : 'Unknown';
          
          // Get all genres for the track's artists
          const genres = new Set();
          track.artists.forEach(artist => {
            if (this.artistGenres[artist.id]) {
              this.artistGenres[artist.id].genres.forEach(genre => {
                genres.add(SpotifyService.normalizeGenre(genre));
              });
            }
          });
          
          return {
            id: track.id,
            name: track.name,
            artists: track.artists.map(a => a.name).join(', '),
            album: track.album.name,
            releaseDate: track.album.release_date,
            popularity: track.popularity,
            duration: durationMs,
            durationFormatted: `${minutes}:${seconds.toString().padStart(2, '0')}`,
            durationMinutes: durationMs / 60000, // For charting
            audioFeatures: features,
            mood,
            genres: [...genres],
            images: track.album.images
          };
        }).filter(track => track !== null);
        
        // Calculate genre percentages
        this.calculateGenrePercentages();
        
        // Calculate mood percentages
        this.calculateMoodPercentages();
        
        // Calculate popularity distribution
        this.calculatePopularityDistribution();
        
        // Calculate top artists
        this.calculateTopArtists();
        
        // Calculate top songs
        this.calculateTopSongs();
      },
      
      calculateGenrePercentages() {
        const genreCounts = {};
        let totalGenres = 0;
        
        // Count genres across all tracks
        this.playlistAnalysis.forEach(track => {
          track.genres.forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            totalGenres++;
          });
        });
        
        // Calculate percentages
        const percentages = {};
        Object.keys(genreCounts).forEach(genre => {
          percentages[genre] = (genreCounts[genre] / totalGenres) * 100;
        });
        
        // Sort by percentage (descending)
        this.genrePercentages = Object.fromEntries(
          Object.entries(percentages).sort((a, b) => b[1] - a[1])
        );
      },
      
      calculateMoodPercentages() {
        const moodCounts = {};
        let totalTracks = this.playlistAnalysis.length;
        
        // Count moods across all tracks
        this.playlistAnalysis.forEach(track => {
          moodCounts[track.mood] = (moodCounts[track.mood] || 0) + 1;
        });
        
        // Calculate percentages
        const percentages = {};
        Object.keys(moodCounts).forEach(mood => {
          percentages[mood] = (moodCounts[mood] / totalTracks) * 100;
        });
        
        this.moodPercentages = percentages;
      },
      
      calculatePopularityDistribution() {
        // Define popularity ranges
        const ranges = {
          'Hidden Gems (0-30%)': 0,
          'Common (30-60%)': 0,
          'Popular (60-100%)': 0
        };
        
        // Count tracks in each popularity range
        this.playlistAnalysis.forEach(track => {
          if (track.popularity < 30) {
            ranges['Hidden Gems (0-30%)']++;
          } else if (track.popularity < 60) {
            ranges['Common (30-60%)']++;
          } else {
            ranges['Popular (60-100%)']++;
          }
        });
        
        // Calculate percentages
        const totalTracks = this.playlistAnalysis.length;
        this.popularityData = Object.keys(ranges).map(range => ({
          range,
          count: ranges[range],
          percentage: (ranges[range] / totalTracks) * 100
        }));
      },
      
      calculateTopArtists() {
        // Count artist occurrences and sum popularity
        const artistData = {};
        
        this.playlistAnalysis.forEach(track => {
          const artists = track.artists.split(', ');
          artists.forEach(artist => {
            if (!artistData[artist]) {
              artistData[artist] = {
                name: artist,
                count: 0,
                totalPopularity: 0
              };
            }
            
            artistData[artist].count++;
            artistData[artist].totalPopularity += track.popularity;
          });
        });
        
        // Calculate average popularity
        Object.values(artistData).forEach(artist => {
          artist.avgPopularity = artist.totalPopularity / artist.count;
        });
        
        // Sort by occurrence, then by average popularity
        this.topArtists = Object.values(artistData)
          .sort((a, b) => {
            if (a.count !== b.count) return b.count - a.count;
            return b.avgPopularity - a.avgPopularity;
          })
          .slice(0, 10);
      },
      
      calculateTopSongs() {
        // Sort tracks by popularity (descending)
        this.topSongs = [...this.playlistAnalysis]
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 10);
      },
      
      async fetchRecommendations() {
        this.loadingMessage = 'Getting recommendations...';
        
        // Use the top 5 most popular tracks as seeds
        const seedTrackIds = this.topSongs
          .slice(0, 5)
          .map(track => track.id);
        
        if (seedTrackIds.length > 0) {
          const recommendations = await SpotifyService.getRecommendations(seedTrackIds);
          this.recommendations = recommendations.tracks || [];
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .dashboard {
    min-height: 80vh;
  }
  
  .loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    text-align: center;
  }
  
  .spinner {
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top: 4px solid var(--spotify-green);
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin-bottom: 1.5rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-container {
    text-align: center;
    padding: 2rem;
  }
  
  .error-container h2 {
    color: #e74c3c;
    margin-bottom: 1rem;
  }
  
  .dashboard-content {
    padding-bottom: 2rem;
  }
  
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .dashboard-item {
    min-height: 400px;
  }
  
  @media (max-width: 768px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>