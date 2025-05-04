
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { useD3LineChart } from './hooks/useD3LineChart';

interface D3LineChartProps {
  data: Array<{ [key: string]: string | number }>;
  title: string;
  dataKey: string;
  xAxisKey?: string;
  className?: string;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  color?: string;
}

export function D3LineChart({ 
  data, 
  title, 
  dataKey,
  xAxisKey = "date",
  className, 
  width = 600, 
  height = 300,
  margin = { top: 20, right: 30, bottom: 40, left: 60 },
  color = "#9b87f5" // Default to retro purple
}: D3LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Use the custom hook to handle D3 rendering logic
  useD3LineChart({
    svgRef,
    data,
    dataKey,
    xAxisKey,
    width,
    height,
    margin,
    color
  });

  return (
    <div className={cn("dd-chart-container", className)}>
      <h3 className="dd-title mb-4">{title}</h3>
      <div className="h-[300px] w-full flex items-center justify-center">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}
