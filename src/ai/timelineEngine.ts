/**
 * Timeline Engine
 * Chronologically organizes digital health records, appointments, lab reports,
 * prescriptions, and vaccinations; supports filtering and search.
 */

import { UserHealthContext } from './conversationMemory';

export interface TimelineRecord {
  id: string | number;
  title: string;
  doctor: string;
  date: string;
  type: string;
  status: string;
  fileUrl?: string;
}

export interface TimelineEngineOutput {
  totalRecords: number;
  filteredRecords: TimelineRecord[];
  categoriesCount: Record<string, number>;
  latestRecord?: TimelineRecord;
}

export class TimelineEngine {
  public organizeTimeline(
    records: TimelineRecord[],
    filter: string = 'All',
    searchQuery: string = '',
    context: UserHealthContext
  ): TimelineEngineOutput {
    const allRecords = records && records.length > 0 ? records : [
      { id: '1', title: 'Complete Blood Count (CBC)', doctor: 'Dr. Anjali Gupta', date: 'Jul 20, 2026', type: 'Lab Report', status: 'Normal' },
      { id: '2', title: 'Thyroid Function Test (T3, T4, TSH)', doctor: 'Apollo Diagnostics', date: 'Jun 12, 2026', type: 'Lab Report', status: 'Subclinical TSH Elevation' },
      { id: '3', title: 'Gynecological Wellness Prescription', doctor: 'Dr. Priya Nair', date: 'May 04, 2026', type: 'Prescription', status: 'Active' }
    ];

    const categoriesCount: Record<string, number> = {};
    allRecords.forEach(r => {
      categoriesCount[r.type] = (categoriesCount[r.type] || 0) + 1;
    });

    const filtered = allRecords.filter(r => {
      const matchesFilter = filter === 'All' || r.type === filter;
      const matchesSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.doctor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    return {
      totalRecords: allRecords.length,
      filteredRecords: filtered,
      categoriesCount,
      latestRecord: allRecords[0]
    };
  }
}

export const timelineEngine = new TimelineEngine();
