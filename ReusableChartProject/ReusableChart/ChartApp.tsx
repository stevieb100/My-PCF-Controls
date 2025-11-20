import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
}

interface ChartAppProps {
  chartType: string;
  data: BarChartData[];
}

interface Dimensions {
  width: number;
  height: number;
}

const ColumnChart: React.FC<BarChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height: height > 0 ? height : 200 });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.unobserve(container);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !dimensions) return;

    const { width, height } = dimensions;
    if (width === 0 || height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 0, bottom: 30, left: 0 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxValue = d3.max(data, d => d.value) || 10;
    const yDomain = [0, maxValue * 1.1];

    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.4);

    const y = d3.scaleLinear()
      .domain(yDomain)
      .range([innerHeight, 0]);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(0))
      .select('.domain').remove();

    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label)!)
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.value))
      .attr('fill', d => d.color || '#60a5fa')
      .attr('rx', 4)
      .attr('ry', 4);

    g.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => x(d.label)! + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 5)
      .attr('text-anchor', 'middle')
      .text(d => d.value)
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#374151');

  }, [data, dimensions]);

  return (
    <div style={{ padding: '1rem', background: 'white', borderRadius: '0.75rem', height: '100%', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
      <div ref={containerRef} style={{ marginTop: '0.5rem', width: '100%', height: '100%' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
      </div>
    </div>
  );
};

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height: height > 0 ? height : 150 });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.unobserve(container);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !dimensions) return;

    const { width, height } = dimensions;
    if (width === 0 || height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 0, right: 30, bottom: 0, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxValue = d3.max(data, d => d.value) || 10;
    const xDomain = [0, maxValue * 1.1];

    const y = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerHeight])
      .padding(0.2);

    const x = d3.scaleLinear()
      .domain(xDomain)
      .range([0, innerWidth]);

    g.append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .select('.domain').remove();

    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', d => y(d.label)!)
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', d => x(d.value))
      .attr('fill', d => d.color || '#60a5fa')
      .attr('rx', 4)
      .attr('ry', 4);

    g.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => x(d.value) + 4)
      .attr('y', d => y(d.label)! + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .text(d => d.value)
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#374151');

  }, [data, dimensions]);

  return (
    <div style={{ padding: '1rem', background: 'white', borderRadius: '0.75rem', height: '100%', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
      <div ref={containerRef} style={{ marginTop: '0.5rem', width: '100%', height: '100%' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
      </div>
    </div>
  );
};

const ChartApp: React.FC<ChartAppProps> = ({ chartType, data }) => {
  
  if (!data || data.length === 0) {
    return (
        <div style={{ padding: '1.5rem', color: '#6B7280' }}>
            <p style={{ marginTop: '1rem' }}>No data provided.</p>
        </div>
    );
  }

  if (chartType === 'column') {
    return <ColumnChart data={data} />;
  }

  if (chartType === 'bar') {
    return <BarChart data={data} />;
  }

  return (
    <div style={{ padding: '1.5rem', color: '#EF4444' }}>
        <p style={{ marginTop: '1rem' }}>Invalid chart type: "{chartType}". Please use "column" or "bar".</p>
    </div>
  );
}

export default ChartApp;

