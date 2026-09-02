import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, FileText, AlertTriangle, CheckCircle, Stethoscope, Bell, Calendar, ShieldCheck, Info } from 'lucide-react';
import { analyzeMedicalReport } from '../../services/reportExplainerService.js';
import { useLanguage } from '../../context/LanguageContext';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';

const ReportExplainerModal = ({ isOpen, onClose, reportRecord, onSaveAnalysis }) => {
  const { currentLang } = useLanguage();
  const { addReminder } = useHealthData();
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [reminderAdded, setReminderAdded] = useState(false);
  const [reminderDeclined, setReminderDeclined] = useState(false);
  const requestedRef = useRef({});

  useEffect(() => {
    if (!isOpen || !reportRecord) {
      setAnalysis(null);
      setIsAnalyzing(false);
      setReminderAdded(false);
      setReminderDeclined(false);
      return;
    }

    // Reset reminder state per open modal
    setReminderAdded(false);
    setReminderDeclined(false);

    // Always fetch fresh real-time AI analysis from Ollama model
    setIsAnalyzing(true);

    analyzeMedicalReport(reportRecord.title, reportRecord.doctor, currentLang, user, reportRecord).then((res) => {
      setAnalysis(res);
      setIsAnalyzing(false);
      if (onSaveAnalysis && res && !res.error) {
        onSaveAnalysis(reportRecord.id, res);
      }
    }).catch(err => {
      console.error('Report AI error:', err);
      setIsAnalyzing(false);
      setAnalysis({
        error: true,
        summary: "⚠️ MahilaCare AI is temporarily unavailable. Please try again shortly.",
        disclaimer: "⚠️ MahilaCare AI is temporarily unavailable."
      });
    });
  }, [isOpen, reportRecord, currentLang]);

  if (!isOpen) return null;

  const handleAddReminderConfirm = () => {
    if (addReminder && reportRecord) {
      addReminder({
        title: `Follow-up Consultation: ${reportRecord.title}`,
        time: 'In 1 Week',
        type: 'appointment',
        completed: false,
        repeat: 'Once'
      });
      setReminderAdded(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4 shrink-0 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-teal-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">MahilaCare AI Report Breakdown</h3>
            <p className="text-xs text-purple-700 font-semibold truncate max-w-md">
              MahilaCare AI Clinical Analysis • {reportRecord?.title || 'Report'}
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-5">
          {/* Always Display Original Recorded Values BEFORE / INDEPENDENT of AI */}
          {reportRecord?.sampleValues && reportRecord.sampleValues.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Original Report Measured Values (Source Data)
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Fixed Sample Data
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {reportRecord.sampleValues.map((val, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{val.parameter}</span>
                      <span className="text-[10px] text-slate-500">Ref: {val.reference}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 block">{val.value}</span>
                      <span className={`text-[10px] font-bold ${
                        val.status === 'LOW' ? 'text-rose-600' : val.status === 'HIGH' ? 'text-amber-600' : 'text-teal-700'
                      }`}>
                        {val.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isAnalyzing ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-extrabold text-purple-900">
                MahilaCare AI is analyzing report parameters and generating personalized breakdown...
              </p>
            </div>
          ) : analysis?.unextractableContent ? (
            /* Unextractable Binary Document Message */
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-sm">
                  <Info className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Document Stored in Vault • Content Unextractable</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  {analysis.summary}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider">How to get an AI breakdown for this document:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Edit this record to include the test parameters or notes text.</li>
                  <li>Or try uploading a plain text file summary.</li>
                </ul>
              </div>

              <div className="text-[11px] text-slate-400 font-medium italic border-t border-slate-100 pt-3">
                {analysis.disclaimer}
              </div>
            </div>
          ) : analysis ? (
            <div className="space-y-5 text-slate-800 animate-fade-in text-xs sm:text-sm">
              {/* Overall Status Banner */}
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5 text-purple-600 shrink-0" />
                  <span className="font-extrabold text-purple-900 text-sm">{analysis.overallStatus}</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-200 text-purple-950 text-[11px] font-extrabold">
                  MahilaCare AI Verified
                </span>
              </div>

              {/* Section 1: AI Report Summary & Plain Explanation */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  1. Report Summary & Plain-Language Explanation
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 leading-relaxed text-slate-800 font-medium space-y-2 whitespace-pre-line">
                  <p>{analysis.summary}</p>
                  {analysis.plainExplanation && analysis.plainExplanation !== analysis.summary && (
                    <p className="text-slate-600 text-xs border-t border-slate-200/60 pt-2 mt-2">
                      <strong>Plain Language Meaning:</strong> {analysis.plainExplanation}
                    </p>
                  )}
                </div>
              </div>

              {/* Section 2: Key Findings & Extracted Report Values */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  2. Key Findings & Measured Values
                </h4>

                {/* Key Bullet Points */}
                {analysis.keyFindings && analysis.keyFindings.length > 0 && (
                  <ul className="space-y-1.5 mb-3">
                    {analysis.keyFindings.map((finding, idx) => (
                      <li key={idx} className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-purple-950 font-medium leading-relaxed">
                        • {finding}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Structured Extracted Parameters Table */}
                {analysis.extractedValues && analysis.extractedValues.length > 0 && (
                  <div className="space-y-2">
                    {analysis.extractedValues.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                          item.status === 'LOW' || item.status === 'HIGH'
                            ? 'bg-rose-50/70 border-rose-200 text-rose-950 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm text-slate-900">{item.parameter}</div>
                          <div className="text-[11px] text-slate-500">Ref Range: {item.reference || 'Standard'}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-sm">{item.value}</div>
                          <div className={`text-[10px] font-bold ${
                            item.status === 'LOW' ? 'text-rose-600' : item.status === 'HIGH' ? 'text-amber-600' : 'text-teal-700'
                          }`}>
                            {item.alert || item.status || 'NORMAL'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: General Precautions & Self-Care */}
              {analysis.generalPrecautions && analysis.generalPrecautions.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    3. General Precautions & Care
                  </h4>
                  <ul className="space-y-1.5">
                    {analysis.generalPrecautions.map((item, idx) => (
                      <li key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Section 4: Recommended 2-3 Actionable Next Steps */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  4. Recommended Next Steps (Actionable Checklist)
                </h4>
                <ul className="space-y-2 text-xs">
                  {analysis.nextSteps?.slice(0, 3).map((adv, idx) => (
                    <li key={idx} className="flex items-start space-x-2 bg-teal-50/60 p-3 rounded-xl border border-teal-100 font-medium text-teal-950">
                      <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 5: When to Seek Medical Evaluation */}
              {analysis.whenToSeekCare && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                  <strong>When Professional Medical Evaluation Should Be Considered:</strong>
                  <p className="mt-1 text-amber-800">{analysis.whenToSeekCare}</p>
                </div>
              )}

              {/* Section 6: Interactive Follow-up Reminder Prompt */}
              {analysis.suggestsFollowup && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-teal-50 border border-purple-200 space-y-3">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Follow-Up Consultation Suggestion</h5>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Would you like to schedule a follow-up reminder in your MahilaCare Health Timeline?
                      </p>
                    </div>
                  </div>

                  {reminderAdded ? (
                    <div className="flex items-center space-x-2 text-xs font-bold text-teal-700 bg-teal-100/80 p-2.5 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span>Follow-up reminder successfully added to your timeline!</span>
                    </div>
                  ) : reminderDeclined ? (
                    <div className="text-xs font-medium text-slate-500 italic">
                      Reminder prompt declined.
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 pt-1">
                      <button
                        onClick={handleAddReminderConfirm}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Add Follow-Up Reminder</span>
                      </button>
                      <button
                        onClick={() => setReminderDeclined(true)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Section 7: Medical Disclaimer */}
              <div className="text-[11px] text-slate-400 font-medium italic border-t border-slate-100 pt-3">
                {analysis.disclaimer || "⚠️ MahilaCare AI provides health education, not medical diagnosis."}
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-md hover:bg-slate-800 transition-colors"
          >
            Close Report Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportExplainerModal;
