import React, { useState, useRef } from 'react';
import DesktopSidebar from '../components/layout/DesktopSidebar';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import FloatingAIChat from '../components/common/FloatingAIChat';
import ReportExplainerModal from '../components/healthcare/ReportExplainerModal';
import { useHealthData } from '../context/HealthDataContext';
import { useLanguage } from '../context/LanguageContext';
import { Clock, FileText, Upload, Sparkles, Eye, Plus, ShieldCheck, CheckCircle, Info } from 'lucide-react';
import { googleDriveService } from '../services/googleDriveService';

const HealthTimelinePage = () => {
  const { healthRecords, addHealthRecord, updateHealthRecord } = useHealthData();
  const { t } = useLanguage();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReportForAnalysis, setSelectedReportForAnalysis] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDoctor, setNewDoctor] = useState('');
  const [newType, setNewType] = useState('Lab Report');
  const [rawTextNotes, setRawTextNotes] = useState('');
  const [selectedFileObj, setSelectedFileObj] = useState(null);
  const [extractedFileText, setExtractedFileText] = useState('');
  const [isBinaryFile, setIsBinaryFile] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileObj(file);
    if (!newTitle) {
      setNewTitle(file.name.replace(/\.[^/.]+$/, ""));
    }

    // Attempt text extraction for readable text formats
    if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.json') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result || '';
        setExtractedFileText(text);
        setIsBinaryFile(false);
      };
      reader.readAsText(file);
    } else {
      // Binary file (PDF, PNG, JPG, DOCX) without built-in browser OCR
      setExtractedFileText('');
      setIsBinaryFile(true);
    }
  };

  const handleUpload = (e) => {
    e?.preventDefault();
    if (!newTitle.trim()) return;

    const fullRawContent = rawTextNotes.trim() || extractedFileText.trim();
    const hasUnextractable = isBinaryFile && !fullRawContent;

    addHealthRecord({
      title: newTitle.trim(),
      doctor: newDoctor.trim() || 'Uploaded Document',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      type: newType,
      status: hasUnextractable ? 'Content Unextractable' : 'Uploaded',
      fileUrl: '#',
      fileName: selectedFileObj?.name || 'document.pdf',
      rawReportData: fullRawContent,
      hasUnextractableContent: hasUnextractable
    });

    setNewTitle('');
    setNewDoctor('');
    setNewType('Lab Report');
    setRawTextNotes('');
    setSelectedFileObj(null);
    setExtractedFileText('');
    setIsBinaryFile(false);
    setShowUploadModal(false);
  };

  const handleSaveAnalysis = (recordId, analysisObj) => {
    if (updateHealthRecord) {
      updateHealthRecord(recordId, { cachedAnalysis: analysisObj });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans pb-20 lg:pb-0">
      <DesktopSidebar />

      <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Health Vault</span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
                NariCare Digital Vault
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {t('timeline.title', 'Digital Health Records & Timeline')}
            </h1>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center space-x-2 self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>{t('timeline.uploadButton', 'Upload Health Record')}</span>
          </button>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-slate-900">{t('timeline.uploadButton', 'Upload Health Record')}</h3>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Complete Blood Count (CBC) Report"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prescribing Doctor / Lab</label>
                  <input
                    type="text"
                    value={newDoctor}
                    onChange={(e) => setNewDoctor(e.target.value)}
                    placeholder="e.g. Apollo Diagnostics"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Record Category</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium"
                  >
                    <option>Lab Report</option>
                    <option>Prescription</option>
                    <option>Ultrasound Scan</option>
                    <option>Vaccination Certificate</option>
                  </select>
                </div>

                {/* File Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select File from Computer</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.csv"
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                  />
                  {selectedFileObj && (
                    <p className="text-[11px] text-teal-700 font-semibold mt-1 flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Selected: {selectedFileObj.name}</span>
                    </p>
                  )}
                  {isBinaryFile && !rawTextNotes && (
                    <p className="text-[11px] text-amber-700 font-medium mt-1">
                      ℹ️ Binary file detected. Enter text results below to enable AI interpretation.
                    </p>
                  )}
                </div>

                {/* Raw Report Parameters / Text Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Report Test Results / Notes (Optional)</label>
                  <textarea
                    rows={3}
                    value={rawTextNotes}
                    onChange={(e) => setRawTextNotes(e.target.value)}
                    placeholder="Enter or paste test parameters (e.g. Hemoglobin: 11.5 g/dL, TSH: 5.2 mIU/L)..."
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2.5 rounded-xl border text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Health Records Timeline */}
        <div className="space-y-4">
          {healthRecords.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto font-bold">
                📄
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">No Health Records Saved Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload your lab reports, prescriptions, or medical documents above to store them securely for your account.
              </p>
            </div>
          ) : (
            healthRecords.map((rec) => (
              <div
                key={rec.id}
                className={`bg-white rounded-3xl p-6 border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all ${
                  rec.isDemo ? 'border-purple-200 bg-gradient-to-r from-white to-purple-50/30' : 'border-slate-200/80'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                    rec.isDemo ? 'bg-purple-600 text-yellow-300' : 'bg-purple-100 text-purple-700'
                  }`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      {rec.isDemo && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                          Verified Health Record
                        </span>
                      )}
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {rec.type}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{rec.date}</span>
                      {rec.cachedAnalysis && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                          AI Saved
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base">{rec.title}</h3>
                    <p className="text-xs text-slate-500">{rec.doctor}</p>
                    {rec.description && (
                      <p className="text-xs text-slate-600 mt-1 italic">{rec.description}</p>
                    )}

                    {/* Direct Test Results & Recorded Values (BEFORE AI Analysis) */}
                    {rec.sampleValues && rec.sampleValues.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                          Recorded Report Values:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {rec.sampleValues.map((val, idx) => (
                            <div
                              key={idx}
                              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                                val.status === 'LOW'
                                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                  : val.status === 'HIGH'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}
                            >
                              <span className="font-bold">{val.parameter}:</span>
                              <span className="font-black text-slate-900">{val.value}</span>
                              <span className="text-[10px] text-slate-500 font-normal">({val.reference})</span>
                              {val.status !== 'NORMAL' && (
                                <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                                  val.status === 'LOW' ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                                }`}>
                                  {val.status}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!rec.sampleValues && rec.rawReportData && (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono">
                        <span className="font-bold text-slate-900 block mb-0.5">Recorded Notes / Parameters:</span>
                        <p className="line-clamp-2">{rec.rawReportData}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => setSelectedReportForAnalysis(rec)}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                    <span>Explain Report with NariCare AI</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* AI Report Explainer Modal */}
      <ReportExplainerModal
        isOpen={!!selectedReportForAnalysis}
        onClose={() => setSelectedReportForAnalysis(null)}
        reportRecord={selectedReportForAnalysis}
        onSaveAnalysis={handleSaveAnalysis}
      />

      <MobileBottomNav />
      <FloatingAIChat />
    </div>
  );
};

export default HealthTimelinePage;
