'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { Save, X, User as UserIcon, Mail, Phone, Sparkles, Trash2 } from 'lucide-react';

interface ProfileFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProfileForm({ onSuccess, onCancel }: ProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile>({
    email: '',
    firstName: '',
    lastName: '',
    mobile: '',
    updatedAt: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
          firstName: profile.firstName,
          lastName: profile.lastName,
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

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError('');

    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete account');

      // Redirect to sign out after successful deletion
      window.location.href = '/api/auth/signout';
    } catch (err) {
      setError('Failed to delete account');
      console.error(err);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-card-modern">
        <div className="profile-loading">
          <div className="profile-loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-card-modern">
      {/* Header Section */}
      <div className="profile-header-gradient">
        <div className="profile-header-content">
          <div className="profile-avatar-large">
            <UserIcon size={40} />
          </div>
          <div className="profile-header-text">
            <h1 className="profile-title">
              <Sparkles size={24} className="profile-sparkle" />
              My Profile
            </h1>
            <p className="profile-subtitle">Manage your personal information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="profile-form-modern">
        {/* Personal Information Section */}
        <div className="profile-section">
          <div className="profile-section-header">
            <h3 className="profile-section-title">Personal Information</h3>
            <p className="profile-section-desc">Your name and contact details</p>
          </div>

          <div className="profile-fields-grid">
            <div className="profile-field-wrapper">
              <label className="profile-label">
                <UserIcon size={16} />
                First Name
              </label>
              <input
                type="text"
                className="profile-input"
                placeholder="Enter your first name"
                value={profile.firstName || ''}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                maxLength={50}
              />
            </div>

            <div className="profile-field-wrapper">
              <label className="profile-label">
                <UserIcon size={16} />
                Last Name
              </label>
              <input
                type="text"
                className="profile-input"
                placeholder="Enter your last name"
                value={profile.lastName || ''}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                maxLength={50}
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="profile-section">
          <div className="profile-section-header">
            <h3 className="profile-section-title">Contact Information</h3>
            <p className="profile-section-desc">How we can reach you</p>
          </div>

          <div className="profile-field-wrapper">
            <label className="profile-label">
              <Mail size={16} />
              Email Address
            </label>
            <input
              type="email"
              className="profile-input profile-input-disabled"
              value={profile.email}
              disabled
            />
            <p className="profile-field-hint">
              <span className="profile-lock-icon">🔒</span>
              Your email is provided by Google and cannot be changed
            </p>
          </div>

          <div className="profile-field-wrapper">
            <label className="profile-label">
              <Phone size={16} />
              Mobile Number
            </label>
            <input
              type="tel"
              className="profile-input"
              placeholder="+1 (555) 123-4567"
              value={profile.mobile || ''}
              onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
              maxLength={20}
            />
            <p className="profile-field-hint">We'll never share your number with anyone</p>
          </div>
        </div>

        {error && (
          <div className="profile-error">
            <span className="profile-error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="profile-actions">
          <button
            type="button"
            onClick={onCancel}
            className="profile-btn-secondary"
            disabled={saving || deleting}
          >
            <X size={18} />
            Cancel
          </button>
          <button
            type="submit"
            className="profile-btn-primary"
            disabled={saving || deleting}
          >
            {saving ? (
              <>
                <div className="profile-btn-spinner"></div>
                Saving Changes...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="profile-danger-zone">
          <div className="profile-section-header">
            <h3 className="profile-section-title" style={{ color: '#ef4444' }}>Danger Zone</h3>
            <p className="profile-section-desc">Permanent actions that cannot be undone</p>
          </div>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="profile-btn-danger"
              disabled={saving || deleting}
            >
              <Trash2 size={18} />
              Delete Account
            </button>
          ) : (
            <div className="profile-delete-confirm">
              <p className="profile-delete-warning">
                ⚠️ <strong>Warning:</strong> This will permanently delete your account, all projects, resources, APIs, and generated data. This action cannot be undone.
              </p>
              <div className="profile-delete-actions">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="profile-btn-secondary"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="profile-btn-danger-confirm"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <div className="profile-btn-spinner"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Yes, Delete Everything
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
