<!-- src/components/TopSongsChart.vue -->
<template>
    <div class="chart-container">
      <h3 class="chart-title">Top 10 Songs by Popularity</h3>
      <div class="chart" ref="chartContainer"></div>
    </div>
  </template>
  
  <script>
  import * as d3 from 'd3';
  
  export default {
    name: 'TopSongsChart',
    props: {
      songData: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        chart: null
      };
    },
    watch: {
      songData: {
        handler() {
          this.renderChart();
        },
        deep: true
      }
    },
    mounted() {
      this.renderChart();
      
      // Handle window resize
      window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.handleResize);
    },
    methods: {
      handleResize() {
        // Clear previous chart
        d3.select(this.$refs.chartContainer).selectAll('*').remove();
        
        // Re-render chart
        this.$nextTick(() => {
          this.renderChart();
        });
      },
      renderChart() {
        if (!this.songData || this.songData.length === 0 || !this.$refs.chartContainer) {
          return;
        }
        
        // Sort data by popularity
        const sortedData = [...this.songData]
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 10)
          .reverse(); // Reverse for bottom-to-top rendering
        
        // Shorten long track names
        sortedData.forEach(track => {
          track.displayName = track.name.length > 25 
            ? track.name.substring(0, 25) + '...' 
            : track.name;
        });
        
        // Clear previous chart
        d3.select(this.$refs.chartContainer).selectAll('*').remove();
        
        // Get container dimensions
        const containerWidth = this.$refs.chartContainer.clientWidth;
        const containerHeight = 400;
        
        // Set up margins
        const margin = { top: 20, right: 30, bottom: 40, left: 150 };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;
        
        // Create SVG
        const svg = d3.select(this.$refs.chartContainer)
          .append('svg')
          .attr('width', containerWidth)
          .attr('height', containerHeight)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Set up scales
        const x = d3.scaleLinear()
          .domain([0, 100]) // Popularity scale is 0-100
          .range([0, width]);
        
        const y = d3.scaleBand()
          .domain(sortedData.map(d => d.displayName))
          .range([0, height])
          .padding(0.3);
        
        // Add X axis
        svg.append('g')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x).ticks(5))
          .selectAll('text')
          .style('text-anchor', 'middle');
        
        // Add X axis label
        svg.append('text')
          .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
          .style('text-anchor', 'middle')
          .style('fill', '#B3B3B3')
          .text('Popularity');
        
        // Add Y axis
        svg.append('g')
          .call(d3.axisLeft(y))
          .selectAll('text')
          .style('text-anchor', 'end')
          .style('font-size', '12px');
        
        // Create gradient for bars
        const gradient = svg.append('defs')
          .append('linearGradient')
          .attr('id', 'song-gradient')
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '100%')
          .attr('y2', '0%');
        
        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', '#e74c3c')
          .attr('stop-opacity', 0.8);
        
        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', '#e74c3c')
          .attr('stop-opacity', 1);
        
        // Add tooltip
        const tooltip = d3.select(this.$refs.chartContainer)
          .append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0)
          .style('position', 'absolute')
          .style('background-color', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '10px')
          .style('border-radius', '5px')
          .style('pointer-events', 'none')
          .style('font-size', '12px')
          .style('max-width', '250px')
          .style('z-index', 10);
        
        // Add bars
        svg.selectAll('bars')
          .data(sortedData)
          .enter()
          .append('rect')
          .attr('y', d => y(d.displayName))
          .attr('height', y.bandwidth())
          .attr('x', 0)
          .attr('width', 0) // Start with zero width for animation
          .attr('fill', 'url(#song-gradient)')
          .attr('rx', 4)
          .attr('ry', 4)
          .on('mouseover', (event, d) => {
            tooltip.transition()
              .duration(200)
              .style('opacity', 1);
            
            tooltip.html(`
              <strong>${d.name}</strong><br>
              Artist: ${d.artists}<br>
              Album: ${d.album}<br>
              Duration: ${d.durationFormatted}<br>
              Popularity: ${d.popularity}<br>
              Mood: ${d.mood}
            `)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          })
          .on('mouseout', () => {
            tooltip.transition()
              .duration(500)
              .style('opacity', 0);
          })
          .transition()
          .duration(800)
          .delay((d, i) => i * 100)
          .attr('width', d => x(d.popularity));
        
        // Add labels
        svg.selectAll('valueLabels')
          .data(sortedData)
          .enter()
          .append('text')
          .attr('y', d => y(d.displayName) + y.bandwidth() / 2)
          .attr('x', d => x(d.popularity) + 5)
          .attr('alignment-baseline', 'middle')
          .style('fill', 'white')
          .style('font-size', '12px')
          .text(d => d.popularity)
          .style('opacity', 0)
          .transition()
          .duration(800)
          .delay((d, i) => i * 100 + 300)
          .style('opacity', 1);
        
        // Add click event for tracks
        svg.selectAll('rect')
          .style('cursor', 'pointer')
          .on('click', (event, d) => {
            window.open(`https://open.spotify.com/track/${d.id}`, '_blank');
          });
      }
    }
  };
  </script>
  
  <style scoped>
  .chart-container {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 1rem;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .chart-title {
    text-align: center;
    margin-bottom: 1rem;
    color: white;
  }
  
  .chart {
    flex: 1;
    position: relative;
  }
  
  /* D3 Styling */
  :deep(.axis) path,
  :deep(.axis) line {
    stroke: #B3B3B3;
  }
  
  :deep(.axis) text {
    fill: #B3B3B3;
  }
  </style>