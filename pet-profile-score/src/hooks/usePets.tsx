'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generatePublicId } from '@/lib/utils/qr';
import type { Pet, PetPhoto, CreatePetForm } from '@/types/database';

interface UsePetsReturn {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  fetchPets: () => Promise<void>;
  fetchPet: (id: string) => Promise<Pet | null>;
  fetchPetByPublicId: (publicId: string) => Promise<Pet | null>;
  createPet: (data: CreatePetForm) => Promise<{ pet?: Pet; error?: string }>;
  updatePet: (id: string, data: Partial<Pet>) => Promise<{ pet?: Pet; error?: string }>;
  deletePet: (id: string) => Promise<{ error?: string }>;
  uploadPhoto: (petId: string, file: File) => Promise<{ photo?: PetPhoto; error?: string }>;
  deletePhoto: (photoId: string) => Promise<{ error?: string }>;
  setPrimaryPhoto: (petId: string, photoId: string) => Promise<{ error?: string }>;
}

export function usePets(): UsePetsReturn {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchPets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('pets')
        .select(`
          *,
          owner:profiles!pets_owner_id_fkey(id, full_name, avatar_url),
          pet_photos(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPets(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pets');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPet = useCallback(async (id: string): Promise<Pet | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('pets')
        .select(`
          *,
          owner:profiles!pets_owner_id_fkey(id, full_name, avatar_url, phone, show_contact_details),
          pet_photos(*)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pet');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPetByPublicId = useCallback(async (publicId: string): Promise<Pet | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('pets')
        .select(`
          *,
          owner:profiles!pets_owner_id_fkey(id, full_name, avatar_url, phone, show_contact_details),
          pet_photos(*)
        `)
        .eq('public_id', publicId)
        .eq('is_active', true)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pet');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPet = useCallback(async (data: CreatePetForm): Promise<{ pet?: Pet; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Not authenticated' };

      const publicId = generatePublicId();

      const { data: pet, error: createError } = await supabase
        .from('pets')
        .insert({
          owner_id: user.id,
          name: data.name,
          species: data.species,
          breed: data.breed || null,
          age_months: data.age_months || null,
          gender: data.gender || null,
          size: data.size || null,
          vaccination_status: data.vaccination_status || 'unknown',
          vaccination_notes: data.vaccination_notes || null,
          bio: data.bio || null,
          special_needs: data.special_needs || null,
          public_id: publicId,
          profile_visibility: data.profile_visibility || 'public',
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add to local state
      setPets(prev => [pet, ...prev]);

      return { pet };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create pet';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePet = useCallback(async (id: string, data: Partial<Pet>): Promise<{ pet?: Pet; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const { data: pet, error: updateError } = await supabase
        .from('pets')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      setPets(prev => prev.map(p => p.id === id ? { ...p, ...pet } : p));

      return { pet };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update pet';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePet = useCallback(async (id: string): Promise<{ error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('pets')
        .update({ is_active: false })
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Remove from local state
      setPets(prev => prev.filter(p => p.id !== id));

      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete pet';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadPhoto = useCallback(async (petId: string, file: File): Promise<{ photo?: PetPhoto; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Not authenticated' };

      // Check existing photos count
      const { count } = await supabase
        .from('pet_photos')
        .select('*', { count: 'exact' })
        .eq('pet_id', petId);

      if ((count || 0) >= 5) {
        return { error: 'Maximum 5 photos allowed per pet' };
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${petId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(fileName);

      // Create photo record
      const isPrimary = (count || 0) === 0;
      const { data: photo, error: createError } = await supabase
        .from('pet_photos')
        .insert({
          pet_id: petId,
          storage_path: fileName,
          url: publicUrl,
          is_primary: isPrimary,
          order_index: count || 0,
        })
        .select()
        .single();

      if (createError) throw createError;

      return { photo };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload photo';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePhoto = useCallback(async (photoId: string): Promise<{ error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      // Get photo record first
      const { data: photo } = await supabase
        .from('pet_photos')
        .select('storage_path')
        .eq('id', photoId)
        .single();

      if (photo) {
        // Delete from storage
        await supabase.storage
          .from('pet-photos')
          .remove([photo.storage_path]);
      }

      // Delete record
      const { error: deleteError } = await supabase
        .from('pet_photos')
        .delete()
        .eq('id', photoId);

      if (deleteError) throw deleteError;

      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete photo';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const setPrimaryPhoto = useCallback(async (petId: string, photoId: string): Promise<{ error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      // Reset all photos to non-primary
      await supabase
        .from('pet_photos')
        .update({ is_primary: false })
        .eq('pet_id', petId);

      // Set new primary
      const { error: updateError } = await supabase
        .from('pet_photos')
        .update({ is_primary: true })
        .eq('id', photoId);

      if (updateError) throw updateError;

      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set primary photo';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pets,
    loading,
    error,
    fetchPets,
    fetchPet,
    fetchPetByPublicId,
    createPet,
    updatePet,
    deletePet,
    uploadPhoto,
    deletePhoto,
    setPrimaryPhoto,
  };
}
