'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/user.service';
import type { UserProfile, UpdateProfileRequest } from '@/types/auth.types';

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    avatarUrl: ''
  });

  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load profile on mount
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadProfile();
    }
  }, [isAuthenticated, authLoading]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const profileData = await userService.getProfile();
      setProfile(profileData);

      // Initialize form with current profile data
      setFormData({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        bio: profileData.bio || '',
        avatarUrl: profileData.avatarUrl || ''
      });
    } catch (err) {
      setError('Failed to load profile. Please try again.');
      console.error('Profile load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Bio must be 500 characters or less';
    }

    if (formData.avatarUrl && formData.avatarUrl.trim()) {
      try {
        new URL(formData.avatarUrl);
      } catch {
        errors.avatarUrl = 'Please enter a valid URL';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const updateData: UpdateProfileRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio.trim() || null,
        avatarUrl: formData.avatarUrl.trim() || null
      };

      const updatedProfile = await userService.updateProfile(updateData);
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
      setError(errorMessage);
      console.error('Profile update error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to current profile data
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || ''
      });
    }
    setFormErrors({});
    setIsEditing(false);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h1>
          <a href="/login" className="text-blue-600 hover:text-blue-700">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
          <div className="px-6 pb-6">
            <div className="-mt-16 mb-4">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-300 flex items-center justify-center text-4xl font-bold text-gray-600">
                  {profile?.firstName[0]}{profile?.lastName[0]}
                </div>
              )}
            </div>

            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                <p className="text-gray-600">@{profile?.username}</p>
                <p className="text-sm text-gray-500 mt-1">{profile?.email}</p>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {profile?.bio && !isEditing && (
              <p className="mt-4 text-gray-700">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {profile?.statistics.watchlistCount || 0}
            </div>
            <div className="text-gray-600">Movies in Watchlist</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {profile?.statistics.ratingsCount || 0}
            </div>
            <div className="text-gray-600">Movies Rated</div>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL
                </label>
                <input
                  type="text"
                  id="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.avatarUrl ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.avatarUrl && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.avatarUrl}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Enter a URL to your profile picture</p>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.bio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={500}
                />
                {formErrors.bio && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.bio}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Account Information */}
        {!isEditing && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Member since</span>
                <span className="text-gray-900 font-medium">
                  {new Date(profile?.createdAt || '').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Last updated</span>
                <span className="text-gray-900 font-medium">
                  {new Date(profile?.updatedAt || '').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
