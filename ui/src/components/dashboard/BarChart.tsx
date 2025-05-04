
import React from 'react';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BarChartProps {
  title: string;
  data: any[];
  className?: string;
}

export function BarChart({ title, data, className }: BarChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={data}>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontFamily: 'Inter, sans-serif' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontFamily: 'Inter, sans-serif' }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '4px', 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)', 
                  border: '1px solid #e5e7eb',
                  fontSize: '12px',
                  padding: '8px 12px',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
              <Bar dataKey="value" fill="#4361ee" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
