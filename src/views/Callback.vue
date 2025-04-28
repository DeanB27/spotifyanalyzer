<!-- src/views/Callback.vue -->
<template>
    <div class="callback">
      <div class="loading-container">
        <div class="spinner"></div>
        <h2>Connecting to Spotify...</h2>
      </div>
    </div>
  </template>
  
  <script>
  import SpotifyService from '@/services/spotify';
  
  export default {
    name: 'CallbackView',
    created() {
      this.handleCallback();
    },
    methods: {
      handleCallback() {
        // Extract the token from the URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        
        if (accessToken) {
          // Save the token in the service and localStorage
          SpotifyService.setAccessToken(accessToken);
          
          // Dispatch an event to notify the app about authentication change
          window.dispatchEvent(new Event('spotify-auth-change'));
          
          // Redirect to home
          this.$router.push('/');
        } else {
          // If no token, show error and redirect to home
          alert('Authentication failed. Please try again.');
          this.$router.push('/');
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .callback {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60vh;
  }
  
  .loading-container {
    text-align: center;
  }
  
  .spinner {
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top: 4px solid var(--spotify-green);
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1.5rem;
  }
  
  h2 {
    font-weight: 500;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>