import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Toaster } from '@/components/ui/toaster';

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

