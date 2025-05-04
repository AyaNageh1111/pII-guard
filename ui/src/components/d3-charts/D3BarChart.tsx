
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { cn } from '@/lib/utils';

interface D3BarChartProps {
  data: Array<{ name: string; value: number } | { [key: string]: any }>;
  title: string;
  className?: string;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  valueKey?: string;
  color?: string;
}

export function D3BarChart({ 
  data, 
  title, 
  className, 
  width = 600, 
  height = 300,
  margin = { top: 20, right: 30, bottom: 40, left: 60 },
  valueKey = "value",
  color = "#33C3F0" // Default to retro sky blue
}: D3BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;
    
    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Calculate the inner dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Determine if we're showing hourly data
    const isHourlyData = data[0] && 'hour' in data[0];
    const nameKey = isHourlyData ? 'hour' : 'name';
    
    // Create scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d[nameKey] as string))
      .range([0, innerWidth])
      .padding(0.3);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => Number(d[valueKey])) || 0])
      .nice()
      .range([innerHeight, 0]);
    
    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    
    // Create a group element for the chart area
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add X axis with better label handling for hourly data
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => {
          if (isHourlyData) {
            // For hourly data, show fewer labels to avoid crowding
            const hour = parseInt(d.toString());
            return hour % 3 === 0 ? d.toString() : '';
          }
          return d.toString();
        })
      )
      .attr("font-size", "12px")
      .attr("font-family", "Roboto, sans-serif") // Updated to Roboto
      .attr("color", "#6E6E6E");
    
    // Rotate labels if hourly data
    if (isHourlyData) {
      xAxis.selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");
    }
      
    // Style axis lines
    xAxis.selectAll("line").attr("stroke", "#e5e7eb");
    
    // Add Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .attr("font-size", "12px")
      .attr("font-family", "Roboto, sans-serif") // Updated to Roboto
      .attr("color", "#6E6E6E")
      .call(g => g.select(".domain").attr("stroke", "#e5e7eb"))
      .call(g => g.selectAll("line").attr("stroke", "#e5e7eb"));
    
    // Add grid lines with retro styling
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-innerWidth)
        .tickFormat(() => "")
      )
      .call(g => g.selectAll("line")
        .attr("stroke", "#e5e7eb")
        .attr("stroke-opacity", 0.7)
        .attr("stroke-dasharray", "3,3")
      )
      .call(g => g.selectAll(".domain").remove());
    
    // Add the bars with retro styling
    const bars = g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d[nameKey] as string) || 0)
      .attr("y", d => yScale(Number(d[valueKey])))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(Number(d[valueKey])))
      .attr("fill", color)
      .attr("rx", 4) // More rounded corners for retro look
      .attr("ry", 4);
    
    // Add tooltip with retro styling
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("border", "1px solid " + color)
      .style("border-radius", "4px")
      .style("padding", "8px 12px")
      .style("font-size", "12px") 
      .style("font-family", "Roboto, sans-serif") // Updated to Roboto
      .style("color", "#7E69AB") // Retro secondary text color
      .style("box-shadow", `0 2px 10px ${color}33`) // Light shadow of the main color
      .style("pointer-events", "none")
      .style("z-index", "100");
    
    // Add event listeners with retro hover effect
    bars.on("mouseover", function(event, d) {
      const displayKey = isHourlyData ? 'hour' : 'name';
      tooltip
        .html(`<strong>${d[displayKey]}</strong>: ${d[valueKey]}`)
        .style("visibility", "visible");

      d3.select(this)
        .attr("fill", d3.color(color)!.darker(0.1).toString())
        .attr("stroke", "#FFFFFF")
        .attr("stroke-width", "1px");
    })
    .on("mousemove", function(event) {
      tooltip
        .style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
      tooltip
        .style("visibility", "hidden");
      
      d3.select(this)
        .attr("fill", color)
        .attr("stroke", "none");
    });
    
    // Clean up tooltip when component unmounts
    return () => {
      d3.select("body").selectAll(".d3-tooltip").remove();
    };
  }, [data, width, height, margin, valueKey, color]);

  return (
    <div className={cn("dd-chart-container", className)}>
      <h3 className="dd-title mb-4">{title}</h3>
      <div className="h-[300px] w-full flex items-center justify-center">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}
