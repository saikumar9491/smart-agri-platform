import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { resolveImageUrl } from '../utils/utils';

export default function PageBackground({ children, className = "" }) {
  const { token } = useAuth();
  const [bgImage, setBgImage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    // Fetch background from settings
    fetch(`${API_URL}/api/settings`, {
       headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const settings = data.settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
          const desktopBg = settings.user_dashboard_bg;
          const mobileBg = settings.user_dashboard_bg_mobile;
          
          if (isMobile && mobileBg) setBgImage(mobileBg);
          else if (desktopBg) setBgImage(desktopBg);
        }
      })
      .catch(err => console.error('Error fetching background:', err));

    return () => window.removeEventListener('resize', handleResize);
  }, [token, isMobile]);

  const bgUrl = bgImage ? resolveImageUrl(bgImage) : null;

  return (
    <div className="relative min-h-screen -m-4 sm:-m-8 p-4 sm:p-8">
      {/* Background Image Layer */}
      <div 
        className="fixed inset-0 z-0 transition-all duration-1000"
        style={bgUrl ? {
          backgroundImage: `url("${bgUrl}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        } : {
          background: 'linear-gradient(to bottom right, #0a0a0a, #1a2a1a)'
        }}
      />
      {/* Dark Overlay for Readability */}
      <div className="fixed inset-0 z-0 bg-black/30" />
      
      {/* Content Layer */}
      <div className={`relative z-10 ${className}`}>
        {children}
      </div>
    </div>
  );
}
