'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { generatePublicId } from '@/lib/utils/qr';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { SPECIES_OPTIONS, SIZE_OPTIONS, GENDER_OPTIONS, VACCINATION_OPTIONS, VISIBILITY_OPTIONS, DOG_BREEDS, CAT_BREEDS, CERTIFICATE_TYPES } from '@/lib/constants/categories';

export default function NewPetPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    breedCustom: '',
    age_years: '',
    age_months: '',
    gender: '',
    size: '',
    vaccination_status: 'unknown',
    vaccination_notes: '',
    bio: '',
    special_needs: '',
    profile_visibility: 'public',
    has_certificate: false,
    certificate_type: '',
    certificate_number: '',
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const breeds = useMemo(() => {
    if (formData.species === 'dog') return DOG_BREEDS;
    if (formData.species === 'cat') return CAT_BREEDS;
    return [];
  }, [formData.species]);

  const filteredBreeds = useMemo(() => {
    if (!formData.breedCustom) return breeds;
    const search = formData.breedCustom.toLowerCase();
    return breeds.filter(b => b.label.toLowerCase().includes(search));
  }, [breeds, formData.breedCustom]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      setError('Maximum 5 photos allowed');
      return;
    }
    setPhotos(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
    setError('');
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertificateFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.name.trim() || !formData.species) {
      setError('Please fill in required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const publicId = generatePublicId();
      const ageMonths = formData.age_years ? (parseInt(formData.age_years) * 12 + parseInt(formData.age_months || '0')) : parseInt(formData.age_months || '0');

      const { data: pet, error: petError } = await supabase
        .from('pets')
        .insert({
          owner_id: user.id,
          name: formData.name.trim(),
          species: formData.species,
          breed: formData.breed === 'not_in_list' ? formData.breedCustom.trim() : (formData.breed || formData.breedCustom || null),
          age_months: ageMonths || null,
          gender: formData.gender || null,
          size: formData.size || null,
          vaccination_status: formData.vaccination_status,
          vaccination_notes: formData.vaccination_notes.trim() || null,
          bio: formData.bio.trim() || null,
          special_needs: formData.special_needs.trim() || null,
          public_id: publicId,
          profile_visibility: formData.profile_visibility,
          has_kci_certificate: formData.has_certificate,
        })
        .select()
        .single();

      if (petError) throw petError;

      // Upload photos
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${pet.id}/${Date.now()}-${i}.${fileExt}`;

        await supabase.storage.from('pet-photos').upload(fileName, file);
        const { data: { publicUrl } } = supabase.storage.from('pet-photos').getPublicUrl(fileName);

        await supabase.from('pet_photos').insert({
          pet_id: pet.id,
          storage_path: fileName,
          url: publicUrl,
          is_primary: i === 0,
          order_index: i,
        });
      }

      // Upload certificate if provided
      if (certificateFile && formData.has_certificate) {
        const fileExt = certificateFile.name.split('.').pop();
        const fileName = `${pet.id}/certificate.${fileExt}`;

        await supabase.storage.from('pet-photos').upload(fileName, certificateFile);
        const { data: { publicUrl } } = supabase.storage.from('pet-photos').getPublicUrl(fileName);

        await supabase.from('pet_certificates').insert({
          pet_id: pet.id,
          certificate_type: formData.certificate_type,
          certificate_number: formData.certificate_number || null,
          certificate_url: publicUrl,
        });
      }

      router.push(`/pets/${pet.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pt-8 pb-20 px-6">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <button onClick={() => router.back()} className="flex items-center text-[#86868b] hover:text-[#1d1d1f] mb-6 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-[14px]">Back</span>
        </button>

        <h1 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">New Profile</h1>
        <p className="text-[#86868b] mt-2">Create a profile for your furry friend</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mt-8 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 h-1 rounded-full bg-black/5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${step >= s ? 'bg-[#1d1d1f]' : 'bg-transparent'}`}
                style={{ width: step >= s ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-[#ff3b30]/10 text-[#ff3b30] text-[14px] rounded-2xl">{error}</div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <Card padding="lg">
                <label className="block">
                  <span className="text-[13px] font-medium text-[#1d1d1f]/70">Name *</span>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="What's their name?"
                    className="mt-1 w-full px-4 py-3.5 text-[15px] bg-[#fafafa] border-2 border-black/5 rounded-2xl focus:outline-none focus:border-[#1d1d1f] transition-colors placeholder:text-[#86868b]"
                    required
                  />
                </label>

                <div className="mt-5">
                  <span className="text-[13px] font-medium text-[#1d1d1f]/70">Species *</span>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {SPECIES_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, species: opt.value, breed: '' }))}
                        className={`p-4 rounded-2xl border-2 text-center transition-all ${formData.species === opt.value ? 'border-[#1d1d1f] bg-[#1d1d1f] text-white' : 'border-black/5 bg-white text-[#1d1d1f]'}`}
                      >
                        <span className="text-2xl block">{opt.value === 'dog' ? '🐕' : opt.value === 'cat' ? '🐱' : opt.value === 'bird' ? '🐦' : opt.value === 'rabbit' ? '🐰' : '🐾'}</span>
                        <span className="text-[12px] font-medium mt-1 block">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              <Button type="button" size="lg" className="w-full" onClick={() => formData.name && formData.species && setStep(2)}>
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <Card padding="lg">
                {/* Breed with Autocomplete */}
                <div className="mb-5">
                  <span className="text-[13px] font-medium text-[#1d1d1f]/70">Breed</span>
                  {breeds.length > 0 ? (
                    <div className="mt-2 relative">
                      <input
                        type="text"
                        value={formData.breedCustom || (formData.breed && formData.breed !== 'not_in_list' ? breeds.find(b => b.value === formData.breed)?.label || '' : '')}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            breedCustom: value,
                            breed: ''
                          }));
                        }}
                        onFocus={() => {
                          if (formData.breedCustom.length >= 1) {
                            document.getElementById('breed-suggestions')?.classList.remove('hidden');
                          }
                        }}
                        placeholder="Search or type breed..."
                        className="w-full px-4 py-3.5 text-[15px] bg-[#fafafa] border-2 border-black/5 rounded-2xl focus:outline-none focus:border-[#1d1d1f] transition-colors placeholder:text-[#86868b]"
                      />
                      {/* Dropdown Suggestions */}
                      {formData.breedCustom.length >= 1 && (
                        <div
                          id="breed-suggestions"
                          className="absolute z-10 w-full mt-1 bg-white border border-black/5 rounded-2xl shadow-lg max-h-64 overflow-y-auto"
                        >
                          {filteredBreeds.length > 0 ? (
                            filteredBreeds.slice(0, 15).map((b) => (
                              <button
                                key={b.value}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    breed: b.value,
                                    breedCustom: b.label
                                  }));
                                  document.getElementById('breed-suggestions')?.classList.add('hidden');
                                }}
                                className="w-full px-4 py-3 text-left text-[14px] text-[#1d1d1f] hover:bg-[#fafafa] transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                              >
                                {b.label}
                              </button>
                            ))
                          ) : null}
                          {filteredBreeds.length === 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  breed: 'not_in_list',
                                  breedCustom: formData.breedCustom
                                }));
                                document.getElementById('breed-suggestions')?.classList.add('hidden');
                              }}
                              className="w-full px-4 py-3 text-left text-[14px] text-[#86868b] hover:bg-[#fafafa] transition-colors rounded-b-2xl border-t border-black/5"
                            >
                              + Add &quot;{formData.breedCustom}&quot; as custom breed
                            </button>
                          )}
                          {filteredBreeds.length > 0 && filteredBreeds.length < breeds.length && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  breed: 'not_in_list',
                                  breedCustom: formData.breedCustom
                                }));
                                document.getElementById('breed-suggestions')?.classList.add('hidden');
                              }}
                              className="w-full px-4 py-3 text-left text-[14px] text-[#0071e3] hover:bg-[#fafafa] transition-colors rounded-b-2xl border-t border-black/5"
                            >
                              Not in list? Add custom breed
                            </button>
                          )}
                        </div>
                      )}
                      {/* Selected breed indicator */}
                      {formData.breed && formData.breed !== 'not_in_list' && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="px-3 py-1.5 bg-[#34c759]/10 text-[#34c759] text-[13px] font-medium rounded-full">
                            {breeds.find(b => b.value === formData.breed)?.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, breed: '', breedCustom: '' }))}
                            className="text-[#86868b] hover:text-[#1d1d1f] text-sm"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                      {formData.breed === 'not_in_list' && (
                        <div className="mt-2">
                          <input
                            name="breedCustom"
                            value={formData.breedCustom}
                            onChange={handleInputChange}
                            placeholder="Enter breed name"
                            className="w-full px-4 py-3 text-[15px] bg-[#fafafa] border-2 border-[#0071e3]/30 rounded-2xl focus:outline-none focus:border-[#0071e3] transition-colors placeholder:text-[#86868b]"
                          />
                          <p className="text-[12px] text-[#86868b] mt-2">Custom breed will be saved as entered</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      name="breedCustom"
                      value={formData.breedCustom}
                      onChange={handleInputChange}
                      placeholder="Enter breed"
                      className="mt-2 w-full px-4 py-3.5 text-[15px] bg-[#fafafa] border-2 border-black/5 rounded-2xl focus:outline-none focus:border-[#1d1d1f] transition-colors placeholder:text-[#86868b]"
                    />
                  )}
                </div>

                {/* Age */}
                <div className="mb-5">
                  <span className="text-[13px] font-medium text-[#1d1d1f]/70">Age</span>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <input
                      name="age_years"
                      type="number"
                      min="0"
                      max="30"
                      value={formData.age_years}
                      onChange={handleInputChange}
                      placeholder="Years"
                      className="w-full px-4 py-3.5 text-[15px] bg-[#fafafa] border-2 border-black/5 rounded-2xl focus:outline-none focus:border-[#1d1d1f] transition-colors placeholder:text-[#86868b]"
                    />
                    <input
                      name="age_months"
                      type="number"
                      min="0"
                      max="11"
                      value={formData.age_months}
                      onChange={handleInputChange}
                      placeholder="Months"
                      className="w-full px-4 py-3.5 text-[15px] bg-[#fafafa] border-2 border-black/5 rounded-2xl focus:outline-none focus:border-[#1d1d1f] transition-colors placeholder:text-[#86868b]"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="mb-5">
                  <span className="text-[13px] font-medium text-[#1d1d1f]/70">Gender</span>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {GENDER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, gender: opt.value }))}
                        className={`p-3 rounded-2xl border-2 text-center transition-all ${formData.gender === opt.value ? 'border-[#1d1d1f] bg-[#1d1d1f] text-white' : 'border-black/5 bg-white text-[#1d1d1f]'}`}
                      >
                        <span className="text-xl block">{opt.value === 'male' ? '♂' : opt.value === 'female' ? '♀' : '?'}</span>
                        <span className="text-[12px] font-medium mt-1 block">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <span className="text-[13px] font-medium text-[#1d1d1f]/70">Size</span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {SIZE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, size: opt.value }))}
                        className={`p-3 rounded-2xl border-2 text-left transition-all ${formData.size === opt.value ? 'border-[#1d1d1f] bg-[#1d1d1f] text-white' : 'border-black/5 bg-white text-[#1d1d1f]'}`}
                      >
                        <span className="text-[13px] font-medium">{opt.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" size="lg" className="flex-1" onClick={() => setStep(3)}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Photos & Certificate */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <Card padding="lg">
                {/* Photos */}
                <div className="mb-6">
                  <span className="text-[13px] font-medium text-[#1d1d1f]/70">Photos (up to 5)</span>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {photoPreviews.map((preview, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-[#fafafa]">
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {photos.length < 5 && (
                      <label className="aspect-square rounded-2xl border-2 border-dashed border-black/10 flex flex-col items-center justify-center cursor-pointer hover:border-[#1d1d1f] transition-colors">
                        <span className="text-2xl text-[#86868b]">+</span>
                        <span className="text-[11px] text-[#86868b]">Add</span>
                        <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                {/* Certificate */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#1d1d1f]/70">Certificate (optional)</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="has_certificate"
                        checked={formData.has_certificate}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 rounded-full transition-colors ${formData.has_certificate ? 'bg-[#34c759]' : 'bg-black/10'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.has_certificate ? 'translate-x-5' : 'translate-x-1'} mt-1`} />
                      </div>
                    </label>
                  </div>

                  {formData.has_certificate && (
                    <div className="mt-4 space-y-3 animate-fade-in">
                      <select
                        name="certificate_type"
                        value={formData.certificate_type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 text-[15px] bg-white border-2 border-black/5 rounded-2xl focus:outline-none focus:border-[#1d1d1f]"
                      >
                        <option value="">Select certificate type</option>
                        {CERTIFICATE_TYPES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                      <input
                        name="certificate_number"
                        value={formData.certificate_number}
                        onChange={handleInputChange}
                        placeholder="Certificate number (if any)"
                        className="w-full px-4 py-3 text-[15px] bg-white border-2 border-black/5 rounded-2xl focus:outline-none focus:border-[#1d1d1f] placeholder:text-[#86868b]"
                      />
                      <label className="block w-full p-4 border-2 border-dashed border-black/10 rounded-2xl text-center cursor-pointer hover:border-[#1d1d1f] transition-colors">
                        <span className="text-[14px] text-[#86868b]">
                          {certificateFile ? certificateFile.name : 'Upload certificate (PDF/Image)'}
                        </span>
                        <input type="file" accept=".pdf,image/*" onChange={handleCertificateChange} className="hidden" />
                      </label>
                      <p className="text-[12px] text-[#86868b]">
                        A verified certificate will give your profile a special badge
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <div className="flex gap-3">
                <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="submit" size="lg" className="flex-1" isLoading={loading}>
                  Create Profile
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
