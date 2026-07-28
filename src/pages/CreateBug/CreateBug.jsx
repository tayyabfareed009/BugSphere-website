import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Buttons/Button.jsx';
import FormInput from '../../components/Forms/FormInput.jsx';
import { PRIORITIES, SEVERITIES, STATUSES } from '../../utils/constants.js';
import api from '../../services/api.js';
import { PageHeader } from '../Projects/Projects.jsx';

// Cloudinary configuration – move these to .env
const CLOUDINARY_CLOUD_NAME = "dq3xutirk"; // e.g., 'demo'
const CLOUDINARY_UPLOAD_PRESET ="worksphere" // create one in Cloudinary dashboard

export default function CreateBug() {
  const navigate = useNavigate();
  const [options, setOptions] = useState({ projects: [], users: [] });
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: { status: 'Open', priority: 'Medium', severity: 'Minor' }
  });

  const fileRef = register('screenshot'); // register file input

  useEffect(() => {
    Promise.all([api.get('/projects'), api.get('/users')])
      .then(([projects, users]) => setOptions({ projects: projects.data, users: users.data }))
      .catch((error) => console.error('[WorkSphere] Bug form options failed', error));
  }, []);

  const onSubmit = async (values) => {
    try {
      setUploading(true);
      let screenshotUrl = '';

      // If a file was selected, upload it to Cloudinary
      const file = values.screenshot?.[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
          { method: 'POST', body: formData }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Cloudinary upload failed');
        screenshotUrl = data.secure_url;
      }

      // Prepare payload without the file
      const payload = {
        title: values.title,
        description: values.description,
        project: values.project,
        status: values.status,
        priority: values.priority,
        severity: values.severity,
        assignedDeveloper: values.assignedDeveloper || null,
        screenshotUrl, // send the Cloudinary URL
      };

      console.log('[WorkSphere] Creating bug with screenshot URL:', screenshotUrl);
      const { data } = await api.post('/bugs', payload);
      toast.success('Bug created');
      navigate(`/bugs/${data._id}`);
    } catch (error) {
      console.error('[WorkSphere] Bug creation failed', error);
      toast.error(error.response?.data?.message || error.message || 'Could not create bug');
    } finally {
      setUploading(false);
    }
  };

  return (
    <BugForm
      title="Create Bug"
      text="Capture reproducible details, ownership, severity, screenshots, and workflow state."
      onSubmit={handleSubmit(onSubmit)}
      register={register}
      errors={errors}
      options={options}
      uploading={uploading}
    />
  );
}

// ---------- BugForm (slightly modified to show uploading state) ----------
export function BugForm({ title, text, onSubmit, register, errors, options = { projects: [], users: [] }, uploading }) {
  return (
    <div className="grid gap-6">
      <PageHeader title={title} text={text} />
      <form onSubmit={onSubmit} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-5 lg:grid-cols-2">
          <FormInput label="Title" {...register('title', { required: 'Title is required' })} error={errors.title?.message} />
          <Select label="Project" register={register('project', { required: true })} options={options.projects.map((p) => ({ value: p._id, label: `${p.key} · ${p.name}` }))} />
          <Select label="Priority" register={register('priority')} options={PRIORITIES.map((x) => ({ value: x, label: x }))} />
          <Select label="Severity" register={register('severity')} options={SEVERITIES.map((x) => ({ value: x, label: x }))} />
          <Select label="Status" register={register('status')} options={STATUSES.map((x) => ({ value: x, label: x }))} />
          <Select label="Assignee" register={register('assignedDeveloper')} options={[{ value: '', label: 'Unassigned' }, ...options.users.map((u) => ({ value: u._id, label: `${u.name} (${u.role})` }))]} />
        </div>
        <FormInput as="textarea" rows={6} label="Description" {...register('description', { required: 'Description is required' })} error={errors.description?.message} />
        <FormInput label="Upload evidence" type="file" accept="image/*,.txt,.json,.pdf,.zip" {...register('screenshot')} />
        <div className="flex justify-end">
          <Button type="submit" disabled={uploading}>
            {uploading ? 'Uploading screenshot…' : 'Save bug'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ---------- Select component (unchanged) ----------
function Select({ label, options, register }) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
      <select {...register} className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
        {options.length ? options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        )) : <option value="">No options available</option>}
      </select>
    </label>
  );
}