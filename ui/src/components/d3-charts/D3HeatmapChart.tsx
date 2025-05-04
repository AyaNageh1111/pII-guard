
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { cn } from '@/lib/utils';

interface D3HeatmapChartProps {
  data: Array<{ hour: string; detections: number }>;
  title: string;
  className?: string;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export function D3HeatmapChart({ 
  data, 
  title, 
  className, 
  width = 600, 
  height = 300,
  margin = { top: 30, right: 30, bottom: 50, left: 60 }
}: D3HeatmapChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;
    
    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Sort data chronologically
    const sortedData = [...data].sort((a, b) => {
      const hourA = parseInt(a.hour.split(':')[0]);
      const hourB = parseInt(b.hour.split(':')[0]);
      return hourA - hourB;
    });
    
    // Calculate the inner dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    
    // Create a group element for the chart area
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Define hours
    const hours = sortedData.map(d => d.hour);
    
    // Calculate day segments (morning, afternoon, evening, night)
    const daySegments = [
      { name: "Night", range: [0, 6] },
      { name: "Morning", range: [6, 12] },
      { name: "Afternoon", range: [12, 18] },
      { name: "Evening", range: [18, 24] }
    ];
    
    // X scale for hours
    const xScale = d3.scaleBand()
      .domain(hours)
      .range([0, innerWidth])
      .padding(0.1);
    
    // Y scale for day parts (just one row for the heatmap)
    const yScale = d3.scaleBand()
      .domain(["Detections"])
      .range([0, innerHeight / 2])
      .padding(0.1);
    
    // Color scale - Use retro purple-to-pink gradient
    const maxDetections = d3.max(data, d => d.detections) || 0;
    const colorScale = d3.scaleSequential()
      .domain([0, maxDetections])
      .interpolator(d3.interpolate('#FFDEE2', '#9b87f5')); // Soft pink to primary purple
    
    // Create cells
    const cells = g.selectAll(".cell")
      .data(sortedData)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", d => xScale(d.hour) || 0)
      .attr("y", yScale("Detections") || 0)
      .attr("rx", 3) // Rounded corners
      .attr("ry", 3)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(d.detections))
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5);
    
    // Add X axis for hours
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${yScale.bandwidth() + (yScale("Detections") || 0) + 10})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => {
          const hour = parseInt(d.toString());
          return hour % 3 === 0 ? d.toString() : '';
        })
      )
      .attr("font-size", "12px")
      .attr("font-family", "Roboto, sans-serif") // Updated to Roboto
      .attr("color", "#6E6E6E");
    
    // Rotate hour labels for better readability
    xAxis.selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");
    
    // Add day segment labels
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight - 5})`)
      .attr("text-anchor", "middle")
      .attr("font-family", "Roboto, sans-serif") // Updated to Roboto
      .attr("font-size", "12px")
      .attr("fill", "#6E6E6E")
      .text("Hour of Day");
    
    // Add legend title
    g.append("text")
      .attr("x", 0)
      .attr("y", yScale.bandwidth() + (yScale("Detections") || 0) + 70)
      .attr("font-family", "Roboto, sans-serif") // Updated to Roboto
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#6E6E6E")
      .text("Detection Count");
    
    // Create legend with retro gradient
    const legendWidth = 200;
    const legendHeight = 15;
    const legend = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${height - 30})`);
    
    // Create gradient for legend
    const defs = legend.append("defs");
    const linearGradient = defs.append("linearGradient")
      .attr("id", "heatmap-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");
    
    // Add color stops with retro colors
    const colorStops = [0, 0.25, 0.5, 0.75, 1];
    colorStops.forEach(stop => {
      linearGradient.append("stop")
        .attr("offset", `${stop * 100}%`)
        .attr("stop-color", colorScale(stop * maxDetections));
    });
    
    // Add gradient rectangle
    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("fill", "url(#heatmap-gradient)")
      .attr("rx", 3)
      .attr("ry", 3);
    
    // Add legend scale ticks
    const legendScale = d3.scaleLinear()
      .domain([0, maxDetections])
      .range([0, legendWidth]);
    
    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickSize(3);
    
    legend.append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .attr("font-size", "10px")
      .attr("font-family", "Roboto, sans-serif"); // Updated to Roboto
    
    // Add tooltip with retro styling
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("border", "1px solid #9b87f5") // Retro primary color border
      .style("border-radius", "4px")
      .style("padding", "8px 12px")
      .style("font-size", "12px")
      .style("font-family", "Roboto, sans-serif") // Updated to Roboto
      .style("color", "#7E69AB") // Retro secondary text color
      .style("box-shadow", "0 2px 10px rgba(155,135,245,0.2)") // Soft purple shadow
      .style("pointer-events", "none")
      .style("z-index", "100");
    
    // Add event listeners for tooltip
    cells.on("mouseover", function(event, d) {
      const formattedHour = d.hour;
      
      tooltip
        .html(`<strong>${formattedHour}</strong>: ${d.detections} detections`)
        .style("visibility", "visible");
      
      d3.select(this)
        .attr("stroke", "#7E69AB") // Retro secondary color
        .attr("stroke-width", 1);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
      tooltip.style("visibility", "hidden");
      
      d3.select(this)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5);
    });
    
    // Clean up tooltip when component unmounts
    return () => {
      d3.select("body").selectAll(".d3-tooltip").remove();
    };
  }, [data, height, margin, width]);

  return (
    <div className={cn("dd-chart-container", className)}>
      <h3 className="dd-title mb-4">{title}</h3>
      <div className="h-[300px] w-full flex items-center justify-center">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}
