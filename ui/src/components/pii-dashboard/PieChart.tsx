
import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PieChartProps {
  data: any[];
  title: string;
  colors?: string[];
  className?: string;
}

export function PieChart({ data, title, colors = ['#632CA6', '#9575FF', '#1A73E8', '#47A6F6', '#2AA876', '#FF9F1C', '#E74C3C'], className }: PieChartProps) {
  return (
    <div className={`dd-chart-container ${className}`}>
      <h3 className="dd-title mb-4">{title}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value}`, 'Detections']}
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
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ 
                fontSize: '12px', 
                paddingTop: '15px',
                fontFamily: 'Roboto, sans-serif'
              }}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
