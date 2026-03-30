import { Users, MessageSquare, MessageCircle, ThumbsUp, PlusCircle, Loader2, X, Send, Trash2, Search, Image as ImageIcon, Camera } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';



export default function Community() {
  const [mockPosts, setMockPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null); // post ID showing comments
  const [comments, setComments] = useState({}); // { postId: [comments] }
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [likesModalData, setLikesModalData] = useState(null);
  const [feedFilter, setFeedFilter] = useState('all'); // 'all' or 'following'

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const { user, token, updateFollowing } = useAuth();
  const navigate = useNavigate();

  const handleToggleFollow = async (authorId) => {
    if (!token) { navigate('/login'); return; }
    try {
      const res = await fetch(`${API_URL}/api/auth/profile/${authorId}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        updateFollowing(authorId, data.isFollowing);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`${API_URL}/api/auth/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.users);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPosts = () => {
    fetch(`${API_URL}/api/community/posts`, {
      headers: { Authorization: `Bearer ${token}` }
    })

      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMockPosts(data.data);
        }
      })
      .catch(err => console.error('Error fetching posts:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (token) fetchPosts();
  }, [token]);

  const handleStartDiscussion = () => {
    if (!user) {
      navigate('/login');
    } else {
      setShowModal(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append('title', newTitle);
    formData.append('content', newContent);
    formData.append('tags', newTags.split(',').map(tag => tag.trim()).filter(Boolean).join(','));
    if (newImage) {
      formData.append('image', newImage);
    }
    
    try {
      const res = await fetch(`${API_URL}/api/community/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setNewTitle('');
        setNewContent('');
        setNewTags('');
        setNewImage(null);
        setImagePreview(null);
        fetchPosts();
      }
    } catch (err) {
      console.error('Failed to create post', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Like a post
  const handleLike = async (postId) => {
    if (!user) { navigate('/login'); return; }

    try {
      const res = await fetch(`${API_URL}/api/community/posts/${postId}/like`, {

        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMockPosts(prev => prev.map(p => p.id === postId ? { 
          ...p, 
          likes: data.likes, 
          hasLiked: data.hasLiked,
          likedBy: data.likedBy 
        } : p));
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete your post?')) return;
    try {
      const res = await fetch(`${API_URL}/api/community/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMockPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        alert(data.message || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  // Toggle comments section & fetch comments
  const handleToggleComments = async (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }

    setExpandedPost(postId);

    // Always re-fetch comments so new comments from other users are visible
    try {
      const res = await fetch(`${API_URL}/api/community/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success) {
        setComments(prev => ({ ...prev, [postId]: data.data }));
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  // Add a comment
  const handleAddComment = async (postId) => {
    if (!user) { navigate('/login'); return; }
    if (!commentText.trim()) return;

    setCommentLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/community/posts/${postId}/comments`, {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText })
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.comment]
        }));
        setCommentText('');
        // Update reply count
        setMockPosts(prev => prev.map(p => p.id === postId ? { ...p, replies: p.replies + 1 } : p));
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const res = await fetch(`${API_URL}/api/community/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => ({
          ...prev,
          [postId]: prev[postId].filter(c => c.id !== commentId)
        }));
        setMockPosts(prev => prev.map(p => p.id === postId ? { ...p, replies: p.replies - 1 } : p));
      } else {
        alert(data.message || 'Failed to delete comment');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const displayedPosts = feedFilter === 'following' 
    ? mockPosts.filter(p => user?.following?.includes(p.authorId) || p.authorId === user?._id)
    : mockPosts;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Farmer Community</h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base font-medium">Connect, share, and learn from farmers worldwide.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* User Search Bar */}
          <div className="relative w-full sm:w-64 z-40" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Find farmers..."
                value={searchQuery}
                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                onChange={(e) => {
                   setSearchQuery(e.target.value);
                   if (e.target.value.trim()) setShowDropdown(true);
                }}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-sm text-sm font-medium"
              />
              {isSearching && (
                <div className="absolute right-3 top-3 h-3 w-3 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
              )}
            </div>

            {/* Search Dropdown */}
            {showDropdown && searchQuery.trim() !== '' && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                {searchResults.length === 0 && !isSearching ? (
                  <div className="p-4 text-center text-sm text-slate-500">No farmers found</div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {searchResults.map((su) => (
                      <div 
                        key={su._id}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                        onClick={() => {
                          setShowDropdown(false);
                          setSearchQuery('');
                          navigate(`/app/user/${su._id}`);
                        }}
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 flex items-center justify-center text-white font-bold text-xs overflow-hidden shadow-sm">
                          {su.profilePic ? (
                             <img 
                              src={su.profilePic.startsWith('/uploads') 
                                ? `${API_URL}${su.profilePic}${su.profilePic.includes('?') ? '&' : '?' }t=${new Date().getTime()}` 
                                : su.profilePic
                              } 
                              alt={su.name} 
                              className="h-full w-full object-cover" 
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                              }}
                             />
                          ) : (
                            su.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{su.name}</p>
                          <p className="text-[10px] uppercase tracking-widest text-teal-600 font-bold">{su.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={handleStartDiscussion}
            className="flex w-full sm:w-auto items-center justify-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md shadow-green-200"
          >
            <MessageCircle className="h-4 w-4" />
            New Post
          </button>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-4 border-b border-slate-200">
          <button 
            onClick={() => setFeedFilter('all')}
            className={`px-4 py-3 text-sm font-bold border-b-[3px] transition-colors focus:outline-none ${feedFilter === 'all' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            All Discussions
          </button>
          <button 
            onClick={() => setFeedFilter('following')}
            className={`px-4 py-3 text-sm font-bold border-b-[3px] transition-colors focus:outline-none ${feedFilter === 'following' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Following
          </button>
        </div>
      )}

      <div className="space-y-5 flex flex-col">
         {loading ? (
            <div className="flex justify-center p-12">
               <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
         ) : displayedPosts.length === 0 ? (
           <div className="text-center p-12 text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
              {feedFilter === 'following' 
                ? "You aren't following anyone with posts yet. Discover farmers in the 'All Discussions' tab!" 
                : "No posts found. Start a discussion!"}
           </div>
         ) : (
           displayedPosts.map(post => (
            <div key={post.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
               <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                   <div 
                      className="flex items-center gap-2 cursor-pointer group"
                      onClick={() => navigate(`/app/user/${post.authorId}`)}
                   >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 flex items-center justify-center text-white font-bold text-xs overflow-hidden ring-2 ring-transparent group-hover:ring-teal-200 transition-all">
                         {post.authorPic ? (
                           <img 
                             src={post.authorPic.startsWith('/uploads') ? `${API_URL}${post.authorPic}` : post.authorPic} 
                             alt={post.author || 'Farmer'} 
                             className="h-full w-full object-cover" 
                           />
                         ) : (
                           (post.author || 'F').charAt(0).toUpperCase()
                         )}
                      </div>
                      <span className="font-semibold text-sm text-slate-800 group-hover:text-teal-600 transition-colors">{post.author || 'Farmer'}</span>
                      {user && user._id !== post.authorId && (
                        <div className="flex items-center gap-1">
                          <span className="text-slate-300 text-[10px]">&bull;</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleFollow(post.authorId); }}
                            className={`text-[11px] font-black tracking-wide transition-colors ${
                              user.following?.includes(post.authorId)
                                ? 'text-slate-500 hover:text-slate-700'
                                : 'text-teal-600 hover:text-teal-800'
                            }`}
                          >
                            {user.following?.includes(post.authorId) ? 'Following' : 'Follow'}
                          </button>
                        </div>
                      )}
                      <span className="text-xs text-slate-400 ml-1">&bull; {post.time}</span>
                   </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                           {(post.tags || []).map(tag => (
                              <span key={tag} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider shrink-0">
                                 {tag}
                              </span>
                           ))}
                           {(user?._id === post.authorId || user?.role === 'admin') && (
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                               className="ml-auto sm:ml-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                               title="Delete Post"
                             >
                               <Trash2 className="h-4 w-4" />
                             </button>
                           )}
                        </div>
                     </div>
                 
                 <h3 className="text-lg font-bold text-slate-900 mb-2">{post.title}</h3>
                 <p className="text-slate-600 text-sm leading-relaxed mb-4">{post.content}</p>
                 
                 {post.image && (
                   <div className="mb-4 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                     <img 
                      src={post.image.startsWith('/uploads') 
                        ? `${API_URL}${post.image}${post.image.includes('?') ? '&' : '?' }t=${new Date().getTime()}` 
                        : post.image
                      } 
                      alt={post.title}
                      className="w-full h-auto max-h-[400px] object-cover"
                    />
                   </div>
                 )}
                 
                 <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t border-slate-100 pt-3 mt-4">
                     <div className="flex items-center gap-2">
                       <button 
                         onClick={() => handleLike(post.id)}
                         className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors active:scale-95 ${post.hasLiked ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                       >
                          <ThumbsUp className={`h-4 w-4 ${post.hasLiked ? 'fill-teal-500' : ''}`} />
                       </button>
                       {post.likes > 0 && (
                         <span 
                           onClick={() => setLikesModalData(post.likedBy || [])}
                           className="text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer hover:underline underline-offset-2"
                         >
                           {post.likes} {post.likes === 1 ? 'Like' : 'Likes'}
                         </span>
                       )}
                     </div>
                    <button 
                      onClick={() => handleToggleComments(post.id)}
                      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${expandedPost === post.id ? 'text-teal-600' : 'text-slate-500 hover:text-teal-600'}`}
                    >
                       <MessageSquare className="h-4 w-4" /> {post.replies} Replies
                    </button>
                 </div>
                </div>

                {/* Comments Section */}
                {expandedPost === post.id && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-4 rounded-b-2xl">
                    {/* Existing comments */}
                    {(comments[post.id] || []).length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-2">No replies yet. Be the first!</p>
                    )}
                    {(comments[post.id] || []).map((c, idx) => (
                      <div key={c.id || idx} className="flex gap-3">
                         <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 mt-0.5 overflow-hidden">
                           {c.authorPic ? (
                             <img 
                               src={c.authorPic.startsWith('/uploads') ? `${API_URL}${c.authorPic}` : c.authorPic} 
                               alt={c.author || 'User'} 
                               className="h-full w-full object-cover" 
                             />
                           ) : (
                             (c.author || 'U').charAt(0)
                           )}
                         </div>
                        <div className="flex-1 rounded-xl bg-white p-3 border border-slate-100 shadow-sm">
                          <div className="flex items-center justify-between gap-2 mb-1">
                             <div className="flex items-center gap-2">
                               <span className="text-xs font-semibold text-slate-800">{c.author}</span>
                               <span className="text-[10px] text-slate-400">{c.time}</span>
                             </div>
                             {(user?._id === c.authorId || user?._id === post.authorId || user?.role === 'admin') && (
                               <button 
                                 onClick={() => handleDeleteComment(post.id, c.id)}
                                 className="text-slate-300 hover:text-red-500 transition-colors"
                                 title="Delete Comment"
                               >
                                 <Trash2 className="h-3 w-3" />
                               </button>
                             )}
                           </div>
                          <p className="text-sm text-slate-600">{c.text}</p>
                        </div>
                      </div>
                    ))}

                    {/* Add comment input */}
                    {user && (
                      <div className="flex gap-3 pt-2">
                         <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 mt-0.5 overflow-hidden">
                           {user.profilePic ? (
                             <img 
                              src={user.profilePic.startsWith('/uploads') 
                                ? `${API_URL}${user.profilePic}${user.profilePic.includes('?') ? '&' : '?' }t=${new Date().getTime()}` 
                                : user.profilePic
                              } 
                              alt={user.name} 
                              className="h-full w-full object-cover" 
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                           ) : (
                             user.name?.charAt(0) || 'U'
                           )}
                         </div>
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                            placeholder="Write a reply..."
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={commentLoading || !commentText.trim()}
                            className="rounded-xl bg-teal-600 px-3 py-2 text-white hover:bg-teal-700 transition-colors disabled:opacity-50"
                          >
                            {commentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>
           ))
         )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Start a Discussion</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-teal-500 focus:ring-teal-500"
                  placeholder="What's on your mind?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Details</label>
                <textarea 
                  required
                  rows="4"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-teal-500 focus:ring-teal-500 resize-none"
                  placeholder="Provide more context for other farmers..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags (Comma separated)</label>
                <input 
                  type="text" 
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-teal-500 focus:ring-teal-500"
                  placeholder="e.g. Pest Control, Wheat, Soil"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Add an Image (Optional)</label>
                {!imagePreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-teal-500 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="h-8 w-8 text-slate-400 group-hover:text-teal-500 mb-2" />
                      <p className="text-xs text-slate-500 font-medium">Click to upload photo</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*,.heic,.heif"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setNewImage(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                    <button 
                      type="button"
                      onClick={() => { setNewImage(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/50 text-white rounded-full hover:bg-slate-900 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors disabled:opacity-70"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Likes Modal */}
      {likesModalData && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Likes</h3>
              <button onClick={() => setLikesModalData(null)} className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-200 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-2">
              {likesModalData.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No one has liked this yet.</div>
              ) : (
                likesModalData.map(likeUser => (
                  <div 
                    key={likeUser.id} 
                    className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors"
                    onClick={() => {
                      setLikesModalData(null);
                      navigate(`/app/user/${likeUser.id}`);
                    }}
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-sm">
                      {likeUser.profilePic ? (
                        <img 
                          src={likeUser.profilePic.startsWith('/uploads') 
                            ? `${API_URL}${likeUser.profilePic}${likeUser.profilePic.includes('?') ? '&' : '?' }t=${new Date().getTime()}` 
                            : likeUser.profilePic
                          } 
                          alt={likeUser.name} 
                          className="h-full w-full object-cover" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        likeUser.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="font-semibold text-slate-800 text-sm">{likeUser.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
