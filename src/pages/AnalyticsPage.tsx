import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import { Lead, LeadStatus, LeadSource } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const COLORS = [
  '#8B5CF6',
  '#EC4899',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#6366F1',
];

const statusColors: Record<LeadStatus, string> = {
  New: '#3B82F6',
  Contacted: '#F59E0B',
  Qualified: '#F97316',
  'Proposal Sent': '#8B5CF6',
  Converted: '#10B981',
  Closed: '#6B7280',
};

const sourceLabels: Record<LeadSource, string> = {
  Website: 'Website',
  Referral: 'Referral',
  LinkedIn: 'LinkedIn',
  Facebook: 'Facebook',
  Instagram: 'Instagram',
  Other: 'Other',
};

interface MonthlyData {
  month: string;
  leads: number;
  converted: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sourceData, setSourceData] = useState<{ name: string; value: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [conversionRate, setConversionRate] = useState(0);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setLeads(data);
        processAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (leadsData: Lead[]) => {
    // Leads by Source
    const sourceCounts: Record<string, number> = {};
    leadsData.forEach((lead) => {
      sourceCounts[lead.lead_source] = (sourceCounts[lead.lead_source] || 0) + 1;
    });
    const formattedSourceData = Object.entries(sourceCounts).map(([name, value]) => ({
      name: sourceLabels[name as LeadSource] || name,
      value,
    }));
    setSourceData(formattedSourceData);

    // Leads by Status
    const statusCounts: Record<string, number> = {};
    leadsData.forEach((lead) => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    });
    const formattedStatusData = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));
    setStatusData(formattedStatusData);

    // Monthly Lead Growth
    const monthlyCounts: Record<string, { leads: number; converted: number }> = {};
    leadsData.forEach((lead) => {
      const date = new Date(lead.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyCounts[monthKey]) {
        monthlyCounts[monthKey] = { leads: 0, converted: 0 };
      }
      monthlyCounts[monthKey].leads++;
      if (lead.status === 'Converted') {
        monthlyCounts[monthKey].converted++;
      }
    });

    const formattedMonthlyData: MonthlyData[] = Object.entries(monthlyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, counts]) => ({
        month: new Date(`${month}-01`).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        leads: counts.leads,
        converted: counts.converted,
      }));
    setMonthlyData(formattedMonthlyData);

    // Conversion Rate
    const totalLeads = leadsData.length;
    const convertedLeads = leadsData.filter((l) => l.status === 'Converted').length;
    setConversionRate(totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Insights and metrics for your leads</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Total Leads</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{leads.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Conversion Rate</p>
          <p className="text-4xl font-bold text-green-600 mt-2">{conversionRate}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500 text-sm">Active Leads</p>
          <p className="text-4xl font-bold text-violet-600 mt-2">
            {leads.filter((l) => !['Converted', 'Closed'].includes(l.status)).length}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Leads by Source */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Leads by Source</h2>
          {sourceData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {sourceData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">No data available</p>
          )}
        </div>

        {/* Leads by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Leads by Status</h2>
          {statusData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={statusColors[entry.name as LeadStatus] || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">No data available</p>
          )}
        </div>
      </div>

      {/* Monthly Lead Growth */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Monthly Lead Growth</h2>
        {monthlyData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  name="Total Leads"
                  dot={{ fill: '#8B5CF6' }}
                />
                <Line
                  type="monotone"
                  dataKey="converted"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Converted"
                  dot={{ fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-12">No data available</p>
        )}
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h2>
        <div className="space-y-4">
          {statusData.map((item, index) => {
            const percentage = leads.length > 0 ? (item.value / leads.length) * 100 : 0;
            const color = statusColors[item.name as LeadStatus] || COLORS[index % COLORS.length];
            return (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">{item.name}</span>
                  <span className="text-gray-500">
                    {item.value} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
