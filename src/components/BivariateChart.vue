<!-- src/components/BivariateChart.vue -->
<template>
    <div class="chart-container">
      <h3 class="chart-title">Duration vs. Popularity</h3>
      <div class="chart" ref="chartContainer"></div>
    </div>
  </template>
  
  <script>
  import * as d3 from 'd3';
  
  export default {
    name: 'BivariateChart',
    props: {
      trackData: {
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
      trackData: {
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
        if (!this.trackData || this.trackData.length === 0 || !this.$refs.chartContainer) {
          return;
        }
        
        // Clear previous chart
        d3.select(this.$refs.chartContainer).selectAll('*').remove();
        
        // Get container dimensions
        const containerWidth = this.$refs.chartContainer.clientWidth;
        const containerHeight = 400;
        
        // Set up margins
        const margin = { top: 20, right: 20, bottom: 50, left: 50 };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;
        
        // Create SVG
        const svg = d3.select(this.$refs.chartContainer)
          .append('svg')
          .attr('width', containerWidth)
          .attr('height', containerHeight)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Add X axis (duration in minutes)
        const x = d3.scaleLinear()
          .domain([0, d3.max(this.trackData, d => d.durationMinutes) * 1.1])
          .range([0, width]);
        
        svg.append('g')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d.toFixed(1)}`));
        
        // Add X axis label
        svg.append('text')
          .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
          .style('text-anchor', 'middle')
          .style('fill', '#B3B3B3')
          .text('Duration (minutes)');
        
        // Add Y axis (popularity)
        const y = d3.scaleLinear()
          .domain([0, 100])
          .range([height, 0]);
        
        svg.append('g')
          .call(d3.axisLeft(y).ticks(5));
        
        // Add Y axis label
        svg.append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', -margin.left)
          .attr('x', -height / 2)
          .attr('dy', '1em')
          .style('text-anchor', 'middle')
          .style('fill', '#B3B3B3')
          .text('Popularity');
        
        // Color scale by mood
        const color = d3.scaleOrdinal()
          .domain(['Happy', 'Sad', 'Energetic', 'Chill', 'Neutral'])
          .range(['#1DB954', '#e74c3c', '#f39c12', '#3498db', '#9b59b6']);
        
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
        
        // Add data points
        svg.append('g')
          .selectAll('dot')
          .data(this.trackData)
          .enter()
          .append('circle')
          .attr('cx', d => x(d.durationMinutes))
          .attr('cy', d => y(d.popularity))
          .attr('r', 5)
          .style('fill', d => color(d.mood))
          .style('opacity', 0.7)
          .style('stroke', 'white')
          .style('stroke-width', 1)
          .on('mouseover', (event, d) => {
            tooltip.transition()
              .duration(200)
              .style('opacity', 1);
            
            tooltip.html(`
              <strong>${d.name}</strong><br>
              Artist: ${d.artists}<br>
              Duration: ${d.durationFormatted}<br>
              Popularity: ${d.popularity}<br>
              Mood: ${d.mood}
            `)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 28) + 'px');
            
            d3.select(event.currentTarget)
              .transition()
              .duration(200)
              .attr('r', 8)
              .style('opacity', 1);
          })
          .on('mouseout', (event, d) => {
            tooltip.transition()
              .duration(500)
              .style('opacity', 0);
            
            d3.select(event.currentTarget)
              .transition()
              .duration(200)
              .attr('r', 5)
              .style('opacity', 0.7);
          });
        
        // Add a trend line (linear regression)
        const xValues = this.trackData.map(d => d.durationMinutes);
        const yValues = this.trackData.map(d => d.popularity);
        
        // Simple linear regression
        const xMean = d3.mean(xValues);
        const yMean = d3.mean(yValues);
        const ssXY = d3.sum(xValues.map((x, i) => (x - xMean) * (yValues[i] - yMean)));
        const ssXX = d3.sum(xValues.map(x => (x - xMean) ** 2));
        
        const slope = ssXY / ssXX;
        const intercept = yMean - slope * xMean;
        
        // Create line function
        const line = d3.line()
          .x(d => x(d))
          .y(d => y(intercept + slope * d));
        
        // Add the trend line
        svg.append('path')
          .datum([0, d3.max(xValues) * 1.1])
          .attr('class', 'trend-line')
          .attr('d', line)
          .style('stroke', 'rgba(255, 255, 255, 0.3)')
          .style('stroke-width', 2)
          .style('stroke-dasharray', '5,5')
          .style('fill', 'none');
        
        // Add legend
        const legend = svg.append('g')
          .attr('class', 'legend')
          .attr('transform', `translate(${width - 120}, 20)`);
        
        const moods = ['Happy', 'Sad', 'Energetic', 'Chill', 'Neutral'];
        
        moods.forEach((mood, i) => {
          const legendRow = legend.append('g')
            .attr('transform', `translate(0, ${i * 20})`);
          
          legendRow.append('rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', color(mood));
          
          legendRow.append('text')
            .attr('x', 15)
            .attr('y', 10)
            .attr('text-anchor', 'start')
            .style('fill', 'white')
            .style('font-size', '12px')
            .text(mood);
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