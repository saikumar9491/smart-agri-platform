import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { cn } from '../utils/utils';
import { useUI } from '../context/UIContext';


export default function MainLayout() {
  const { isSearchActive } = useUI();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={cn(
      "min-h-dvh overflow-x-hidden flex flex-col transition-colors duration-500",
      (location.pathname === '/app' || location.pathname === '/app/') ? "bg-transparent" : "bg-slate-50",
      (!location.pathname.includes('/chat') && !(isMobile && (location.pathname === '/app' || location.pathname === '/app/'))) && "pt-20"
    )}>
      {(!location.pathname.includes('/chat') && !(isMobile && (location.pathname === '/app' || location.pathname === '/app/')) && !isSearchActive) && (
        <Navbar />
      )}
      <div className="flex-1 flex relative max-w-[1600px] mx-auto w-full">
        <main className={cn(
          "flex-1 flex flex-col transition-all duration-500 w-full",
          location.pathname.includes('/chat') 
            ? "p-0" 
            : "p-4 md:px-8 md:py-6 pb-24 md:pb-8"
        )}>
          <Outlet />
        </main>
      </div>
      {(!isMobile || !location.pathname.includes('/chat')) && !isSearchActive && <MobileNav />}
    </div>
  );
}


