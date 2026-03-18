import { Users, MessageSquare, ThumbsUp, PlusCircle, Loader2, X, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Community() {
  const [mockPosts, setMockPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null); // post ID showing comments
  const [comments, setComments] = useState({}); // { postId: [comments] }
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const { user, token } = useAuth();
  const navigate = useNavigate();

  const fetchPosts = () => {
    fetch('/api/community/posts')
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
    fetchPosts();
  }, []);

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
    
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          tags: newTags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setNewTitle('');
        setNewContent('');
        setNewTags('');
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
      const res = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMockPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: data.likes } : p));
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  // Toggle comments section & fetch comments
  const handleToggleComments = async (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }

    setExpandedPost(postId);

    if (!comments[postId]) {
      try {
        const res = await fetch(`/api/community/posts/${postId}/comments`);
        const data = await res.json();
        if (data.success) {
          setComments(prev => ({ ...prev, [postId]: data.data }));
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    }
  };

  // Add a comment
  const handleAddComment = async (postId) => {
    if (!user) { navigate('/login'); return; }
    if (!commentText.trim()) return;

    setCommentLoading(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
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

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-teal-500" />
            Farmer Community
          </h1>
          <p className="mt-2 text-slate-500">
            Connect, ask questions, and share knowledge with thousands of fellow agriculturalists.
          </p>
        </div>
        
        <button 
          onClick={handleStartDiscussion}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
        >
          <PlusCircle className="h-5 w-5" /> Start Discussion
        </button>
      </div>

      <div className="space-y-5 flex flex-col">
         {loading ? (
            <div className="flex justify-center p-12">
               <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
         ) : mockPosts.length === 0 ? (
            <div className="text-center p-12 text-slate-500">
               No posts found. Start a discussion!
            </div>
         ) : (
           mockPosts.map(post => (
            <div key={post.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
               <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 flex items-center justify-center text-white font-bold text-xs">
                         {post.author.charAt(0)}
                      </div>
                      <span className="font-semibold text-sm text-slate-800">{post.author}</span>
                      <span className="text-xs text-slate-400">&bull; {post.time}</span>
                   </div>
                   <div className="flex gap-2">
                      {post.tags.map(tag => (
                         <span key={tag} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                            {tag}
                         </span>
                      ))}
                   </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2">{post.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{post.content}</p>
                
                <div className="flex items-center gap-6 border-t border-slate-100 pt-3">
                   <button 
                     onClick={() => handleLike(post.id)}
                     className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors active:scale-95"
                   >
                      <ThumbsUp className="h-4 w-4" /> {post.likes}
                   </button>
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
                       <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 mt-0.5">
                         {c.author.charAt(0)}
                       </div>
                       <div className="flex-1 rounded-xl bg-white p-3 border border-slate-100 shadow-sm">
                         <div className="flex items-center gap-2 mb-1">
                           <span className="text-xs font-semibold text-slate-800">{c.author}</span>
                           <span className="text-[10px] text-slate-400">{c.time}</span>
                         </div>
                         <p className="text-sm text-slate-600">{c.text}</p>
                       </div>
                     </div>
                   ))}

                   {/* Add comment input */}
                   {user && (
                     <div className="flex gap-3 pt-2">
                       <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 mt-0.5">
                         {user.name?.charAt(0) || 'U'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
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
    </div>
  );
}
