<!-- src/App.vue -->
<template>
  <div id="app" class="app-container">
    <header>
      <div class="logo-container">
        <img src="@/assets/Vibify.png" alt="Vibify Logo" class="logo">
        <h1>Spotify Playlist Analyzer</h1>
      </div>
      <div v-if="isAuthenticated" class="user-info">
        <button @click="logout" class="spotify-button outline">Logout</button>
      </div>
    </header>

    <main>
      <router-view />
    </main>

    <footer>
      <p>Created with Vue.js | Spotify API</p>
    </footer>
  </div>
</template>

<script>
import SpotifyService from '@/services/spotify';

export default {
  name: 'App',
  data() {
    return {
      isAuthenticated: false
    };
  },
  created() {
    // Initialize the Spotify service
    SpotifyService.init();
    this.isAuthenticated = SpotifyService.isAuthenticated();
    
    // Listen for auth changes
    window.addEventListener('spotify-auth-change', () => {
      this.isAuthenticated = SpotifyService.isAuthenticated();
    });
  },
  methods: {
    logout() {
      SpotifyService.logout();
      this.isAuthenticated = false;
      this.$router.push('/');
    }
  }
};
</script>

<style>
:root {
  --spotify-green: #1DB954;
  --spotify-black: #191414;
  --spotify-dark-gray: #262730;
  --spotify-light-gray: #B3B3B3;
  --spotify-white: #FFFFFF;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--spotify-black);
  color: var(--spotify-white);
  line-height: 1.6;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: rgba(0, 0, 0, 0.8);
  border-bottom: 1px solid #333;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  margin-right: 1rem;
}

h1 {
  font-size: 1.5rem;
  font-weight: 700;
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

footer {
  padding: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--spotify-light-gray);
  background-color: rgba(0, 0, 0, 0.9);
}

.spotify-button {
  background-color: var(--spotify-green);
  color: var(--spotify-white);
  border: none;
  border-radius: 30px;
  padding: 0.75rem 2rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.spotify-button:hover {
  transform: scale(1.05);
  background-color: #1ed760;
}

.spotify-button.outline {
  background-color: transparent;
  border: 2px solid var(--spotify-green);
  color: var(--spotify-green);
}

.spotify-button.outline:hover {
  background-color: var(--spotify-green);
  color: var(--spotify-white);
}

.bubble {
  background-color: var(--spotify-dark-gray);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.loading-bar {
  width: 100%;
  height: 4px;
  background-color: #ddd;
  position: relative;
  margin: 1rem 0;
}

.loading-bar-progress {
  height: 100%;
  background-color: var(--spotify-green);
  width: 0;
  position: absolute;
  animation: loading 2s linear infinite;
}

@keyframes loading {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}
</style>