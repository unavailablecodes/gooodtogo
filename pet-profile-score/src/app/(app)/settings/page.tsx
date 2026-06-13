'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { User, Shield, Bell, Trash2, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { profile, updateProfile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Avatar src={profile?.avatar_url} name={profile?.full_name} size="xl" />
              <div>
                <p className="font-semibold text-gray-900">{profile?.full_name || 'User'}</p>
                <p className="text-sm text-gray-500">{profile?.email}</p>
                <p className="text-sm text-gray-500 capitalize">Role: {profile?.role || 'user'}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              To update your profile information, please contact support or use the Supabase dashboard.
            </p>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-500" />
              <CardTitle>Privacy & Visibility</CardTitle>
            </div>
            <CardDescription>Control who can see your information</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/privacy">
              <Button variant="outline">Manage Privacy Settings</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-500" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Email notifications for new reviews and updates are coming soon.
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </div>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="danger"
              onClick={handleSignOut}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
            <p className="text-sm text-gray-500">
              Need to delete your account? Contact support for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}