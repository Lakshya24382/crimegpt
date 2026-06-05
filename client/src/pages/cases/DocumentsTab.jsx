import { useState } from 'react';
import { caseApi } from '../../api/caseApi';
import { FileText, Download, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const DOCUMENTS = [
  { key: 'CHARGESHEET', label: 'Purvani Chargesheet', desc: 'Preliminary charge sheet with FIR, accused, and sections' },
  { key: 'REMAND_REQUEST', label: 'Remand Request Letter', desc: 'Police custody remand application for court' },
  { key: 'SEIZURE_RECEIPT', label: 'Seizure Receipt', desc: 'Panchanama of all seized items and evidence' },
  { key: 'MEDICAL_LETTER', label: 'Medical Treatment Letter', desc: 'Letter to hospital for medical examination' },
  { key: 'COURT_CUSTODY', label: 'Court Custody Letter', desc: 'Letter for producing accused before magistrate' },
  { key: 'ACCUSED_PANCHANAMA', label: 'Accused Panchanama', desc: 'Physical description and arrest details of accused' },
  { key: 'FACE_IDENTIFICATION', label: 'Face Identification Form', desc: 'Physical features form for accused identification' },
];

export default function DocumentsTab({ caseId }) {
  const [loading, setLoading] = useState({});
  const [preview, setPreview] = useState(null);

  const generate = async (docType) => {
    setLoading(l => ({ ...l, [docType]: true }));
    try {
      const res = await caseApi.generateDocument(caseId, docType);
      setPreview(res.data);
      toast.success(`${res.data.docType} generated`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(l => ({ ...l, [docType]: false }));
    }
  };

  const download = () => {
    if (!preview) return;
    const blob = new Blob([preview.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${preview.caseNumber}_${preview.docType}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Document Cards */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700 mb-2">Select Document to Generate</h2>
        {DOCUMENTS.map(doc => (
          <div key={doc.key}
            onClick={() => generate(doc.key)}
            className={`bg-white border rounded-xl p-4 cursor-pointer transition hover:border-primary-400 hover:shadow-md ${
              preview?.docType === doc.key ? 'border-primary-500 shadow-md' : 'border-gray-100'
            }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{doc.label}</p>
                  <p className="text-xs text-gray-400">{doc.desc}</p>
                </div>
              </div>
              {loading[doc.key]
                ? <Loader className="w-4 h-4 text-primary-500 animate-spin" />
                : <span className="text-xs text-primary-600 font-medium">Generate →</span>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Preview Panel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700 text-sm">
            {preview ? preview.docType.replace(/_/g, ' ') : 'Document Preview'}
          </h2>
          {preview && (
            <button onClick={download}
              className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs px-3 py-1.5 rounded-lg transition">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          )}
        </div>
        <div className="flex-1 p-4 overflow-auto">
          {preview
            ? <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">{preview.content}</pre>
            : <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                <FileText className="w-12 h-12 mb-3" />
                <p className="text-sm">Click a document to preview it here</p>
              </div>
          }
        </div>
      </div>
    </div>
  );
}