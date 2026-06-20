'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Lead {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  ip_address: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  screen_resolution: string | null;
  referrer: string | null;
  created_at: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setLeads(data);
    setLoading(false);
  };

  const filteredLeads = leads.filter(lead =>
    lead.email?.includes(search) ||
    lead.name?.includes(search) ||
    lead.phone?.includes(search)
  );

  const stats = {
    total: leads.length,
    today: leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length,
    mobile: leads.filter(l => l.device === 'Phone' || l.device === 'Mobile').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leads Dashboard</h1>
        <p className="text-gray-600 mb-8">View all landing page submissions</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Leads</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Today</p>
            <p className="text-3xl font-bold text-blue-600">{stats.today}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Mobile</p>
            <p className="text-3xl font-bold text-purple-600">{stats.mobile}</p>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search email, name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No leads found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Device</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <a href={'mailto:' + lead.email} className="text-blue-600 hover:underline">{lead.email}</a>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{lead.name || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.phone || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={'px-2 py-1 rounded-full text-xs font-medium ' + (lead.device === 'Phone' || lead.device === 'Mobile' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700')}>
                        {lead.device || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(lead.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
