import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import { cn } from '../utils/utils';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-dvh flex flex-col bg-slate-50 overflow-hidden">
      {/* Hide navbar on mobile when in a chat conversation */}
      {/* Hide navbar on all devices when in a chat conversation to maximize vertical space */}
      {!location.pathname.includes('/chat') && (
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      )}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          // Special handling for chat: remove padding and overflow on mobile to let Chat.jsx handle it
          location.pathname.includes('/chat') 
            ? "p-0 overflow-hidden" 
            : "overflow-y-auto p-4 md:p-8 pb-24 md:pb-8",
          !isMobile && "md:ml-64"
        )}>
          <Outlet />
        </main>
      </div>
      {/* Hide mobile nav when in a chat conversation */}
      {(!isMobile || !location.pathname.includes('/chat')) && <MobileNav />}
    </div>
  );
}
