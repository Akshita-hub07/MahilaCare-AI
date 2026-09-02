import React, { useState } from 'react';
import DesktopSidebar from '../components/layout/DesktopSidebar';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import FloatingAIChat from '../components/common/FloatingAIChat';
import { useHealthData } from '../context/HealthDataContext';
import { useLanguage } from '../context/LanguageContext';
import { Bell, Pill, Droplet, Calendar, Plus, CheckCircle2, Circle, Clock, Sparkles, AlertCircle, RefreshCw, X, Check, Trash2 } from 'lucide-react';

const RemindersPage = () => {
  const { reminders, addReminder, addOrUpdateReminder, rescheduleReminder, toggleReminder, deleteReminder } = useHealthData();
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:30 AM');
  const [type, setType] = useState('pill');
  const [repeat, setRepeat] = useState('Daily');
  const [notificationBanner, setNotificationBanner] = useState('');
  const [reminderToDelete, setReminderToDelete] = useState(null);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addOrUpdateReminder({
      title,
      time,
      type,
      repeat
    });

    setTitle('');
    setShowAddModal(false);
    setNotificationBanner(`Smart Reminder set for "${title}" at ${time}! Push notifications enabled.`);
  };

  const handleSnooze = (rId) => {
    setNotificationBanner(`Reminder snoozed for 15 minutes!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans pb-20 lg:pb-0">
      <DesktopSidebar />

      <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Smart Health Notifications</span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold">
                AI Pattern Learning Active 🌸
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {t('remindersPage.title', 'Smart Reminders')}
            </h1>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center space-x-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t('remindersPage.addReminder', 'Add New Reminder')}</span>
          </button>
        </div>

        {/* Notification Toast */}
        {notificationBanner && (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-600 animate-bounce" />
              <span>{notificationBanner}</span>
            </div>
            <button onClick={() => setNotificationBanner('')} className="text-purple-600 underline">Dismiss</button>
          </div>
        )}

        {/* AI Insight Box with 1-Click Reminder Sync */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950 via-purple-900 to-teal-900 text-white space-y-3 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Mahila AI Reminder Optimizer
            </div>
            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed font-light">
              "Based on your daily routine, Mahila AI suggests taking Iron & Folic Acid supplements after your lunch around <strong>02:00 PM</strong> for 35% higher absorption."
            </p>
          </div>
          <button
            onClick={() => {
              addOrUpdateReminder({
                title: 'Iron & Folic Acid Supplement',
                time: '02:00 PM',
                type: 'pill',
                repeat: 'Daily'
              });
              setNotificationBanner('Iron & Folic Acid Supplement scheduled for 02:00 PM!');
            }}
            className="px-4 py-2 bg-teal-400 text-teal-950 rounded-xl font-extrabold text-xs shadow hover:bg-teal-300 transition shrink-0"
          >
            Sync AI Reminder 🔔
          </button>
        </div>

        {/* Missed Reminder Reschedule & Action */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Missed Alert: <strong>Calcium Supplement</strong> was scheduled for 09:00 AM. Mark as completed or reschedule?</span>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                const item = reminders.find(r => r.title.toLowerCase().includes('calcium'));
                if (item) toggleReminder(item.id);
                setNotificationBanner('Calcium Supplement marked as completed!');
              }}
              className="px-3 py-1.5 bg-amber-200 text-amber-950 rounded-xl text-xs font-bold hover:bg-amber-300 transition"
            >
              Mark Done
            </button>
            <button
              onClick={() => {
                rescheduleReminder('Calcium Supplement', '03:00 PM');
                setNotificationBanner('Calcium Supplement rescheduled to 03:00 PM today!');
              }}
              className="px-3 py-1.5 bg-white border border-amber-300 text-amber-950 rounded-xl text-xs font-bold hover:bg-amber-100 transition shadow-2xs"
            >
              Reschedule to 3:00 PM
            </button>
          </div>
        </div>

        {/* Reminders List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className={`bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                rem.completed ? 'border-slate-200 opacity-70 bg-slate-50/50' : 'border-purple-100 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                    rem.type === 'pill' ? 'bg-purple-100 text-purple-700' : rem.type === 'water' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {rem.type === 'pill' ? <Pill className="w-5 h-5" /> : rem.type === 'water' ? <Droplet className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className={`font-extrabold text-sm ${rem.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {rem.title}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      {rem.time} ({rem.repeat})
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => toggleReminder(rem.id)}
                    className={`p-2 rounded-full transition ${rem.completed ? 'text-teal-600' : 'text-slate-300 hover:text-purple-600'}`}
                    title="Toggle completion"
                  >
                    {rem.completed ? <CheckCircle2 className="w-6 h-6 fill-teal-100" /> : <Circle className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={() => setReminderToDelete(rem)}
                    className="p-2 rounded-full text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                {!rem.completed ? (
                  <>
                    <button
                      onClick={() => toggleReminder(rem.id)}
                      className="flex-1 py-2 bg-teal-50 text-teal-800 rounded-xl font-bold text-xs hover:bg-teal-100 transition"
                    >
                      Mark as Done
                    </button>
                    <button
                      onClick={() => handleSnooze(rem.id)}
                      className="py-2 px-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition"
                    >
                      Snooze (+15m)
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-teal-700 font-bold py-1 px-2 bg-teal-50 rounded-lg">✓ Completed</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        {reminderToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-rose-100 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Reminder?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete <strong>"{reminderToDelete.title}"</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setReminderToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteReminder(reminderToDelete.id);
                    setNotificationBanner(`Deleted reminder "${reminderToDelete.title}".`);
                    setReminderToDelete(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-purple-100">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Add Health Reminder</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Reminder Name</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Iron & Folic Acid Supplement"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 02:00 PM"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  >
                    <option value="pill">Medicine / Pill Timing</option>
                    <option value="water">Hydration Target</option>
                    <option value="appointment">Doctor Appointment</option>
                    <option value="vaccine">Vaccination Alert</option>
                    <option value="lab">Lab Test Follow-up</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Frequency</label>
                  <select
                    value={repeat}
                    onChange={(e) => setRepeat(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  >
                    <option>Daily</option>
                    <option>Every 2 Days</option>
                    <option>Weekly</option>
                    <option>Once</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold text-xs shadow hover:opacity-95 transition"
                >
                  Save Smart Reminder
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <MobileBottomNav />
      <FloatingAIChat />
    </div>
  );
};

export default RemindersPage;
