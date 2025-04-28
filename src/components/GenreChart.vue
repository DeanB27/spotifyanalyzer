<!-- src/components/GenreChart.vue -->
<template>
    <div class="chart-container">
      <h3 class="chart-title">Genre Distribution</h3>
      <div class="chart" ref="chartContainer"></div>
    </div>
  </template>
  
  <script>
  import * as d3 from 'd3';
  
  export default {
    name: 'GenreChart',
    props: {
      genreData: {
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
      genreData: {
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
        if (!this.genreData || Object.keys(this.genreData).length === 0 || !this.$refs.chartContainer) {
          return;
        }
        
        // Prepare data
        const data = Object.entries(this.genreData)
          .map(([genre, percentage]) => ({ genre, percentage }))
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 10); // Show top 10 genres
        
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
        
        // Color scale
        const color = d3.scaleOrdinal()
          .domain(data.map(d => d.genre))
          .range([
            '#1DB954', // Spotify green
            '#1ED760',
            '#2EBD59',
            '#4B917D',
            '#121212',
            '#212121',
            '#535353',
            '#B3B3B3',
            '#777777',
            '#999999'
          ]);
        
        // Compute the position of each group on the pie
        const pie = d3.pie()
          .sort(null) // Do not sort by value
          .value(d => d.percentage);
        
        const data_ready = pie(data);
        
        // Shape generator
        const arc = d3.arc()
          .innerRadius(radius * 0.5) // This creates a donut chart
          .outerRadius(radius * 0.8);
        
        // Label arc
        const labelArc = d3.arc()
          .innerRadius(radius * 0.85)
          .outerRadius(radius * 0.85);
        
        // Build the pie chart
        svg.selectAll('allSlices')
          .data(data_ready)
          .enter()
          .append('path')
          .attr('d', arc)
          .attr('fill', d => color(d.data.genre))
          .attr('stroke', 'white')
          .style('stroke-width', '2px')
          .style('opacity', 0.8);
        
        // Add labels
        const label = svg.selectAll('allLabels')
          .data(data_ready)
          .enter()
          .append('text')
          .text(d => {
            // Only show label if percentage is large enough
            return d.data.percentage > 5 ? d.data.genre : '';
          })
          .attr('transform', d => `translate(${labelArc.centroid(d)})`)
          .style('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('fill', 'white');
        
        // Add percentages
        svg.selectAll('allValues')
          .data(data_ready)
          .enter()
          .append('text')
          .text(d => {
            // Only show percentage if large enough
            return d.data.percentage > 5 ? `${d.data.percentage.toFixed(1)}%` : '';
          })
          .attr('transform', d => {
            const pos = labelArc.centroid(d);
            // Move position slightly below genre label
            return `translate(${pos[0]},${pos[1] + 15})`;
          })
          .style('text-anchor', 'middle')
          .style('font-size', '11px')
          .style('fill', '#B3B3B3');
        
        // Add legend for smaller slices
        const smallGenres = data_ready.filter(d => d.data.percentage <= 5);
        
        if (smallGenres.length > 0) {
          const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${-radius},${radius * 1.1})`);
          
          legend.selectAll('legendItems')
            .data(smallGenres)
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr('y', (d, i) => i * 20)
            .attr('width', 15)
            .attr('height', 15)
            .style('fill', d => color(d.data.genre));
          
          legend.selectAll('legendLabels')
            .data(smallGenres)
            .enter()
            .append('text')
            .attr('x', 20)
            .attr('y', (d, i) => i * 20 + 12)
            .text(d => `${d.data.genre} (${d.data.percentage.toFixed(1)}%)`)
            .style('font-size', '11px')
            .style('fill', 'white');
        }
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