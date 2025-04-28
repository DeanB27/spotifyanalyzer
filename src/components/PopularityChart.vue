<!-- src/components/PopularityChart.vue -->
<template>
    <div class="chart-container">
      <h3 class="chart-title">Track Popularity Distribution</h3>
      <div class="chart" ref="chartContainer"></div>
    </div>
  </template>
  
  <script>
  import * as d3 from 'd3';
  
  export default {
    name: 'PopularityChart',
    props: {
      popularityData: {
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
      popularityData: {
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
        if (!this.popularityData || this.popularityData.length === 0 || !this.$refs.chartContainer) {
          return;
        }
        
        // Clear previous chart
        d3.select(this.$refs.chartContainer).selectAll('*').remove();
        
        // Get container dimensions
        const containerWidth = this.$refs.chartContainer.clientWidth;
        const containerHeight = 300;
        
        // Set up margins
        const margin = { top: 20, right: 30, bottom: 40, left: 60 };
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
        const x = d3.scaleBand()
          .domain(this.popularityData.map(d => d.range))
          .range([0, width])
          .padding(0.3);
        
        const y = d3.scaleLinear()
          .domain([0, d3.max(this.popularityData, d => d.percentage)])
          .nice()
          .range([height, 0]);
        
        // Add X axis
        svg.append('g')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x))
          .selectAll('text')
          .style('text-anchor', 'end')
          .attr('dx', '-.8em')
          .attr('dy', '.15em')
          .attr('transform', 'rotate(-45)');
        
        // Add Y axis
        svg.append('g')
          .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));
        
        // Add Y axis label
        svg.append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', -margin.left)
          .attr('x', -height / 2)
          .attr('dy', '1em')
          .style('text-anchor', 'middle')
          .style('fill', '#B3B3B3')
          .text('Percentage of Songs');
        
        // Add bars
        svg.selectAll('.bar')
          .data(this.popularityData)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', d => x(d.range))
          .attr('width', x.bandwidth())
          .attr('y', d => y(d.percentage))
          .attr('height', d => height - y(d.percentage))
          .attr('fill', (d, i) => {
            const colors = ['#e74c3c', '#f39c12', '#1DB954'];
            return colors[i % colors.length];
          })
          .attr('rx', 4)
          .attr('ry', 4);
        
        // Add labels on top of bars
        svg.selectAll('.label')
          .data(this.popularityData)
          .enter()
          .append('text')
          .attr('class', 'label')
          .attr('x', d => x(d.range) + x.bandwidth() / 2)
          .attr('y', d => y(d.percentage) - 5)
          .attr('text-anchor', 'middle')
          .style('fill', '#FFFFFF')
          .style('font-size', '12px')
          .text(d => `${d.percentage.toFixed(1)}%`);
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