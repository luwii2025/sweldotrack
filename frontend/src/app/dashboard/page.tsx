'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        // Redirect to role-specific dashboard
        if (user.role === 'admin') router.push('/dashboard/admin');
        else if (user.role === 'manager') router.push('/dashboard/manager');
        else router.push('/dashboard/employee');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-400 text-sm">Redirecting...</p>
    </div>
  );
}
