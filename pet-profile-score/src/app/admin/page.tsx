'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Check, X, Trash2, User, Dog, Star, Shield, AlertTriangle, Users, LogOut, LogIn } from 'lucide-react';

interface DeleteRequest {
  id: string;
  name: string;
  breed: string | null;
  species: string;
  owner_id: string;
  owner_name: string | null;
  owner_email: string;
  delete_requested_at: string;
  pet_photos: Array<{ url: string }>;
  total_reviews: number;
  overall_score: number;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  pet_count: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, profile, isAdmin } = useAuth();
  const [deleteRequests, setDeleteRequests] = useState<DeleteRequest[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState({ totalPets: 0, totalUsers: 0, totalReviews: 0, pendingDeletes: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'deletes' | 'users'>('overview');
  const supabase = createClient();

  useEffect(() => {
    if (!isAdmin) { router.push('/admin/login'); return; }
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    const { data: deleteData } = await supabase
      .from('pets')
      .select(`id, name, breed, species, owner_id, delete_requested_at, pet_photos(*), total_reviews, overall_score, owner:profiles!pets_owner_id_fkey(full_name, email)`)
      .eq('delete_requested', true)
      .order('delete_requested_at', { ascending: true });

    const { data: usersData } = await supabase
      .from('profiles').select('*, pets:pets(count)').order('created_at', { ascending: false }).limit(20);

    const [{ count: petCount }, { count: userCount }, { count: reviewCount }] = await Promise.all([
      supabase.from('pets').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
    ]);

    setDeleteRequests((deleteData || []).map((d: any) => ({
      id: d.id, name: d.name, breed: d.breed, species: d.species, owner_id: d.owner_id,
      owner_name: d.owner?.full_name, owner_email: d.owner?.email || 'Unknown',
      delete_requested_at: d.delete_requested_at, pet_photos: d.pet_photos || [],
      total_reviews: d.total_reviews, overall_score: d.overall_score,
    })));

    setUsers((usersData || []).map((u: any) => ({
      id: u.id, email: u.email, full_name: u.full_name, role: u.role,
      created_at: u.created_at, pet_count: u.pets?.[0]?.count || 0,
    })));

    setStats({ totalPets: petCount || 0, totalUsers: userCount || 0, totalReviews: reviewCount || 0, pendingDeletes: (deleteData || []).length });
    setLoading(false);
  };

  const handleApproveDelete = async (petId: string) => {
    await supabase.from('pets').update({ is_active: false, delete_approved: true }).eq('id', petId);
    setDeleteRequests(prev => prev.filter(r => r.id !== petId));
    setStats(prev => ({ ...prev, pendingDeletes: prev.pendingDeletes - 1, totalPets: prev.totalPets - 1 }));
  };

  const handleRejectDelete = async (petId: string) => {
    await supabase.from('pets').update({ delete_requested: false, delete_requested_at: null }).eq('id', petId);
    setDeleteRequests(prev => prev.filter(r => r.id !== petId));
    setStats(prev => ({ ...prev, pendingDeletes: prev.pendingDeletes - 1 }));
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Minimal Header */}
      <header className="bg-white border-b border-black/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1d1d1f] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold text-[#1d1d1f]">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-[#86868b]">{user?.email}</span>
            <button onClick={handleSignOut} className="text-[13px] text-[#86868b] hover:text-[#1d1d1f]">Sign Out</button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-[#1d1d1f] text-white' : 'bg-white border border-black/5 text-[#1d1d1f]'}`}>
            <Dog className="w-4 h-4" />
            <span className="text-[13px] font-medium">{stats.totalPets} Pets</span>
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-[#1d1d1f] text-white' : 'bg-white border border-black/5 text-[#1d1d1f]'}`}>
            <Users className="w-4 h-4" />
            <span className="text-[13px] font-medium">{stats.totalUsers} Users</span>
          </button>
          <button onClick={() => setActiveTab('deletes')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'deletes' ? 'bg-[#ff3b30] text-white' : 'bg-white border border-black/5 text-[#1d1d1f]'}`}>
            <Trash2 className="w-4 h-4" />
            <span className="text-[13px] font-medium">{stats.pendingDeletes} Pending</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-2xl animate-pulse">🐾</span>
          </div>
        ) : (
          <>
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Pets', value: stats.totalPets, icon: Dog },
                  { label: 'Users', value: stats.totalUsers, icon: Users },
                  { label: 'Reviews', value: stats.totalReviews, icon: Star },
                  { label: 'Pending', value: stats.pendingDeletes, icon: AlertTriangle, highlight: stats.pendingDeletes > 0 },
                ].map((stat) => (
                  <div key={stat.label} className={`p-4 rounded-xl ${stat.highlight ? 'bg-[#ff3b30]/5 border border-[#ff3b30]/20' : 'bg-white border border-black/5'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className={`w-4 h-4 ${stat.highlight ? 'text-[#ff3b30]' : 'text-[#86868b]'}`} />
                      <span className="text-[12px] text-[#86868b]">{stat.label}</span>
                    </div>
                    <span className={`text-2xl font-semibold ${stat.highlight ? 'text-[#ff3b30]' : 'text-[#1d1d1f]'}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Delete Requests */}
            {activeTab === 'deletes' && (
              <div className="space-y-2">
                {deleteRequests.length === 0 ? (
                  <div className="flex items-center gap-3 p-6 bg-white rounded-xl border border-black/5">
                    <Check className="w-5 h-5 text-[#34c759]" />
                    <span className="text-[14px] text-[#86868b]">No pending requests</span>
                  </div>
                ) : deleteRequests.map((req) => {
                  const photo = req.pet_photos.find(p => p.url);
                  return (
                    <div key={req.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-black/5">
                      <div className="w-10 h-10 rounded-lg bg-[#f5f5f5] flex items-center justify-center overflow-hidden">
                        {photo ? <img src={photo.url} className="w-full h-full object-cover" /> : <Dog className="w-5 h-5 text-[#86868b]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-medium text-[#1d1d1f]">{req.name}</span>
                          <span className="text-[12px] text-[#86868b]">{req.breed || req.species}</span>
                        </div>
                        <span className="text-[12px] text-[#86868b]">{req.owner_name || req.owner_email}</span>
                      </div>
                      <span className="text-[13px] text-[#86868b]">{req.total_reviews} reviews</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleRejectDelete(req.id)} className="px-3 py-1.5 text-[12px] font-medium text-[#86868b] hover:text-[#1d1d1f] border border-black/10 rounded-lg">Reject</button>
                        <button onClick={() => handleApproveDelete(req.id)} className="px-3 py-1.5 text-[12px] font-medium bg-[#ff3b30] text-white rounded-lg hover:bg-[#e8352c]">Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/5">
                      <th className="text-left px-4 py-3 text-[11px] font-medium text-[#86868b] uppercase">User</th>
                      <th className="text-left px-4 py-3 text-[11px] font-medium text-[#86868b] uppercase">Role</th>
                      <th className="text-left px-4 py-3 text-[11px] font-medium text-[#86868b] uppercase">Pets</th>
                      <th className="text-left px-4 py-3 text-[11px] font-medium text-[#86868b] uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-black/5 last:border-0 hover:bg-[#fafafa]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#f5f5f5] flex items-center justify-center">
                              <User className="w-3 h-3 text-[#86868b]" />
                            </div>
                            <div>
                              <span className="text-[13px] font-medium text-[#1d1d1f]">{u.full_name || '—'}</span>
                              <span className="text-[11px] text-[#86868b] block">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-[11px] font-medium rounded-md ${u.role === 'admin' ? 'bg-[#1d1d1f] text-white' : u.role === 'business' ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'bg-[#f5f5f5] text-[#1d1d1f]'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#1d1d1f]">{u.pet_count}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {u.role !== 'admin' && (
                              <button onClick={() => handleUpdateRole(u.id, 'admin')} className="px-2 py-1 text-[11px] font-medium text-[#86868b] hover:text-[#1d1d1f] border border-black/10 rounded-md">
                                <Shield className="w-3 h-3" />
                              </button>
                            )}
                            {u.role === 'admin' && (
                              <button onClick={() => handleUpdateRole(u.id, 'user')} className="px-2 py-1 text-[11px] font-medium text-[#86868b] hover:text-[#1d1d1f] border border-black/10 rounded-md">
                                Remove
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
