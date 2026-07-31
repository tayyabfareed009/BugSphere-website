import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '../../components/Buttons/Button.jsx';
import FormInput from '../../components/Forms/FormInput.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import api from '../../services/api.js';
import { PageHeader } from '../Projects/Projects.jsx';

// Cloudinary settings – keep these as provided
const CLOUDINARY_CLOUD_NAME = 'dq3xutirk';
const CLOUDINARY_UPLOAD_PRESET = 'worksphere';

export default function Profile() {
  const { user, refetchUser, resetPassword } = useAuth();

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [isUploading, setIsUploading] = useState(false);

  // Password reset state
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Organisation deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      notificationsEnabled: user?.notificationsEnabled ?? true,
    },
  });

  // ── Avatar Upload (frontend → Cloudinary → backend) ──
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      const secureUrl = data.secure_url;

      // Send URL to backend
      await api.put('/users/profile', { avatar: secureUrl });
      toast.success('Avatar updated successfully');
      await refetchUser();
      setAvatarPreview(secureUrl);
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || 'Failed to upload image');
      setAvatarPreview(user?.avatar || '');
    } finally {
      setIsUploading(false);
      e.target.value = ''; // allow re‑upload of same file
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Remove your profile picture?')) return;
    setIsUploading(true);
    try {
      await api.put('/users/profile', { avatar: '' });
      toast.success('Avatar removed');
      setAvatarPreview('');
      await refetchUser();
    } catch (error) {
      toast.error('Failed to remove avatar');
    } finally {
      setIsUploading(false);
    }
  };

  // ── Save Profile (name, phone, notification preference) ──
  const saveProfile = async (values) => {
    try {
      const payload = {
        name: values.name.trim(),
        phone: values.phone || '',
        notificationsEnabled: values.notificationsEnabled,
      };
      await api.put('/users/profile', payload);
      toast.success('Profile updated successfully');
      await refetchUser();
    } catch (error) {
      console.error('Profile save error:', error);
      toast.error(error.response?.data?.error || 'Could not save profile');
    }
  };

  // ── Reset Password (uses Firebase) ──
  const handleResetPassword = async () => {
    if (!user?.email) {
      toast.error('No email address found');
      return;
    }
    setIsResettingPassword(true);
    try {
      await resetPassword(user.email);
      // Toast is already shown by the auth provider
    } catch (error) {
      console.error('Password reset error:', error);
      // Error is handled by the provider
    } finally {
      setIsResettingPassword(false);
    }
  };

  // ── Delete Organisation (owner only) ──
  const handleDeleteOrganization = async () => {
    const expectedPhrase = 'DELETE MY ORGANIZATION';
    if (deleteConfirmationText.trim() !== expectedPhrase) {
      toast.error(`Please type "${expectedPhrase}" exactly to confirm.`);
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete('/organizations/current', {
        data: { confirm: deleteConfirmationText.trim() },
      });
      toast.success('Organization deleted successfully');
      window.location.href = '/';
    } catch (error) {
      console.error('Organisation deletion error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete organization');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmationText('');
    }
  };

  // ── Helpers ──
  const isOwner = user?.role === 'Owner';
  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

  // Fallback when image fails to load
  const handleImageError = () => {
    setAvatarPreview('');
  };

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Profile"
        text="Update your workspace identity and notification preferences."
      />

      <form
        onSubmit={handleSubmit(saveProfile)}
        className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[260px_1fr]"
      >
        {/* Left column – Avatar & summary */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="h-32 w-32 rounded-full object-cover ring-4 ring-indigo-100 dark:ring-indigo-900/30"
                onError={handleImageError}
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-700 text-4xl font-bold text-white shadow-lg shadow-indigo-500/20">
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-indigo-600 p-2 text-white shadow-lg transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isUploading}
              />
            </label>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
              </div>
            )}
          </div>

          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {user?.name || 'User'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {user?.role || 'Member'} • {user?.organization?.name || 'No Organization'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Member since {formatDate(user?.createdAt)}
            </p>
            <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
              {user?.active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {avatarPreview && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="text-sm text-red-500 hover:underline dark:text-red-400"
              disabled={isUploading}
            >
              Remove photo
            </button>
          )}
        </div>

        {/* Right column – Editable & read‑only fields */}
        <div className="grid gap-4">
          <FormInput
            label="Full Name"
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 3, message: 'Minimum 3 characters' },
              maxLength: { value: 50, message: 'Maximum 50 characters' },
            })}
            error={errors.name?.message}
          />

          <FormInput
            label="Phone Number"
            {...register('phone', {
              pattern: {
                value: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
                message: 'Invalid phone format (e.g. +1234567890)',
              },
            })}
            error={errors.phone?.message}
            placeholder="Optional"
          />

          <FormInput
            label="Email Address"
            value={user?.email || ''}
            disabled
            readOnly
            className="bg-slate-50 dark:bg-slate-800"
          />

          <FormInput
            label="Role"
            value={user?.role || ''}
            disabled
            readOnly
            className="bg-slate-50 dark:bg-slate-800"
          />

          <FormInput
            label="Organization"
            value={user?.organization?.name || 'N/A'}
            disabled
            readOnly
            className="bg-slate-50 dark:bg-slate-800"
          />

          {/* Notification toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div>
              <label
                htmlFor="notifications-toggle"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                In‑app notifications
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive updates and alerts within the app
              </p>
            </div>
            <div className="relative inline-flex cursor-pointer items-center">
              <input
                id="notifications-toggle"
                type="checkbox"
                className="peer sr-only"
                {...register('notificationsEnabled')}
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-indigo-300 dark:bg-slate-600 dark:peer-focus:ring-indigo-800" />
            </div>
          </div>

          {/* Security section with password reset */}
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Security
            </h4>
            <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <p>
                <span className="font-medium">Firebase UID:</span>{' '}
                {user?.firebaseUid || 'N/A'}
              </p>
              <p>
                <span className="font-medium">Last Login:</span>{' '}
                {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'N/A'}
              </p>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isResettingPassword}
                className="mt-2 inline-flex items-center gap-2 rounded-md bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 hover:text-indigo-800 disabled:opacity-50 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
              >
                {isResettingPassword ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        fill="currentColor"
                      />
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Reset password'
                )}
              </button>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                A password reset link will be sent to your registered email.
              </p>
            </div>
          </div>

          {/* Save button */}
          <Button
            type="submit"
            className="justify-self-start"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save profile'}
          </Button>
        </div>
      </form>

      {/* Danger Zone – only for organisation owners */}
      {isOwner && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800/30 dark:bg-red-950/20">
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
            Danger Zone
          </h3>
          <p className="text-sm text-red-600 dark:text-red-300">
            Once you delete your organisation, all data will be permanently removed.
            This action cannot be undone.
          </p>
          <Button
            type="button"
            variant="danger"
            className="mt-4"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Organisation
          </Button>
        </div>
      )}

      {/* Delete Organisation Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Confirm Organisation Deletion
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              To verify you are human, please type the following phrase exactly:
            </p>
            <div className="mt-3 rounded-lg bg-slate-100 p-3 text-center font-mono text-sm font-bold dark:bg-slate-800 dark:text-white">
              DELETE MY ORGANIZATION
            </div>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="Type the phrase here…"
              className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              disabled={isDeleting}
            />
            <div className="mt-4 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText('');
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteOrganization}
                loading={isDeleting}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}