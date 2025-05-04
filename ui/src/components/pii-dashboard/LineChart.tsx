
import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface LineChartProps {
  data: any[];
  title: string;
  dataKey: string;
  xAxisKey?: string;
  className?: string;
}

export function LineChart({ data, title, dataKey, xAxisKey = "date", className }: LineChartProps) {
  return (
    <div className={`dd-chart-container ${className}`}>
      <h3 className="dd-title mb-4">{title}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 15 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12, fill: '#6E6E6E', fontFamily: 'Roboto, sans-serif' }}
              tickMargin={10}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6E6E6E', fontFamily: 'Roboto, sans-serif' }} 
              tickMargin={10}
              axisLine={false}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '4px', 
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)', 
                border: '1px solid #e5e7eb',
                fontSize: '12px',
                padding: '8px 12px',
                color: '#4F4F4F',
                fontFamily: 'Roboto, sans-serif'
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#632CA6"
              activeDot={{ r: 6, fill: '#632CA6', stroke: '#fff', strokeWidth: 2 }}
              dot={{ r: 3, fill: '#632CA6', stroke: '#fff', strokeWidth: 2 }}
              strokeWidth={2}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
