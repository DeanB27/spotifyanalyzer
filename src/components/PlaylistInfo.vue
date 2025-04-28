<!-- src/components/PlaylistInfo.vue -->
<template>
    <div class="playlist-info-container">
      <div class="playlist-header">
        <div class="playlist-cover">
          <img :src="coverImage" :alt="playlist.name" />
        </div>
        
        <div class="playlist-details">
          <h1>{{ playlist.name }}</h1>
          
          <p v-if="playlist.description" class="playlist-description">
            {{ playlist.description }}
          </p>
          
          <div class="playlist-stats">
            <div class="stat-item">
              <div class="stat-value">{{ trackCount }}</div>
              <div class="stat-label">Tracks</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-value">{{ formattedDuration }}</div>
              <div class="stat-label">Total Duration</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-value">{{ playlist.followers.total.toLocaleString() }}</div>
              <div class="stat-label">Followers</div>
            </div>
          </div>
          
          <div class="playlist-user">
            Created by: {{ playlist.owner.display_name }}
          </div>
          
          <a 
            :href="playlist.external_urls.spotify" 
            target="_blank" 
            class="spotify-link"
          >
            Open in Spotify
          </a>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'PlaylistInfo',
    props: {
      playlist: {
        type: Object,
        required: true
      },
      trackCount: {
        type: Number,
        required: true
      },
      totalDuration: {
        type: Number,
        required: true
      }
    },
    computed: {
      coverImage() {
        return this.playlist.images && this.playlist.images.length > 0
          ? this.playlist.images[0].url
          : '/images/default-playlist.png';
      },
      formattedDuration() {
        const totalMinutes = Math.floor(this.totalDuration / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        return hours > 0
          ? `${hours} hr ${minutes} min`
          : `${minutes} min`;
      }
    }
  };
  </script>
  
  <style scoped>
  .playlist-info-container {
    margin-bottom: 2rem;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 1.5rem;
  }
  
  .playlist-header {
    display: flex;
    align-items: flex-start;
  }
  
  .playlist-cover {
    flex-shrink: 0;
    width: 200px;
    height: 200px;
    margin-right: 2rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }
  
  .playlist-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .playlist-details {
    flex: 1;
  }
  
  .playlist-details h1 {
    font-size: 2rem;
    margin: 0 0 0.5rem;
  }
  
  .playlist-description {
    color: var(--spotify-light-gray);
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .playlist-stats {
    display: flex;
    margin-bottom: 1.5rem;
  }
  
  .stat-item {
    margin-right: 2rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--spotify-green);
  }
  
  .stat-label {
    font-size: 0.8rem;
    color: var(--spotify-light-gray);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .playlist-user {
    font-size: 0.9rem;
    color: var(--spotify-light-gray);
    margin-bottom: 1rem;
  }
  
  .spotify-link {
    display: inline-block;
    background-color: var(--spotify-green);
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  
  .spotify-link:hover {
    background-color: #1ed760;
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    .playlist-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .playlist-cover {
      margin-right: 0;
      margin-bottom: 1.5rem;
    }
    
    .playlist-stats {
      justify-content: center;
    }
  }
  </style>