
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { AreaChart } from '@/components/dashboard/AreaChart';
import { BarChart } from '@/components/dashboard/BarChart';
import { ArrowUpRight, Users, DollarSign, ShoppingBag, ArrowRight } from 'lucide-react';
import { GdprReportSection } from '@/components/dashboard/GdprReportSection';

const Index = () => {
  // Sample data for charts
  const revenueData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4000 },
    { name: 'May', value: 7000 },
    { name: 'Jun', value: 6000 },
    { name: 'Jul', value: 8000 },
    { name: 'Aug', value: 9000 },
  ];

  const productData = [
    { name: 'Product A', value: 400 },
    { name: 'Product B', value: 300 },
    { name: 'Product C', value: 500 },
    { name: 'Product D', value: 280 },
    { name: 'Product E', value: 590 },
    { name: 'Product F', value: 320 },
  ];

  // Sample jobs data for the GDPR report section
  const sampleJobs = [
    {
      id: "job123",
      status: "success",
      task_group_id: "group1",
      created_at: "2025-05-01T10:30:00Z",
      completed_at: "2025-05-01T10:35:00Z",
      logs: ["Log entry 1", "Log entry 2"],
      results: [
        { id: "result1", type: "email", field: "user@example.com", source: "user_database" },
        { id: "result2", type: "phone", field: "555-123-4567", source: "customer_records" }
      ],
      tags: ["production", "user-data"]
    },
    {
      id: "job456",
      status: "success",
      task_group_id: "group2",
      created_at: "2025-05-02T14:20:00Z",
      completed_at: "2025-05-02T14:25:00Z",
      logs: ["Processing started", "Scan complete"],
      results: [
        { id: "result3", type: "name", field: "John Doe", source: "profiles" },
        { id: "result4", type: "address", field: "123 Main St", source: "shipping_info" }
      ],
      tags: ["staging", "customer-data"]
    }
  ];

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's an overview of your startup operations.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard 
            title="Total Revenue" 
            value="$24,780" 
            change={12} 
            icon={<DollarSign className="h-5 w-5 text-brand-500" />} 
          />
          <MetricCard 
            title="New Customers" 
            value="1,482" 
            change={8.2} 
            icon={<Users className="h-5 w-5 text-brand-500" />} 
          />
          <MetricCard 
            title="Products Sold" 
            value="3,594" 
            change={-3.6} 
            icon={<ShoppingBag className="h-5 w-5 text-brand-500" />} 
          />
          <MetricCard 
            title="Active Users" 
            value="1,064" 
            change={14.8} 
            icon={<ArrowUpRight className="h-5 w-5 text-brand-500" />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <AreaChart 
            title="Monthly Revenue" 
            data={revenueData} 
          />
          <BarChart 
            title="Top Products" 
            data={productData} 
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
            <button className="text-sm text-brand-500 font-medium flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-brand-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">New customer registered</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">ID: 67890{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Add the GDPR Report Section here */}
        <GdprReportSection jobs={sampleJobs} />
      </div>
    </DashboardLayout>
  );
};

export default Index;
