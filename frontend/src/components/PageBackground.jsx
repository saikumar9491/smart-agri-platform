import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export default function PageBackground({ children, className = "" }) {
  const { token } = useAuth();
  const [bgImage, setBgImage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    // Fetch background from settings
    fetch(`${API_URL}/api/admin/settings`, {
       headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const settings = data.data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
          const desktopBg = settings.user_dashboard_bg;
          const mobileBg = settings.user_dashboard_bg_mobile;
          
          if (isMobile && mobileBg) setBgImage(mobileBg);
          else if (desktopBg) setBgImage(desktopBg);
        }
      })
      .catch(err => console.error('Error fetching background:', err));

    return () => window.removeEventListener('resize', handleResize);
  }, [token, isMobile]);

  const bgUrl = bgImage 
    ? (bgImage.startsWith('http') ? bgImage : `${API_URL}${bgImage}`)
    : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000';

  return (
    <div className="relative min-h-screen -m-4 sm:-m-8 p-4 sm:p-8">
      {/* Background Image Layer */}
      <div 
        className="fixed inset-0 z-0 transition-all duration-1000"
        style={{
          backgroundImage: `url("${bgUrl}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
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
