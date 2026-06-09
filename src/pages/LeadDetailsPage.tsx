import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import { Lead, Note, FollowUp, StatusHistory, LeadStatus } from '../types';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Calendar,
  MessageSquare,
  Bell,
  Edit2,
  Trash2,
  Clock,
  Save,
  X,
  Plus,
  CheckCircle,
  Globe,
} from 'lucide-react';

const leadStatuses: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Converted',
  'Closed',
];

const statusColors: Record<LeadStatus, string> = {
  New: 'bg-blue-100 text-blue-700',
  Contacted: 'bg-yellow-100 text-yellow-700',
  Qualified: 'bg-orange-100 text-orange-700',
  'Proposal Sent': 'bg-violet-100 text-violet-700',
  Converted: 'bg-green-100 text-green-700',
  Closed: 'bg-gray-100 text-gray-700',
};

export default function LeadDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    requirement_message: '',
  });
  const [newNote, setNewNote] = useState('');
  const [newFollowUp, setNewFollowUp] = useState({
    scheduled_date: '',
    description: '',
  });
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);

  useEffect(() => {
    if (id) fetchLeadData();
  }, [id]);

  const fetchLeadData = async () => {
    try {
      const [leadRes, notesRes, followUpsRes, historyRes] = await Promise.all([
        supabase.from('leads').select('*').eq('id', id).single(),
        supabase.from('notes').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
        supabase.from('followups').select('*').eq('lead_id', id).order('scheduled_date', { ascending: true }),
        supabase.from('status_history').select('*').eq('lead_id', id).order('changed_at', { ascending: false }),
      ]);

      if (leadRes.data) {
        setLead(leadRes.data);
        setEditForm({
          full_name: leadRes.data.full_name,
          email: leadRes.data.email,
          phone: leadRes.data.phone || '',
          company_name: leadRes.data.company_name || '',
          requirement_message: leadRes.data.requirement_message || '',
        });
      }
      if (notesRes.data) setNotes(notesRes.data);
      if (followUpsRes.data) setFollowUps(followUpsRes.data);
      if (historyRes.data) setStatusHistory(historyRes.data);
    } catch (error) {
      console.error('Error fetching lead data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLead = async () => {
    if (!lead) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          full_name: editForm.full_name,
          email: editForm.email,
          phone: editForm.phone || null,
          company_name: editForm.company_name || null,
          requirement_message: editForm.requirement_message || null,
        })
        .eq('id', lead.id);

      if (error) throw error;
      await fetchLeadData();
      setEditMode(false);
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', lead.id);

      if (error) throw error;
      await fetchLeadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAddNote = async () => {
    if (!lead || !newNote.trim()) return;

    try {
      const { error } = await supabase.from('notes').insert([
        {
          lead_id: lead.id,
          content: newNote.trim(),
        },
      ]);

      if (error) throw error;
      setNewNote('');
      setShowAddNote(false);
      await fetchLeadData();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleAddFollowUp = async () => {
    if (!lead || !newFollowUp.scheduled_date) return;

    try {
      const { error } = await supabase.from('followups').insert([
        {
          lead_id: lead.id,
          scheduled_date: newFollowUp.scheduled_date,
          description: newFollowUp.description || null,
        },
      ]);

      if (error) throw error;
      setNewFollowUp({ scheduled_date: '', description: '' });
      setShowAddFollowUp(false);
      await fetchLeadData();
    } catch (error) {
      console.error('Error adding follow-up:', error);
    }
  };

  const handleCompleteFollowUp = async (followUpId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('followups')
        .update({ completed: !completed })
        .eq('id', followUpId);

      if (error) throw error;
      await fetchLeadData();
    } catch (error) {
      console.error('Error updating follow-up:', error);
    }
  };

  const handleDeleteFollowUp = async (followUpId: string) => {
    if (!confirm('Delete this follow-up?')) return;

    try {
      const { error } = await supabase.from('followups').delete().eq('id', followUpId);

      if (error) throw error;
      await fetchLeadData();
    } catch (error) {
      console.error('Error deleting follow-up:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;

    try {
      const { error } = await supabase.from('notes').delete().eq('id', noteId);

      if (error) throw error;
      await fetchLeadData();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleDeleteLead = async () => {
    if (!lead || !confirm('Are you sure you want to delete this lead? This cannot be undone.')) return;

    try {
      const { error } = await supabase.from('leads').delete().eq('id', lead.id);

      if (error) throw error;
      navigate('/leads');
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!lead) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Lead not found</p>
          <button
            onClick={() => navigate('/leads')}
            className="mt-4 text-violet-600 hover:text-violet-700"
          >
            Back to Leads
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/leads')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{lead.full_name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[lead.status]}`}>
              {lead.status}
            </span>
          </div>
          <p className="text-gray-500 mt-1">
            Lead Details · Created {new Date(lead.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDeleteLead}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Information</h2>

            {editMode ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={editForm.company_name}
                      onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requirements
                  </label>
                  <textarea
                    value={editForm.requirement_message}
                    onChange={(e) =>
                      setEditForm({ ...editForm, requirement_message: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateLead}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-gray-900 hover:text-violet-600"
                      >
                        {lead.email}
                      </a>
                    </div>
                  </div>
                  {lead.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-gray-900 hover:text-violet-600"
                        >
                          {lead.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {lead.company_name && (
                    <div className="flex items-start gap-3">
                      <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Company</p>
                        <p className="text-gray-900">{lead.company_name}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Source</p>
                      <p className="text-gray-900">{lead.lead_source}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-gray-900">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {lead.requirement_message && !editMode && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Requirements</h3>
                <p className="text-gray-600">{lead.requirement_message}</p>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Notes ({notes.length})
              </h2>
              <button
                onClick={() => setShowAddNote(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-violet-600 hover:bg-violet-50 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add Note
              </button>
            </div>

            {showAddNote && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add your note..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setShowAddNote(false)}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 text-sm"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            )}

            {notes.length > 0 ? (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="p-4 bg-gray-50 rounded-lg group">
                    <p className="text-gray-700">{note.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-500">
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No notes yet</p>
            )}
          </div>

          {/* Follow-ups Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Follow-ups ({followUps.length})
              </h2>
              <button
                onClick={() => setShowAddFollowUp(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-violet-600 hover:bg-violet-50 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Schedule Follow-up
              </button>
            </div>

            {showAddFollowUp && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scheduled Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={newFollowUp.scheduled_date}
                      onChange={(e) =>
                        setNewFollowUp({ ...newFollowUp, scheduled_date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newFollowUp.description}
                      onChange={(e) =>
                        setNewFollowUp({ ...newFollowUp, description: e.target.value })
                      }
                      placeholder="What's this follow-up about?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => setShowAddFollowUp(false)}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddFollowUp}
                    disabled={!newFollowUp.scheduled_date}
                    className="px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 text-sm"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            )}

            {followUps.length > 0 ? (
              <div className="space-y-3">
                {followUps.map((followUp) => (
                  <div
                    key={followUp.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      followUp.completed
                        ? 'bg-green-50 border-green-200'
                        : new Date(followUp.scheduled_date) < new Date()
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => handleCompleteFollowUp(followUp.id, followUp.completed)}
                      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        followUp.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {followUp.completed && <CheckCircle className="w-4 h-4 text-white" />}
                    </button>
                    <div className="flex-1">
                      <p className={`font-medium ${followUp.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                        {followUp.description || 'Follow-up'}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(followUp.scheduled_date).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteFollowUp(followUp.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No follow-ups scheduled</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
            <div className="space-y-2">
              {leadStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                    lead.status === status
                      ? 'bg-violet-100 text-violet-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      statusColors[status]
                    }`}
                  >
                    {status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status History</h2>
            {statusHistory.length > 0 ? (
              <div className="space-y-4">
                {statusHistory.map((history, index) => (
                  <div key={history.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-violet-500" />
                      {index < statusHistory.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        {history.old_status && (
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${statusColors[history.old_status]}`}
                          >
                            {history.old_status}
                          </span>
                        )}
                        <span className="text-gray-400">→</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${statusColors[history.new_status]}`}
                        >
                          {history.new_status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(history.changed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No status changes yet</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
