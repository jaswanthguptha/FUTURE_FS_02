import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import { Lead, LeadStatus } from '../types';
import {
  Users,
  UserPlus,
  Phone,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  convertedLeads: number;
  conversionRate: number;
  recentLeads: Lead[];
}

interface StatusStat {
  status: LeadStatus;
  count: number;
  color: string;
}

const statusColors: Record<LeadStatus, string> = {
  New: 'bg-blue-500',
  Contacted: 'bg-yellow-500',
  Qualified: 'bg-orange-500',
  'Proposal Sent': 'bg-violet-500',
  Converted: 'bg-green-500',
  Closed: 'bg-gray-500',
};

const statusLabels: Record<LeadStatus, string> = {
  New: 'New',
  Contacted: 'Contacted',
  Qualified: 'Qualified',
  'Proposal Sent': 'Proposal',
  Converted: 'Converted',
  Closed: 'Closed',
};

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted', 'Closed'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statusStats, setStatusStats] = useState<StatusStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (leads) {
        const totalLeads = leads.length;
        const newLeads = leads.filter((l) => l.status === 'New').length;
        const contactedLeads = leads.filter((l) => l.status === 'Contacted').length;
        const convertedLeads = leads.filter((l) => l.status === 'Converted').length;
        const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

        setStats({
          totalLeads,
          newLeads,
          contactedLeads,
          convertedLeads,
          conversionRate,
          recentLeads: leads.slice(0, 5),
        });

        setStatusStats(
          STATUSES.map((status) => ({
            status,
            count: leads.filter((l) => l.status === status).length,
            color: statusColors[status],
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your lead management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalLeads || 0}</p>
            </div>
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-violet-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">All time</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">New Leads</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.newLeads || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Pending follow-up</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Contacted</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.contactedLeads || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">In progress</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Converted</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.convertedLeads || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 font-medium mt-4">Won deals</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.conversionRate || 0}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className={`text-sm font-medium mt-4 ${stats?.conversionRate && stats.conversionRate > 20 ? 'text-green-600' : 'text-orange-600'}`}>
            {stats?.conversionRate && stats.conversionRate > 20 ? 'Good rate' : 'Needs work'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Leads by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Leads by Status</h2>
          <div className="space-y-4">
            {statusStats.map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">{statusLabels[item.status]}</span>
                  <span className="font-medium text-gray-900">{item.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{
                      width: stats ? `${(item.count / stats.totalLeads) * 100}%` : '0%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Leads</h2>
          {stats?.recentLeads && stats.recentLeads.length > 0 ? (
            <div className="space-y-4">
              {stats.recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{lead.full_name}</p>
                    <p className="text-sm text-gray-500 truncate">{lead.email}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        lead.status === 'New'
                          ? 'bg-blue-100 text-blue-700'
                          : lead.status === 'Converted'
                          ? 'bg-green-100 text-green-700'
                          : lead.status === 'Contacted'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {lead.status}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No leads yet</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
