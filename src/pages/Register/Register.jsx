import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiUserPlus } from 'react-icons/fi'
import Button from '../../components/Buttons/Button.jsx'
import FormInput from '../../components/Forms/FormInput.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { AuthFrame } from '../Login/Login.jsx'
import api from '../../services/api.js'

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'dq3xutirk'
const CLOUDINARY_UPLOAD_PRESET = 'worksphere'

export default function Register() {
  const { register: createAccount } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const invitationToken = searchParams.get('invitation')
  const [invitation, setInvitation] = useState(null)
  const [inviteError, setInviteError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm()

  useEffect(() => {
    if (!invitationToken) return

    api
      .get('/organization/invitations/validate', {
        params: { token: invitationToken }
      })
      .then(({ data }) => {
        setInvitation(data)
        setValue('email', data.email)
      })
      .catch((error) =>
        setInviteError(
          error.response?.data?.message || 'This invitation is unavailable.'
        )
      )
  }, [invitationToken, setValue])

  const onSubmit = async (values) => {
    try {
      let avatar = ''

      // Upload avatar to Cloudinary
      const file = values.avatar?.[0]

      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error?.message || 'Cloudinary upload failed')
        }

        avatar = data.secure_url
      }

      // Send image URL instead of File
      await createAccount({
        ...values,
        avatar,
        invitationToken
      })

      navigate('/dashboard')
    } catch (error) {
      console.error(error)
      setInviteError(error.message || 'Registration failed')
    }
  }

  return (
    <AuthFrame
      title={invitationToken ? 'Join your workspace' : 'Create your workspace'}
      subtitle={
        invitationToken
          ? invitation
            ? `You are joining ${invitation.organization.name} as ${invitation.role}.`
            : 'Checking invitation…'
          : 'Invite teammates, assign work, and centralize delivery.'
      }
    >
      {inviteError && (
        <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {inviteError}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <FormInput
          label="Full name"
          {...register('name', { required: 'Name is required' })}
          error={errors.name?.message}
        />

        <FormInput
          label="Email"
          type="email"
          readOnly={Boolean(invitationToken)}
          {...register('email', { required: 'Email is required' })}
          error={errors.email?.message}
        />

        {!invitationToken && (
          <FormInput
            label="Organization name"
            {...register('organizationName', {
              required: 'Organization name is required'
            })}
            error={errors.organizationName?.message}
          />
        )}

        <FormInput
          label="Phone number (optional)"
          type="tel"
          {...register('phone')}
          error={errors.phone?.message}
        />

        <FormInput
          label="Profile image (optional)"
          type="file"
          accept="image/*"
          {...register('avatar')}
          error={errors.avatar?.message}
        />

        <FormInput
          label="Password"
          type="password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Use at least 8 characters'
            }
          })}
          error={errors.password?.message}
        />

        <Button
          icon={FiUserPlus}
          className="w-full"
          disabled={Boolean(invitationToken && !invitation)}
        >
          {invitationToken ? 'Accept invitation' : 'Create workspace'}
        </Button>
      </form>
    </AuthFrame>
  )
}