'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { Save, X, User as UserIcon } from 'lucide-react';

interface ProfileFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProfileForm({ onSuccess, onCancel }: ProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile>({
    email: '',
    name: '',
    mobile: '',
    updatedAt: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          mobile: profile.mobile,
        }),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      onSuccess();
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="p-6 text-center text-muted">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <UserIcon size={20} className="text-primary" />
          <div>
            <h2 className="font-semibold">Profile Settings</h2>
            <p className="text-sm text-muted mt-1">Update your profile information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Email (from Google)</label>
            <input
              type="email"
              className="form-input"
              value={profile.email}
              disabled
            />
            <p className="text-xs text-muted mt-1">Your email cannot be changed</p>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your full name"
              value={profile.name || ''}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="Enter your mobile number"
              value={profile.mobile || ''}
              onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
              maxLength={20}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="card-footer">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={saving}
            >
              <X size={18} className="mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              <Save size={18} className="mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
