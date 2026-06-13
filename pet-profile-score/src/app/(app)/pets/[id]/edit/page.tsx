'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { SPECIES_OPTIONS, SIZE_OPTIONS, GENDER_OPTIONS, VACCINATION_OPTIONS, VISIBILITY_OPTIONS } from '@/lib/constants/categories';
import { ArrowLeft, AlertCircle, Save } from 'lucide-react';
import type { Pet } from '@/types/database';

export default function EditPetPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const petId = params.id as string;
  const supabase = createClient();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age_months: '',
    gender: '',
    size: '',
    vaccination_status: 'unknown',
    vaccination_notes: '',
    bio: '',
    special_needs: '',
    profile_visibility: 'public',
  });

  useEffect(() => {
    const fetchPet = async () => {
      setLoading(true);

      const { data } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();

      if (data) {
        if (data.owner_id !== user?.id) {
          router.push('/pets');
          return;
        }

        setPet(data);
        setFormData({
          name: data.name || '',
          species: data.species || '',
          breed: data.breed || '',
          age_months: data.age_months?.toString() || '',
          gender: data.gender || '',
          size: data.size || '',
          vaccination_status: data.vaccination_status || 'unknown',
          vaccination_notes: data.vaccination_notes || '',
          bio: data.bio || '',
          special_needs: data.special_needs || '',
          profile_visibility: data.profile_visibility || 'public',
        });
      }

      setLoading(false);
    };

    if (petId && user) {
      fetchPet();
    }
  }, [petId, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet) return;

    setSaving(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('pets')
        .update({
          name: formData.name.trim(),
          species: formData.species,
          breed: formData.breed.trim() || null,
          age_months: formData.age_months ? parseInt(formData.age_months) : null,
          gender: formData.gender || null,
          size: formData.size || null,
          vaccination_status: formData.vaccination_status,
          vaccination_notes: formData.vaccination_notes.trim() || null,
          bio: formData.bio.trim() || null,
          special_needs: formData.special_needs.trim() || null,
          profile_visibility: formData.profile_visibility,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pet.id);

      if (updateError) throw updateError;

      router.push(`/pets/${pet.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update pet');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pet Not Found</h2>
        <p className="text-gray-600">This pet profile doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit {pet.name}</h1>
        <p className="text-gray-600">Update your pet's profile information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update your pet's basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              name="name"
              label="Pet Name"
              placeholder="e.g., Buddy"
              value={formData.name}
              onChange={handleInputChange}
              required
            />

            <Select
              name="species"
              label="Species"
              options={SPECIES_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
              value={formData.species}
              onChange={handleInputChange}
              required
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                name="breed"
                label="Breed"
                placeholder="e.g., Golden Retriever"
                value={formData.breed}
                onChange={handleInputChange}
              />

              <Input
                name="age_months"
                label="Age (months)"
                type="number"
                min="0"
                max="360"
                placeholder="e.g., 24"
                value={formData.age_months}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                name="gender"
                label="Gender"
                options={GENDER_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                value={formData.gender}
                onChange={handleInputChange}
                placeholder="Select gender"
              />

              <Select
                name="size"
                label="Size"
                options={SIZE_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                value={formData.size}
                onChange={handleInputChange}
                placeholder="Select size"
              />
            </div>
          </CardContent>
        </Card>

        {/* Medical Info */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
            <CardDescription>Vaccination and health details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              name="vaccination_status"
              label="Vaccination Status"
              options={VACCINATION_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
              value={formData.vaccination_status}
              onChange={handleInputChange}
            />

            <Textarea
              name="vaccination_notes"
              label="Vaccination Notes"
              placeholder="List vaccinations and dates..."
              value={formData.vaccination_notes}
              onChange={handleInputChange}
              rows={3}
            />

            <Textarea
              name="special_needs"
              label="Special Needs (Optional)"
              placeholder="Any allergies, medications, or special requirements..."
              value={formData.special_needs}
              onChange={handleInputChange}
              rows={2}
            />
          </CardContent>
        </Card>

        {/* Bio & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>About & Privacy</CardTitle>
            <CardDescription>Tell us more and control who can see your pet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              name="bio"
              label="Bio (Optional)"
              placeholder="Tell us about your pet's personality, favorite activities, etc..."
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
            />

            <Select
              name="profile_visibility"
              label="Profile Visibility"
              options={VISIBILITY_OPTIONS.map(o => ({ value: o.value, label: `${o.label} - ${o.description}` }))}
              value={formData.profile_visibility}
              onChange={handleInputChange}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
