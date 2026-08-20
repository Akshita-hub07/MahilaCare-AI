import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { userHealthStorage } from '../services/userHealthStorage';

const HealthDataContext = createContext();

export const HealthDataProvider = ({ children }) => {
  const { user } = useAuth();

  // State initialization
  const [reminders, setReminders] = useState([]);
  const [cycleData, setCycleDataState] = useState({
    cycleLength: 28,
    periodLength: 5,
    lastPeriodStart: '2026-07-26',
    currentDay: 13,
    phase: 'Ovulation / Fertile Window',
    fertileDays: 'Aug 05 - Aug 10',
    chanceOfPregnancy: 'High',
    symptoms: ['Mild Cramps', 'Clear Skin', 'Energetic']
  });

  const [isPregnancyEnabled, setIsPregnancyEnabledState] = useState(false);
  const [pregnancyDetails, setPregnancyDetailsState] = useState({
    week: 16,
    trimester: 2,
    dueDate: '2027-01-15',
    babySize: 'Avocado (4.5 inches)',
    weightGain: '+3.2 kg',
    kicksToday: 8,
    bumpPhotos: []
  });

  const [healthRecords, setHealthRecordsState] = useState([]);
  const [doctors] = useState([
    {
      id: 1,
      name: 'Dr. Priya Nair',
      specialty: 'Senior Gynecologist & Obstetrician',
      experience: '16+ Years Experience',
      rating: 4.9,
      reviews: 320,
      distance: '2.4 km away',
      hospital: 'Apollo Women Healthcare Center',
      availability: 'Today, 4:00 PM',
      consultFee: '₹800',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 2,
      name: 'Dr. Meera Deshmukh',
      specialty: 'Reproductive Endocrinology & Fertility Specialist',
      experience: '12+ Years Experience',
      rating: 4.8,
      reviews: 210,
      distance: '4.1 km away',
      hospital: 'Nari Wellness Clinic',
      availability: 'Tomorrow, 10:30 AM',
      consultFee: '₹950',
      image: 'https://images.unsplash.com/photo-1594824813566-78a5b3a4a821?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 3,
      name: 'Dr. Sunita Reddy',
      specialty: 'Maternal & Fetal Medicine Specialist',
      experience: '20+ Years Experience',
      rating: 5.0,
      reviews: 450,
      distance: '6.8 km away',
      hospital: 'Cloudnine Maternity Hospital',
      availability: 'Fri, Aug 08',
      consultFee: '₹1,200',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
    }
  ]);

  // Synchronize state with authenticated user storage upon mount or user change
  useEffect(() => {
    if (!user) return;
    const stored = userHealthStorage.loadUserData(user);
    if (stored) {
      if (stored.records) setHealthRecordsState(stored.records);
      if (stored.cycleData) setCycleDataState(stored.cycleData);
      if (stored.pregnancyDetails) setPregnancyDetailsState(stored.pregnancyDetails);
      if (typeof stored.isPregnancyEnabled === 'boolean') setIsPregnancyEnabledState(stored.isPregnancyEnabled);
      if (stored.reminders) setReminders(stored.reminders);
    }
  }, [user?.email, user?.id, user?.name]);

  // Wrapped State Setters that synchronize with user storage
  const setCycleData = (newCycleData) => {
    setCycleDataState((prev) => {
      const updated = typeof newCycleData === 'function' ? newCycleData(prev) : newCycleData;
      if (user) userHealthStorage.saveCycleData(user, updated);
      return updated;
    });
  };

  const setPregnancyDetails = (newDetails) => {
    setPregnancyDetailsState((prev) => {
      const updated = typeof newDetails === 'function' ? newDetails(prev) : newDetails;
      if (user) userHealthStorage.savePregnancyDetails(user, updated, isPregnancyEnabled);
      return updated;
    });
  };

  const setIsPregnancyEnabled = (enabled) => {
    setIsPregnancyEnabledState(enabled);
    if (user) userHealthStorage.savePregnancyDetails(user, pregnancyDetails, enabled);
  };

  const addReminder = (newReminder) => {
    setReminders((prev) => {
      const updated = [...prev, { id: Date.now(), ...newReminder, completed: false }];
      if (user) userHealthStorage.saveReminders(user, updated);
      return updated;
    });
  };

  const addOrUpdateReminder = (reminderData) => {
    setReminders((prev) => {
      const matchIdx = prev.findIndex(r => r.title.toLowerCase().trim() === reminderData.title.toLowerCase().trim());
      let updated;
      if (matchIdx !== -1) {
        updated = [...prev];
        updated[matchIdx] = {
          ...updated[matchIdx],
          ...reminderData,
          completed: false
        };
      } else {
        updated = [...prev, { id: Date.now(), completed: false, repeat: 'Daily', ...reminderData }];
      }
      if (user) userHealthStorage.saveReminders(user, updated);
      return updated;
    });
  };

  const rescheduleReminder = (identifier, newTime, newDate) => {
    setReminders((prev) => {
      const updated = prev.map((r) => {
        if (r.id === identifier || r.title.toLowerCase().trim().includes(String(identifier).toLowerCase().trim())) {
          return {
            ...r,
            time: newTime || r.time,
            date: newDate || r.date,
            completed: false
          };
        }
        return r;
      });
      if (user) userHealthStorage.saveReminders(user, updated);
      return updated;
    });
  };

  const toggleReminder = (id) => {
    setReminders((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r));
      if (user) userHealthStorage.saveReminders(user, updated);
      return updated;
    });
  };

  const addHealthRecord = (record) => {
    setHealthRecordsState((prev) => {
      const newRec = {
        id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        doctor: record.doctor || 'Uploaded Document',
        date: record.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        type: record.type || 'Lab Report',
        status: record.status || 'Uploaded',
        fileUrl: record.fileUrl || '#',
        ...record
      };
      const updated = [newRec, ...prev];
      if (user) userHealthStorage.saveHealthRecords(user, updated);
      return updated;
    });
  };

  const updateHealthRecord = (id, updatedFields) => {
    setHealthRecordsState((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, ...updatedFields } : r));
      if (user) userHealthStorage.saveHealthRecords(user, updated);
      return updated;
    });
  };

  return (
    <HealthDataContext.Provider
      value={{
        reminders,
        addReminder,
        addOrUpdateReminder,
        rescheduleReminder,
        toggleReminder,
        cycleData,
        setCycleData,
        isPregnancyEnabled,
        setIsPregnancyEnabled,
        pregnancyDetails,
        setPregnancyDetails,
        healthRecords,
        addHealthRecord,
        updateHealthRecord,
        doctors
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => useContext(HealthDataContext);

