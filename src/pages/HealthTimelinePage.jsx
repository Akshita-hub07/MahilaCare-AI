import React, { useState, useRef } from 'react';
import DesktopSidebar from '../components/layout/DesktopSidebar';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import FloatingAIChat from '../components/common/FloatingAIChat';
import ReportExplainerModal from '../components/healthcare/ReportExplainerModal';
import { useHealthData } from '../context/HealthDataContext';
import { useLanguage } from '../context/LanguageContext';
import { Clock, FileText, Upload, Sparkles, Eye, Plus, ShieldCheck, CheckCircle, Info, Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import { googleDriveService } from '../services/googleDriveService';
import { extractTextFromFile, generateWordDocumentBlob } from '../utils/documentExtractor';

const HealthTimelinePage = () => {
  const { healthRecords, addHealthRecord, updateHealthRecord, deleteHealthRecord } = useHealthData();
  const { t } = useLanguage();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReportForAnalysis, setSelectedReportForAnalysis] = useState(null);
  const [previewRecord, setPreviewRecord] = useState(null);
  const [previewTab, setPreviewTab] = useState('word');
  const [recordToDelete, setRecordToDelete] = useState(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDoctor, setNewDoctor] = useState('');
  const [newType, setNewType] = useState('Lab Report');
  const [rawTextNotes, setRawTextNotes] = useState('');
  const [selectedFileObj, setSelectedFileObj] = useState(null);
  const [fileObjectUrl, setFileObjectUrl] = useState('');
  const [fileTypeStr, setFileTypeStr] = useState('');
  const [extractedFileText, setExtractedFileText] = useState('');
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [extractionErrorMessage, setExtractionErrorMessage] = useState('');
  const [isBinaryFile, setIsBinaryFile] = useState(false);

  const fileInputRef = useRef(null);
  const [activeUploadTargetRecord, setActiveUploadTargetRecord] = useState(null);
  const appointmentFileInputRef = useRef(null);

  const handleAppointmentFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadTargetRecord) return;

    const blobUrl = URL.createObjectURL(file);
    setIsExtractingText(true);

    const res = await extractTextFromFile(file);
    setIsExtractingText(false);

    const extractedText = res.success ? res.text : '';

    if (updateHealthRecord) {
      updateHealthRecord(activeUploadTargetRecord.id, {
        fileName: file.name,
        fileUrl: blobUrl,
        fileObjectUrl: blobUrl,
        fileTypeStr: file.type || '',
        rawReportData: extractedText || `Attached medical report file: ${file.name}`,
        status: 'Report Attached',
        hasUnextractableContent: !res.success
      });
    }

    setActiveUploadTargetRecord(null);
    if (appointmentFileInputRef.current) {
      appointmentFileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileObj(file);
    const blobUrl = URL.createObjectURL(file);
    setFileObjectUrl(blobUrl);
    setFileTypeStr(file.type || '');

    if (!newTitle) {
      setNewTitle(file.name.replace(/\.[^/.]+$/, ""));
    }

    setIsExtractingText(true);
    setExtractionErrorMessage('');
    setExtractedFileText('');

    const res = await extractTextFromFile(file);
    setIsExtractingText(false);

    if (res.success && res.text) {
      setExtractedFileText(res.text);
      setIsBinaryFile(false);
      setExtractionErrorMessage('');
    } else {
      setExtractedFileText('');
      setIsBinaryFile(true);
      setExtractionErrorMessage(res.userMessage || 'NariCare AI could not extract readable text from this file. Please enter test parameters directly below.');
    }
  };

  const handleUpload = (e) => {
    e?.preventDefault();
    if (!newTitle.trim()) return;

    const fullRawContent = rawTextNotes.trim() || extractedFileText.trim();
    const hasUnextractable = !fullRawContent;

    const wordBlob = generateWordDocumentBlob(newTitle.trim(), fullRawContent, []);
    const wordBlobUrl = URL.createObjectURL(wordBlob);

    addHealthRecord({
      title: newTitle.trim(),
      doctor: newDoctor.trim() || 'Uploaded Document',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      type: newType,
      status: hasUnextractable ? 'Content Unextractable' : 'Uploaded',
      fileUrl: fileObjectUrl || '#',
      fileObjectUrl: fileObjectUrl || '',
      convertedWordUrl: wordBlobUrl,
      fileTypeStr: fileTypeStr || selectedFileObj?.type || '',
      fileName: selectedFileObj?.name || 'document.pdf',
      rawReportData: fullRawContent,
      hasUnextractableContent: hasUnextractable
    });

    setNewTitle('');
    setNewDoctor('');
    setNewType('Lab Report');
    setRawTextNotes('');
    setSelectedFileObj(null);
    setFileObjectUrl('');
    setFileTypeStr('');
    setExtractedFileText('');
    setIsBinaryFile(false);
    setExtractionErrorMessage('');
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
                  {isExtractingText && (
                    <p className="text-[11px] text-purple-700 font-semibold mt-1 flex items-center space-x-1 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Converting document & extracting text/OCR...</span>
                    </p>
                  )}
                  {selectedFileObj && !isExtractingText && extractedFileText && (
                    <p className="text-[11px] text-teal-700 font-semibold mt-1 flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Extracted text from {selectedFileObj.name} ({extractedFileText.length} chars)</span>
                    </p>
                  )}
                  {extractionErrorMessage && !isExtractingText && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium mt-1 flex items-start gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{extractionErrorMessage}</span>
                    </div>
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
                    disabled={isExtractingText}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md disabled:opacity-50"
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

                    {/* Direct Test Results & Recorded Values */}
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

                    {/* Attached Report File Badge */}
                    {rec.fileName && (
                      <div className="mt-2.5 p-2 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1.5 truncate">
                          <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          Attached Report: {rec.fileName}
                        </span>
                        <span className="text-[10px] bg-teal-200 text-teal-900 px-2 py-0.5 rounded font-black shrink-0">Ready for AI</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto shrink-0">
                  {/* Upload / Attach Report for Doctor Appointment / Record */}
                  <button
                    onClick={() => {
                      setActiveUploadTargetRecord(rec);
                      appointmentFileInputRef.current?.click();
                    }}
                    className="px-3.5 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-extrabold transition-all flex items-center space-x-1.5 border border-purple-200"
                    title="Upload or Attach Report File from Desktop/System"
                  >
                    <Upload className="w-4 h-4 text-purple-600" />
                    <span>{rec.fileName ? 'Change Report' : 'Attach Report'}</span>
                  </button>

                  <button
                    onClick={() => setPreviewRecord(rec)}
                    className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center space-x-1.5"
                    title="View Original Uploaded File & Report Notes"
                  >
                    <Eye className="w-4 h-4 text-slate-600" />
                    <span>View / Preview</span>
                  </button>

                  <button
                    onClick={() => setSelectedReportForAnalysis(rec)}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                    <span>Explain Report with NariCare AI</span>
                  </button>

                  <button
                    onClick={() => setRecordToDelete(rec)}
                    className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-800 transition-colors"
                    title="Delete Health Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Hidden File Input for Doctor Appointment Report Attachment */}
        <input
          type="file"
          ref={appointmentFileInputRef}
          onChange={handleAppointmentFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.csv"
        />
      </main>

      {/* Report View / Preview Modal */}
      {previewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col space-y-4">
            <button
              onClick={() => setPreviewRecord(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                  {previewRecord.type}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{previewRecord.title}</h3>
                <p className="text-xs text-slate-500">{previewRecord.doctor} • {previewRecord.date}</p>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              {/* Original Uploaded File Preview */}
              {(previewRecord.fileObjectUrl || (previewRecord.fileUrl && previewRecord.fileUrl !== '#')) && (
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-purple-600" />
                      Original Uploaded Document: {previewRecord.fileName || 'Report Document'}
                    </span>
                    <a
                      href={previewRecord.fileObjectUrl || previewRecord.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={previewRecord.fileName || 'report_document'}
                      className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 text-[11px] font-bold hover:bg-slate-50 transition"
                    >
                      Open Original File ↗
                    </a>
                  </div>

                  {previewRecord.fileTypeStr?.startsWith('image/') ? (
                    <div className="max-h-64 overflow-auto rounded-xl bg-slate-900 p-2 text-center">
                      <img
                        src={previewRecord.fileObjectUrl || previewRecord.fileUrl}
                        alt="Original Report Document"
                        className="max-h-60 mx-auto rounded-lg object-contain"
                      />
                    </div>
                  ) : previewRecord.fileTypeStr === 'application/pdf' || previewRecord.fileName?.endsWith('.pdf') ? (
                    <iframe
                      src={previewRecord.fileObjectUrl || previewRecord.fileUrl}
                      title="PDF Document Preview"
                      className="w-full h-64 rounded-xl border border-slate-300 bg-white"
                    />
                  ) : (
                    <p className="text-xs text-slate-600 italic">
                      Original file stored safely in your health vault. Click the button above to view the original file.
                    </p>
                  )}
                </div>
              )}

              {/* Recorded Parameters */}
              {previewRecord.sampleValues && previewRecord.sampleValues.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Report Parameters & Measured Values</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {previewRecord.sampleValues.map((val, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-900 block">{val.parameter}</span>
                          <span className="text-[11px] text-slate-500">Ref: {val.reference}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-lg font-black text-xs ${
                          val.status === 'LOW' ? 'bg-rose-100 text-rose-800' : val.status === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {val.value} ({val.status})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Extracted Report Text / Source Notes */}
              {previewRecord.rawReportData && (
                <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 space-y-2 font-mono text-xs">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Extracted Report Text & Source Notes</h4>
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-300 max-h-48 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                    {previewRecord.rawReportData}
                  </pre>
                </div>
              )}

              {/* Saved AI Interpretation */}
              {previewRecord.cachedAnalysis && (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                  <div className="flex items-center space-x-2 text-purple-900 font-extrabold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Saved AI Clinical Interpretation</span>
                  </div>
                  <p className="text-xs text-purple-950 leading-relaxed">
                    {previewRecord.cachedAnalysis.summary}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setPreviewRecord(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  const target = previewRecord;
                  setPreviewRecord(null);
                  setSelectedReportForAnalysis(target);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span>Explain with NariCare AI</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-rose-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto font-bold">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete Health Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong>"{recordToDelete.title}"</strong>? This will permanently remove it from your digital health vault.
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setRecordToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteHealthRecord) {
                    deleteHealthRecord(recordToDelete.id);
                  }
                  setRecordToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
