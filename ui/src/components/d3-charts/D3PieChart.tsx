
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { cn } from '@/lib/utils';

interface D3PieChartProps {
  data: Array<{ name: string; value: number }>;
  title: string;
  className?: string;
  colors?: string[];
  width?: number;
  height?: number;
}

export function D3PieChart({ 
  data, 
  title, 
  className, 
  colors = ['#9b87f5', '#D946EF', '#F97316', '#33C3F0', '#8B5CF6', '#7E69AB', '#6E59A5'], // Retro colors
  width = 600,
  height = 300
}: D3PieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;
    
    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Calculate the inner dimensions and radius
    const margin = { top: 40, right: 20, bottom: 40, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const radius = Math.min(innerWidth, innerHeight) / 2;
    
    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left + innerWidth / 2}, ${margin.top + innerHeight / 2})`);
    
    // Create a color scale
    const colorScale = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.name))
      .range(colors);
    
    // Calculate total for percentages
    const total = d3.sum(data, d => d.value);
    
    // Sort data for better visualization (optional)
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    
    // Create the polar bar chart
    const outerRadius = radius * 0.9;
    const innerRadius = radius * 0.4; // Increased from 0.4 for more pronounced bars
    
    // Calculate angle scale - how much of the circle each value takes
    const angleScale = d3.scaleLinear()
      .domain([0, total])
      .range([0, 2 * Math.PI]);
    
    // Start angle for the first bar
    let startAngle = 0;
    
    // Draw the polar bars with small gaps between them
    svg.selectAll(".polar-bar")
      .data(sortedData)
      .join("path")
      .attr("class", "polar-bar")
      .attr("d", d => {
        // End angle based on this data point's value
        const value = d.value;
        const endAngle = startAngle + angleScale(value) - 0.02; // Small gap between bars
        
        // Create arc path for this segment
        const arcPath = d3.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius)
          .startAngle(startAngle)
          .endAngle(endAngle)
          .padAngle(0.01) // Add padding between segments
          .cornerRadius(2); // Slightly rounded corners
        
        const path = arcPath({
          innerRadius,
          outerRadius,
          startAngle,
          endAngle
        } as any);
        
        // Update start angle for next bar
        startAngle = endAngle + 0.02; // Add small gap
        return path;
      })
      .attr("fill", (d, i) => colorScale(d.name))
      .style("stroke", "white")
      .style("stroke-width", "1px")
      .style("opacity", 0.9)
      .attr("data-value", d => d.value)
      .attr("data-name", d => d.name)
      .on("mouseover", function(event, d) {
        const percent = Math.round((d.value / total) * 100);
        
        const tooltip = d3.select("body").select(".d3-tooltip");
        tooltip
          .html(`<strong>${d.name}</strong>: ${d.value} (${percent}%)`)
          .style("visibility", "visible");

        d3.select(this)
          .style("opacity", 1)
          .style("stroke-width", "2px")
          .attr("transform", "scale(1.03)"); // Slight pop effect
      })
      .on("mousemove", function(event) {
        const tooltip = d3.select("body").select(".d3-tooltip");
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function() {
        const tooltip = d3.select("body").select(".d3-tooltip");
        tooltip
          .style("visibility", "hidden");
        
        d3.select(this)
          .style("opacity", 0.9)
          .style("stroke-width", "1px")
          .attr("transform", "scale(1)"); // Reset scale
      });
    
    // Add percentage labels
    startAngle = 0; // Reset for labels
    
    svg.selectAll(".percentage-label")
      .data(sortedData)
      .join("text")
      .attr("class", "percentage-label")
      .text(d => {
        const percent = Math.round((d.value / total) * 100);
        return percent > 5 ? `${percent}%` : "";
      })
      .attr("transform", d => {
        const value = d.value;
        const segmentAngle = angleScale(value);
        const midAngle = startAngle + segmentAngle / 2;
        startAngle += segmentAngle;
        
        const radius = innerRadius + (outerRadius - innerRadius) / 2;
        const x = Math.sin(midAngle) * radius;
        const y = -Math.cos(midAngle) * radius;
        
        return `translate(${x}, ${y})`;
      })
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto, sans-serif")
      .style("fill", "white")
      .style("text-shadow", "0px 0px 3px rgba(0,0,0,0.5)");
    
    // Create the legend on the left side
    const legend = svg.append("g")
      .attr("transform", `translate(${-radius - 80}, ${-radius / 2})`);
    
    // Adjust legend positioning
    const legendItems = legend.selectAll(".legend-item")
      .data(sortedData)
      .join("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 25})`);
    
    legendItems.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("rx", 2)
      .attr("ry", 2)
      .style("fill", d => colorScale(d.name))
      .style("stroke", "#FFFFFF")
      .style("stroke-width", "0.5px");
    
    legendItems.append("text")
      .attr("x", 18)
      .attr("y", 10)
      .text(d => {
        // Show value along with name
        return `${d.name.length > 12 ? d.name.substring(0, 10) + "..." : d.name} (${d.value})`;
      })
      .style("font-size", "11px")
      .style("font-weight", "500")
      .style("font-family", "Roboto, sans-serif");
    
    // Add a small circular highlight in the center
    svg.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", innerRadius)
      .attr("fill", "none")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", "1px");
    
    // Add tooltip (if not already in DOM)
    if (!d3.select("body").select(".d3-tooltip").size()) {
      d3.select("body")
        .append("div")
        .attr("class", "d3-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "white")
        .style("border", "1px solid #9b87f5")
        .style("border-radius", "4px")
        .style("padding", "8px 12px")
        .style("font-size", "12px")
        .style("font-family", "Roboto, sans-serif")
        .style("color", "#7E69AB")
        .style("box-shadow", "0 2px 10px rgba(155,135,245,0.2)")
        .style("pointer-events", "none")
        .style("z-index", "100");
    }
    
    // Clean up tooltip when component unmounts
    return () => {
      d3.select("body").selectAll(".d3-tooltip").remove();
    };
  }, [data, colors, width, height]);

  return (
    <div className={cn("dd-chart-container", className)}>
      <h3 className="dd-title mb-4">{title}</h3>
      <div className="h-[300px] w-full flex items-center justify-center">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}
