<!-- src/components/TrackList.vue -->
<template>
    <div class="track-list-container">
      <h2 class="section-title bubble">Playlist Tracks</h2>
      
      <div class="track-search">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search by track or artist..." 
          class="search-input"
        />
      </div>
      
      <div class="track-list-controls">
        <div class="track-sort">
          <label for="sort-by">Sort by:</label>
          <select id="sort-by" v-model="sortBy" class="sort-select">
            <option value="default">Default</option>
            <option value="name">Name</option>
            <option value="artists">Artist</option>
            <option value="album">Album</option>
            <option value="popularity">Popularity</option>
            <option value="duration">Duration</option>
            <option value="releaseDate">Release Date</option>
          </select>
          
          <button @click="toggleSortOrder" class="sort-direction">
            {{ sortOrder === 'asc' ? '↑' : '↓' }}
          </button>
        </div>
        
        <div class="track-filter">
          <label for="filter-by">Filter:</label>
          <select id="filter-by" v-model="filterBy" class="filter-select">
            <option value="all">All</option>
            <option value="mood">Mood</option>
            <option value="genre">Genre</option>
          </select>
          
          <select 
            v-if="filterBy === 'mood'" 
            v-model="selectedMood" 
            class="filter-value"
          >
            <option v-for="mood in moodOptions" :key="mood" :value="mood">{{ mood }}</option>
          </select>
          
          <select 
            v-if="filterBy === 'genre'" 
            v-model="selectedGenre" 
            class="filter-value"
          >
            <option v-for="genre in genreOptions" :key="genre" :value="genre">{{ genre }}</option>
          </select>
        </div>
      </div>
      
      <div class="table-container">
        <table class="track-table">
          <thead>
            <tr>
              <th>#</th>
              <th @click="setSortBy('name')">Title</th>
              <th @click="setSortBy('artists')">Artist</th>
              <th @click="setSortBy('album')">Album</th>
              <th @click="setSortBy('popularity')">Popularity</th>
              <th @click="setSortBy('mood')">Mood</th>
              <th @click="setSortBy('duration')">Duration</th>
            </tr>
          </thead>
          
          <tbody>
            <tr 
              v-for="(track, index) in filteredAndSortedTracks" 
              :key="track.id"
              @click="openTrack(track)"
            >
              <td>{{ index + 1 }}</td>
              <td class="track-name">{{ track.name }}</td>
              <td>{{ track.artists }}</td>
              <td>{{ track.album }}</td>
              <td>
                <div class="popularity-bar">
                  <div 
                    class="popularity-fill" 
                    :style="{ width: track.popularity + '%' }"
                    :class="getPopularityClass(track.popularity)"
                  ></div>
                </div>
              </td>
              <td>{{ track.mood }}</td>
              <td>{{ track.durationFormatted }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <p v-if="filteredAndSortedTracks.length === 0" class="no-results">
        No tracks found matching your criteria.
      </p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TrackList',
    props: {
      tracks: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        searchQuery: '',
        sortBy: 'default',
        sortOrder: 'asc',
        filterBy: 'all',
        selectedMood: 'All',
        selectedGenre: 'All'
      };
    },
    computed: {
      filteredAndSortedTracks() {
        // First, filter the tracks
        let result = [...this.tracks];
        
        // Apply search filter
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase();
          result = result.filter(track => 
            track.name.toLowerCase().includes(query) || 
            track.artists.toLowerCase().includes(query) ||
            track.album.toLowerCase().includes(query)
          );
        }
        
        // Apply mood filter
        if (this.filterBy === 'mood' && this.selectedMood !== 'All') {
          result = result.filter(track => track.mood === this.selectedMood);
        }
        
        // Apply genre filter
        if (this.filterBy === 'genre' && this.selectedGenre !== 'All') {
          result = result.filter(track => track.genres.includes(this.selectedGenre));
        }
        
        // Apply sorting
        if (this.sortBy !== 'default') {
          result.sort((a, b) => {
            let comparison = 0;
            
            // Special case for popularity and duration which are numbers
            if (this.sortBy === 'popularity' || this.sortBy === 'duration') {
              comparison = a[this.sortBy] - b[this.sortBy];
            } else if (this.sortBy === 'releaseDate') {
              comparison = new Date(a[this.sortBy]) - new Date(b[this.sortBy]);
            } else {
              comparison = a[this.sortBy].localeCompare(b[this.sortBy]);
            }
            
            return this.sortOrder === 'asc' ? comparison : -comparison;
          });
        }
        
        return result;
      },
      
      moodOptions() {
        // Get unique moods
        const moods = new Set(['All', ...this.tracks.map(track => track.mood)]);
        return [...moods];
      },
      
      genreOptions() {
        // Get unique genres from all tracks
        const genres = new Set(['All']);
        this.tracks.forEach(track => {
          track.genres.forEach(genre => genres.add(genre));
        });
        return [...genres];
      }
    },
    methods: {
      setSortBy(field) {
        if (this.sortBy === field) {
          this.toggleSortOrder();
        } else {
          this.sortBy = field;
          this.sortOrder = 'asc';
        }
      },
      
      toggleSortOrder() {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      },
      
      getPopularityClass(value) {
        if (value < 30) return 'low';
        if (value < 60) return 'medium';
        return 'high';
      },
      
      openTrack(track) {
        window.open(`https://open.spotify.com/track/${track.id}`, '_blank');
      }
    }
  };
  </script>
  
  <style scoped>
  .track-list-container {
    margin-bottom: 2rem;
  }
  
  .track-search {
    margin-bottom: 1rem;
  }
  
  .search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    background-color: #333;
    color: white;
  }
  
  .track-list-controls {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }
  
  .track-sort, .track-filter {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .track-sort label, .track-filter label {
    margin-right: 0.5rem;
    color: var(--spotify-light-gray);
  }
  
  .sort-select, .filter-select, .filter-value {
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    background-color: #333;
    color: white;
    margin-right: 0.5rem;
  }
  
  .sort-direction {
    background-color: #333;
    color: white;
    border: none;
    border-radius: 4px;
    width: 30px;
    height: 30px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .track-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  
  .track-table th,
  .track-table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #333;
  }
  
  .track-table th {
    color: var(--spotify-light-gray);
    font-weight: 400;
    cursor: pointer;
  }
  
  .track-table th:hover {
    color: var(--spotify-white);
  }
  
  .track-table tbody tr {
    transition: background-color 0.2s ease;
    cursor: pointer;
  }
  
  .track-table tbody tr:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .track-name {
    font-weight: 500;
  }
  
  .popularity-bar {
    width: 100%;
    height: 4px;
    background-color: #333;
    border-radius: 2px;
    overflow: hidden;
  }
  
  .popularity-fill {
    height: 100%;
    border-radius: 2px;
  }
  
  .popularity-fill.low {
    background-color: #e74c3c;
  }
  
  .popularity-fill.medium {
    background-color: #f39c12;
  }
  
  .popularity-fill.high {
    background-color: var(--spotify-green);
  }
  
  .no-results {
    text-align: center;
    padding: 2rem;
    color: var(--spotify-light-gray);
  }
  
  @media (max-width: 768px) {
    .track-list-controls {
      flex-direction: column;
    }
    
    .track-sort, .track-filter {
      margin-bottom: 1rem;
    }
  }
  </style>