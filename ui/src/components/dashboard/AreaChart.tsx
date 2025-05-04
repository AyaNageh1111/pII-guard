
import React from 'react';
import { Area, AreaChart as RechartsAreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AreaChartProps {
  title: string;
  data: any[];
  className?: string;
}

export function AreaChart({ title, data, className }: AreaChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4361ee" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4361ee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontFamily: 'Inter, sans-serif' }}
              />
              <YAxis 
                hide={false}
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
              <Area
                type="monotone"
                dataKey="value"
                stroke="#4361ee"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </RechartsAreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
