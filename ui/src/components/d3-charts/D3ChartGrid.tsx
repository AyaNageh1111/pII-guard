
import React from 'react';
import { D3LineChart } from './D3LineChart';
import { D3PieChart } from './D3PieChart';
import { D3BarChart } from './D3BarChart';
import { D3HeatmapChart } from './D3HeatmapChart';

interface D3ChartGridProps {
  timeSeriesData: any[];
  piiTypeData: any[];
  sourceData: any[];
  hourlyData: any[];
}

export function D3ChartGrid({
  timeSeriesData,
  piiTypeData,
  sourceData,
  hourlyData
}: D3ChartGridProps) {
  // Retro color palette
  const retroColors = {
    primary: '#9b87f5',      // Primary Purple
    secondary: '#7E69AB',    // Secondary Purple
    accent: '#D946EF',       // Magenta Pink
    highlight: '#F97316',    // Bright Orange
    blue: '#33C3F0',         // Sky Blue
    pieColors: ['#9b87f5', '#D946EF', '#F97316', '#33C3F0', '#8B5CF6', '#7E69AB', '#6E59A5']
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 font-roboto">
      <D3LineChart
        data={timeSeriesData}
        title="PII Detections Over Time"
        dataKey="detections"
        color={retroColors.primary}
      />
      <D3PieChart 
        data={piiTypeData}
        title="PII Types Distribution"
        colors={retroColors.pieColors}
      />
      <D3BarChart
        data={sourceData}
        title="Detections by Source"
        valueKey="value"
        color={retroColors.blue}
      />
      <div className="bg-white shadow rounded-lg p-5 font-roboto">
        <D3HeatmapChart
          data={hourlyData}
          title="Recent Detection Rate (24h)"
          margin={{ top: 20, right: 30, bottom: 70, left: 40 }}
        />
      </div>
    </div>
  );
}
