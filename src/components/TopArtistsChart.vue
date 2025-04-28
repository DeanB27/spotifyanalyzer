<!-- src/components/TopArtistsChart.vue -->
<template>
    <div class="chart-container">
      <h3 class="chart-title">Top 10 Artists by Popularity</h3>
      <div class="chart" ref="chartContainer"></div>
    </div>
  </template>
  
  <script>
  import * as d3 from 'd3';
  
  export default {
    name: 'TopArtistsChart',
    props: {
      artistData: {
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
      artistData: {
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
        if (!this.artistData || this.artistData.length === 0 || !this.$refs.chartContainer) {
          return;
        }
        
        // Sort data by average popularity
        const sortedData = [...this.artistData]
          .sort((a, b) => b.avgPopularity - a.avgPopularity)
          .slice(0, 10)
          .reverse(); // Reverse for bottom-to-top rendering
        
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
          .domain(sortedData.map(d => d.name))
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
          .text('Average Popularity');
        
        // Add Y axis
        svg.append('g')
          .call(d3.axisLeft(y))
          .selectAll('text')
          .style('text-anchor', 'end')
          .style('font-size', '12px');
        
        // Create gradient for bars
        const gradient = svg.append('defs')
          .append('linearGradient')
          .attr('id', 'bar-gradient')
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '100%')
          .attr('y2', '0%');
        
        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', '#1DB954')
          .attr('stop-opacity', 0.8);
        
        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', '#1DB954')
          .attr('stop-opacity', 1);
        
        // Add bars
        svg.selectAll('bars')
          .data(sortedData)
          .enter()
          .append('rect')
          .attr('y', d => y(d.name))
          .attr('height', y.bandwidth())
          .attr('x', 0)
          .attr('width', 0) // Start with zero width for animation
          .attr('fill', 'url(#bar-gradient)')
          .attr('rx', 4)
          .attr('ry', 4)
          .transition()
          .duration(800)
          .delay((d, i) => i * 100)
          .attr('width', d => x(d.avgPopularity));
        
        // Add labels with count and popularity
        svg.selectAll('valueLabels')
          .data(sortedData)
          .enter()
          .append('text')
          .attr('y', d => y(d.name) + y.bandwidth() / 2)
          .attr('x', d => x(d.avgPopularity) + 5)
          .attr('alignment-baseline', 'middle')
          .style('fill', 'white')
          .style('font-size', '12px')
          .text(d => `Avg: ${d.avgPopularity.toFixed(1)} (${d.count} tracks)`)
          .style('opacity', 0)
          .transition()
          .duration(800)
          .delay((d, i) => i * 100 + 300)
          .style('opacity', 1);
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