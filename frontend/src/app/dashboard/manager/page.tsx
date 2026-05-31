'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function ManagerDashboard() {
  const [pending, setPending] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [leaveRes, teamRes] = await Promise.all([
      api.get('/api/leaves/pending'),
      api.get('/api/attendance/team'),
    ]);
    setPending(leaveRes.data);
    setTeam(teamRes.data);
  };

  const decide = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/api/leaves/${id}/decide`, { status });
      setMessage(`✅ Leave request ${status}`);
      fetchData();
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.error || 'Error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Team attendance and leave approvals</p>
      </div>

      {message && (
        <div className="text-sm bg-gray-50 text-gray-600 px-4 py-3 rounded-lg">{message}</div>
      )}

      {/* Pending leave requests */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-medium text-gray-900 mb-4">
          Pending Leave Requests
          {pending.length > 0 && (
            <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-400">No pending requests. 🎉</p>
        ) : (
          <div className="space-y-3">
            {pending.map((l: any) => (
              <div key={l.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{l.full_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {l.leave_type} · {new Date(l.start_date).toLocaleDateString()} — {new Date(l.end_date).toLocaleDateString()} ({l.days_count} days)
                  </p>
                  {l.reason && <p className="text-xs text-gray-400 mt-0.5">"{l.reason}"</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => decide(l.id, 'approved')}
                    className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => decide(l.id, 'rejected')}
                    className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's team attendance */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-medium text-gray-900 mb-4">Today's Team Attendance</h2>
        {team.length === 0 ? (
          <p className="text-sm text-gray-400">No attendance recorded today yet.</p>
        ) : (
          <div className="space-y-2">
            {team.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.full_name}</p>
                  <p className="text-xs text-gray-400">{a.department}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>
                    {a.time_in ? new Date(a.time_in).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    {' → '}
                    {a.time_out ? new Date(a.time_out).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : 'ongoing'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full ${
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
    </div>
  );
}