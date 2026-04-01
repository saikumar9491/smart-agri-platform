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

  const isChatDetail = location.pathname.match(/^\/app\/chat\/[^/]+$/);
  const showNav = !(isMobile && isChatDetail);

  return (
    <div className="min-h-screen bg-slate-50">
      {showNav && <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />}
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={cn(
          "flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto transition-all duration-300",
          !isMobile && "md:ml-64",
          !showNav && "p-0 pb-0 h-screen" // Fullscreen for mobile chat detail
        )}>
          <Outlet />
        </main>
      </div>
      {showNav && <MobileNav />}
    </div>
  );
}
