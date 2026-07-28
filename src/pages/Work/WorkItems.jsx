import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiEye, FiTrash2, FiX } from 'react-icons/fi';
import Button from '../../components/Buttons/Button.jsx';
import { PageHeader } from '../Projects/Projects.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import api from '../../services/api.js';

// --- Configuration per work item type ---
const configs = {
  tasks: {
    title: 'Tasks',
    text: 'Plan, assign, and track delivery work.',
    endpoint: '/tasks',
    fields: ['title', 'description', 'project', 'assignee', 'team', 'deadline', 'estimatedHours', 'priority', 'status'],
    optionFields: {
      project: '/projects',
      assignee: '/users',
      team: '/teams',
    },
    creatorField: 'createdBy', // field on the item that holds the creator object
    statusOptions: ['Open', 'Assigned', 'In Progress', 'Ready for Testing', 'Testing', 'Resolved', 'Closed'],
  },
  requirements: {
    title: 'Requirements',
    text: 'Capture, review, and approve product requirements.',
    endpoint: '/requirements',
    fields: ['title', 'content', 'project', 'status'],
    optionFields: {
      project: '/projects',
    },
    creatorField: 'createdBy',
    statusOptions: ['Draft', 'Review', 'Approved', 'Rejected'],
  },
  submissions: {
    title: 'Daily submissions',
    text: 'Submit work updates and review delivery evidence.',
    endpoint: '/submissions',
    fields: ['task', 'description', 'hoursWorked', 'links', 'status'],
    optionFields: {
      task: '/tasks',
    },
    creatorField: 'employee', // submissions use 'employee' as creator
    statusOptions: ['Pending', 'Approved', 'Rejected', 'Changes Requested'],
  },
};

// --- Helpers ---
const getDisplayLabel = (item, field) => {
  if (field === 'project') return item.name;
  if (field === 'assignee') return item.name;
  if (field === 'task') return item.title;
  if (field === 'team') return item.name;
  return item.name || item.title || item._id;
};

const label = (value) =>
  value.replace(/([A-Z])/g, ' $1').replace(/^./, (l) => l.toUpperCase());

// --- Main Component ---
export default function WorkItems({ type }) {
  const { user } = useAuth();
  const config = configs[type];

  const [items, setItems] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [form, setForm] = useState({});
  const [options, setOptions] = useState({});

  // --- Load data ---
  const load = useCallback(() => {
    api.get(config.endpoint)
      .then(({ data }) => setItems(data))
      .catch(() => toast.error(`Could not load ${config.title.toLowerCase()}`));
  }, [config.endpoint, config.title]);

  const loadOptions = useCallback(async () => {
    const optionFields = config.optionFields || {};
    const newOptions = {};
    const promises = Object.entries(optionFields).map(async ([field, endpoint]) => {
      try {
        const { data } = await api.get(endpoint);
        newOptions[field] = data;
      } catch (err) {
        console.error(`Failed to load ${field} options`, err);
        toast.error(`Could not load ${field} options`);
      }
    });
    await Promise.all(promises);
    setOptions(newOptions);
  }, [config.optionFields]);

  useEffect(() => {
    load();
    loadOptions();
  }, [load, loadOptions]);

  // --- Form helpers ---
  const resetForm = () => {
    setForm({});
    setEditingItem(null);
    setShowEditModal(false);
    setShowCreateModal(false);
  };

  // --- Create / Update ---
  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : undefined,
        hoursWorked: form.hoursWorked ? Number(form.hoursWorked) : undefined,
        links: form.links ? form.links.split(',').map((l) => l.trim()).filter(Boolean) : [],
      };

      if (editingItem) {
        await api.put(`${config.endpoint}/${editingItem._id}`, payload);
        toast.success(`${config.title.slice(0, -1)} updated`);
      } else {
        await api.post(config.endpoint, payload);
        toast.success(`${config.title.slice(0, -1)} created`);
      }
      resetForm();
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save');
    }
  };

  // --- Delete ---
  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete this ${config.title.slice(0, -1)}?`)) return;
    try {
      await api.delete(`${config.endpoint}/${item._id}`);
      toast.success(`${config.title.slice(0, -1)} deleted`);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete');
    }
  };

  // --- Permission: can edit/delete? ---
  const canModify = (item) => {
    if (!user) return false;
    const isOwner = user.role === 'Owner';
    const creatorId = item[config.creatorField]?._id || item[config.creatorField];
    const isCreator = creatorId === user._id;
    return isOwner || isCreator;
  };

  // --- Open edit modal with pre-filled data ---
  const openEdit = (item) => {
    setEditingItem(item);
    const prefilled = {};
    config.fields.forEach((field) => {
      let value = item[field];
      // If the field is a populated object, extract its _id
      if (value && typeof value === 'object' && value._id) {
        value = value._id;
      }
      // For dates, format to YYYY-MM-DD
      if (field === 'deadline' && value) {
        value = new Date(value).toISOString().split('T')[0];
      }
      prefilled[field] = value || '';
    });
    // Also set status if not present
    if (!prefilled.status) prefilled.status = item.status || '';
    setForm(prefilled);
    setShowEditModal(true);
  };

  // --- Determine if a field uses a dropdown ---
  const isSelectField = (field) => config.optionFields && config.optionFields[field];

  // --- Render a form field input ---
  const renderField = (field) => {
    const value = form[field] || '';
    const required = ['title', 'project', 'task', 'hoursWorked'].includes(field);

    // If it's a select field (reference to another collection)
    if (isSelectField(field)) {
      const optionsList = options[field] || [];
      return (
        <select
          required={required}
          value={value}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          className="rounded-lg border border-slate-300 bg-transparent p-2 dark:border-slate-700"
        >
          <option value="">Select {field}</option>
          {optionsList.map((item) => (
            <option key={item._id} value={item._id}>
              {getDisplayLabel(item, field)}
            </option>
          ))}
        </select>
      );
    }

    // If it's the 'status' field, use a dropdown with status options
    if (field === 'status' && config.statusOptions) {
      return (
        <select
          required={required}
          value={value}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          className="rounded-lg border border-slate-300 bg-transparent p-2 dark:border-slate-700"
        >
          <option value="">Select status</option>
          {config.statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      );
    }

    // Otherwise, standard input
    const inputType =
      field === 'deadline' ? 'date'
      : (field.includes('Hours') || field === 'hoursWorked') ? 'number'
      : 'text';
    return (
      <input
        required={required}
        type={inputType}
        value={value}
        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        placeholder={field === 'links' ? 'Comma-separated URLs' : ''}
        className="rounded-lg border border-slate-300 bg-transparent p-2 dark:border-slate-700"
      />
    );
  };

  // --- Render Create/Edit Modal (reused) ---
  const renderFormModal = (isEdit) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-slate-900">
        <button
          onClick={resetForm}
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <FiX size={24} />
        </button>
        <h2 className="mb-4 text-2xl font-bold text-slate-950 dark:text-white">
          {isEdit ? `Edit ${config.title.slice(0, -1)}` : `Create ${config.title.slice(0, -1)}`}
        </h2>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          {config.fields.map((field) => (
            <label
              key={field}
              className={`grid gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200 ${
                (field === 'description' || field === 'content') ? 'md:col-span-2' : ''
              }`}
            >
              {label(field)}
              {field === 'description' || field === 'content' ? (
                <textarea
                  required={field === 'content'}
                  value={form[field] || ''}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="min-h-24 rounded-lg border border-slate-300 bg-transparent p-2 dark:border-slate-700"
                />
              ) : (
                renderField(field)
              )}
            </label>
          ))}
          <div className="flex gap-3 md:col-span-2">
            <Button type="submit">{isEdit ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );

  // --- Render Detail Modal ---
  const renderDetailModal = () => {
    if (!viewingItem) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-slate-900">
          <button
            onClick={() => setViewingItem(null)}
            className="absolute right-4 top-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <FiX size={24} />
          </button>
          <h2 className="mb-4 text-2xl font-bold text-slate-950 dark:text-white">
            {viewingItem.title || 'Details'}
          </h2>
          <dl className="grid gap-3">
            {Object.entries(viewingItem).map(([key, value]) => {
              // Skip internal fields
              if (['_id', '__v', 'createdAt', 'updatedAt', 'organization'].includes(key)) return null;
              // If value is a populated object, show its name/title
              if (value && typeof value === 'object' && value._id) {
                value = value.name || value.title || value._id;
              }
              // If it's an array of objects, stringify
              if (Array.isArray(value) && value.length) {
                if (typeof value[0] === 'object') {
                  value = value.map(v => v.name || v.title || v._id).join(', ');
                } else {
                  value = value.join(', ');
                }
              }
              // If it's a date, format it
              if (key === 'deadline' || key === 'submissionDate' || key === 'dueDate') {
                value = value ? new Date(value).toLocaleDateString() : '—';
              }
              // If it's a number, keep as is
              return (
                <div key={key} className="flex justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                  <dt className="font-medium text-slate-500">{label(key)}</dt>
                  <dd className="text-slate-900 dark:text-white">{value || '—'}</dd>
                </div>
              );
            })}
          </dl>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setViewingItem(null)}>Close</Button>
          </div>
        </div>
      </div>
    );
  };

  // --- Main render ---
  return (
    <div className="grid gap-6">
      <PageHeader
        title={config.title}
        text={config.text}
        action={<Button onClick={() => setShowCreateModal(true)}>Create {config.title.slice(0, -1)}</Button>}
      />

      {/* Modals */}
      {showCreateModal && renderFormModal(false)}
      {showEditModal && renderFormModal(true)}
      {showDetailModal && renderDetailModal()}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Project / Task</th>
              <th className="p-4">Status</th>
              <th className="p-4">Submitter</th>
              <th className="p-4">Updated</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-4 font-semibold text-slate-900 dark:text-white">
                  <button
                    onClick={() => { setViewingItem(item); setShowDetailModal(true); }}
                    className="hover:text-sky-600 dark:hover:text-sky-400"
                  >
                    {item.title || item.description}
                  </button>
                </td>
                <td className="p-4">
                  {item.project?.name || item.task?.title || item.team?.name || '—'}
                </td>
                <td className="p-4">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">{item.status}</span>
                </td>
                <td className="p-4">
                  {item[config.creatorField]?.name || '—'}
                </td>
                <td className="p-4">{new Date(item.updatedAt || item.submissionDate).toLocaleDateString()}</td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => { setViewingItem(item); setShowDetailModal(true); }}
                      className="text-slate-400 hover:text-sky-600 dark:hover:text-sky-400"
                      title="View details"
                    >
                      <FiEye size={16} />
                    </button>
                    {canModify(item) && (
                      <>
                        <button
                          onClick={() => openEdit(item)}
                          className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && (
          <p className="p-10 text-center text-slate-500">No {config.title.toLowerCase()} yet.</p>
        )}
      </div>
    </div>
  );
}