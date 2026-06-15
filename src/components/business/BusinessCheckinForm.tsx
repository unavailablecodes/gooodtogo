'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Check, X, Store, Calendar, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { BusinessCheckin } from '@/types/database';

interface BusinessCheckinFormProps {
  petId: string;
  petName: string;
  businessId?: string;
  businessName?: string;
  onSuccess?: () => void;
}

export function BusinessCheckinForm({ petId, petName, businessId, businessName, onSuccess }: BusinessCheckinFormProps) {
  const router = useRouter();
  const { user, isBusiness } = useAuth();
  const supabase = createClient();

  const [friendly, setFriendly] = useState<boolean | null>(null);
  const [quiet, setQuiet] = useState<boolean | null>(null);
  const [cleanedUp, setCleanedUp] = useState<boolean | null>(null);
  const [aggressive, setAggressive] = useState<boolean | null>(null);
  const [noisy, setNoisy] = useState<boolean | null>(null);
  const [allowAgain, setAllowAgain] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (friendly === null || quiet === null || cleanedUp === null || aggressive === null || noisy === null || allowAgain === null) {
      setError('Please answer all questions');
      return;
    }

    if (!isBusiness) {
      setError('Only business accounts can check in pets');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Calculate overall rating (1-5)
      let rating = 5;
      if (!friendly) rating -= 1;
      if (!quiet) rating -= 1;
      if (!cleanedUp) rating -= 1;
      if (aggressive) rating -= 2;
      if (!allowAgain) rating -= 1;
      rating = Math.max(1, rating);

      const { error: submitError } = await supabase
        .from('business_checkins')
        .insert({
          pet_id: petId,
          business_id: businessId || null,
          business_name: businessName || (isBusiness ? 'Local Business' : null),
          visit_date: new Date().toISOString().split('T')[0],
          overall_rating: rating,
          was_friendly: friendly,
          was_noisy: noisy,
          was_aggressive: aggressive,
          cleaned_up_after: cleanedUp,
          would_allow_again: allowAgain,
          notes: notes.trim() || null,
          verified: false,
        });

      if (submitError) throw submitError;

      setSubmitted(true);
      onSuccess?.();

      // Refresh after 2 seconds
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit check-in');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Store className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Business Check-in</h3>
          <p className="text-sm text-gray-600 mb-4">
            Login as a business to check in pets at your location
          </p>
          <Button onClick={() => router.push('/login')} size="sm">
            Login as Business
          </Button>
        </div>
      </Card>
    );
  }

  if (!isBusiness) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Store className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Business Check-in</h3>
          <p className="text-sm text-gray-600 mb-4">
            Only business accounts can check in pets. {user.email}
          </p>
          <p className="text-xs text-gray-500">
            Contact admin to upgrade your account to business
          </p>
        </div>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-green-800 mb-2">Check-in Complete!</h3>
          <p className="text-sm text-green-700">
            {petName} has been checked in at your business.
          </p>
        </div>
      </Card>
    );
  }

  const isComplete = friendly !== null && quiet !== null && cleanedUp !== null && aggressive !== null && noisy !== null && allowAgain !== null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <Store className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Check in {petName}</h3>
          <p className="text-sm text-gray-500">Rate this pet's visit to your business</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-lg">😊</span>
            <span className="text-sm font-medium text-gray-700">Was pet friendly?</span>
          </div>
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
          <div className="flex items-center gap-2">
            <span className="text-lg">🤫</span>
            <span className="text-sm font-medium text-gray-700">Was pet calm/quiet?</span>
          </div>
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
          <div className="flex items-center gap-2">
            <span className="text-lg">🧹</span>
            <span className="text-sm font-medium text-gray-700">Cleaned up after?</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCleanedUp(true)}
              className={`p-2 rounded-lg transition-all ${cleanedUp === true ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCleanedUp(false)}
              className={`p-2 rounded-lg transition-all ${cleanedUp === false ? 'bg-red-100 text-red-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span className="text-sm font-medium text-gray-700">Was aggressive?</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAggressive(false)}
              className={`p-2 rounded-lg transition-all ${aggressive === false ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => setAggressive(true)}
              className={`p-2 rounded-lg transition-all ${aggressive === true ? 'bg-red-100 text-red-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔊</span>
            <span className="text-sm font-medium text-gray-700">Was noisy/barking?</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setNoisy(false)}
              className={`p-2 rounded-lg transition-all ${noisy === false ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => setNoisy(true)}
              className={`p-2 rounded-lg transition-all ${noisy === true ? 'bg-red-100 text-red-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-lg">👍</span>
            <span className="text-sm font-medium text-gray-700">Would allow again?</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAllowAgain(true)}
              className={`p-2 rounded-lg transition-all ${allowAgain === true ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => setAllowAgain(false)}
              className={`p-2 rounded-lg transition-all ${allowAgain === false ? 'bg-red-100 text-red-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notes */}
        {isComplete && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about the visit..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!isComplete || loading}
        isLoading={loading}
        className="w-full mt-4"
      >
        Submit Check-in
      </Button>
    </Card>
  );
}
