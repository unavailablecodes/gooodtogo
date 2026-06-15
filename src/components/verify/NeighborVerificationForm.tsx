'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Check, X, Users, MessageSquare, Phone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { NeighborVerification } from '@/types/database';

interface NeighborVerificationFormProps {
  petId: string;
  petName: string;
  onSuccess?: () => void;
}

const INTERACTION_TYPES = [
  { value: 'walked_together', label: 'Walked together', icon: '🚶' },
  { value: 'met_at_park', label: 'Met at park', icon: '🌳' },
  { value: 'visited_home', label: 'Visited home', icon: '🏠' },
  { value: 'saw_daily', label: 'See daily', icon: '👀' },
  { value: 'other', label: 'Other', icon: '💬' },
];

export function NeighborVerificationForm({ petId, petName, onSuccess }: NeighborVerificationFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<'info' | 'verify'>('info');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [interactionType, setInteractionType] = useState<NeighborVerification['interaction_type'] | null>(null);
  const [interactionCount, setInteractionCount] = useState(1);
  const [friendly, setFriendly] = useState<boolean | null>(null);
  const [quiet, setQuiet] = useState<boolean | null>(null);
  const [wellBehaved, setWellBehaved] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alreadyVerified, setAlreadyVerified] = useState(false);

  const handleCheckAndProceed = async () => {
    if (!name.trim() || !phone.trim()) {
      setError('Please enter your name and phone number');
      return;
    }

    setLoading(true);
    setError('');

    // Check if this phone has already verified this pet
    const { data: existing } = await supabase
      .from('neighbor_verifications')
      .select('id')
      .eq('pet_id', petId)
      .eq('verifier_phone', phone.trim())
      .single();

    if (existing) {
      setAlreadyVerified(true);
      setLoading(false);
      return;
    }

    setStep('verify');
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!interactionType || friendly === null || quiet === null || wellBehaved === null) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: submitError } = await supabase
        .from('neighbor_verifications')
        .insert({
          pet_id: petId,
          verifier_name: name.trim(),
          verifier_phone: phone.trim(),
          interaction_type: interactionType,
          interaction_count: interactionCount,
          friendly_rating: friendly ? 5 : 3,
          quiet_rating: quiet ? 5 : 3,
          well_behaved: wellBehaved,
          notes: notes.trim() || null,
        });

      if (submitError) {
        if (submitError.code === '23505') {
          setError('This phone number has already verified this pet');
          setAlreadyVerified(true);
        } else {
          setError(submitError.message);
        }
        setLoading(false);
        return;
      }

      onSuccess?.();
      setStep('success');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-green-800 mb-2">Thank you, {name}!</h3>
          <p className="text-sm text-green-700">
            Your verification has been added to {petName}&apos;s profile.
          </p>
        </div>
      </Card>
    );
  }

  if (alreadyVerified) {
    return (
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <div className="text-center">
          <Phone className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <h3 className="font-semibold text-yellow-800 mb-2">Already Verified</h3>
          <p className="text-sm text-yellow-700 mb-4">
            This phone number has already verified {petName}. Each phone can verify a pet only once.
          </p>
          <Button variant="outline" size="sm" onClick={() => {
            setAlreadyVerified(false);
            setPhone('');
          }}>
            Use Different Phone
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">I met {petName}!</h3>
          <p className="text-sm text-gray-500">Share your experience (30 seconds)</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Step 1: Name & Phone */}
      {step === 'info' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Enter your details to verify. Each phone number can verify a pet only once.
          </p>

          <Input
            label="Your Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />

          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
          />

          <div className="bg-blue-50 p-3 rounded-xl">
            <p className="text-xs text-blue-700">
              💡 Your phone number links your verification. You can verify different pets with the same phone, but not the same pet twice.
            </p>
          </div>

          <Button
            onClick={handleCheckAndProceed}
            isLoading={loading}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      )}

      {/* Step 2: Verification Questions */}
      {step === 'verify' && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-xl mb-4">
            <p className="text-sm text-gray-700">
              <span className="font-medium">{name}</span> • {phone}
            </p>
          </div>

          {/* Interaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">How did you meet?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INTERACTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setInteractionType(type.value as NeighborVerification['interaction_type'])}
                  className={`
                    p-3 rounded-xl border text-sm font-medium transition-all text-left
                    ${interactionType === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* How many times */}
          {interactionType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How many times have you met?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setInteractionCount(num)}
                    className={`
                      px-4 py-2 rounded-lg border text-sm font-medium transition-all
                      ${interactionCount === num
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }
                    `}
                  >
                    {num}+
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Questions */}
          {interactionType && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Was {petName} friendly?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFriendly(true)}
                    className={`p-2 rounded-lg transition-all ${friendly === true ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setFriendly(false)}
                    className={`p-2 rounded-lg transition-all ${friendly === false ? 'bg-red-100 text-red-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Was {petName} calm/quiet?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setQuiet(true)}
                    className={`p-2 rounded-lg transition-all ${quiet === true ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setQuiet(false)}
                    className={`p-2 rounded-lg transition-all ${quiet === false ? 'bg-red-100 text-red-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Would you pet {petName} again?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setWellBehaved(true)}
                    className={`p-2 rounded-lg transition-all ${wellBehaved === true ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setWellBehaved(false)}
                    className={`p-2 rounded-lg transition-all ${wellBehaved === false ? 'bg-red-100 text-red-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes (optional) */}
          {interactionType && friendly !== null && quiet !== null && wellBehaved !== null && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional thoughts..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep('info')}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!interactionType || friendly === null || quiet === null || wellBehaved === null}
              isLoading={loading}
              className="flex-1"
            >
              Submit
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
