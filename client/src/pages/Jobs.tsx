import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api, type JobApplication, type JobStatus } from '../lib/api';
import { Card, ErrorNote, Spinner, Stat } from '../components/ui';

const STATUSES: JobStatus[] = ['applied', 'screening', 'interview', 'offer', 'rejected', 'ghosted'];

const STATUS_STYLES: Record<JobStatus, string> = {
  applied: 'bg-sky-950 text-sky-300',
  screening: 'bg-violet-950 text-violet-300',
  interview: 'bg-amber-950 text-amber-300',
  offer: 'bg-green-950 text-green-300',
  rejected: 'bg-red-950 text-red-300',
  ghosted: 'bg-slate-800 text-slate-400',
};

type FormState = Omit<JobApplication, 'id'>;

const emptyForm = (): FormState => ({
  company: '',
  role: '',
  status: 'applied',
  appliedDate: new Date().toISOString().slice(0, 10),
  url: '',
  notes: '',
});

export default function Jobs() {
  const queryClient = useQueryClient();
  const jobs = useQuery({ queryKey: ['jobs'], queryFn: api.jobs });
  const stats = useQuery({ queryKey: ['job-stats'], queryFn: api.jobStats });

  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [formError, setFormError] = useState('');

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
    queryClient.invalidateQueries({ queryKey: ['job-stats'] });
  };

  const save = useMutation({
    mutationFn: () =>
      editingId === 'new' ? api.createJob(form) : api.updateJob(editingId as number, form),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      setFormError('');
    },
    onError: (err) => setFormError(err.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.deleteJob(id),
    onSuccess: invalidate,
  });

  const startEdit = (job: JobApplication) => {
    setEditingId(job.id);
    setForm({ ...job, url: job.url ?? '', notes: job.notes ?? '' });
    setFormError('');
  };

  const field = (key: keyof FormState) => ({
    value: form[key] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="space-y-6">
      <Card title="Pipeline">
        {stats.isPending && <Spinner />}
        {stats.data && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            <Stat label="Total" value={stats.data.total} />
            <Stat label="Response rate" value={`${Math.round(stats.data.responseRate * 100)}%`} />
            {STATUSES.map((s) => (
              <Stat key={s} label={s} value={stats.data.counts[s]} />
            ))}
          </div>
        )}
      </Card>

      <Card
        title="Applications"
        action={
          <button
            onClick={() => {
              setEditingId('new');
              setForm(emptyForm());
              setFormError('');
            }}
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            + Add
          </button>
        }
      >
        {editingId !== null && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
            className="mb-5 grid gap-3 rounded-lg bg-surface p-4 sm:grid-cols-2"
          >
            <input required placeholder="Company" {...field('company')} className="rounded border border-edge bg-card px-3 py-2 text-sm" />
            <input required placeholder="Role" {...field('role')} className="rounded border border-edge bg-card px-3 py-2 text-sm" />
            <select {...field('status')} className="rounded border border-edge bg-card px-3 py-2 text-sm">
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input type="date" required {...field('appliedDate')} className="rounded border border-edge bg-card px-3 py-2 text-sm" />
            <input placeholder="Job posting URL (optional)" {...field('url')} className="rounded border border-edge bg-card px-3 py-2 text-sm sm:col-span-2" />
            <textarea placeholder="Notes (optional)" rows={2} {...field('notes')} className="rounded border border-edge bg-card px-3 py-2 text-sm sm:col-span-2" />
            {formError && <div className="sm:col-span-2"><ErrorNote message={formError} /></div>}
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" disabled={save.isPending} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
                {editingId === 'new' ? 'Add application' : 'Save changes'}
              </button>
              <button type="button" onClick={() => setEditingId(null)} className="rounded-lg border border-edge px-4 py-2 text-sm hover:bg-card">
                Cancel
              </button>
            </div>
          </form>
        )}

        {jobs.isPending && <Spinner />}
        {jobs.error && <ErrorNote message={jobs.error.message} />}
        {jobs.data && jobs.data.length === 0 && (
          <p className="py-4 text-center text-sm text-ink-dim">No applications yet — add your first one above.</p>
        )}
        {jobs.data && jobs.data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-edge text-xs uppercase tracking-wider text-ink-dim">
                  <th className="py-2 pr-4">Company</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Applied</th>
                  <th className="py-2 pr-4">Notes</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {jobs.data.map((job) => (
                  <tr key={job.id} className="border-b border-edge/50">
                    <td className="py-2.5 pr-4 font-medium">
                      {job.url ? (
                        <a href={job.url} target="_blank" rel="noreferrer" className="hover:text-accent">{job.company}</a>
                      ) : (
                        job.company
                      )}
                    </td>
                    <td className="py-2.5 pr-4">{job.role}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[job.status]}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-ink-dim">{job.appliedDate}</td>
                    <td className="max-w-48 truncate py-2.5 pr-4 text-ink-dim">{job.notes}</td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      <button onClick={() => startEdit(job)} className="mr-3 text-xs text-accent hover:underline">Edit</button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${job.company} — ${job.role}?`)) remove.mutate(job.id);
                        }}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
