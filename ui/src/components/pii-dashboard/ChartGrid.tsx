
import React from 'react';
import { D3LineChart } from '@/components/d3-charts/D3LineChart';
import { D3PieChart } from '@/components/d3-charts/D3PieChart';
import { D3BarChart } from '@/components/d3-charts/D3BarChart';
import { D3HeatmapChart } from '@/components/d3-charts/D3HeatmapChart';

interface ChartGridProps {
  timeSeriesData: any[];
  piiTypeData: any[];
  sourceData: any[];
  hourlyData: any[];
}

export function ChartGrid({
  timeSeriesData,
  piiTypeData,
  sourceData,
  hourlyData
}: ChartGridProps) {
  // Modern color palette with vibrant but professional tones
  const modernColors = {
    primary: '#6366F1',      // Indigo
    secondary: '#8B5CF6',    // Purple
    accent: '#EC4899',       // Pink
    highlight: '#F97316',    // Orange
    blue: '#0EA5E9',         // Sky Blue
    pieColors: ['#6366F1', '#8B5CF6', '#EC4899', '#F97316', '#0EA5E9', '#10B981', '#F59E0B']
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      <div className="p-0 bg-gradient-to-br from-indigo-50 to-white rounded-lg shadow-md transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
        <D3LineChart
          data={timeSeriesData}
          title="PII Detections Over Time"
          dataKey="detections"
          color={modernColors.primary}
          className="border-0 bg-transparent"
        />
      </div>
      
      <div className="p-0 bg-gradient-to-br from-fuchsia-50 to-white rounded-lg shadow-md transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
        <D3PieChart 
          data={piiTypeData}
          title="PII Types Distribution"
          colors={modernColors.pieColors}
          className="border-0 bg-transparent"
        />
      </div>
      
      <div className="p-0 bg-gradient-to-br from-sky-50 to-white rounded-lg shadow-md transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
        <D3BarChart
          data={sourceData}
          title="Detections by Source"
          valueKey="value"
          color={modernColors.blue}
          className="border-0 bg-transparent"
        />
      </div>
      
      <div className="p-0 bg-gradient-to-br from-amber-50 to-white rounded-lg shadow-md transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
        <div className="dd-chart-container border-0 bg-transparent">
          <h3 className="dd-title mb-4">Recent Detection Rate (24h)</h3>
          <D3HeatmapChart
            data={hourlyData}
            title=""
            margin={{ top: 20, right: 30, bottom: 70, left: 40 }}
          />
        </div>
      </div>
    </div>
  );
}
