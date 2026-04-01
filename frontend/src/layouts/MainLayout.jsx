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
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // JS fix for mobile keyboard height (Fix #5)
      if (window.innerWidth < 768) {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isChatDetail = location.pathname.match(/^\/app\/chat\/[^/]+$/);
  const showNav = !(isMobile && isChatDetail);

  return (
    <div 
      className="flex flex-col bg-slate-50 transition-all duration-75 overflow-hidden" 
      style={{ height: isMobile && isChatDetail ? 'calc(var(--vh, 1vh) * 100)' : 'max(100dvh, 100%)' }}
    >
      {showNav && <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={cn(
          "flex-1 p-4 md:p-8 pb-24 md:pb-8 transition-all duration-300",
          !isChatDetail && "overflow-y-auto",
          !isMobile && "md:ml-64",
          !showNav && "p-0 pb-0 h-dvh" // Immersive mobile chat
        )}>
          <Outlet />
        </main>
      </div>
      {showNav && <MobileNav />}
    </div>
  );
}
