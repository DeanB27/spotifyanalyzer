<!-- src/components/MoodChart.vue -->
<template>
    <div class="chart-container">
      <h3 class="chart-title">Mood Analysis</h3>
      <div class="chart" ref="chartContainer"></div>
    </div>
  </template>
  
  <script>
  import * as d3 from 'd3';
  
  export default {
    name: 'MoodChart',
    props: {
      moodData: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        chart: null
      };
    },
    watch: {
      moodData: {
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
        if (!this.moodData || Object.keys(this.moodData).length === 0 || !this.$refs.chartContainer) {
          return;
        }
        
        // Prepare data
        const data = Object.entries(this.moodData)
          .map(([mood, percentage]) => ({ mood, percentage }))
          .sort((a, b) => b.percentage - a.percentage);
        
        // Clear previous chart
        d3.select(this.$refs.chartContainer).selectAll('*').remove();
        
        // Get container dimensions
        const containerWidth = this.$refs.chartContainer.clientWidth;
        const containerHeight = 400;
        
        // Set up margins
        const margin = { top: 10, right: 10, bottom: 10, left: 10 };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;
        const radius = Math.min(width, height) / 2;
        
        // Create SVG
        const svg = d3.select(this.$refs.chartContainer)
          .append('svg')
          .attr('width', containerWidth)
          .attr('height', containerHeight)
          .append('g')
          .attr('transform', `translate(${containerWidth / 2},${containerHeight / 2})`);
        
        // Color scale with mood-specific colors
        const color = d3.scaleOrdinal()
          .domain(data.map(d => d.mood))
          .range([
            '#1DB954', // Happy - Spotify green
            '#3498db', // Chill - Blue
            '#e74c3c', // Sad - Red
            '#f39c12', // Energetic - Orange
            '#9b59b6'  // Neutral - Purple
          ]);
        
        // Compute the position of each group on the pie
        const pie = d3.pie()
          .sort(null) // Do not sort by value
          .value(d => d.percentage);
        
        const data_ready = pie(data);
        
        // Shape generator
        const arc = d3.arc()
          .innerRadius(0) // This creates a standard pie chart
          .outerRadius(radius * 0.8);
        
        // Label arc
        const labelArc = d3.arc()
          .innerRadius(radius * 0.6)
          .outerRadius(radius * 0.6);
        
        // Build the pie chart
        svg.selectAll('allSlices')
          .data(data_ready)
          .enter()
          .append('path')
          .attr('d', arc)
          .attr('fill', d => color(d.data.mood))
          .attr('stroke', 'white')
          .style('stroke-width', '2px')
          .style('opacity', 0.8);
        
        // Add mood icons or emojis to the center of each slice
        svg.selectAll('moodIcons')
          .data(data_ready)
          .enter()
          .append('text')
          .attr('transform', d => {
            const pos = labelArc.centroid(d);
            return `translate(${pos[0]},${pos[1]})`;
          })
          .style('text-anchor', 'middle')
          .style('dominant-baseline', 'middle')
          .style('font-size', '20px')
          .text(d => {
            // Return appropriate emoji for each mood
            switch(d.data.mood) {
              case 'Happy': return '😊';
              case 'Sad': return '😢';
              case 'Energetic': return '⚡';
              case 'Chill': return '😌';
              case 'Neutral': return '😐';
              default: return '';
            }
          });
        
        // Add mood labels
        svg.selectAll('moodLabels')
          .data(data_ready)
          .enter()
          .append('text')
          .attr('transform', d => {
            const pos = labelArc.centroid(d);
            // Position the text slightly below the emoji
            return `translate(${pos[0]},${pos[1] + 20})`;
          })
          .style('text-anchor', 'middle')
          .style('fill', 'white')
          .style('font-size', '14px')
          .style('font-weight', 'bold')
          .text(d => d.data.mood);
        
        // Add percentages
        svg.selectAll('percentageLabels')
          .data(data_ready)
          .enter()
          .append('text')
          .attr('transform', d => {
            const pos = labelArc.centroid(d);
            // Position the text below the mood label
            return `translate(${pos[0]},${pos[1] + 40})`;
          })
          .style('text-anchor', 'middle')
          .style('fill', '#B3B3B3')
          .style('font-size', '12px')
          .text(d => `${d.data.percentage.toFixed(1)}%`);
        
        // Add a nice glow effect to the chart
        // Define a gradient
        const defs = svg.append('defs');
        const filter = defs.append('filter')
          .attr('id', 'glow');
        
        filter.append('feGaussianBlur')
          .attr('stdDeviation', '3.5')
          .attr('result', 'coloredBlur');
        
        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode')
          .attr('in', 'coloredBlur');
        feMerge.append('feMergeNode')
          .attr('in', 'SourceGraphic');
        
        // Apply the filter to the chart
        svg.style('filter', 'url(#glow)');
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
    display: flex;
    justify-content: center;
    align-items: center;
  }
  </style>