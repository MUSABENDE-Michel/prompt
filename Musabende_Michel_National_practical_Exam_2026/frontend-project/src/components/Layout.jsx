import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-slate-800">
      <Header onToggleSidebar={() => setSidebarCollapsed((v) => !v)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-800">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
