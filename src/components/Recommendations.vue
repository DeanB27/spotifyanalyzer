<!-- src/components/Recommendations.vue -->
<template>
    <div class="recommendations-container">
      <h2 class="section-title bubble">Recommended Songs</h2>
      
      <div class="recommendations-grid">
        <div 
          v-for="track in recommendations" 
          :key="track.id"
          class="recommendation-card"
          @click="openTrack(track)"
        >
          <div class="album-cover">
            <img 
              :src="getAlbumImage(track)" 
              :alt="`Album cover for ${track.name}`"
            />
            <div class="play-overlay">
              <i class="play-icon">▶</i>
            </div>
          </div>
          
          <div class="track-info">
            <h3 class="track-name">{{ track.name }}</h3>
            <p class="track-artist">{{ getArtistNames(track) }}</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Recommendations',
    props: {
      recommendations: {
        type: Array,
        required: true
      }
    },
    methods: {
      getAlbumImage(track) {
        if (track.album && track.album.images && track.album.images.length > 0) {
          return track.album.images[0].url;
        }
        return '/images/default-album.png';
      },
      
      getArtistNames(track) {
        if (track.artists && track.artists.length > 0) {
          return track.artists.map(artist => artist.name).join(', ');
        }
        return 'Unknown Artist';
      },
      
      openTrack(track) {
        if (track.external_urls && track.external_urls.spotify) {
          window.open(track.external_urls.spotify, '_blank');
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .recommendations-container {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
  
  .recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }
  
  .recommendation-card {
    background-color: rgba(40, 40, 40, 0.5);
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .recommendation-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
    background-color: rgba(40, 40, 40, 0.8);
  }
  
  .recommendation-card:hover .play-overlay {
    opacity: 1;
  }
  
  .album-cover {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
  }
  
  .album-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .play-icon {
    font-size: 2rem;
    color: var(--spotify-green);
  }
  
  .track-info {
    padding: 1rem;
  }
  
  .track-name {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .track-artist {
    font-size: 0.8rem;
    color: #B3B3B3;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  @media (max-width: 768px) {
    .recommendations-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
  }
  </style>