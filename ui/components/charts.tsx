"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Card } from "@/components/ui/card";
import type { Job } from "@/lib/types";
import { format } from "date-fns";

interface ChartsProps {
  jobs: Job[];
}

export function Charts({ jobs }: ChartsProps) {
  const timeSeriesRef = useRef<SVGSVGElement>(null);
  const pieChartRef = useRef<SVGSVGElement>(null);
  const barChartRef = useRef<SVGSVGElement>(null);
  const heatmapRef = useRef<SVGSVGElement>(null);
  const scatterPlotRef = useRef<SVGSVGElement>(null);
  const statusChartRef = useRef<SVGSVGElement>(null);
  const errorChartRef = useRef<SVGSVGElement>(null);

  // Time Series Chart
  useEffect(() => {
    if (!timeSeriesRef.current || !jobs.length) return;

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = timeSeriesRef.current.clientWidth - margin.left - margin.right;
    const height = timeSeriesRef.current.clientHeight - margin.top - margin.bottom;

    d3.select(timeSeriesRef.current).selectAll("*").remove();

    const svg = d3.select(timeSeriesRef.current)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process data for time series
    const timeSeriesData = jobs
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(job => ({
        date: new Date(job.created_at),
        detections: job.results?.length || 0
      }));

    const x = d3.scaleTime()
      .domain(d3.extent(timeSeriesData, d => d.date) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(timeSeriesData, d => d.detections) || 0])
      .nice()
      .range([height, 0]);

    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add the line
    svg.append("path")
      .datum(timeSeriesData)
      .attr("fill", "none")
      .attr("stroke", "hsl(var(--chart-1))")
      .attr("stroke-width", 2)
      .attr("d", d3.line<{ date: Date; detections: number }>()
        .x(d => x(d.date))
        .y(d => y(d.detections))
      );

    // Add dots
    svg.selectAll("circle")
      .data(timeSeriesData)
      .join("circle")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.detections))
      .attr("r", 4)
      .attr("fill", "hsl(var(--chart-1))")
      .attr("stroke", "white")
      .attr("stroke-width", 1);
  }, [jobs]);

  // PII Types Pie Chart
  useEffect(() => {
    if (!pieChartRef.current || !jobs.length) return;

    const width = pieChartRef.current.clientWidth;
    const height = pieChartRef.current.clientHeight;
    const radius = Math.min(width, height) / 2;

    d3.select(pieChartRef.current).selectAll("*").remove();

    const svg = d3.select(pieChartRef.current)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Process data for pie chart
    const piiTypeMap = new Map<string, number>();
    jobs.forEach(job => {
      job.results?.forEach(result => {
        piiTypeMap.set(result.type, (piiTypeMap.get(result.type) || 0) + 1);
      });
    });

    const pieData = Array.from(piiTypeMap.entries()).map(([name, value]) => ({
      name,
      value
    }));

    const pie = d3.pie<{ name: string; value: number }>()
      .value(d => d.value);

    const arc = d3.arc<d3.PieArcDatum<{ name: string; value: number }>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.9);

    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))"
    ];

    // Add the pie slices
    const arcs = svg.selectAll("path")
      .data(pie(pieData))
      .join("path")
      .attr("d", arc)
      .attr("fill", (_, i) => colors[i % colors.length])
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    // Add labels
    const labelArc = d3.arc<d3.PieArcDatum<{ name: string; value: number }>>()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

    svg.selectAll("text")
      .data(pie(pieData))
      .join("text")
      .attr("transform", d => `translate(${labelArc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .text(d => d.data.name)
      .style("font-size", "12px")
      .style("fill", "currentColor");
  }, [jobs]);

  // Error Distribution Pie Chart
  useEffect(() => {
    if (!errorChartRef.current || !jobs.length) return;

    const width = errorChartRef.current.clientWidth;
    const height = errorChartRef.current.clientHeight;
    const radius = Math.min(width, height) / 2;

    d3.select(errorChartRef.current).selectAll("*").remove();

    const svg = d3.select(errorChartRef.current)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Process data for error distribution
    const errorData = jobs
      .filter(job => job.status === "failed" && job.error_message)
      .reduce((acc, job) => {
        const message = job.error_message || "Unknown Error";
        acc.set(message, (acc.get(message) || 0) + 1);
        return acc;
      }, new Map<string, number>());

    const pieData = Array.from(errorData.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count);

    const pie = d3.pie<{ message: string; count: number }>()
      .value(d => d.count);

    const arc = d3.arc<d3.PieArcDatum<{ message: string; count: number }>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.9);

    // Add the pie slices
    svg.selectAll("path")
      .data(pie(pieData))
      .join("path")
      .attr("d", arc)
      .attr("fill", (_, i) => d3.interpolateReds(0.3 + (i * 0.2)))
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    // Add labels
    const labelArc = d3.arc<d3.PieArcDatum<{ message: string; count: number }>>()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

    const labels = svg.selectAll(".label")
      .data(pie(pieData))
      .join("g")
      .attr("class", "label")
      .attr("transform", d => `translate(${labelArc.centroid(d)})`);

    labels.append("text")
      .attr("dy", "-0.5em")
      .attr("text-anchor", "middle")
      .text(d => d.data.message.length > 15 ? d.data.message.substring(0, 15) + "..." : d.data.message)
      .style("font-size", "12px")
      .style("fill", "currentColor");

    labels.append("text")
      .attr("dy", "1em")
      .attr("text-anchor", "middle")
      .text(d => d.data.count)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "currentColor");
  }, [jobs]);

  // Bar Chart
  useEffect(() => {
    if (!barChartRef.current || !jobs.length) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = barChartRef.current.clientWidth - margin.left - margin.right;
    const height = barChartRef.current.clientHeight - margin.top - margin.bottom;

    d3.select(barChartRef.current).selectAll("*").remove();

    const svg = d3.select(barChartRef.current)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process data for bar chart
    const sourceMap = new Map<string, number>();
    jobs.forEach(job => {
      job.tags.forEach(tag => {
        sourceMap.set(tag, (sourceMap.get(tag) || 0) + 1);
      });
    });

    const data = Array.from(sourceMap.entries()).map(([source, count]) => ({
      source,
      count
    }));

    const x = d3.scaleBand()
      .domain(data.map(d => d.source))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) || 0])
      .nice()
      .range([height, 0]);

    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add bars
    svg.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => x(d.source) || 0)
      .attr("y", d => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.count))
      .attr("fill", "hsl(var(--chart-1))")
      .attr("rx", 4);
  }, [jobs]);

  // Status Distribution Chart
  useEffect(() => {
    if (!statusChartRef.current || !jobs.length) return;

    const width = statusChartRef.current.clientWidth;
    const height = statusChartRef.current.clientHeight;
    const radius = Math.min(width, height) / 2;

    d3.select(statusChartRef.current).selectAll("*").remove();

    const svg = d3.select(statusChartRef.current)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Process data for status distribution
    const statusCounts = {
      success: jobs.filter(job => job.status === "success").length,
      processing: jobs.filter(job => job.status === "processing").length,
      failed: jobs.filter(job => job.status === "failed").length
    };

    const data = [
      { status: "Success", count: statusCounts.success, color: "#22c55e" },
      { status: "Processing", count: statusCounts.processing, color: "#3b82f6" },
      { status: "Failed", count: statusCounts.failed, color: "#ef4444" }
    ];

    const pie = d3.pie<{ status: string; count: number; color: string }>()
      .value(d => d.count);

    const arc = d3.arc<d3.PieArcDatum<{ status: string; count: number; color: string }>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.9);

    // Add the pie slices
    svg.selectAll("path")
      .data(pie(data))
      .join("path")
      .attr("d", arc)
      .attr("fill", d => d.data.color)
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    // Add labels
    const labelArc = d3.arc<d3.PieArcDatum<{ status: string; count: number; color: string }>>()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

    const labels = svg.selectAll(".label")
      .data(pie(data))
      .join("g")
      .attr("class", "label")
      .attr("transform", d => `translate(${labelArc.centroid(d)})`);

    labels.append("text")
      .attr("dy", "-0.5em")
      .attr("text-anchor", "middle")
      .text(d => d.data.status)
      .style("font-size", "12px")
      .style("fill", "currentColor");

    labels.append("text")
      .attr("dy", "1em")
      .attr("text-anchor", "middle")
      .text(d => d.data.count)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "currentColor");
  }, [jobs]);

  // Heatmap Chart
  useEffect(() => {
    if (!heatmapRef.current || !jobs.length) return;

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = heatmapRef.current.clientWidth - margin.left - margin.right;
    const height = heatmapRef.current.clientHeight - margin.top - margin.bottom;

    d3.select(heatmapRef.current).selectAll("*").remove();

    const svg = d3.select(heatmapRef.current)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process data for heatmap
    const activityByHourDay = new Map();
    jobs.forEach(job => {
      const date = new Date(job.created_at);
      const hour = date.getHours();
      const day = date.getDay();
      const key = `${day}-${hour}`;
      activityByHourDay.set(key, (activityByHourDay.get(key) || 0) + 1);
    });

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(Array.from(activityByHourDay.values())) || 1])
      .interpolator(d3.interpolateBlues);

    const xScale = d3.scaleBand()
      .domain(hours.map(h => h.toString()))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(days)
      .range([0, height])
      .padding(0.1);

    // Add cells
    svg.selectAll("rect")
      .data(days.flatMap(day => hours.map(hour => ({
        day,
        hour,
        value: activityByHourDay.get(`${days.indexOf(day)}-${hour}`) || 0
      }))))
      .join("rect")
      .attr("x", d => xScale(d.hour.toString()) || 0)
      .attr("y", d => yScale(d.day) || 0)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(d.value))
      .attr("rx", 2);

    // Add axes
    svg.append("g")
      .call(d3.axisBottom(xScale))
      .attr("transform", `translate(0,${height})`);

    svg.append("g")
      .call(d3.axisLeft(yScale));
  }, [jobs]);

  // Scatter Plot
  useEffect(() => {
    if (!scatterPlotRef.current || !jobs.length) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = scatterPlotRef.current.clientWidth - margin.left - margin.right;
    const height = scatterPlotRef.current.clientHeight - margin.top - margin.bottom;

    d3.select(scatterPlotRef.current).selectAll("*").remove();

    const svg = d3.select(scatterPlotRef.current)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const data = jobs.map(job => ({
      processingTime: job.completed_at ? 
        (new Date(job.completed_at).getTime() - new Date(job.created_at).getTime()) / 1000 : 0,
      detections: job.results?.length || 0,
      status: job.status
    })).filter(d => d.processingTime > 0);

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.processingTime) || 0])
      .nice()
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.detections) || 0])
      .nice()
      .range([height, 0]);

    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("fill", "currentColor")
      .text("Processing Time (seconds)");

    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("x", -height / 2)
      .attr("fill", "currentColor")
      .text("PII Detections");

    // Add dots
    svg.append("g")
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => x(d.processingTime))
      .attr("cy", d => y(d.detections))
      .attr("r", 5)
      .attr("fill", d => d.status === "success" ? "hsl(var(--chart-1))" : "hsl(var(--destructive))")
      .attr("opacity", 0.6);
  }, [jobs]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Tooltip.Provider>
        <Card className="p-6">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <h3 className="text-lg font-semibold mb-4 cursor-help">PII Detections Over Time</h3>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-popover px-3 py-1.5 text-sm text-popover-foreground rounded-md" sideOffset={5}>
                Number of PII detections found in each time period
                <Tooltip.Arrow className="fill-popover" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          <div className="h-[300px] w-full">
            <svg ref={timeSeriesRef} className="w-full h-full" />
          </div>
        </Card>

        <Card className="p-6">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <h3 className="text-lg font-semibold mb-4 cursor-help">PII Types Distribution</h3>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-popover px-3 py-1.5 text-sm text-popover-foreground rounded-md" sideOffset={5}>
                Distribution of different types of PII detected
                <Tooltip.Arrow className="fill-popover" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          <div className="h-[300px] w-full">
            <svg ref={pieChartRef} className="w-full h-full" />
          </div>
        </Card>

        <Card className="p-6">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <h3 className="text-lg font-semibold mb-4 cursor-help">Error Distribution</h3>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-popover px-3 py-1.5 text-sm text-popover-foreground rounded-md" sideOffset={5}>
                Distribution of error messages in failed jobs
                <Tooltip.Arrow className="fill-popover" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          <div className="h-[300px] w-full">
            <svg ref={errorChartRef} className="w-full h-full" />
          </div>
        </Card>

        <Card className="p-6">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <h3 className="text-lg font-semibold mb-4 cursor-help">Job Status Distribution</h3>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-popover px-3 py-1.5 text-sm text-popover-foreground rounded-md" sideOffset={5}>
                Distribution of jobs by their current status
                <Tooltip.Arrow className="fill-popover" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          <div className="h-[300px] w-full">
            <svg ref={statusChartRef} className="w-full h-full" />
          </div>
        </Card>

        <Card className="p-6">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <h3 className="text-lg font-semibold mb-4 cursor-help">Job Activity Heatmap</h3>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-popover px-3 py-1.5 text-sm text-popover-foreground rounded-md" sideOffset={5}>
                Distribution of job activity by hour and day of week
                <Tooltip.Arrow className="fill-popover" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          <div className="h-[300px] w-full">
            <svg ref={heatmapRef} className="w-full h-full" />
          </div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <h3 className="text-lg font-semibold mb-4 cursor-help">Processing Time vs Detections</h3>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-popover px-3 py-1.5 text-sm text-popover-foreground rounded-md" sideOffset={5}>
                Correlation between processing time and number of PII detections
                <Tooltip.Arrow className="fill-popover" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          <div className="h-[300px] w-full">
            <svg ref={scatterPlotRef} className="w-full h-full" />
          </div>
        </Card>
      </Tooltip.Provider>
    </div>
  );
}