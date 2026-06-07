import { useForm } from 'react-hook-form';
import { caseApi } from '../../api/caseApi';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FilePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function NewCase() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onSubmit = async (data) => {
    try {
      const res = await caseApi.create(data);
      toast.success(`Case ${res.data.case_number} created!`);
      navigate(`/cases/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create case');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-primary-700 transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-primary-900">{t('registerCase')}</h1>
          <p className="text-gray-500 text-sm">Enter FIR details to create a new case</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">

        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-2 border-b">{t('firDetails')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('firNo')}</label>
              <input {...register('fir_number')}
                placeholder="e.g. FIR/2026/001"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('policeStation')}</label>
              <input {...register('station')}
                placeholder="e.g. Navrangpura PS"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-2 border-b">{t('incidentDetails')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('incidentDate')} <span className="text-red-500">*</span></label>
              <input {...register('incident_date', { required: 'Date is required' })} type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              {errors.incident_date && <p className="text-red-500 text-xs mt-1">{errors.incident_date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('incidentTime')}</label>
              <input {...register('incident_time')} type="time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('incidentLocation')} <span className="text-red-500">*</span></label>
            <input {...register('incident_location', { required: 'Location is required' })}
              placeholder="e.g. Near Paldi Cross Roads, Ahmedabad"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            {errors.incident_location && <p className="text-red-500 text-xs mt-1">{errors.incident_location.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('incidentDescription')} <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-2">(used for AI legal section suggestions)</span>
            </label>
            <textarea {...register('incident_description', { required: 'Description is required', minLength: { value: 30, message: 'Please provide more detail (min 30 chars)' } })}
              rows={5}
              placeholder="Describe the incident in detail — what happened, how, weapons used, injuries, property involved..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            {errors.incident_description && <p className="text-red-500 text-xs mt-1">{errors.incident_description.message}</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/')}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition font-medium">
            {t('cancel')}
          </button>
          <button type="submit" disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition font-medium disabled:opacity-60">
            <FilePlus className="w-5 h-5" />
            {isSubmitting ? 'Creating...' : t('createCase')}
          </button>
        </div>
      </form>
    </div>
  );
}