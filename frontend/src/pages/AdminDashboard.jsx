import { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  ArrowLeft,
  Bell, 
  BarChart3, 
  Trash2, 
  UserCog, 
  Send, 
  Search,
  CheckCircle2,
  AlertCircle,
  Info,
  ShieldAlert,
  ShieldCheck,
  Sprout,
  Plus,
  FileText,
  Clock,
  MessageSquare,
  Mail,
  TrendingUp,
  MapPin,
  MessageCircle,
  X,
  Settings,
  Zap,
  Activity,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  History,
  FileDown,
  ShoppingBag,
  Package,
  Sparkles,
  Megaphone,
  Smartphone,
  Palette,
  Upload,
  MonitorPlay,
  Monitor,
  UserPlus,
  Eye,
  Edit3,
  Droplets,
  Image as ImageIcon,
  CloudUpload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { cn, resolveImageUrl } from '../utils/utils';

export default function AdminDashboard() {
  const { token, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [globalSettings, setGlobalSettings] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [communitySubTab, setCommunitySubTab] = useState('list');
  const [selectedPostImage, setSelectedPostImage] = useState(null);
  const [allListings, setAllListings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [spotlights, setSpotlights] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [viewingPost, setViewingPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);

  const BANNER_GRADIENTS = [
    { name: 'Green Emerald', value: 'bg-gradient-to-br from-green-500 to-emerald-700' },
    { name: 'Orange Amber', value: 'bg-gradient-to-br from-orange-400 to-amber-600' },
    { name: 'Blue Indigo', value: 'bg-gradient-to-br from-blue-500 to-indigo-700' },
    { name: 'Rose Pink', value: 'bg-gradient-to-br from-rose-500 to-pink-700' },
    { name: 'Purple Indigo', value: 'bg-gradient-to-br from-purple-600 to-indigo-800' },
    { name: 'Teal Cyan', value: 'bg-gradient-to-br from-teal-400 to-cyan-600' },
    { name: 'Sunset Orange', value: 'bg-gradient-to-br from-pink-500 to-orange-400' },
    { name: 'Crimson Rose', value: 'bg-gradient-to-br from-red-600 to-rose-800' },
    { name: 'Midnight Dark', value: 'bg-gradient-to-br from-slate-800 to-slate-950' },
    { name: 'Golden Lime', value: 'bg-gradient-to-br from-yellow-400 to-lime-600' },
    { name: 'Ocean Blue', value: 'bg-gradient-to-br from-blue-400 to-cyan-500' },
    { name: 'Lavender Sweet', value: 'bg-gradient-to-br from-purple-400 to-pink-500' },
    { name: 'Earth Metal', value: 'bg-gradient-to-br from-stone-500 to-stone-800' },
    { name: 'Forest Canopy', value: 'bg-gradient-to-br from-emerald-600 to-green-900' },
    { name: 'Neon Lime', value: 'bg-gradient-to-br from-lime-300 to-green-500' },
    { name: 'Fresh Mango', value: 'bg-gradient-to-br from-orange-300 to-red-500' },
    { name: 'Wild Berry', value: 'bg-gradient-to-br from-fuchsia-500 to-purple-700' },
    { name: 'Silver Mist', value: 'bg-gradient-to-br from-slate-300 to-slate-500' },
    { name: 'Royal Gold', value: 'bg-gradient-to-br from-amber-400 to-yellow-600' },
    { name: 'Grand Cherry', value: 'bg-gradient-to-br from-rose-800 to-red-950' },
    { name: 'Electric Navy', value: 'bg-gradient-to-br from-indigo-500 to-blue-700' }
  ];

  const [announcementForm, setAnnouncementForm] = useState({
    title: '', subtitle: '', bgGradient: 'bg-gradient-to-br from-green-500 to-emerald-700', imageUrl: '', accentColor: 'bg-green-400/20', link: ''
  });
  const [spotlightForm, setSpotlightForm] = useState({
    title: '', description: '', imageUrl: '', videoUrl: '', secondaryImageUrl: '', badge: '', brand: '', buttonText: 'Learn More', link: '', type: 'image', color: 'indigo-600'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedListingIds, setSelectedListingIds] = useState([]);
  
  // Additional forms state
  const [selectedUser, setSelectedUser] = useState(null);
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'info', target: 'all', recipientId: '', alsoSendEmail: false });
  const [cropForm, setCropForm] = useState({ name: '', idealSoil: '', season: '', waterRequirement: 'Medium', estimatedYield: '', description: '' });
  const [postForm, setPostForm] = useState({ title: '', content: '', tags: '' });
  const [marketForm, setMarketForm] = useState({ cropName: '', marketLocation: '', pricePerKg: '', trend: 'stable' });
  
  const [dragSelection, setDragSelection] = useState({ active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 });
  const listingsScrollRef = useRef(null);
  const scrollRAF = useRef(null);



  const toggleSelectListing = (id) => {
    setSelectedListingIds(prev => 
      prev.includes(id) ? prev.filter(lid => lid !== id) : [...prev, id]
    );
  };

  const handleDragStart = (e) => {
    // Only start drag if clicking on the background of the table container or rows (not buttons)
    if (e.target.closest('button')) return;
    
    // Reset selection if not holding shift - DEFERRED TO MOUSEMOVE
    // if (!e.shiftKey) setSelectedListingIds([]);

    const startPageX = e.pageX;
    const startPageY = e.pageY;
    
    setDragSelection({
      active: false, // Don't start active immediately
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY
    });

    let isDragging = false;

    const onMouseMove = (moveEvent) => {
      // Calculate distance from start to see if we actually started dragging
      const dist = Math.sqrt(
        Math.pow(moveEvent.clientX - e.clientX, 2) + 
        Math.pow(moveEvent.clientY - e.clientY, 2)
      );
      
      // If we haven't moved enough yet, don't start the drag logic (and don't clear selection)
      if (dist < 4 && !isDragging) return;

      // Start the drag: Reset selection if not already active and shift is not held
      if (!isDragging) {
        if (!e.shiftKey) setSelectedListingIds([]);
        isDragging = true;
        setDragSelection(prev => ({ ...prev, active: true }));
      }

      setDragSelection(prev => ({
        ...prev,
        currentX: moveEvent.clientX,
        currentY: moveEvent.clientY
      }));

      // Viewport-relative Edge Detection (near screen edges)
      const threshold = 100;
      const top = 0;
      const bottom = window.innerHeight;
      
      if (scrollRAF.current) {
        cancelAnimationFrame(scrollRAF.current);
        scrollRAF.current = null;
      }

      let speed = 0;
      if (moveEvent.clientY < threshold) {
        // Scroll up
        speed = -Math.max(5, (threshold - moveEvent.clientY) / 3);
      } else if (moveEvent.clientY > bottom - threshold) {
        // Scroll down
        speed = Math.max(5, (threshold - (bottom - moveEvent.clientY)) / 3);
      }

      if (speed !== 0) {
        const doScroll = () => {
          window.scrollBy(0, speed);
          // Also update current position to reflect the new scroll offset
          setDragSelection(prev => ({
            ...prev,
            currentY: moveEvent.clientY
          }));
          scrollRAF.current = requestAnimationFrame(doScroll);
        };
        scrollRAF.current = requestAnimationFrame(doScroll);
      }
    };

    const onMouseUp = (upEvent) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      
      if (scrollRAF.current) {
        cancelAnimationFrame(scrollRAF.current);
        scrollRAF.current = null;
      }
      
      const endPageX = upEvent.pageX;
      const endPageY = upEvent.pageY;

      const finalRectPage = {
        left: Math.min(startPageX, endPageX),
        top: Math.min(startPageY, endPageY),
        right: Math.max(startPageX, endPageX),
        bottom: Math.max(startPageY, endPageY)
      };

      // Detect which rows are within the rect using page coordinates
      const selectedIds = [];
      const rows = document.querySelectorAll('.listing-row');
      rows.forEach(row => {
        // Convert row offset into a comparable box
        // offsetTop is relative to the offsetParent. 
        // We'll use getBoundingClientRect + window.scrollY for absolute page Y.
        const rowRect = row.getBoundingClientRect();
        const rowPageTop = rowRect.top + window.scrollY;
        const rowPageBottom = rowRect.bottom + window.scrollY;
        const rowPageLeft = rowRect.left + window.scrollX;
        const rowPageRight = rowRect.right + window.scrollX;

        const intersects = !(rowPageLeft > finalRectPage.right || 
                            rowPageRight < finalRectPage.left || 
                            rowPageTop > finalRectPage.bottom || 
                            rowPageBottom < finalRectPage.top);
        if (intersects) {
          selectedIds.push(row.getAttribute('data-id'));
        }
      });

      setSelectedListingIds(prev => {
        const unique = new Set([...(e.shiftKey ? prev : []), ...selectedIds]);
        return Array.from(unique);
      });

      setDragSelection({ active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleUserDragStart = (e) => {
    // Only start drag if clicking on the background of the table container or rows (not buttons)
    if (e.target.closest('button')) return;
    
    const startPageX = e.pageX;
    const startPageY = e.pageY;
    
    setDragSelection({
      active: false,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY
    });

    let isDragging = false;

    const onMouseMove = (moveEvent) => {
      const dist = Math.sqrt(
        Math.pow(moveEvent.clientX - e.clientX, 2) + 
        Math.pow(moveEvent.clientY - e.clientY, 2)
      );
      
      if (dist < 4 && !isDragging) return;

      if (!isDragging) {
        if (!e.shiftKey) setSelectedUserIds([]);
        isDragging = true;
        setDragSelection(prev => ({ ...prev, active: true }));
      }

      setDragSelection(prev => ({
        ...prev,
        currentX: moveEvent.clientX,
        currentY: moveEvent.clientY
      }));

      const threshold = 100;
      const bottom = window.innerHeight;
      
      if (scrollRAF.current) {
        cancelAnimationFrame(scrollRAF.current);
        scrollRAF.current = null;
      }

      let speed = 0;
      if (moveEvent.clientY < threshold) {
        speed = -Math.max(5, (threshold - moveEvent.clientY) / 3);
      } else if (moveEvent.clientY > bottom - threshold) {
        speed = Math.max(5, (threshold - (bottom - moveEvent.clientY)) / 3);
      }

      if (speed !== 0) {
        const doScroll = () => {
          window.scrollBy(0, speed);
          setDragSelection(prev => ({
            ...prev,
            currentY: moveEvent.clientY
          }));
          scrollRAF.current = requestAnimationFrame(doScroll);
        };
        scrollRAF.current = requestAnimationFrame(doScroll);
      }
    };

    const onMouseUp = (upEvent) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      
      if (scrollRAF.current) {
        cancelAnimationFrame(scrollRAF.current);
        scrollRAF.current = null;
      }
      
      const endPageX = upEvent.pageX;
      const endPageY = upEvent.pageY;

      const finalRectPage = {
        left: Math.min(startPageX, endPageX),
        top: Math.min(startPageY, endPageY),
        right: Math.max(startPageX, endPageX),
        bottom: Math.max(startPageY, endPageY)
      };

      const selectedIds = [];
      const rows = document.querySelectorAll('.user-row');
      rows.forEach(row => {
        const rowRect = row.getBoundingClientRect();
        const rowPageTop = rowRect.top + window.scrollY;
        const rowPageBottom = rowRect.bottom + window.scrollY;
        const rowPageLeft = rowRect.left + window.scrollX;
        const rowPageRight = rowRect.right + window.scrollX;

        const intersects = !(rowPageLeft > finalRectPage.right || 
                            rowPageRight < finalRectPage.left || 
                            rowPageTop > finalRectPage.bottom || 
                            rowPageBottom < finalRectPage.top);
        if (intersects) {
          selectedIds.push(row.getAttribute('data-id'));
        }
      });

      setSelectedUserIds(prev => {
        const unique = new Set([...(e.shiftKey ? prev : []), ...selectedIds]);
        return Array.from(unique);
      });

      setDragSelection({ active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const toggleSelectAllListings = () => {
    if (selectedListingIds.length === allListings.length) {
      setSelectedListingIds([]);
    } else {
      setSelectedListingIds(allListings.map(l => l._id));
    }
  };

  const handleBulkDeleteListings = async () => {
    if (selectedListingIds.length === 0) return;
    if (!window.confirm(`Permanently delete ${selectedListingIds.length} marketplace listings? This cannot be undone.`)) return;

    setActionStatus({ type: 'loading', message: `Deleting ${selectedListingIds.length} listings...` });
    try {
      const res = await fetch(`${API_URL}/api/admin/listings/bulk`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ listingIds: selectedListingIds })
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus({ type: 'success', message: data.message });
        setSelectedListingIds([]);
        fetchListings();
        fetchStats();
        setTimeout(() => setActionStatus(null), 3000);
      } else {
        setActionStatus({ type: 'error', message: data.message || 'Bulk delete failed' });
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: 'Network error during bulk delete' });
    }
  };

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'notifications') fetchNotifications();
    if (activeTab === 'community') fetchAllPosts();
    if (activeTab === 'market') fetchMarketPrices();
    if (activeTab === 'listings') { fetchListings(); fetchAnnouncements(); }
    if (activeTab === 'spotlight') fetchSpotlights();
    if (activeTab === 'insights') fetchInsights();
    if (activeTab === 'settings') fetchSettings();
    if (activeTab === 'logs') fetchAuditLogs();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      if (activeTab === 'stats') setLoading(false);
    }
  };


  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAuditLogs(data.logs);
    } catch (err) {
      setError('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => { // type: 'users' or 'market'
    try {
      const res = await fetch(`${API_URL}/api/admin/export/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smart_agri_${type}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Export failed');
    }
  };

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/insights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setInsights(data.insights);
    } catch (err) {
      setError('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setGlobalSettings(data.settings);
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setNotifications(data.notifications);
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAllPosts(data.posts);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketPrices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/market`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setMarketPrices(data.prices);
    } catch (err) {
      setError('Failed to load market prices');
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/listings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAllListings(data.listings);
    } catch (err) {
      setError('Failed to load marketplace listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdminListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this marketplace listing?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/listings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAllListings(allListings.filter(l => l._id !== id));
        fetchStats();
      }
    } catch (err) {
      alert('Failed to delete listing');
    }
  };

  const handleUpdateListingStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'available' ? 'out_of_stock' : 'available';
    try {
      const res = await fetch(`${API_URL}/api/listings/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setAllListings(allListings.map(l => l._id === id ? { ...l, status: newStatus } : l));
      } else {
        alert('Failed to update status: ' + (data.message || 'Error'));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAnnouncements(data.announcements);
    } catch (err) {
      console.error('Failed to load announcements');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setActionStatus({ type: 'loading', message: editingAnnouncementId ? 'Updating banner...' : 'Publishing banner...' });
    try {
      const url = editingAnnouncementId 
        ? `${API_URL}/api/admin/announcements/${editingAnnouncementId}`
        : `${API_URL}/api/admin/announcements`;
      
      const res = await fetch(url, {
        method: editingAnnouncementId ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(announcementForm)
      });
      const data = await res.json();
      if (data.success) {
        if (editingAnnouncementId) {
          setAnnouncements(announcements.map(a => a._id === editingAnnouncementId ? data.announcement : a));
          setActionStatus({ type: 'success', message: 'Banner updated successfully!' });
        } else {
          setAnnouncements([data.announcement, ...announcements]);
          setActionStatus({ type: 'success', message: 'Banner published successfully!' });
        }
        setAnnouncementForm({ title: '', subtitle: '', bgGradient: 'bg-gradient-to-br from-green-500 to-emerald-700', imageUrl: '', accentColor: 'bg-green-400/20', link: '' });
        setEditingAnnouncementId(null);
        setTimeout(() => setActionStatus(null), 3000);
      } else {
        setActionStatus({ type: 'error', message: data.message || 'Action failed' });
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: 'Network error occurred' });
    }
  };

  const handleEditAnnouncement = (ann) => {
    setEditingAnnouncementId(ann._id);
    setAnnouncementForm({
      title: ann.title,
      subtitle: ann.subtitle,
      bgGradient: ann.bgGradient,
      imageUrl: ann.imageUrl,
      accentColor: ann.accentColor,
      link: ann.link || ''
    });
    // Scroll to form
    const formElement = document.getElementById('announcementForm');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements(announcements.filter(a => a._id !== id));
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const fetchSpotlights = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/spotlights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setSpotlights(data.spotlights);
    } catch (err) {
      console.error('Failed to load spotlights');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpotlight = async (e) => {
    e.preventDefault();
    setActionStatus({ type: 'loading', message: 'Publishing spotlight...' });
    try {
      const res = await fetch(`${API_URL}/api/admin/spotlights`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(spotlightForm)
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus({ type: 'success', message: 'Spotlight published!' });
        setSpotlights([data.spotlight, ...spotlights]);
        setSpotlightForm({
          title: '', description: '', imageUrl: '', videoUrl: '', secondaryImageUrl: '', badge: '', brand: '', buttonText: 'Learn More', link: '', type: 'image', color: 'indigo-600'
        });
        setTimeout(() => setActionStatus(null), 3000);
      } else {
        setActionStatus({ type: 'error', message: data.message || 'Failed' });
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: 'Network error' });
    }
  };

  const handleDeleteSpotlight = async (id) => {
    if (!window.confirm('Permanently delete this spotlight item?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/spotlights/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSpotlights(spotlights.filter(s => s._id !== id));
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleUpdateRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, status: data.user.status } : u));
      }
    } catch (err) {
      alert('Failed to toggle status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUserIds.length === 0) return;
    if (!window.confirm(`Apply ${action} to ${selectedUserIds.length} users?`)) return;
    
    setActionStatus({ type: 'loading', message: `Applying ${action}...` });
    try {
      const res = await fetch(`${API_URL}/api/admin/users/bulk`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userIds: selectedUserIds, action })
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus({ type: 'success', message: data.message });
        setSelectedUserIds([]);
        fetchUsers();
        setTimeout(() => setActionStatus(null), 3000);
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: 'Bulk action failed' });
    }
  };

  const handleUpdateSetting = async (key, value) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key, value })
      });
      const data = await res.json();
      if (data.success) {
        setGlobalSettings(globalSettings.map(s => s.key === key ? { ...s, value } : s));
        if (!globalSettings.find(s => s.key === key)) {
          setGlobalSettings([...globalSettings, data.setting]);
        }
      }
    } catch (err) {
      alert('Failed to update setting');
    }
  };

  const handleUploadBackground = async (file, key) => {
    setActionStatus({ type: 'loading', message: `Uploding ${key.includes('mobile') ? 'Mobile' : 'Desktop'} background...` });
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', key);
    
    try {
      const res = await fetch(`${API_URL}/api/admin/settings/background`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus({ type: 'success', message: 'Vision Updated!' });
        fetchSettings();
        setTimeout(() => setActionStatus(null), 3000);
      } else {
        setActionStatus({ type: 'error', message: 'Upload missed' });
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: 'Error' });
    }
  };

  const handleDirectMessage = (user) => {
    setSelectedUser(user);
    setNotifForm({
      ...notifForm,
      target: 'specific',
      recipientId: user._id,
      title: `Message to ${user.name}`
    });
    setActiveTab('notifications');
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setActionStatus({ type: 'loading', message: 'Sending...' });
    try {
      const res = await fetch(`${API_URL}/api/admin/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(notifForm)
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus({ type: 'success', message: selectedUser ? `Message sent to ${selectedUser.name}` : 'Broadcast sent!' });
        setNotifForm({ title: '', message: '', type: 'info', target: 'all', recipientId: '', alsoSendEmail: false });
        setSelectedUser(null);
        fetchNotifications();
        setTimeout(() => setActionStatus(null), 3000);
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: 'Failed to send message' });
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(notifications.filter(n => n._id !== id));
      }
    } catch (err) {
      alert('Failed to delete notification');
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this community post?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAllPosts(allPosts.filter(p => p._id !== id));
        fetchStats();
      }
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAllPosts(allPosts.map(p => {
          if (p._id === postId) {
            return { ...p, comments: p.comments.filter(c => c._id !== commentId) };
          }
          return p;
        }));
        if (viewingPost?._id === postId) {
          setViewingPost({ ...viewingPost, comments: viewingPost.comments.filter(c => c._id !== commentId) });
        }
      }
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  const handleAddMarketPrice = async (e) => {
    e.preventDefault();
    setActionStatus({ type: 'loading', message: 'Adding market data...' });
    try {
      const res = await fetch(`${API_URL}/api/admin/market`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(marketForm)
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus({ type: 'success', message: 'Market data published!' });
        setMarketForm({ cropName: '', marketLocation: '', pricePerKg: '', trend: 'stable' });
        fetchMarketPrices();
        setTimeout(() => setActionStatus(null), 3000);
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: 'Failed to add market data' });
    }
  };

  const handleDeleteMarketPrice = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/market/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMarketPrices(marketPrices.filter(m => m._id !== id));
      }
    } catch (err) {
      alert('Failed to delete market entry');
    }
  };

  const handleAddCrop = async (e) => {
    e.preventDefault();
    setActionStatus({ type: 'loading', message: 'Adding crop...' });
    try {
      const res = await fetch(`${API_URL}/api/admin/crops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...cropForm,
          idealSoil: cropForm.idealSoil.split(',').map(s => s.trim()),
          season: cropForm.season.split(',').map(s => s.trim())
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus({ type: 'success', message: 'Crop added successfully!' });
        setCropForm({ name: '', idealSoil: '', season: '', waterRequirement: 'Medium', estimatedYield: '', description: '' });
        fetchStats();
        setTimeout(() => setActionStatus(null), 3000);
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: 'Failed to add crop' });
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setActionStatus({ type: 'loading', message: 'Creating post...' });
    try {
      const formData = new FormData();
      formData.append('title', postForm.title);
      formData.append('content', postForm.content);
      formData.append('tags', postForm.tags.split(',').map(t => t.trim()));
      if (selectedPostImage) {
        formData.append('image', selectedPostImage);
      }

      const res = await fetch(`${API_URL}/api/community/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus({ type: 'success', message: 'Official post created!' });
        setPostForm({ title: '', content: '', tags: '' });
        setSelectedPostImage(null);
        fetchAllPosts(); // Refresh list
        setTimeout(() => setActionStatus(null), 3000);
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: 'Failed to create post' });
    }
  };

  const handleUpdateAdminPost = async (e) => {
    e.preventDefault();
    if (!editingPost) return;
    setActionStatus({ type: 'loading', message: 'Updating post...' });
    try {
      const formData = new FormData();
      formData.append('title', postForm.title);
      formData.append('content', postForm.content);
      formData.append('tags', postForm.tags.split(',').map(t => t.trim()));
      if (selectedPostImage) {
        formData.append('image', selectedPostImage);
      }

      const res = await fetch(`${API_URL}/api/community/posts/${editingPost._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus({ type: 'success', message: 'Post updated successfully!' });
        setEditingPost(null);
        setPostForm({ title: '', content: '', tags: '' });
        setSelectedPostImage(null);
        fetchAllPosts();
        setTimeout(() => setActionStatus(null), 3000);
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: 'Failed to update post' });
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setSelectedPostImage(null);
    setPostForm({
      title: post.title,
      content: post.content,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : ''
    });
    // Scroll to form or switch sub-tab if needed
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectUser = (id) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter(uid => uid !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u._id));
    }
  };

  const isMaintenanceOn = () => globalSettings.find(s => s.key === 'maintenanceMode')?.value === true;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            Admin Command Center
          </h1>
          <p className="text-slate-500 text-sm">Resource governance and community moderation</p>
        </div>

        {/* MOBILE IMMERSIVE SEARCH HEADER */}
        {isMobile && isSearchActive && (
          <div className="fixed top-0 left-0 right-0 z-[1001] bg-slate-950 px-4 py-4 flex items-center gap-4 animate-in fade-in slide-in-from-top duration-300 shadow-2xl ring-1 ring-white/10">
            <button 
              onClick={() => {
                setIsSearchActive(false);
                setSearchTerm('');
              }}
              className="p-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-green-400 transition-colors" />
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3 pl-12 pr-10 text-white placeholder:text-white/20 focus:outline-none focus:bg-white/[0.08] focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-sm"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/20 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Tab Bar */}
        <div className="flex overflow-x-auto bg-white p-1 rounded-xl border border-slate-200 shadow-sm no-scrollbar sticky top-0 z-30 gap-1">
          {[
            { id: 'stats', label: 'Overview', icon: BarChart3 },
            { id: 'insights', label: 'Insights', icon: Zap },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'notifications', label: 'Alerts', icon: Bell },
            { id: 'market', label: 'Market', icon: TrendingUp },
            { id: 'listings', label: 'Farmer Sales', icon: ShoppingBag },
            { id: 'spotlight', label: 'Spotlight', icon: Sparkles },
            { id: 'crops', label: 'Crops', icon: Sprout },
            { id: 'community', label: 'Moderation', icon: MessageCircle },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'logs', label: 'Logs', icon: History },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0",
                activeTab === tab.id ? "bg-green-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <tab.icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !['crops', 'notifications', 'market', 'listings'].includes(activeTab) && (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      )}

      {!loading && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === 'stats' && (
            <div className="space-y-8">
              {/* High-Impact Analytics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg relative overflow-hidden group border border-indigo-400/20">
                  <Activity className="absolute -right-4 -bottom-4 h-32 w-32 text-indigo-400/20 group-hover:scale-110 transition-transform" />
                  <div className="relative z-10">
                    <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Live Status</p>
                    <div className="flex items-center gap-3">
                      <h3 className="text-4xl font-black">{stats?.onlineUsers || 0}</h3>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-green-300 uppercase">Online</span>
                      </div>
                    </div>
                    <p className="text-indigo-100/60 text-xs mt-1 font-medium italic">Active in last 5 minutes</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg relative overflow-hidden group border border-emerald-400/20">
                  <UserPlus className="absolute -right-4 -bottom-4 h-32 w-32 text-emerald-400/20 group-hover:scale-110 transition-transform" />
                  <div className="relative z-10">
                    <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1">User Growth</p>
                    <h3 className="text-4xl font-black">{stats?.signupsToday || 0}</h3>
                    <p className="text-emerald-100/60 text-xs mt-1 font-medium uppercase tracking-widest">Signups Today</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg relative overflow-hidden group border border-orange-400/20">
                  <Eye className="absolute -right-4 -bottom-4 h-32 w-32 text-amber-300/20 group-hover:scale-110 transition-transform" />
                  <div className="relative z-10">
                    <p className="text-amber-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Platform Traffic</p>
                    <h3 className="text-4xl font-black">{stats?.visits?.today || 0}</h3>
                    <div className="flex gap-2 mt-2">
                       <div className="flex flex-col">
                          <span className="text-[9px] text-amber-100/50 uppercase font-bold tracking-tighter">Monthly</span>
                          <span className="text-xs font-black">{stats?.visits?.monthly?.toLocaleString() || 0}</span>
                       </div>
                       <div className="h-6 w-px bg-white/10 mx-1" />
                       <div className="flex flex-col">
                          <span className="text-[9px] text-amber-100/50 uppercase font-bold tracking-tighter">Yearly</span>
                          <span className="text-xs font-black">{stats?.visits?.yearly?.toLocaleString() || 0}</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Users', value: stats?.users || 0, icon: Users, color: 'blue' },
                  { label: 'Crops Listed', value: stats?.crops || 0, icon: Sprout, color: 'green' },
                  { label: 'Community Posts', value: stats?.posts || 0, icon: FileText, color: 'purple' },
                  { label: 'Total Broadcasts', value: stats?.notifications || 0, icon: Bell, color: 'orange' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                    <div className={`p-2.5 rounded-xl bg-slate-50 text-slate-600 w-fit mb-4 border border-slate-100`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">{item.value.toLocaleString()}</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-600" /> Recent User Activity
                </h3>
                <div className="space-y-4">
                  {stats?.recentUsers?.map(user => (
                    <div key={user._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                       <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm overflow-hidden">
                           {user.profilePic ? (
                             <img 
                               src={user.profilePic.startsWith('/uploads') 
                                 ? `${API_URL}${user.profilePic}${user.profilePic.includes('?') ? '&' : '?' }t=${new Date().getTime()}` 
                                 : user.profilePic
                               } 
                               alt=""
                               className="h-full w-full object-cover" 
                               onError={(e) => {
                                 e.target.style.display = 'none';
                                 if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                               }}
                             />
                           ) : null}
                           <div className={cn("items-center justify-center h-full w-full", user.profilePic ? "hidden" : "flex")}>
                             {user.name.charAt(0)}
                           </div>
                         </div>
                         <div>
                           <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                           <p className="text-xs text-slate-500">{user.email}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Joined</p>
                         <p className="text-xs font-medium text-slate-600">{new Date(user.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
             <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-6">AI Scan Distribution</h3>
                      <div className="space-y-4">
                         {insights?.diseaseStats?.map((stat, idx) => (
                           <div key={idx}>
                              <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                                 <span>{stat._id}</span>
                                 <span>{Math.round((stat.count / insights.totalScans) * 100)}%</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                 <div 
                                   className="h-full bg-green-500 transition-all duration-1000" 
                                   style={{ width: `${(stat.count / insights.totalScans) * 100}%` }}
                                 />
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                   <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                       <div className="h-32 w-32 rounded-full border-8 border-indigo-50 flex items-center justify-center mb-4 relative">
                          <Activity className="h-12 w-12 text-indigo-500" />
                          <div className="absolute inset-0 rounded-full border-8 border-indigo-500 border-t-transparent animate-spin duration-[3s]" />
                       </div>
                       <h3 className="text-3xl font-black text-slate-900">{Math.round((insights?.avgConfidence || 0) * 100)}%</h3>
                       <p className="text-slate-500 font-medium">Average AI Confidence Score</p>
                       <p className="text-xs text-slate-400 mt-2 max-w-[240px]">High accuracy ensures reliable disease detection and treatment advice for farmers.</p>
                   </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">Live AI Scan Log</h3>
                  </div>
                  <div className="overflow-x-auto -mx-4 md:mx-0">
                    <table className="w-full min-w-[800px] text-left">
                       <thead className="bg-slate-50/30 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                          <tr>
                             <th className="px-6 py-4">Farmer</th>
                             <th className="px-6 py-4">Detection</th>
                             <th className="px-6 py-4 text-center">Confidence</th>
                             <th className="px-6 py-4 text-right">Time</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {insights?.recentScans?.map(scan => (
                            <tr key={scan._id} className="hover:bg-slate-50/50 transition-colors">
                               <td className="px-6 py-4 font-bold text-slate-700 text-sm">{scan.userId?.name || 'Unknown'}</td>
                               <td className="px-6 py-4">
                                  <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100">
                                    {scan.detectedDisease}
                                  </span>
                               </td>
                               <td className="px-6 py-4 text-center font-black text-slate-900">{Math.round(scan.confidenceScore * 100)}%</td>
                               <td className="px-6 py-4 text-right text-xs text-slate-400">{new Date(scan.createdAt).toLocaleString()}</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
                </div>
             </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              {selectedUserIds.length > 0 && (
                <div className="fixed bottom-20 left-4 right-4 md:relative md:bottom-0 md:left-0 md:right-0 z-[60] flex flex-col sm:flex-row items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 gap-4">
                   <div className="flex items-center gap-3">
                      <div className="bg-white/20 h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm">
                        {selectedUserIds.length}
                      </div>
                      <span className="font-bold text-sm">Users Selected</span>
                   </div>
                   <div className="flex flex-wrap items-center justify-center gap-2">
                      <button onClick={() => handleBulkAction('block')} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-xl text-xs font-bold transition-all"><Lock className="h-3 w-3" shrink-0 /> Block</button>
                      <button onClick={() => handleBulkAction('unblock')} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl text-xs font-bold transition-all"><Unlock className="h-3 w-3" shrink-0 /> Unblock</button>
                      <button onClick={() => handleBulkAction('delete')} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-xs font-bold transition-all"><Trash2 className="h-3 w-3" shrink-0 /> Delete</button>
                      <div className="hidden sm:block w-px h-6 bg-white/20 mx-2" />
                      <button onClick={() => setSelectedUserIds([])} className="p-2 text-white/50 hover:text-white transition-all"><X className="h-5 w-5" /></button>
                   </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center px-2" onClick={toggleSelectAll}>
                       <div className={cn(
                         "h-5 w-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer",
                         selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0 ? "bg-green-600 border-green-600" : "bg-white border-slate-300"
                       )}>
                         {selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0 && <CheckCircle2 className="h-3 w-3 text-white" />}
                       </div>
                    </div>
                    <div className={cn(
                       "flex items-center gap-3 flex-1 transition-all duration-300",
                       isMobile && isSearchActive ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
                    )}>
                      <Search className="h-5 w-5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search users..."
                        className="flex-1 text-sm bg-transparent border-none focus:ring-0"
                        value={searchTerm}
                        onFocus={() => isMobile ? setIsSearchActive(true) : null}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => handleExport('users')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all border border-slate-200"
                  >
                    <FileDown className="h-4 w-4" /> Export CSV
                  </button>
                </div>
                <div 
                  className="overflow-x-auto -mx-4 md:mx-0 no-scrollbar relative"
                  onMouseDown={handleUserDragStart}
                >
                  {/* Drag Selection Box Overlay */}
                  {dragSelection.active && activeTab === 'users' && (
                    <div 
                      className="fixed pointer-events-none z-[9999] bg-indigo-500/20 border border-indigo-500 rounded-sm"
                      style={{
                        left: Math.min(dragSelection.startX, dragSelection.currentX),
                        top: Math.min(dragSelection.startY, dragSelection.currentY),
                        width: Math.abs(dragSelection.startX - dragSelection.currentX),
                        height: Math.abs(dragSelection.startY - dragSelection.currentY)
                      }}
                    />
                  )}

                  <table className="w-full min-w-[900px] text-left">
                    <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                      <tr>
                        <th className="px-6 py-4 w-16" onMouseDown={(e) => e.stopPropagation()}>Select</th>
                        <th className="px-6 py-4">Farmer</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => (
                        <tr 
                          key={u._id} 
                          data-id={u._id}
                          className={cn(
                            "user-row transition-colors", 
                            selectedUserIds.includes(u._id) ? "bg-indigo-50/30" : "hover:bg-slate-50"
                          )}
                        >
                          <td className="px-6 py-4" onMouseDown={(e) => e.stopPropagation()}>
                             <div 
                               className={cn(
                                 "h-5 w-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer",
                                 selectedUserIds.includes(u._id) ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"
                               )}
                               onClick={() => toggleSelectUser(u._id)}
                             >
                               {selectedUserIds.includes(u._id) && <CheckCircle2 className="h-3 w-3 text-white" />}
                             </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 overflow-hidden">
                                {u.profilePic ? (
                                  <img 
                                    src={resolveImageUrl(u.profilePic)} 
                                    alt=""
                                    className="h-full w-full object-cover" 
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className={cn("items-center justify-center h-full w-full", u.profilePic ? "hidden" : "flex")}>
                                  {u.name.charAt(0)}
                                </div>
                              </div>
                              <div>
                                 <p className={cn("font-bold text-sm", u.status === 'blocked' ? "text-slate-400 line-through" : "text-slate-900")}>
                                   {u.name}
                                 </p>
                                 <p className="text-xs text-slate-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                              u.role === 'admin' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                            )}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                              u.status === 'blocked' ? "bg-slate-200 text-slate-600" : "bg-green-100 text-green-700"
                            )}>
                              {u.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button 
                                onClick={() => handleDirectMessage(u)}
                                className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                title="Send Private Message"
                              >
                                <MessageSquare className="h-5 w-5" />
                              </button>
                              <button 
                                onClick={() => handleToggleStatus(u._id)}
                                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                title={u.status === 'blocked' ? "Unblock User" : "Block User"}
                              >
                                {u.status === 'blocked' ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(u._id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete User"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-fit">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {selectedUser ? <MessageSquare className="h-5 w-5 text-indigo-600" /> : <Bell className="h-5 w-5 text-green-600" />} 
                    {selectedUser ? `Message to ${selectedUser.name}` : 'Send Broadcast'}
                  </h2>
                  {selectedUser && (
                    <button 
                      onClick={() => { setSelectedUser(null); setNotifForm({...notifForm, target: 'all', recipientId: '', title: ''}); }}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider"
                    >
                      Switch to Broadcast
                    </button>
                  )}
                </div>
                <form onSubmit={handleSendNotification} className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                      <input 
                        type="text" required
                        className="w-full rounded-xl border-slate-200"
                        placeholder="Weather Alert"
                        value={notifForm.title}
                        onChange={(e) => setNotifForm({...notifForm, title: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                      <select 
                        className="w-full rounded-xl border-slate-200"
                        value={notifForm.type}
                        onChange={(e) => setNotifForm({...notifForm, type: e.target.value})}
                      >
                        <option value="info">Information</option>
                        <option value="warning">Critical Warning</option>
                        <option value="success">System Success</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message Body</label>
                      <textarea 
                        required rows={3}
                        className="w-full rounded-xl border-slate-200"
                        placeholder="Detail your broadcast message here..."
                        value={notifForm.message}
                        onChange={(e) => setNotifForm({...notifForm, message: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 group cursor-pointer" onClick={() => setNotifForm({...notifForm, alsoSendEmail: !notifForm.alsoSendEmail})}>
                    <div className={cn(
                      "h-5 w-5 rounded border-2 flex items-center justify-center transition-all",
                      notifForm.alsoSendEmail ? "bg-green-600 border-green-600" : "bg-white border-slate-300"
                    )}>
                      {notifForm.alsoSendEmail && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        Also send email notification
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">Deliver this message directly to the user's registered inbox</p>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700"
                  >
                    <Send className="h-4 w-4" /> {selectedUser ? "Send Direct Message" : "Send Official Alert"}
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Broadcast History
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">{notifications.length} Sent</span>
                </div>
                <div className="divide-y divide-slate-100 h-[400px] overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n._id} className="p-4 hover:bg-slate-50 transition-colors group">
                       <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                             <div className={cn(
                               "mt-1 p-1.5 rounded-lg",
                               n.type === 'warning' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                             )}>
                               {n.type === 'warning' ? <AlertCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                             </div>
                             <div>
                               <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                               <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                               <span className="text-[10px] text-slate-400 mt-2 block uppercase font-bold tracking-tight">
                                 {new Date(n.createdAt).toLocaleString()}
                               </span>
                             </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteNotification(n._id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" /> Update Market Price
                </h2>
                <form onSubmit={handleAddMarketPrice} className="space-y-4">
                   <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Crop Name</label>
                    <input 
                      type="text" required
                      className="w-full rounded-xl border-slate-200 text-sm"
                      placeholder="e.g., Basmati Rice"
                      value={marketForm.cropName}
                      onChange={(e) => setMarketForm({...marketForm, cropName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Market Location</label>
                    <input 
                      type="text" required
                      className="w-full rounded-xl border-slate-200 text-sm"
                      placeholder="e.g., Mumbai APMC"
                      value={marketForm.marketLocation}
                      onChange={(e) => setMarketForm({...marketForm, marketLocation: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Price (per kg)</label>
                      <input 
                        type="number" required
                        className="w-full rounded-xl border-slate-200 text-sm"
                        placeholder="45"
                        value={marketForm.pricePerKg}
                        onChange={(e) => setMarketForm({...marketForm, pricePerKg: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Trend</label>
                      <select 
                        className="w-full rounded-xl border-slate-200 text-sm"
                        value={marketForm.trend}
                        onChange={(e) => setMarketForm({...marketForm, trend: e.target.value})}
                      >
                        <option value="stable">Stable</option>
                        <option value="up">Rising</option>
                        <option value="down">Falling</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors">
                    Publish Price
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900">Current Market Listings</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-medium">{marketPrices.length} Active Prices</span>
                    <button 
                      onClick={() => handleExport('market')}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-all border border-slate-200"
                    >
                      <FileDown className="h-3.5 w-3.5" /> Export
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Crop & Location</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Trend</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {marketPrices.map(m => (
                        <tr key={m._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                             <p className="font-bold text-slate-900">{m.cropName}</p>
                             <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> {m.marketLocation}</p>
                          </td>
                          <td className="px-6 py-4 font-bold text-green-600">₹{m.pricePerKg}/kg</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                              m.trend === 'up' ? "bg-green-100 text-green-700" :
                              m.trend === 'down' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                            )}>
                              {m.trend}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button onClick={() => handleDeleteMarketPrice(m._id)} className="p-2 text-slate-300 hover:text-red-500">
                               <Trash2 className="h-4 w-4" />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                   </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-green-600" />
                    Marketplace Management
                  </h2>
                  <p className="text-sm text-slate-500">Oversee all farmer product listings and addresses</p>
                </div>
                <div className="flex items-center gap-3">
                  {selectedListingIds.length > 0 && (
                    <button 
                      onClick={handleBulkDeleteListings}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black border border-red-100 flex items-center gap-2 hover:bg-red-100 transition-all shadow-sm active:scale-95"
                    >
                      <Trash2 className="h-4 w-4" /> Delete {selectedListingIds.length} Selected
                    </button>
                  )}
                  <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-xs font-bold border border-green-100 flex items-center gap-2">
                    <Sprout className="h-4 w-4" /> {allListings.length} Active Listings
                  </div>
                </div>
              </div>
              
              <div 
                className={cn(
                  "overflow-x-auto relative",
                  dragSelection.active && "select-none"
                )}
                onMouseDown={handleDragStart}
                ref={listingsScrollRef}
              >
                {/* Drag Selection Box Overlay */}
                {dragSelection.active && (
                  <div 
                    className="fixed pointer-events-none z-[9999] bg-green-500/20 border border-green-500 rounded-sm"
                    style={{
                      left: Math.min(dragSelection.startX, dragSelection.currentX),
                      top: Math.min(dragSelection.startY, dragSelection.currentY),
                      width: Math.abs(dragSelection.startX - dragSelection.currentX),
                      height: Math.abs(dragSelection.startY - dragSelection.currentY)
                    }}
                  />
                )}

                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 w-10" onMouseDown={(e) => e.stopPropagation()}>
                        <div 
                          onClick={toggleSelectAllListings}
                          className={cn(
                            "h-4 w-4 rounded border-2 flex items-center justify-center cursor-pointer transition-all",
                            selectedListingIds.length === allListings.length && allListings.length > 0 
                              ? "bg-green-600 border-green-600" 
                              : "bg-white border-slate-300"
                          )}
                        >
                          {selectedListingIds.length === allListings.length && allListings.length > 0 && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                        </div>
                      </th>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Seller</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price & Quant.</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allListings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">No marketplace listings found.</td>
                      </tr>
                    ) : (
                      allListings.map(listing => (
                        <tr 
                          key={listing._id} 
                          data-id={listing._id}
                          className={cn(
                            "listing-row transition-colors group",
                            selectedListingIds.includes(listing._id) ? "bg-green-50/30" : "hover:bg-slate-50/50"
                          )}
                        >
                          <td className="px-6 py-4" onMouseDown={(e) => e.stopPropagation()}>
                            <div 
                              onClick={() => toggleSelectListing(listing._id)}
                              className={cn(
                                "h-4 w-4 rounded border flex items-center justify-center cursor-pointer transition-all",
                                selectedListingIds.includes(listing._id) 
                                  ? "bg-green-600 border-green-600" 
                                  : "bg-white border-slate-200"
                              )}
                            >
                              {selectedListingIds.includes(listing._id) && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={listing.image?.startsWith('/uploads') ? `${API_URL}${listing.image}` : listing.image} alt={listing.title} className="h-10 w-10 rounded-lg object-cover bg-slate-100" />
                              <div>
                                <p className="text-sm font-bold text-slate-900 line-clamp-1">{listing.title}</p>
                                <p className="text-[10px] text-slate-500 line-clamp-1 italic">{listing.description || 'No description provided'}</p>
                                <p className="text-[9px] text-slate-400 uppercase tracking-tight">{new Date(listing.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {listing.seller?.profilePic ? (
                                <img src={listing.seller.profilePic} alt="" className="h-6 w-6 rounded-full" />
                              ) : (
                                <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                  {listing.seller?.name?.charAt(0) || '?'}
                                </div>
                              )}
                              <div className="max-w-[150px]">
                                <p className="text-xs font-bold text-slate-700 truncate">{listing.seller?.name || 'Unknown'}</p>
                                <p className="text-[10px] text-slate-400 truncate">{listing.seller?.email || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                              {listing.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-green-600">₹{listing.price}</p>
                            <p className="text-[10px] text-slate-500">{listing.quantity} available</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap",
                              listing.status === 'available' ? "bg-green-50 text-green-700 border border-green-100" : "bg-slate-100 text-slate-500 border border-slate-200"
                            )}>
                              {listing.status?.replace('_', ' ') || 'available'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleUpdateListingStatus(listing._id, listing.status || 'available')}
                                className={cn(
                                  "p-2 rounded-lg transition-all border shadow-sm active:scale-95",
                                  listing.status === 'out_of_stock' ? "bg-green-50 border-green-100 text-green-600 hover:bg-green-100" : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                                )}
                                title={listing.status === 'out_of_stock' ? "Mark Available" : "Mark Out of Stock"}
                              >
                                <Package className={cn("h-4 w-4", listing.status === 'available' ? "opacity-50" : "opacity-100")} />
                              </button>
                              <button 
                                onClick={() => handleDeleteAdminListing(listing._id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                                title="Delete Listing"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 p-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
                  <Bell className="h-5 w-5 text-amber-500" />
                  Banner Management (Announcements)
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Form */}
                  <form id="announcementForm" onSubmit={handleCreateAnnouncement} className={cn("space-y-4 p-6 rounded-3xl border transition-all duration-500", editingAnnouncementId ? "bg-indigo-50/50 border-indigo-200" : "bg-slate-50 border-slate-100")}>
                    <div className="flex items-center justify-between mb-2">
                       <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                         {editingAnnouncementId ? 'Edit Banner Mode' : 'Banner Details'}
                       </h3>
                       {editingAnnouncementId && (
                         <button 
                           type="button"
                           onClick={() => {
                             setEditingAnnouncementId(null);
                             setAnnouncementForm({ title: '', subtitle: '', bgGradient: 'bg-gradient-to-br from-green-500 to-emerald-700', imageUrl: '', accentColor: 'bg-green-400/20', link: '' });
                           }}
                           className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                         >
                           <X className="h-3 w-3" /> Cancel Edit
                         </button>
                       )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Banner Title</label>
                      <input 
                        type="text" required
                        className="w-full rounded-2xl border-slate-200 text-sm font-bold"
                        placeholder="e.g., Stock Clearing Sale"
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Subtitle</label>
                      <input 
                        type="text" required
                        className="w-full rounded-2xl border-slate-200 text-sm"
                        placeholder="Up to 30% Off on Seeds"
                        value={announcementForm.subtitle}
                        onChange={(e) => setAnnouncementForm({...announcementForm, subtitle: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Image URL (Unsplash/Web)</label>
                      <input 
                        type="text" required
                        className="w-full rounded-2xl border-slate-200 text-sm"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={announcementForm.imageUrl}
                        onChange={(e) => setAnnouncementForm({...announcementForm, imageUrl: e.target.value})}
                      />
                    </div>
                    <div className="space-y-4 bg-slate-100/50 p-6 rounded-[28px] border border-slate-200/60 shadow-inner">
                       <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-tight">Select Theme Color (Visual Picker)</label>
                        <div className="grid grid-cols-7 gap-2 bg-white/80 backdrop-blur-sm p-3 rounded-2xl max-h-[140px] overflow-y-auto no-scrollbar border border-slate-200">
                           {BANNER_GRADIENTS.map((g) => (
                             <button
                               key={g.name}
                               type="button"
                               title={g.name}
                               onClick={() => setAnnouncementForm({...announcementForm, bgGradient: g.value})}
                               className={cn(
                                 "w-10 h-10 rounded-full transition-all border-2 relative group flex items-center justify-center",
                                 g.value,
                                 announcementForm.bgGradient === g.value ? "border-slate-900 scale-110 shadow-lg z-10" : "border-transparent opacity-80 hover:opacity-100"
                               )}
                             >
                               {announcementForm.bgGradient === g.value && (
                                 <CheckCircle2 className="h-4 w-4 text-white drop-shadow-md" />
                               )}
                               <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                 {g.name}
                               </div>
                             </button>
                           ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Accent Color (Advanced)</label>
                          <input 
                            type="text" 
                            className="w-full rounded-2xl border-slate-200 text-xs py-2.5"
                            placeholder="bg-green-400/20"
                            value={announcementForm.accentColor}
                            onChange={(e) => setAnnouncementForm({...announcementForm, accentColor: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Destination Link (Optional)</label>
                          <input 
                            type="text" 
                            className="w-full rounded-2xl border-slate-200 text-sm py-2.5"
                            placeholder="/app/sales"
                            value={announcementForm.link}
                            onChange={(e) => setAnnouncementForm({...announcementForm, link: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <button type="submit" className={cn("w-full text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 mt-4", editingAnnouncementId ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-900 hover:bg-slate-800")}>
                      {editingAnnouncementId ? <CheckCircle2 className="h-4 w-4" /> : null}
                      {editingAnnouncementId ? 'Update Marketplace Banner' : 'Publish Marketplace Banner'}
                    </button>
                  </form>

                  {/* List */}
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                    {announcements.map(ann => (
                      <div key={ann._id} className={cn("p-6 rounded-[32px] relative overflow-hidden text-white shadow-md border border-white/10", ann.bgGradient)}>
                         <div className="relative z-10 flex justify-between items-start">
                            <div>
                              <h4 className="font-black text-xl">{ann.title}</h4>
                              <p className="text-white/80 text-xs font-bold uppercase tracking-wider">{ann.subtitle}</p>
                            </div>
                            <div className="flex gap-1.5">
                               <button onClick={() => handleEditAnnouncement(ann)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/20">
                                  <Edit3 className="h-4 w-4" />
                               </button>
                               <button onClick={() => handleDeleteAnnouncement(ann._id)} className="p-2 bg-white/10 hover:bg-red-500 rounded-full transition-all border border-white/20">
                                  <Trash2 className="h-4 w-4" />
                               </button>
                             </div>
                         </div>
                         <div className="absolute right-0 top-0 h-full w-[30%] opacity-100">
                            <img src={ann.imageUrl} className="h-full w-full object-cover" alt="" />
                         </div>
                      </div>
                    ))}
                    {announcements.length === 0 && (
                      <div className="h-32 rounded-[32px] border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 italic">
                        No active announcements
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'crops' && (
            <div className="bg-white p-4 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-green-600" /> 
                  Register New Crop Data
                </h2>
                <form onSubmit={handleAddCrop} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Crop Name</label>
                    <input 
                      type="text" required
                      className="w-full rounded-xl border-slate-200"
                      placeholder="e.g., Alphonso Mango"
                      value={cropForm.name}
                      onChange={(e) => setCropForm({...cropForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ideal Soil (comma separated)</label>
                    <input 
                      type="text" required
                      className="w-full rounded-xl border-slate-200"
                      placeholder="Sandy, Loamy"
                      value={cropForm.idealSoil}
                      onChange={(e) => setCropForm({...cropForm, idealSoil: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Season (comma separated)</label>
                    <input 
                      type="text" required
                      className="w-full rounded-xl border-slate-200"
                      placeholder="Summer, Monsoon"
                      value={cropForm.season}
                      onChange={(e) => setCropForm({...cropForm, season: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Water Requirement</label>
                    <select 
                      className="w-full rounded-xl border-slate-200"
                      value={cropForm.waterRequirement}
                      onChange={(e) => setCropForm({...cropForm, waterRequirement: e.target.value})}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Estimated Yield</label>
                    <input 
                      type="text" required
                      className="w-full rounded-xl border-slate-200"
                      placeholder="3-4 tons/hectare"
                      value={cropForm.estimatedYield}
                      onChange={(e) => setCropForm({...cropForm, estimatedYield: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                    <textarea 
                      required rows={3}
                      className="w-full rounded-xl border-slate-200"
                      placeholder="Cultural practices and crop benefits..."
                      value={cropForm.description}
                      onChange={(e) => setCropForm({...cropForm, description: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="col-span-2 bg-green-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg shadow-green-100"
                  >
                    <Plus className="h-5 w-5" /> Add to Platform Database
                  </button>
                </form>
            </div>
          )}

          {activeTab === 'spotlight' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Spotlight Creator Form */}
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-indigo-600" />
                     </div>
                     <div>
                        <h2 className="text-xl font-bold text-slate-900">Create New Spotlight</h2>
                        <p className="text-sm text-slate-500">Add premium promotional content to the main dashboard.</p>
                     </div>
                  </div>
                  
                  <form onSubmit={handleCreateSpotlight} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Campaign Title</label>
                              <input 
                                type="text" required
                                className="w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 text-sm py-3"
                                placeholder="e.g., Save up to ₹50,000 on New Tractors"
                                value={spotlightForm.title} onChange={e => setSpotlightForm({...spotlightForm, title: e.target.value})}
                              />
                           </div>
                           <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description (Marketing Hook)</label>
                              <textarea 
                                required rows={3}
                                className="w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder="Upgrade your farm with the latest tech..."
                                value={spotlightForm.description} onChange={e => setSpotlightForm({...spotlightForm, description: e.target.value})}
                              />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Badge Text</label>
                                 <input 
                                   type="text" required
                                   className="w-full rounded-xl border-slate-200 text-sm"
                                   placeholder="e.g., SEASONAL OFFER"
                                   value={spotlightForm.badge} onChange={e => setSpotlightForm({...spotlightForm, badge: e.target.value})}
                                 />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Brand/Partner Name</label>
                                 <input 
                                   type="text" required
                                   className="w-full rounded-xl border-slate-200 text-sm"
                                   placeholder="e.g., Mahindra"
                                   value={spotlightForm.brand} onChange={e => setSpotlightForm({...spotlightForm, brand: e.target.value})}
                                 />
                              </div>
                           </div>
                        </div>
                        
                        <div className="space-y-4">
                           <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Before/Primary Image URL</label>
                              <input 
                                type="url" required
                                className="w-full rounded-xl border-slate-200 text-sm"
                                placeholder="https://..."
                                value={spotlightForm.imageUrl} onChange={e => setSpotlightForm({...spotlightForm, imageUrl: e.target.value})}
                              />
                           </div>
                           <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">After/Secondary Image (Optional)</label>
                              <input 
                                type="url"
                                className="w-full rounded-xl border-slate-200 text-sm"
                                placeholder="https://..."
                                value={spotlightForm.secondaryImageUrl} onChange={e => setSpotlightForm({...spotlightForm, secondaryImageUrl: e.target.value})}
                              />
                           </div>
                           <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Video URL (Optional)</label>
                              <input 
                                type="url"
                                className="w-full rounded-xl border-slate-200 text-sm"
                                placeholder="Direct .mp4 link"
                                value={spotlightForm.videoUrl} onChange={e => setSpotlightForm({...spotlightForm, videoUrl: e.target.value})}
                              />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Content Type</label>
                                 <select 
                                   className="w-full rounded-xl border-slate-200 text-sm"
                                   value={spotlightForm.type} onChange={e => setSpotlightForm({...spotlightForm, type: e.target.value})}
                                 >
                                    <option value="image">Image Only</option>
                                    <option value="video">Video Loop</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Theme Color (CSS)</label>
                                 <input 
                                   type="text"
                                   className="w-full rounded-xl border-slate-200 text-sm"
                                   placeholder="e.g., indigo-600"
                                   value={spotlightForm.color} onChange={e => setSpotlightForm({...spotlightForm, color: e.target.value})}
                                 />
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Button Text</label>
                                 <input 
                                   type="text"
                                   className="w-full rounded-xl border-slate-200 text-sm"
                                   value={spotlightForm.buttonText} onChange={e => setSpotlightForm({...spotlightForm, buttonText: e.target.value})}
                                 />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Link (URL)</label>
                                 <input 
                                   type="text"
                                   className="w-full rounded-xl border-slate-200 text-sm"
                                   placeholder="External or internal path"
                                   value={spotlightForm.link} onChange={e => setSpotlightForm({...spotlightForm, link: e.target.value})}
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                     
                     <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button 
                          type="submit"
                          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 active:scale-95"
                        >
                           <Megaphone className="h-5 w-5" />
                           Launch Spotlight
                        </button>
                     </div>
                  </form>
               </div>

               {/* Active Spotlights List */}
               <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                     <h3 className="font-bold text-slate-900">Manage Active Spotlights ({spotlights.length})</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {spotlights.length === 0 ? (
                       <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 font-medium">
                          No active spotlight campaigns yet.
                       </div>
                     ) : (
                       spotlights.map(item => (
                         <div key={item._id} className="relative group bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
                            <div className="aspect-[21/9] bg-slate-100 relative overflow-hidden">
                               <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                               {item.type === 'video' && (
                                 <div className="absolute top-2 right-2 bg-slate-900/40 backdrop-blur-md p-1.5 rounded-lg">
                                    <Monitor className="h-3 w-3 text-white" />
                                 </div>
                               )}
                               <div className="absolute top-2 left-2 flex gap-1">
                                  <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-md text-[8px] font-black uppercase text-indigo-600">{item.brand}</span>
                               </div>
                            </div>
                            <div className="p-5">
                               <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h4>
                                  <button 
                                    onClick={() => handleDeleteSpotlight(item._id)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                               </div>
                               <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{item.description}</p>
                               <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                  <span>{item.badge}</span>
                                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                               </div>
                            </div>
                         </div>
                       ))
                     )}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'community' && (
            <div className="space-y-6">
              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden active:scale-[0.99] transition-all duration-300">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                       <MessageSquare className="h-6 w-6 text-indigo-600" /> Community Moderation
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">Control the narrative and ensure platform health</p>
                  </div>
                  
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 shrink-0 h-fit">
                    <button 
                      onClick={() => setCommunitySubTab('list')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        communitySubTab === 'list' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      All Discussions
                    </button>
                    <button 
                      onClick={() => {
                        setCommunitySubTab('form');
                        setEditingPost(null);
                        setPostForm({ title: '', content: '', tags: '' });
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        communitySubTab === 'form' ? "bg-white text-green-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {editingPost ? 'Edit Selected Post' : 'Post Management'}
                    </button>
                  </div>
                </div>

                {communitySubTab === 'form' && (
                  <div className="p-8 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="max-w-3xl mx-auto space-y-8">
                       <div className="bg-indigo-50/30 border border-indigo-100 p-6 rounded-3xl relative overflow-hidden">
                          <div className="relative z-10 flex items-start gap-4">
                             <div className="h-10 w-10 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
                                {editingPost ? <Edit3 className="h-5 w-5 text-indigo-600" /> : <Send className="h-5 w-5 text-indigo-600" />}
                             </div>
                             <div>
                                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-1">{editingPost ? 'Edit Community Resource' : 'Publish Official Advisory'}</h3>
                                <p className="text-sm text-slate-500">{editingPost ? `Currently modifying: ${editingPost.title}` : 'Your post will appear at the top of the community feed for all farmers.'}</p>
                             </div>
                          </div>
                          {editingPost && (
                            <button 
                              onClick={() => {
                                setEditingPost(null);
                                setPostForm({ title: '', content: '', tags: '' });
                              }}
                              className="absolute top-6 right-6 p-2 hover:bg-white rounded-xl transition-all"
                            >
                              <X className="h-4 w-4 text-slate-400" />
                            </button>
                          )}
                       </div>

                       <form onSubmit={editingPost ? handleUpdateAdminPost : handleCreatePost} className="space-y-6">
                         <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Discussion Title</label>
                           <input 
                             type="text" required
                             className="w-full rounded-2xl border-slate-200 focus:ring-indigo-500 text-sm font-bold py-3"
                             placeholder="e.g., Best practices for Monsoon Sowing"
                             value={postForm.title}
                             onChange={(e) => setPostForm({...postForm, title: e.target.value})}
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Content / Advisory Body</label>
                           <textarea 
                             required rows={6}
                             className="w-full rounded-3xl border-slate-200 focus:ring-indigo-500 text-sm leading-relaxed"
                             placeholder="Provide valuable information or question here..."
                             value={postForm.content}
                             onChange={(e) => setPostForm({...postForm, content: e.target.value})}
                           />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Tags (Comma Separated)</label>
                            <input 
                              type="text"
                              className="w-full rounded-2xl border-slate-200 focus:ring-indigo-500 text-xs"
                              placeholder="Govt, Scheme, Maharashtra, Help"
                              value={postForm.tags}
                              onChange={(e) => setPostForm({...postForm, tags: e.target.value})}
                            />
                          </div>

                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Discussion Image</label>
                            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/30 hover:bg-slate-50 hover:border-indigo-300 transition-all group">
                               {(selectedPostImage || (editingPost && editingPost.image)) ? (
                                 <div className="h-32 w-32 rounded-2xl overflow-hidden border border-slate-200 relative shrink-0">
                                    <img 
                                      src={selectedPostImage ? URL.createObjectURL(selectedPostImage) : (editingPost.image?.startsWith('http') ? editingPost.image : `${API_URL}/${editingPost.image}`)} 
                                      className="h-full w-full object-cover" 
                                      alt="Preview" 
                                    />
                                    <button 
                                      type="button"
                                      onClick={() => setSelectedPostImage(null)}
                                      className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all"
                                    >
                                       <X className="h-3 w-3" />
                                    </button>
                                 </div>
                               ) : (
                                 <div className="h-32 w-32 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0">
                                    <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                                    <span className="text-[8px] font-bold uppercase">No Image</span>
                                 </div>
                               )}
                               
                               <div className="flex-1 text-center sm:text-left">
                                  <h4 className="text-sm font-bold text-slate-700 mb-1">{selectedPostImage ? selectedPostImage.name : 'Upload visual context'}</h4>
                                  <p className="text-xs text-slate-400 mb-4">Support: JPG, PNG, WEBP (Max 5MB)</p>
                                  <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-sm transition-all uppercase tracking-widest">
                                     <CloudUpload className="h-4 w-4" />
                                     Choose Graphic
                                     <input 
                                       type="file" 
                                       className="hidden" 
                                       accept="image/*"
                                       onChange={(e) => setSelectedPostImage(e.target.files[0])}
                                     />
                                  </label>
                               </div>
                            </div>
                          </div>
                         <div className="pt-4 flex justify-end gap-3">
                           {editingPost && (
                             <button 
                               type="button"
                               onClick={() => {
                                 setEditingPost(null);
                                 setCommunitySubTab('list');
                               }}
                               className="px-8 py-3 rounded-2xl text-xs font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest"
                             >
                               Discard Changes
                             </button>
                           )}
                           <button 
                             type="submit"
                             className={cn(
                               "px-10 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3",
                               editingPost ? "bg-indigo-600 shadow-indigo-100" : "bg-slate-900 shadow-slate-200"
                             )}
                           >
                             {editingPost ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                             {editingPost ? 'Apply Modification' : 'Publish Broadcast Post'}
                           </button>
                         </div>
                       </form>
                    </div>
                  </div>
                )}

                {communitySubTab === 'list' && (
                  <div className="p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allPosts.length === 0 ? (
                          <div className="col-span-full py-24 text-center">
                             <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                                <MessageSquare className="h-8 w-8 text-slate-300" />
                             </div>
                             <h4 className="font-bold text-slate-900">Silence in the community...</h4>
                             <p className="text-sm text-slate-400">No farmer posts found. Start an official discussion!</p>
                          </div>
                        ) : (
                          allPosts.map(post => (
                            <div key={post._id} className="bg-white rounded-[28px] border border-slate-200/60 p-6 flex flex-col hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                               <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all flex gap-1 transform translate-y-2 group-hover:translate-y-0">
                                  <button 
                                    onClick={() => {
                                       handleEditPost(post);
                                       setCommunitySubTab('form');
                                    }}
                                    className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                    title="Edit Post"
                                  >
                                     <Edit3 className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeletePost(post._id)}
                                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                    title="Delete Post"
                                  >
                                     <Trash2 className="h-4 w-4" />
                                  </button>
                               </div>

                               <div className="flex items-center gap-3 mb-4">
                                  <div className="h-10 w-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                     {post.authorPic ? (
                                       <img src={post.authorPic} className="h-full w-full object-cover" alt="" />
                                     ) : (
                                       <span className="font-black text-slate-400 text-xs">{post.author?.charAt(0) || '?'}</span>
                                     )}
                                  </div>
                                  <div className="min-w-0">
                                     <h4 className="text-sm font-black text-slate-900 truncate pr-16">{post.author || 'Farmer'}</h4>
                                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{post.time}</p>
                                  </div>
                               </div>

                               <h3 className="font-black text-slate-900 mb-2 line-clamp-2 min-h-[2.5rem] leading-tight group-hover:text-indigo-600 transition-colors">{post.title}</h3>
                               <p className="text-xs text-slate-500 line-clamp-4 flex-1 leading-relaxed">{post.content}</p>

                               <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                     <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                        <TrendingUp className="h-3 w-3 text-emerald-500" /> {post.likes}
                                     </span>
                                     <button 
                                       onClick={() => setViewingPost(post)}
                                       className="flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-tighter transition-all"
                                     >
                                        <MessageCircle className="h-3 w-3 text-indigo-500" /> {post.replies || 0}
                                     </button>
                                  </div>
                                  <div className="flex gap-1 overflow-hidden max-w-[120px]">
                                     {post.tags?.slice(0, 2).map((t, idx) => (
                                       <span key={idx} className="text-[8px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-tighter whitespace-nowrap">{t}</span>
                                     ))}
                                  </div>
                               </div>
                            </div>
                          ))
                        )}
                     </div>
                  </div>
                )}
              </div>

               {/* Comment Moderation Modal */}
               {viewingPost && (
                 <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                   <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                     <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-900">Manage Comments</h3>
                        <button onClick={() => setViewingPost(null)} className="p-2 hover:bg-white rounded-xl transition-all">
                          <X className="h-5 w-5 text-slate-400" />
                        </button>
                     </div>
                     <div className="p-6 max-h-[60dvh] overflow-y-auto space-y-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Post Context</p>
                           <h4 className="font-bold text-slate-900">{viewingPost.title}</h4>
                        </div>
                        {viewingPost.comments?.length === 0 ? (
                          <p className="text-center py-8 text-slate-400 font-medium italic">No comments to moderate yet</p>
                        ) : (
                          <div className="space-y-3">
                            {viewingPost.comments.map(comment => (
                              <div key={comment._id} className="p-4 rounded-2xl border border-slate-100 flex justify-between items-start group">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900">{comment.userId?.name || 'User'}</span>
                                    <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-sm text-slate-600 leading-relaxed">{comment.text}</p>
                                </div>
                                <button 
                                  onClick={() => handleDeleteComment(viewingPost._id, comment._id)}
                                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                     </div>
                   </div>
                 </div>
               )}
            </div>
          )}

                  {activeTab === 'settings' && (
            <div className="space-y-6">
               {/* --- GLOSSY SETTINGS HEADER --- */}
               <div className="bg-white/40 backdrop-blur-xl border border-white/40 p-6 rounded-[32px] shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-indigo-600" /> 
                    Platform Control Center
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Configure global platform behavior and aesthetics.</p>
               </div>

               {/* --- COMPACT GLOSSY CARDS GRID --- */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* CARD 1: DESKTOP BACKGROUND (GLOSSY) */}
                  <div className="bg-white/40 backdrop-blur-xl border border-white/40 p-6 rounded-[32px] shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-indigo-600">
                        <Monitor className="h-12 w-12" />
                     </div>
                     
                     <div className="relative z-10 space-y-5">
                        <div className="flex items-center justify-between">
                           <h4 className="font-black text-slate-900 flex items-center gap-2 text-sm">
                              <Monitor className="h-4 w-4 text-indigo-600" />
                              Desktop Background
                           </h4>
                           <button 
                             onClick={() => {
                               if(!globalSettings.find(s => s.key === 'user_dashboard_bg')?.value) return;
                               if(window.confirm('Delete desktop background and revert to default?')) {
                                 handleUpdateSetting('user_dashboard_bg', '');
                               }
                             }}
                             className={cn(
                               "p-1.5 rounded-lg transition-all border flex items-center gap-1.5",
                               globalSettings.find(s => s.key === 'user_dashboard_bg')?.value 
                                 ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100 cursor-pointer" 
                                 : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-50"
                             )}
                             title="Clear Desktop Background"
                           >
                              <Trash2 className="h-3 w-3" />
                              <span className="text-[9px] font-black uppercase tracking-tighter">Delete</span>
                           </button>
                        </div>

                        {/* URL OPTION */}
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Image URL</label>
                           <div className="flex gap-2">
                              <input 
                                id="desktopBgInput"
                                type="text" 
                                className="flex-1 bg-white/50 border-white/20 rounded-xl text-xs py-1.5 focus:ring-indigo-500"
                                placeholder="Paste Desktop URL..."
                                defaultValue={globalSettings.find(s => s.key === 'user_dashboard_bg')?.value || ''}
                              />
                              <button 
                                onClick={() => handleUpdateSetting('user_dashboard_bg', document.getElementById('desktopBgInput')?.value || '')}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                              >
                                SET
                              </button>
                           </div>
                        </div>

                        {/* UPLOAD OPTION */}
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local Upload</label>
                           <div className="flex gap-2 items-center">
                              <div className="flex-1 relative">
                                 <input 
                                   type="file" 
                                   accept="image/*"
                                   id="desktopBgFile"
                                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                   onChange={(e) => {
                                      const lbl = document.getElementById('desktop-file-label');
                                      if (lbl && e.target.files[0]) lbl.innerText = e.target.files[0].name;
                                   }}
                                 />
                                 <div className="py-1.5 px-3 rounded-xl border border-dashed border-slate-300 bg-white/30 text-[10px] font-bold text-slate-500 flex items-center gap-2 truncate">
                                    <Upload className="h-3 w-3" />
                                    <span id="desktop-file-label">Choose photo...</span>
                                 </div>
                              </div>
                              <button 
                                onClick={async () => {
                                  const fileInput = document.getElementById('desktopBgFile');
                                  if (!fileInput.files[0]) return alert('Select a photo');
                                  await handleUploadBackground(fileInput.files[0], 'user_dashboard_bg');
                                }}
                                className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-slate-800 transition-all"
                              >
                                UPLOAD
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* CARD 2: MOBILE BACKGROUND (GLOSSY) */}
                  <div className="bg-white/40 backdrop-blur-xl border border-white/40 p-6 rounded-[32px] shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-indigo-600">
                        <Smartphone className="h-12 w-12" />
                     </div>
                     
                     <div className="relative z-10 space-y-5">
                        <div className="flex items-center justify-between">
                           <h4 className="font-black text-slate-900 flex items-center gap-2 text-sm">
                              <Smartphone className="h-4 w-4 text-indigo-600" />
                              Mobile Background
                           </h4>
                           <button 
                             onClick={() => {
                               if(!globalSettings.find(s => s.key === 'user_dashboard_bg_mobile')?.value) return;
                               if(window.confirm('Delete mobile background and revert to default?')) {
                                 handleUpdateSetting('user_dashboard_bg_mobile', '');
                               }
                             }}
                             className={cn(
                               "p-1.5 rounded-lg transition-all border flex items-center gap-1.5",
                               globalSettings.find(s => s.key === 'user_dashboard_bg_mobile')?.value 
                                 ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100 cursor-pointer" 
                                 : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-50"
                             )}
                             title="Clear Mobile Background"
                           >
                              <Trash2 className="h-3 w-3" />
                              <span className="text-[9px] font-black uppercase tracking-tighter">Delete</span>
                           </button>
                        </div>

                        {/* URL OPTION */}
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Image URL</label>
                           <div className="flex gap-2">
                              <input 
                                id="mobileBgInput"
                                type="text" 
                                className="flex-1 bg-white/50 border-white/20 rounded-xl text-xs py-1.5 focus:ring-indigo-500"
                                placeholder="Paste Mobile URL..."
                                defaultValue={globalSettings.find(s => s.key === 'user_dashboard_bg_mobile')?.value || ''}
                              />
                              <button 
                                onClick={() => handleUpdateSetting('user_dashboard_bg_mobile', document.getElementById('mobileBgInput')?.value || '')}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                              >
                                SET
                              </button>
                           </div>
                        </div>

                        {/* UPLOAD OPTION */}
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local Upload</label>
                           <div className="flex gap-2 items-center">
                              <div className="flex-1 relative">
                                 <input 
                                   type="file" 
                                   accept="image/*"
                                   id="mobileBgFile"
                                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                   onChange={(e) => {
                                      const lbl = document.getElementById('mobile-file-label');
                                      if (lbl && e.target.files[0]) lbl.innerText = e.target.files[0].name;
                                   }}
                                 />
                                 <div className="py-1.5 px-3 rounded-xl border border-dashed border-slate-300 bg-white/30 text-[10px] font-bold text-slate-500 flex items-center gap-2 truncate">
                                    <Upload className="h-3 w-3" />
                                    <span id="mobile-file-label">Choose photo...</span>
                                 </div>
                              </div>
                              <button 
                                onClick={async () => {
                                  const fileInput = document.getElementById('mobileBgFile');
                                  if (!fileInput.files[0]) return alert('Select a photo');
                                  await handleUploadBackground(fileInput.files[0], 'user_dashboard_bg_mobile');
                                }}
                                className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-slate-800 transition-all"
                              >
                                UPLOAD
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>

                   {/* --- DASHBOARD TOOL TILES SECTION --- */}
                   <div className="col-span-1 lg:col-span-2 mt-4 space-y-4">
                      <div className="flex items-center gap-3 px-2">
                         <div className="h-1 bg-indigo-600 w-12 rounded-full" />
                         <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tool Navigation Tiles (Images)</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {[
                            { key: 'tile_crop_guide', label: 'Crop Recommendation', Icon: Sprout, color: 'text-green-500' },
                            { key: 'tile_disease_ml', label: 'Disease Detection', Icon: ShieldAlert, color: 'text-rose-500' },
                            { key: 'tile_irrigation', label: 'Irrigation Advice', Icon: Droplets, color: 'text-blue-500' },
                            { key: 'tile_market_prices', label: 'Market Prices', Icon: TrendingUp, color: 'text-amber-500' },
                            { key: 'tile_marketplace', label: 'Farmer Marketplace', Icon: ShoppingBag, color: 'text-indigo-500' },
                         ].map((item) => (
                            <div key={item.key} className="bg-white/40 backdrop-blur-xl border border-white/40 p-6 rounded-[32px] shadow-sm relative overflow-hidden group">
                               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                  <item.Icon className={cn("h-10 w-10", item.color)} />
                               </div>
                               
                               <div className="relative z-10 space-y-4">
                                  <div className="flex items-center justify-between">
                                     <h5 className="font-black text-slate-900 flex items-center gap-2 text-[11px] uppercase tracking-wider">
                                        <item.Icon className={cn("h-3.5 w-3.5", item.color)} />
                                        {item.label}
                                     </h5>
                                     <button 
                                       onClick={() => {
                                         if(!globalSettings.find(s => s.key === item.key)?.value) return;
                                         if(window.confirm(`Reset ${item.label} image to default?`)) {
                                           handleUpdateSetting(item.key, '');
                                         }
                                       }}
                                       className={cn(
                                         "p-1.5 rounded-lg transition-all border",
                                         globalSettings.find(s => s.key === item.key)?.value 
                                           ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100" 
                                           : "bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed opacity-50"
                                       )}
                                       title="Clear Image"
                                     >
                                        <Trash2 className="h-3 w-3" />
                                     </button>
                                  </div>

                                  {/* URL OPTION */}
                                  <div className="space-y-1.5">
                                     <div className="flex items-center justify-between">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Image URL</label>
                                        {globalSettings.find(s => s.key === item.key)?.value && (
                                          <span className="text-[8px] font-black text-green-600 uppercase flex items-center gap-1">
                                            <CheckCircle2 className="h-2 w-2" /> Active
                                          </span>
                                        )}
                                     </div>
                                     <div className="flex gap-2">
                                        <input 
                                          id={`${item.key}Input`}
                                          type="text" 
                                          className="flex-1 bg-white/50 border-white/20 rounded-xl text-[10px] py-1.5 focus:ring-1 focus:ring-indigo-200"
                                          placeholder="Unsplash URL..."
                                          defaultValue={globalSettings.find(s => s.key === item.key)?.value || ''}
                                        />
                                        <button 
                                          onClick={() => handleUpdateSetting(item.key, document.getElementById(`${item.key}Input`)?.value || '')}
                                          className="px-3 bg-slate-900 text-white rounded-xl text-[9px] font-black hover:bg-slate-800 transition-all active:scale-95"
                                        >
                                          SET
                                        </button>
                                     </div>
                                  </div>

                                  {/* UPLOAD OPTION */}
                                  <div className="space-y-1.5 pt-0.5">
                                     <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Local Upload</label>
                                     <div className="flex gap-2 items-center">
                                        <div className="flex-1 relative">
                                           <input 
                                             type="file" 
                                             accept="image/*"
                                             id={`${item.key}File`}
                                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                             onChange={(e) => {
                                                const lbl = document.getElementById(`${item.key}-file-label`);
                                                if (lbl && e.target.files[0]) lbl.innerText = e.target.files[0].name;
                                             }}
                                           />
                                           <div className="py-1.5 px-3 rounded-xl border border-dashed border-slate-300 bg-white/30 text-[9px] font-bold text-slate-500 flex items-center gap-2 truncate whitespace-nowrap overflow-hidden">
                                              <Upload className="h-2.5 w-2.5 shrink-0" />
                                              <span id={`${item.key}-file-label`} className="truncate">Choose...</span>
                                           </div>
                                        </div>
                                        <button 
                                          onClick={async () => {
                                            const fileInput = document.getElementById(`${item.key}File`);
                                            if (!fileInput.files[0]) return alert('Select a photo first');
                                            await handleUploadBackground(fileInput.files[0], item.key);
                                          }}
                                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 whitespace-nowrap"
                                        >
                                          UPLOAD
                                        </button>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* CARD 2: MAINTENANCE & SYSTEM (GLOSSY) */}
                  <div className="bg-white/40 backdrop-blur-xl border border-white/40 p-6 rounded-[32px] shadow-sm flex flex-col justify-between">
                     <div className="space-y-4">
                        <h4 className="font-black text-slate-900 flex items-center gap-2 text-sm">
                           <Activity className="h-4 w-4 text-emerald-500" />
                           System Status
                        </h4>
                        
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/30 border border-white/40">
                           <div>
                              <span className="text-xs font-bold text-slate-700 block">Maintenance Mode</span>
                              <p className="text-[10px] text-slate-500 italic">Redirects all users to safety page.</p>
                           </div>
                           <button 
                             onClick={() => handleUpdateSetting('maintenanceMode', !isMaintenanceOn())}
                             className={cn(
                               "w-10 h-5 rounded-full relative transition-colors duration-200",
                               isMaintenanceOn() ? "bg-red-500" : "bg-slate-200"
                             )}
                           >
                             <div className={cn(
                               "absolute top-1 bg-white h-3 w-3 rounded-full transition-all duration-200",
                               isMaintenanceOn() ? "left-6" : "left-1"
                             )} />
                           </button>
                        </div>
                     </div>

                     <div className="mt-4 p-4 rounded-2xl bg-amber-50/30 border border-amber-100/50 flex items-start gap-3">
                        <ShieldAlert className="h-4 w-4 text-amber-500 mt-0.5" />
                        <div>
                           <span className="text-[10px] font-black text-amber-700 uppercase tracking-tighter">Admin Note</span>
                           <p className="text-[10px] text-amber-600/80 leading-snug">Visual changes impact all user dashboards instantly. Use high-resolution assets for best quality.</p>
                        </div>
                     </div>
                  </div>

                  {/* CARD 3: COMMUNICATION (GLOSSY) */}
                  <div className="bg-white/40 backdrop-blur-xl border border-white/40 p-6 rounded-[32px] shadow-sm">
                     <div className="space-y-4">
                        <h4 className="font-black text-slate-900 flex items-center gap-2 text-sm">
                           <Mail className="h-4 w-4 text-indigo-500" />
                           Support Channel
                        </h4>
                        <div className="flex gap-2">
                           <input 
                             id="compactSupportEmail"
                             type="email" 
                             className="flex-1 bg-white/50 border-white/20 rounded-xl text-xs py-1.5"
                             placeholder="support@agrismart.com" 
                             defaultValue={globalSettings.find(s => s.key === 'supportEmail')?.value || ''}
                           />
                           <button 
                             onClick={() => handleUpdateSetting('supportEmail', document.getElementById('compactSupportEmail')?.value || '')}
                             className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black transition-all"
                           >
                             SAVE
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* CARD 4: MEDIA STREAMS (GLOSSY) */}
                  <div className="bg-white/40 backdrop-blur-xl border border-white/40 p-6 rounded-[32px] shadow-sm">
                     <div className="space-y-4">
                        <h4 className="font-black text-slate-900 flex items-center gap-2 text-sm">
                           <MonitorPlay className="h-4 w-4 text-orange-500" />
                           Live Agri-Cam
                        </h4>
                        <div className="flex gap-2">
                           <input 
                             id="compactCamUrl"
                             type="text" 
                             className="flex-1 bg-white/50 border-white/20 rounded-xl text-xs py-1.5"
                             placeholder="Stream URL/Video path..."
                             defaultValue={globalSettings.find(s => s.key === 'agriCamUrl')?.value || ''}
                           />
                           <button 
                             onClick={() => handleUpdateSetting('agriCamUrl', document.getElementById('compactCamUrl')?.value || '')}
                             className="px-4 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-[10px] font-black transition-all"
                           >
                             UPDATE
                           </button>
                        </div>
                     </div>
                  </div>
               </div>

               {/* COMPACT FOOTER LOG */}
               <div className="py-4 px-8 bg-slate-900/90 backdrop-blur-md text-white/50 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <ShieldAlert className="h-3 w-3 text-amber-500" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Secure Admin Session</span>
                  </div>
                  <span className="text-[10px] font-mono lowercase">{currentUser?.email}</span>
               </div>
             </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                       <History className="h-5 w-5 text-indigo-600" />
                       Audit Logs
                    </h2>
                    <p className="text-sm text-slate-500">Historical record of all administrative actions</p>
                  </div>
                  <button 
                    onClick={fetchAuditLogs}
                    className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-indigo-600"
                    title="Refresh Logs"
                  >
                    <Clock className="h-5 w-5" />
                  </button>
               </div>
               <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <table className="w-full min-w-[640px] text-left border-collapse">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <tr>
                         <th className="px-6 py-4">Admin</th>
                         <th className="px-6 py-4">Action</th>
                         <th className="px-6 py-4">Target ID</th>
                         <th className="px-6 py-4">Details</th>
                         <th className="px-6 py-4 text-right">Time</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {auditLogs.length === 0 ? (
                         <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No administrative actions logged yet.</td>
                         </tr>
                       ) : (
                         auditLogs.map(log => (
                           <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-[10px]">
                                      {log.adminId?.name?.charAt(0) || 'A'}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{log.adminId?.name || 'System'}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className={cn(
                                   "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter",
                                   log.action.includes('DELETE') ? "bg-red-50 text-red-600" :
                                   log.action.includes('UPDATE') ? "bg-blue-50 text-blue-600" :
                                   log.action.includes('CREATE') ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-600"
                                 )}>
                                   {log.action.replace(/_/g, ' ')}
                                 </span>
                              </td>
                              <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{log.targetId || 'N/A'}</td>
                              <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">{log.details}</td>
                              <td className="px-6 py-4 text-right text-xs text-slate-400 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                           </tr>
                         ))
                       )}
                    </tbody>
                  </table>
               </div>
            </div>
          )}

          {actionStatus && (
             <div className="fixed bottom-8 right-8 animate-in slide-in-from-right-8 duration-300 z-[300]">
                <div className={cn(
                  "px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border",
                  actionStatus.type === 'success' ? "bg-green-600 border-green-500 text-white" : 
                  actionStatus.type === 'error' ? "bg-red-600 border-red-500 text-white" : "bg-white border-slate-200 text-slate-900"
                )}>
                  {actionStatus.type === 'loading' ? <div className="h-5 w-5 animate-spin border-2 border-slate-300 border-t-slate-900 rounded-full" /> : 
                   actionStatus.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                  <span className="font-bold">{actionStatus.message}</span>
                </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
