import { useState, useEffect, useRef } from 'react';
import { 
  Users, 
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
  Monitor,
  UserPlus,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { cn } from '../utils/utils';

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
  const [allListings, setAllListings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [spotlights, setSpotlights] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [viewingPost, setViewingPost] = useState(null);
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
  
  // Forms state
  const [selectedUser, setSelectedUser] = useState(null);
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'info', target: 'all', recipientId: '', alsoSendEmail: false });
  const [cropForm, setCropForm] = useState({ name: '', idealSoil: '', season: '', waterRequirement: 'Medium', estimatedYield: '', description: '' });
  const [postForm, setPostForm] = useState({ title: '', content: '', tags: '' });
  const [marketForm, setMarketForm] = useState({ cropName: '', marketLocation: '', pricePerKg: '', trend: 'stable' });
  
  const [actionStatus, setActionStatus] = useState(null);
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
    
    // Reset selection if not holding shift
    if (!e.shiftKey) setSelectedListingIds([]);

    const startPageX = e.pageX;
    const startPageY = e.pageY;
    
    setDragSelection({
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY
    });

    const onMouseMove = (moveEvent) => {
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
    try {
      const res = await fetch(`${API_URL}/api/admin/announcements`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(announcementForm)
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements([data.announcement, ...announcements]);
        setAnnouncementForm({ title: '', subtitle: '', bgGradient: 'bg-gradient-to-br from-green-500 to-emerald-700', imageUrl: '', accentColor: 'bg-green-400/20', link: '' });
      }
    } catch (err) {
      alert('Failed to create announcement');
    }
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
      const res = await fetch(`${API_URL}/api/admin/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...postForm,
          tags: postForm.tags.split(',').map(t => t.trim())
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus({ type: 'success', message: 'Official post created!' });
        setPostForm({ title: '', content: '', tags: '' });
        fetchStats();
        setTimeout(() => setActionStatus(null), 3000);
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: 'Failed to create post' });
    }
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
                    <Search className="h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search users..."
                      className="flex-1 text-sm bg-transparent border-none focus:ring-0"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => handleExport('users')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all border border-slate-200"
                  >
                    <FileDown className="h-4 w-4" /> Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto -mx-4 md:mx-0 no-scrollbar">
                  <table className="w-full min-w-[900px] text-left">
                    <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                      <tr>
                        <th className="px-6 py-4 w-16">Select</th>
                        <th className="px-6 py-4">Farmer</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className={cn("hover:bg-slate-50 transition-colors", selectedUserIds.includes(u._id) && "bg-green-50/50")}>
                          <td className="px-6 py-4">
                             <div 
                               className={cn(
                                 "h-5 w-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer",
                                 selectedUserIds.includes(u._id) ? "bg-green-600 border-green-600" : "bg-white border-slate-200"
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
                                    src={u.profilePic.startsWith('/uploads') 
                                      ? `${API_URL}${u.profilePic}${u.profilePic.includes('?') ? '&' : '?' }t=${new Date().getTime()}` 
                                      : u.profilePic
                                    } 
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
                      <th className="px-6 py-4 w-10">
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
                          <td className="px-6 py-4">
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
                  <form onSubmit={handleCreateAnnouncement} className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
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
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Gradient (Tailwind classes)</label>
                        <select 
                          className="w-full rounded-2xl border-slate-200 text-xs"
                          value={announcementForm.bgGradient}
                          onChange={(e) => setAnnouncementForm({...announcementForm, bgGradient: e.target.value})}
                        >
                          <option value="bg-gradient-to-br from-green-500 to-emerald-700">Green Emerald</option>
                          <option value="bg-gradient-to-br from-orange-400 to-amber-600">Orange Amber</option>
                          <option value="bg-gradient-to-br from-blue-500 to-indigo-700">Blue Indigo</option>
                          <option value="bg-gradient-to-br from-rose-500 to-pink-700">Rose Pink</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Accent Color</label>
                        <input 
                          type="text" 
                          className="w-full rounded-2xl border-slate-200 text-xs"
                          placeholder="bg-green-400/20"
                          value={announcementForm.accentColor}
                          onChange={(e) => setAnnouncementForm({...announcementForm, accentColor: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Destination Link (Optional)</label>
                      <input 
                        type="text" 
                        className="w-full rounded-2xl border-slate-200 text-sm"
                        placeholder="e.g., /marketplace/item-id or https://google.com"
                        value={announcementForm.link}
                        onChange={(e) => setAnnouncementForm({...announcementForm, link: e.target.value})}
                      />
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]">
                      Publish Marketplace Banner
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
                            <button onClick={() => handleDeleteAnnouncement(ann._id)} className="p-2 bg-white/10 hover:bg-red-500 rounded-full transition-all border border-white/20">
                               <Trash2 className="h-4 w-4" />
                            </button>
                         </div>
                         <div className="absolute right-0 top-0 h-full w-[30%] opacity-40 mix-blend-overlay">
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
                
                <div className="mt-12 pt-12 border-t border-slate-100">
                   <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" /> 
                    Create Official Community Post
                  </h2>
                  <form onSubmit={handleCreatePost} className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Post Title</label>
                      <input 
                        type="text" required
                        className="w-full rounded-xl border-slate-200"
                        placeholder="Title of the announcement..."
                        value={postForm.title}
                        onChange={(e) => setPostForm({...postForm, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Content</label>
                      <textarea 
                        required rows={4}
                        className="w-full rounded-xl border-slate-200"
                        placeholder="Write your official advisory or news here..."
                        value={postForm.content}
                        onChange={(e) => setPostForm({...postForm, content: e.target.value})}
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800"
                    >
                      <Send className="h-5 w-5" /> Publish Official Post
                    </button>
                  </form>
                </div>
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Community Moderation</h2>
                    <p className="text-sm text-slate-500">Monitor and manage all user discussions</p>
                  </div>
                  <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold border border-amber-100 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {allPosts.length} Active Discussions
                  </div>
               </div>
               <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allPosts.map(post => (
                    <div key={post._id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all group">
                       <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                             <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                               {post.userId?.name?.charAt(0) || '?'}
                             </div>
                             <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">{post.userId?.name || 'Anonymous'}</span>
                          </div>
                          <button onClick={() => handleDeletePost(post._id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Trash2 className="h-4 w-4" />
                          </button>
                       </div>
                       <h3 className="font-bold text-slate-900 mb-2 line-clamp-1">{post.title}</h3>
                       <p className="text-xs text-slate-500 line-clamp-3 mb-4">{post.content}</p>
                       <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100/50">
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {post.likes} Likes</span>
                             <button 
                               onClick={() => setViewingPost(post)}
                               className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                             >
                               <MessageCircle className="h-3 w-3" /> {post.comments?.length || 0} Replies
                             </button>
                          </div>
                          <span className="text-[10px] font-medium text-slate-400">
                             {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                       </div>
                    </div>
                  ))}
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
            <>
            <div className="space-y-6">
               <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-slate-500" /> Platform Configuration
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100 group">
                       <div>
                         <h4 className="font-bold text-slate-900">Maintenance Mode</h4>
                         <p className="text-xs text-slate-500">Redirect users to a maintenance page while updating the platform.</p>
                       </div>
                       <button 
                         onClick={() => handleUpdateSetting('maintenanceMode', !isMaintenanceOn())}
                         className={cn(
                           "w-12 h-6 rounded-full relative transition-colors duration-200 ml-4",
                           isMaintenanceOn() ? "bg-red-500" : "bg-slate-300"
                         )}
                       >
                         <div className={cn(
                           "absolute top-1 bg-white h-4 w-4 rounded-full transition-all duration-200",
                           isMaintenanceOn() ? "left-7" : "left-1"
                         )} />
                       </button>
                    </div>

                    <div className="p-6 rounded-2xl border border-slate-100">
                       <h4 className="font-bold text-slate-900 mb-4">Support Information</h4>
                       <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Support Email</label>
                            <div className="flex gap-2">
                               <input 
                                 type="email" 
                                 className="flex-1 rounded-xl border-slate-100 text-sm"
                                 placeholder="support@agrismart.com" defaultValue={globalSettings.find(s => s.key === 'supportEmail')?.value || ''}
                                 onBlur={(e) => handleUpdateSetting('supportEmail', e.target.value)}
                               />
                               <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all">Save</button>
                            </div>
                          </div>

                           <div>
                             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Live Agri-Cam URL</label>
                             <div className="flex flex-wrap gap-2">
                                <input id="agriCamInput" 
                                  type="text" 
                                  className="flex-1 rounded-xl border-slate-100 text-sm"
                                  placeholder="https://example.com/stream.mp4"
                                  defaultValue={globalSettings.find(s => s.key === 'agriCamUrl')?.value || ''}
                                  onBlur={(e) => handleUpdateSetting('agriCamUrl', e.target.value)}
                                />
                                 <button 
                                   onClick={() => handleUpdateSetting('agriCamUrl', document.getElementById('agriCamInput')?.value || '')}
                                   className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm"
                                 >
                                   Update URL
                                 </button>
                                 <button 
                                   onClick={() => {
                                     const input = document.getElementById('agriCamInput');
                                     if (input) input.value = '';
                                     handleUpdateSetting('agriCamUrl', '');
                                   }}
                                   className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all border border-rose-100"
                                 >
                                   Delete Video
                                 </button>
                             </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Direct Video Upload</label>
                              <div className="flex flex-wrap gap-2 items-center">
                                 <input 
                                   type="file" 
                                   accept="video/*"
                                   id="agriCamFile"
                                   className="flex-1 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                 />
                                 <button 
                                   onClick={async () => {
                                     const fileInput = document.getElementById('agriCamFile');
                                     if (!fileInput.files[0]) return alert('Please select a file');
                                     
                                     const formData = new FormData();
                                     formData.append('video', fileInput.files[0]);
                                     
                                     try {
                                       const res = await fetch(`${API_URL}/api/admin/settings/video`, {
                                         method: 'POST',
                                         headers: { Authorization: `Bearer ${token}` },
                                         body: formData
                                       });
                                       const data = await res.json();
                                       if (data.success) {
                                         alert('Video uploaded successfully!');
                                         fetchSettings();
                                       } else {
                                         alert(data.message || 'Upload failed');
                                       }
                                     } catch (err) {
                                       alert('Upload failed');
                                     }
                                   }}
                                   className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold transition-all shadow-sm"
                                 >
                                   Upload & Set
                                 </button>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1 italic">Upload a local video file directly to the platform.</p>
                            </div>
                           </div>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center">
                  <ShieldAlert className="h-10 w-10 text-amber-500 mb-4" />
                  <h3 className="text-lg font-bold">Admin Accountability</h3>
                  <p className="text-sm text-white/60 mt-2">All administrative actions are logged and associated with your account: <span className="text-amber-500 font-mono">{currentUser?.email}</span></p>
               </div>
            </>
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
