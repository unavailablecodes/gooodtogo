'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { VISIBILITY_OPTIONS } from '@/lib/constants/categories';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function PrivacySettingsPage() {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [settings, setSettings] = useState({
    is_profile_public: profile?.is_profile_public ?? true,
    show_contact_details: profile?.show_contact_details ?? false,
    allow_detailed_history: profile?.allow_detailed_history ?? false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error: updateError } = await updateProfile(settings);
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Privacy Settings</h1>
        <p className="text-gray-600">Control who can see your profile and pet information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Settings saved successfully!
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Profile Visibility</CardTitle>
            <CardDescription>Choose who can see your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {VISIBILITY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`
                  flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors
                  ${settings.is_profile_public === (option.value === 'public')
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="is_profile_public"
                  value={option.value}
                  checked={settings.is_profile_public === (option.value === 'public')}
                  onChange={() => setSettings(prev => ({ ...prev, is_profile_public: option.value === 'public' }))}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Control how others can reach you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.show_contact_details}
                onChange={(e) => setSettings(prev => ({ ...prev, show_contact_details: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <div>
                <p className="font-medium text-gray-900">Show contact details</p>
                <p className="text-sm text-gray-500">Allow others to see your email and phone number on your pet's profile</p>
              </div>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Behavior History</CardTitle>
            <CardDescription>Control access to detailed behavior history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.allow_detailed_history}
                onChange={(e) => setSettings(prev => ({ ...prev, allow_detailed_history: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <div>
                <p className="font-medium text-gray-900">Allow detailed history</p>
                <p className="text-sm text-gray-500">Let businesses view complete behavior history after permission</p>
              </div>
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={loading} leftIcon={<Save className="w-4 h-4" />}>
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
