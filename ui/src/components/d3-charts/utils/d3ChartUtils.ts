
import * as d3 from 'd3';

/**
 * Creates and configures a tooltip for D3 charts
 * @param color - The color to use for the tooltip border and shadow
 * @returns The tooltip selection
 */
export function createTooltip(color: string) {
  return d3.select("body")
    .append("div")
    .attr("class", "d3-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "white")
    .style("border", "1px solid " + color)
    .style("border-radius", "4px")
    .style("padding", "8px 12px")
    .style("font-size", "12px")
    .style("font-family", "Roboto, sans-serif")
    .style("color", "#7E69AB")
    .style("box-shadow", `0 2px 10px ${color}33`)
    .style("pointer-events", "none")
    .style("z-index", "100");
}

/**
 * Cleanup function to remove tooltips when components unmount
 */
export function removeTooltip() {
  d3.select("body").selectAll(".d3-tooltip").remove();
}

/**
 * Formats axis ticks for hourly data
 * @param d - The tick value
 * @param isHourlyData - Whether the data is hourly
 * @param dataLength - The length of the dataset
 * @returns Formatted tick string
 */
export function formatAxisTick(d: any, isHourlyData: boolean, dataLength: number): string {
  if (isHourlyData) {
    // Return simple hour format or empty string for every other tick if too many
    return dataLength > 12 && Number(d.toString().split(':')[0]) % 2 !== 0 ? "" : d.toString();
  }
  return d.toString();
}

/**
 * Creates scales for the line chart based on data
 * @param data - The dataset
 * @param innerWidth - The inner width of the chart
 * @param innerHeight - The inner height of the chart
 * @param dataKey - The data key to plot
 * @param xAxisKey - The x-axis key
 * @returns Object containing the scales
 */
export function createLineChartScales(
  data: Array<{ [key: string]: string | number }>,
  innerWidth: number,
  innerHeight: number,
  dataKey: string,
  xAxisKey: string
) {
  const isHourlyData = xAxisKey === "hour";
  
  let xScale;
  
  if (isHourlyData) {
    // For hourly data, use a point scale with better spacing
    xScale = d3.scalePoint()
      .domain(data.map(d => String(d[xAxisKey])))
      .range([0, innerWidth])
      .padding(0.5);
  } else {
    // For other data, use a band scale
    xScale = d3.scaleBand()
      .domain(data.map(d => String(d[xAxisKey])))
      .range([0, innerWidth])
      .padding(0.3);
  }
  
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => Number(d[dataKey])) || 0])
    .nice()
    .range([innerHeight, 0]);
    
  return { xScale, yScale, isHourlyData };
}
