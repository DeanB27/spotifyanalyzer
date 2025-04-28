// vue.config.js
module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/spotifyanalyzer/'  // Changed to match your repository name
    : '/',
  configureWebpack: {
    performance: {
      hints: false
    }
  }
};