import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { caseApi } from '../../api/caseApi';
import { useForm } from 'react-hook-form';
import Badge from '../../components/ui/Badge';
import DocumentsTab from './DocumentsTab';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import {
  ArrowLeft, User, Package, Scale, BookOpen,
  Plus, Trash2, Calendar, MapPin, FileText, Brain
} from 'lucide-react';

const TABS = ['Overview', 'Persons', 'Evidence', 'Legal Sections', 'Documents', 'Case Diary'];

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);

  const fetchCase = () => {
    caseApi.getById(id)
      .then(res => setCaseData(res.data))
      .catch(() => toast.error('Failed to load case'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCase(); }, [id]);

  if (loading) return <Spinner />;
  if (!caseData) return <div className="text-red-500">Case not found</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-primary-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-primary-900">{caseData.case_number}</h1>
            <Badge label={caseData.status} />
          </div>
          <p className="text-gray-500 text-sm mt-1">FIR: {caseData.fir_number || '—'} · {caseData.station || '—'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && <OverviewTab caseData={caseData} />}
      {activeTab === 'Persons' && <PersonsTab caseData={caseData} caseId={id} onRefresh={fetchCase} showForm={showPersonForm} setShowForm={setShowPersonForm} />}
      {activeTab === 'Evidence' && <EvidenceTab caseData={caseData} caseId={id} onRefresh={fetchCase} showForm={showEvidenceForm} setShowForm={setShowEvidenceForm} />}
      {activeTab === 'Legal Sections' && <SectionsTab caseData={caseData} caseId={id} onRefresh={fetchCase} />}
      {activeTab === 'Documents' && <DocumentsTab caseId={id} />}
      {activeTab === 'Case Diary' && <DiaryTab diary={caseData.diary} />}
    </div>
  );
}

// ── OVERVIEW TAB ────────────────────────────────────────────
function OverviewTab({ caseData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Case Information
        </h3>
        <dl className="space-y-3 text-sm">
          {[
            ['Case Number', caseData.case_number],
            ['FIR Number', caseData.fir_number || '—'],
            ['Station', caseData.station || '—'],
            ['Assigned Officer', caseData.officer_name || '—'],
            ['Status', <Badge label={caseData.status} />],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-gray-500 font-medium">{k}</dt>
              <dd className="text-gray-800">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Incident Details
        </h3>
        <dl className="space-y-3 text-sm">
          {[
            ['Date', caseData.incident_date ? new Date(caseData.incident_date).toLocaleDateString('en-IN') : '—'],
            ['Time', caseData.incident_time || '—'],
            ['Location', caseData.incident_location || '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-gray-500 font-medium">{k}</dt>
              <dd className="text-gray-800">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:col-span-2">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Incident Description
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {caseData.incident_description || 'No description provided.'}
        </p>
      </div>

      {/* Quick stats */}
      <div className="md:col-span-2 grid grid-cols-3 gap-4">
        {[
          { label: 'Persons', value: caseData.persons?.length || 0, icon: <User className="w-5 h-5" />, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Evidence Items', value: caseData.evidence?.length || 0, icon: <Package className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50' },
          { label: 'Legal Sections', value: caseData.sections?.length || 0, icon: <Scale className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 flex items-center gap-4 ${s.color}`}>
            {s.icon}
            <div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs font-medium">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PERSONS TAB ─────────────────────────────────────────────
function PersonsTab({ caseData, caseId, onRefresh, showForm, setShowForm }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await caseApi.addPerson(caseId, data);
      toast.success('Person added');
      reset();
      setShowForm(false);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add person');
    }
  };

  const roleColors = { VICTIM: 'bg-blue-100 text-blue-800', ACCUSED: 'bg-red-100 text-red-800', WITNESS: 'bg-green-100 text-green-800' };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700">Persons ({caseData.persons?.length || 0})</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition">
          <Plus className="w-4 h-4" /> Add Person
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">New Person</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role *</label>
              <select {...register('role', { required: true })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="VICTIM">Victim</option>
                <option value="ACCUSED">Accused</option>
                <option value="WITNESS">Witness</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input {...register('name', { required: true })} placeholder="Full name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Father's Name</label>
              <input {...register('father_name')} placeholder="Father's name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Age</label>
              <input {...register('age')} type="number" placeholder="Age"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
              <select {...register('gender')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mobile</label>
              <input {...register('mobile')} placeholder="Mobile number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
              <input {...register('address')} placeholder="Full address"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ID Proof Type</label>
              <select {...register('id_proof_type')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Select</option>
                <option value="Aadhaar">Aadhaar</option>
                <option value="PAN">PAN Card</option>
                <option value="Passport">Passport</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Driving License">Driving License</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ID Proof Number</label>
              <input {...register('id_proof_number')} placeholder="ID number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Physical Description</label>
              <input {...register('physical_description')} placeholder="Height, build, marks, complexion..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={() => { setShowForm(false); reset(); }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={isSubmitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition disabled:opacity-60">
              {isSubmitting ? 'Saving...' : 'Save Person'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {caseData.persons?.length === 0 && (
          <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-100">
            <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No persons added yet</p>
          </div>
        )}
        {caseData.persons?.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">{p.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${roleColors[p.role]}`}>{p.role}</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {[p.father_name && `S/o ${p.father_name}`, p.age && `Age: ${p.age}`, p.gender].filter(Boolean).join(' · ')}
                </p>
                <p className="text-sm text-gray-500">{p.address || ''}</p>
                {p.mobile && <p className="text-xs text-gray-400 mt-0.5">📞 {p.mobile}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── EVIDENCE TAB ─────────────────────────────────────────────
function EvidenceTab({ caseData, caseId, onRefresh, showForm, setShowForm }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await caseApi.addEvidence(caseId, data);
      toast.success('Evidence added');
      reset();
      setShowForm(false);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add evidence');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700">Evidence / Seized Items ({caseData.evidence?.length || 0})</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition">
          <Plus className="w-4 h-4" /> Add Evidence
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">New Evidence Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Item Description *</label>
              <input {...register('item_description', { required: true })} placeholder="e.g. One black mobile phone Samsung Galaxy"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
              <input {...register('quantity')} placeholder="e.g. 1 piece"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Muddemal Number</label>
              <input {...register('muddemal_number')} placeholder="e.g. MUD/2026/001"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Seized From (Person)</label>
              <input {...register('seized_from')} placeholder="Name of person"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Seizure Date</label>
              <input {...register('seized_date')} type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Seizure Location</label>
              <input {...register('seized_at')} placeholder="Where was it seized from"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={() => { setShowForm(false); reset(); }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={isSubmitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition disabled:opacity-60">
              {isSubmitting ? 'Saving...' : 'Save Evidence'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {caseData.evidence?.length === 0 && (
          <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-100">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No evidence added yet</p>
          </div>
        )}
        {caseData.evidence?.map((e, i) => (
          <div key={e.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-sm">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{e.item_description}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {[e.quantity && `Qty: ${e.quantity}`, e.muddemal_number && `Muddemal: ${e.muddemal_number}`].filter(Boolean).join(' · ')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {[e.seized_from && `From: ${e.seized_from}`, e.seized_at && `At: ${e.seized_at}`].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── LEGAL SECTIONS TAB ───────────────────────────────────────
function SectionsTab({ caseData, caseId, onRefresh }) {
  const [aiLoading, setAiLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const getSuggestions = async () => {
    if (!caseData.incident_description) {
      return toast.error('Please add an incident description first');
    }
    setAiLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/ai/suggest-sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          caseId,
          description: caseData.incident_description,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success(`${data.added} sections suggested by AI`);
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'AI suggestion failed');
    } finally {
      setAiLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await caseApi.addSection(caseId, data);
      toast.success('Section added');
      reset();
      onRefresh();
    } catch (err) {
      toast.error('Failed to add section');
    }
  };

  const handleDelete = async (sectionId) => {
    try {
      await caseApi.deleteSection(caseId, sectionId);
      toast.success('Section removed');
      onRefresh();
    } catch {
      toast.error('Failed to remove section');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700">Legal Sections ({caseData.sections?.length || 0})</h2>
        <button onClick={getSuggestions} disabled={aiLoading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-60">
          <Brain className="w-4 h-4" />
          {aiLoading ? 'Analysing...' : 'AI Suggest Sections'}
        </button>
      </div>

      {/* Manual add form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-xl p-4 mb-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Add Section Manually</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Act</label>
            <select {...register('act', { required: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="BNS">BNS</option>
              <option value="BNSS">BNSS</option>
              <option value="BSA">BSA</option>
              <option value="IPC">IPC</option>
              <option value="CRPC">CrPC</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Section No.</label>
            <input {...register('section_number', { required: true })} placeholder="e.g. 103"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Section Title</label>
            <input {...register('section_title')} placeholder="e.g. Murder"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <button type="submit" disabled={isSubmitting}
          className="mt-3 px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition disabled:opacity-60">
          {isSubmitting ? 'Adding...' : 'Add Section'}
        </button>
      </form>

      {/* Sections list */}
      <div className="space-y-3">
        {caseData.sections?.length === 0 && (
          <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-100">
            <Scale className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No sections added yet. Use AI Suggest or add manually.</p>
          </div>
        )}
        {caseData.sections?.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded">{s.act}</span>
                <span className="font-semibold text-gray-800">Section {s.section_number}</span>
                {s.ai_suggested && (
                  <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Brain className="w-3 h-3" /> AI
                  </span>
                )}
              </div>
              {s.section_title && <p className="text-sm text-gray-600 mt-1">{s.section_title}</p>}
              {s.description && <p className="text-xs text-gray-400 mt-1">{s.description}</p>}
            </div>
            <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-600 transition ml-4">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CASE DIARY TAB ───────────────────────────────────────────
function DiaryTab({ diary }) {
  return (
    <div>
      <h2 className="font-semibold text-gray-700 mb-4">Case Diary ({diary?.length || 0} entries)</h2>
      {diary?.length === 0 && (
        <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-100">
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>No diary entries yet</p>
        </div>
      )}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div className="space-y-4">
          {diary?.map((entry, i) => (
            <div key={entry.id} className="relative pl-10">
              <div className="absolute left-2.5 w-3 h-3 rounded-full bg-primary-500 border-2 border-white shadow" />
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
                    {entry.entry_type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(entry.entry_date).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{entry.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}