import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unreadNotifications } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6F9] dark:bg-[#0B1120]">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Header
          setMobileOpen={setMobileOpen}
          unreadNotifications={unreadNotifications}
        />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="hidden xl:block w-4 kj-tenun-v opacity-20 flex-shrink-0" />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
            <div className="max-w-7xl mx-auto animate-fade-in-up">
              <Outlet />
            </div>
          </main>
          <div className="hidden xl:block w-4 kj-tenun-v opacity-20 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
