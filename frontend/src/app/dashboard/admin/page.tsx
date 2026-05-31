'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/employees').then(res => {
      setEmployees(res.data);
      setLoading(false);
    });
  }, []);

  const departments = [...new Set(employees.map((e: any) => e.department))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage employees and payroll</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: employees.length },
          { label: 'Departments', value: departments.length },
          { label: 'Regular', value: employees.filter(e => e.employment_type === 'regular').length },
          { label: 'Probationary', value: employees.filter(e => e.employment_type === 'probationary').length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Employee table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-medium text-gray-900 mb-4">All Employees</h2>
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Name</th>
                  <th className="text-left py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Department</th>
                  <th className="text-left py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Role</th>
                  <th className="text-left py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Salary</th>
                  <th className="text-left py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Type</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp: any) => (
                  <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-900">{emp.full_name}</td>
                    <td className="py-3 text-gray-500">{emp.department}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        emp.role === 'admin' ? 'bg-purple-50 text-purple-600' :
                        emp.role === 'manager' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3 text-gray-700">
                      ₱{Number(emp.basic_salary).toLocaleString()}
                    </td>
                    <td className="py-3 text-gray-500 capitalize">{emp.employment_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}