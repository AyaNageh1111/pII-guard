
import { useEffect, RefObject } from 'react';
import * as d3 from 'd3';
import { createTooltip, removeTooltip, formatAxisTick, createLineChartScales } from '../utils/d3ChartUtils';

interface UseD3LineChartProps {
  svgRef: RefObject<SVGSVGElement>;
  data: Array<{ [key: string]: string | number }>;
  dataKey: string;
  xAxisKey: string;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  color: string;
}

export function useD3LineChart({
  svgRef,
  data,
  dataKey,
  xAxisKey,
  width,
  height,
  margin,
  color
}: UseD3LineChartProps) {
  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;
    
    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Calculate the inner dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create scales
    const { xScale, yScale, isHourlyData } = createLineChartScales(
      data, 
      innerWidth, 
      innerHeight, 
      dataKey, 
      xAxisKey
    );
    
    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    
    // Create a group element for the chart area
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add X axis - with improved label handling
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => formatAxisTick(d, isHourlyData, data.length))
      )
      .attr("font-size", "11px")
      .attr("font-family", "Roboto, sans-serif")
      .attr("color", "#6E6E6E");
    
    // Rotate x-axis labels if needed
    if (isHourlyData && data.length > 12) {
      xAxis.selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em");
    }
    
    // Style axis lines
    xAxis.selectAll("line").attr("stroke", "#e5e7eb");
    
    // Add Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .attr("font-size", "12px")
      .attr("font-family", "Roboto, sans-serif")
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
    
    // Create a line generator
    const line = d3.line<any>()
      .x(d => {
        if (isHourlyData) {
          return xScale(String(d[xAxisKey])) as number;
        } 
        return (xScale(String(d[xAxisKey])) || 0) + (xScale.bandwidth ? xScale.bandwidth() / 2 : 0);
      })
      .y(d => yScale(Number(d[dataKey])));
    
    // Add the line with retro styling
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2.5)
      .attr("d", line);
    
    // Add dots with retro styling
    const dots = g.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => {
        if (isHourlyData) {
          return xScale(String(d[xAxisKey])) as number;
        }
        return (xScale(String(d[xAxisKey])) || 0) + (xScale.bandwidth ? xScale.bandwidth() / 2 : 0);
      })
      .attr("cy", d => yScale(Number(d[dataKey])))
      .attr("r", 4.5)
      .attr("fill", color)
      .attr("stroke", "white")
      .attr("stroke-width", 2);
    
    // Add tooltip with retro styling
    const tooltip = createTooltip(color);
    
    // Add event listeners
    dots.on("mouseover", function(event, d) {
      tooltip
        .html(`<strong>${d[xAxisKey]}</strong>: ${d[dataKey]}`)
        .style("visibility", "visible");
      
      d3.select(this)
        .attr("r", 6)
        .attr("stroke-width", 3);
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
        .attr("r", 4)
        .attr("stroke-width", 2);
    });
    
    // Clean up tooltip when component unmounts
    return () => {
      removeTooltip();
    };
  }, [data, dataKey, xAxisKey, width, height, margin, color, svgRef]);
}
