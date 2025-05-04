
import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BarChartProps {
  data: any[];
  title: string;
  dataKey: string;
  className?: string;
}

export function BarChart({ data, title, dataKey, className }: BarChartProps) {
  return (
    <div className={`dd-chart-container ${className}`}>
      <h3 className="dd-title mb-4">{title}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 15 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
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
            <Bar 
              dataKey={dataKey} 
              fill="#1A73E8"
              radius={[4, 4, 0, 0]} 
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
