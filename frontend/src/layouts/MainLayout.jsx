import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import { cn } from '../utils/utils';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Fallback for standard resize
      if (window.innerWidth < 768 && !window.visualViewport) {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        setViewportHeight(window.innerHeight);
      }
    };

    const handleVisualResize = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
        // Also update --vh for CSS usage
        document.documentElement.style.setProperty('--vh', `${window.visualViewport.height * 0.01}px`);
      }
    };

    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualResize);
      window.visualViewport.addEventListener('scroll', handleVisualResize);
    }
    
    handleResize();
    handleVisualResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualResize);
        window.visualViewport.removeEventListener('scroll', handleVisualResize);
      }
    };
  }, []);

  const isChatDetail = location.pathname.match(/^\/app\/chat\/[^/]+$/);
  const showNav = !(isMobile && isChatDetail);

  return (
    <div 
      className="flex flex-col bg-slate-50 transition-all duration-75 overflow-hidden max-h-full" 
      style={{ height: isMobile && isChatDetail ? `${viewportHeight}px` : 'max(100dvh, 100%)' }}
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
