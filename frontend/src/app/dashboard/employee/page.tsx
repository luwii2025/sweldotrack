'use client';

import { useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [clockedIn, setClockedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attRes, leaveRes] = await Promise.all([
        api.get('/api/attendance/my'),
        api.get('/api/leaves/my'),
      ]);
      setAttendance(attRes.data);
      setLeaves(leaveRes.data);

      // Check if already clocked in today
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = attRes.data.find((a: any) =>
        a.date.split('T')[0] === today
      );
      setClockedIn(!!todayRecord && !todayRecord.time_out);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClockIn = async () => {
    setLoading(true);
    try {
      await api.post('/api/attendance/clock-in');
      setMessage('✅ Clocked in successfully!');
      fetchData();
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.error || 'Error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      await api.post('/api/attendance/clock-out');
      setMessage('✅ Clocked out successfully!');
      fetchData();
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.error || 'Error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Magandang umaga, {user?.full_name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">{new Date().toDateString()}</p>
      </div>

      {/* Clock in/out */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-medium text-gray-900 mb-4">Attendance</h2>
        {message && (
          <div className="mb-4 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={handleClockIn}
            disabled={loading || clockedIn}
            className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clock In
          </button>
          <button
            onClick={handleClockOut}
            disabled={loading || !clockedIn}
            className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clock Out
          </button>
        </div>
      </div>

      {/* Recent attendance */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-medium text-gray-900 mb-4">Recent Attendance</h2>
        {attendance.length === 0 ? (
          <p className="text-sm text-gray-400">No attendance records this month.</p>
        ) : (
          <div className="space-y-2">
            {attendance.slice(0, 7).map((a: any) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">
                  {new Date(a.date).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">
                    {a.time_in ? new Date(a.time_in).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    {' → '}
                    {a.time_out ? new Date(a.time_out).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : 'ongoing'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    a.status === 'present' ? 'bg-green-50 text-green-600' :
                    a.status === 'late' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leave requests */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-gray-900">Leave Requests</h2>
        </div>
        {leaves.length === 0 ? (
          <p className="text-sm text-gray-400">No leave requests filed.</p>
        ) : (
          <div className="space-y-2">
            {leaves.slice(0, 5).map((l: any) => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm text-gray-700 capitalize">{l.leave_type} leave</p>
                  <p className="text-xs text-gray-400">
                    {new Date(l.start_date).toLocaleDateString()} — {new Date(l.end_date).toLocaleDateString()} ({l.days_count} days)
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  l.status === 'approved' ? 'bg-green-50 text-green-600' :
                  l.status === 'rejected' ? 'bg-red-50 text-red-600' :
                  'bg-yellow-50 text-yellow-600'
                }`}>
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}