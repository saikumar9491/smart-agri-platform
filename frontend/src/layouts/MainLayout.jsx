import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import { cn } from '../utils/utils';

import { useUI } from '../context/UIContext';

export default function MainLayout() {
  const { isSearchActive } = useUI();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock background scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen, isMobile]);

  return (
    <div className={cn(
      "min-h-dvh overflow-x-hidden flex flex-col",
      (location.pathname === '/app' || location.pathname === '/app/') ? "bg-transparent" : "bg-slate-50",
      (!location.pathname.includes('/chat') && !(isMobile && (location.pathname === '/app' || location.pathname === '/app/'))) && "pt-16"
    )}>
      {/* Hide navbar on all devices when in a chat conversation to maximize vertical space */}
      {/* Also hide on mobile when on the main dashboard to allow for immersive background */}
      {/* Hide when search is active on mobile */}
      {(!location.pathname.includes('/chat') && !(isMobile && (location.pathname === '/app' || location.pathname === '/app/')) && !(isMobile && isSearchActive)) && (
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      )}
      <div className="flex-1 flex relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={cn(
          "flex-1 flex flex-col transition-all duration-300 w-full overflow-hidden",
          // Special handling for chat: remove padding and overflow on mobile to let Chat.jsx handle it
          location.pathname.includes('/chat') 
            ? "p-0" 
            : "p-4 md:p-8 pb-24 md:pb-8",
          !isMobile && "md:ml-64"
        )}>
          <Outlet />
        </main>
      </div>
      {/* Hide mobile nav when in a chat conversation or when search is active */}
      {(!isMobile || !location.pathname.includes('/chat')) && !isSearchActive && <MobileNav />}
    </div>
  );
}

