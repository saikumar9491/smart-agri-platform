import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { Send, User, Search, Loader2, MessageSquare, ArrowLeft, MoreVertical, Reply, Pin, Trash2, Forward, X, Phone, Video, Info, Camera, Mic, Image, Smile, Plus } from 'lucide-react';
import { cn } from '../utils/utils';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

export default function Chat() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // The user object we are chatting with
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiRef = useRef(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const pressTimerRef = useRef(null);
  const locallyDeletedIds = useRef(new Set());
  
  // New actions states
  const [activeMessageMenu, setActiveMessageMenu] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMessageMenu(null);
    if (activeMessageMenu) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMessageMenu]);

  // Parse direct user from location state (if coming from Profile)
  useEffect(() => {
    if (location.state?.directUser) {
      setActiveChat(location.state.directUser);
    }
  }, [location]);

  const fetchChats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/recent`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setChats(data.chats);
        
        // If we don't have an active chat, but have chats, pick the first one?
        // Actually, better to let user pick unless coming from profile.
      }
    } catch (err) {
      console.error('Fetch chats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/chat/conversation/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => {
          const sending = prev.filter(m => m.sending);
          // Filter out messages that were just locally deleted but might still be in server response
          const filteredServerMessages = data.messages.filter(m => !locallyDeletedIds.current.has(m._id));
          
          // Once a message is no longer returned by the server, we can remove it from our local "deleted" tracker
          const serverMessageIds = new Set(data.messages.map(m => m._id));
          locallyDeletedIds.current.forEach(id => {
            if (!serverMessageIds.has(id)) {
              locallyDeletedIds.current.delete(id);
            }
          });

          return [...filteredServerMessages, ...sending];
        });
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (userId) {
      // If we already have the user in chats list, use it
      const existingChat = chats.find(c => (c.user._id || c.user.id) === userId);
      if (existingChat) {
        setActiveChat(existingChat.user);
      } else {
        // Fetch user info if not in list
        const fetchUser = async () => {
          try {
            const res = await fetch(`${API_URL}/api/users/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setActiveChat(data.user);
          } catch (err) { console.error('Fetch user error:', err); }
        };
        fetchUser();
      }
    } else {
      setActiveChat(null);
    }
  }, [userId, chats, token]);

  useEffect(() => {
    if (activeChat) {
      setIsScrolledUp(false); // Ensure we start at the bottom of new chat
      const targetId = activeChat._id || activeChat.id;
      fetchMessages(targetId);
      const interval = setInterval(() => fetchMessages(targetId), 2000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  const handleSelectChat = (user) => {
    const id = user._id || user.id;
    navigate(`/app/chat/${id}`);
  };

  const handleBack = () => {
    navigate('/app/chat');
  };

  const handleFeatureComingSoon = (feature) => {
    // A simple, modern notification
    const alertDiv = document.createElement('div');
    alertDiv.className = "fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom duration-300 font-bold text-sm flex items-center gap-2";
    alertDiv.innerHTML = `<span class="text-green-400">💡</span> ${feature} feature is coming soon!`;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
      alertDiv.classList.add('fade-out', 'slide-out-to-bottom');
      setTimeout(() => alertDiv.remove(), 300);
    }, 2500);
  };

  const onFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;
    
    handleFeatureComingSoon("Image sharing");
    // Clear input
    e.target.value = null;
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const onAddEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    
    // If chat is short (no scrollbar), we are technically at bottom
    if (scrollHeight <= clientHeight) {
      setIsScrolledUp(false);
      return;
    }

    // If the user is scrolled up more than 100px from bottom, stop auto-scroll
    // Increased threshold to 100px for mobile keyboard stability
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsScrolledUp(!isAtBottom);
  };

  // Keep scroll at bottom when keyboard opens on mobile
  useEffect(() => {
    const handleResize = () => {
      if (!isScrolledUp) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isScrolledUp]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (!isScrolledUp && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };

    if (messages.length > 0) {
      // Immediate scroll for better feel
      scrollToBottom();
      // Delayed scroll for mobile keyboard/layout shifts
      const timer = setTimeout(scrollToBottom, 100);
      const timer2 = setTimeout(scrollToBottom, 300);
      return () => { clearTimeout(timer); clearTimeout(timer2); };
    }
  }, [messages, isScrolledUp]);

  const handleTouchStart = (msgId) => {
    pressTimerRef.current = setTimeout(() => {
      setActiveMessageMenu(msgId);
    }, 500); // 500ms for long press
  };

  const handleTouchEndOrMove = () => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const content = newMessage;
    const replyTarget = replyingTo;
    
    setNewMessage(''); // Clear immediately
    setReplyingTo(null);
    setIsScrolledUp(false); // Force scroll to bottom when sending

    // Optimistic Update
    const tempMessage = {
      _id: 'temp-' + Date.now(),
      sender: user._id,
      recipient: activeChat._id || activeChat.id,
      content,
      replyTo: replyTarget, // Store full object for optimstic render
      createdAt: new Date().toISOString(),
      sending: true
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const res = await fetch(`${API_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: activeChat._id || activeChat.id,
          content,
          replyTo: replyTarget?._id
        })
      });
      const data = await res.json();
      if (data.success) {
        // Replace temp message with real one
        setMessages(prev => prev.map(m => m._id === tempMessage._id ? data.message : m));
        fetchChats(); // Update preview in sidebar
      }
    } catch (err) {
      console.error('Send message error:', err);
      // Remove failed message or show error
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
    }
  };

  const handleUnsend = async (msgId) => {
    try {
      locallyDeletedIds.current.add(msgId);
      setMessages(prev => prev.filter(m => m._id !== msgId));
      const res = await fetch(`${API_URL}/api/chat/message/${msgId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error('Backend delete failed:', errText);
        alert('Could not unsend message. Please make sure the backend server was restarted. Details in console.');
        locallyDeletedIds.current.delete(msgId);
        // Revert UI optimistic deletion
        fetchMessages(activeChat._id || activeChat.id);
      } else {
        fetchChats();
      }
    } catch(err) { console.error('Unsend error:', err); }
  };

  const handleTogglePin = async (msg) => {
    try {
      setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isPinned: !m.isPinned } : m));
      await fetch(`${API_URL}/api/chat/message/${msg._id}/pin`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch(err) { console.error('Pin error:', err); }
  };

  const executeForward = async (targetUser) => {
    if (!forwardingMessage) return;
    try {
      await fetch(`${API_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: targetUser._id || targetUser.id,
          content: forwardingMessage.content
        })
      });
      setForwardModalOpen(false);
      setForwardingMessage(null);
      fetchChats();
      // If we are currently in that chat, fetch messages
      if (activeChat && (activeChat._id === targetUser._id || activeChat.id === targetUser.id)) {
        fetchMessages(targetUser._id || targetUser.id);
      }
    } catch(err) { console.error('Forward error:', err); }
  };

  if (loading && chats.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="flex w-full h-full md:h-[calc(100vh-8rem)] overflow-hidden md:rounded-3xl border-none md:border md:border-slate-200 bg-white md:shadow-xl">
      {/* Sidebar - Chat List */}
      <div className={cn(
        "flex w-full flex-col border-r border-slate-100 md:w-80 h-full",
        userId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Messages</h2>
          <div className="relative mt-4">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search conversations..." 
               className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500/20"
             />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">No conversations yet.</p>
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.user._id}
                onClick={() => handleSelectChat(chat.user)}
                className={cn(
                  "flex w-full items-center gap-3 p-4 transition-colors hover:bg-slate-50 text-left",
                  (userId === chat.user._id || userId === chat.user.id) && "bg-green-50/50"
                )}
              >
                <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                  {chat.user.profilePic ? (
                    <img 
                      src={chat.user.profilePic.startsWith('/uploads') 
                        ? `${API_URL}${chat.user.profilePic}` 
                        : chat.user.profilePic
                      } 
                      alt=""
                      className="h-full w-full object-cover" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={cn(
                    "flex h-full w-full items-center justify-center bg-green-100 text-green-700 font-bold",
                    chat.user.profilePic ? "hidden" : "flex"
                  )}>
                    {chat.user.name.charAt(0)}
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">{chat.user.name}</span>
                    <span className="text-[10px] text-slate-400">{new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-1">{chat.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex flex-1 flex-col bg-slate-50/30",
        !activeChat ? "hidden md:flex" : "flex"
      )}>
        {activeChat ? (
          <>
            {/* Header - Instagram Style */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md p-3 md:p-4">
               <div className="flex items-center gap-2 md:gap-3">
                  <button 
                    onClick={handleBack}
                    className="p-1 text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </button>
                  <div className="relative">
                    <div className="h-9 w-9 md:h-10 md:w-10 rounded-full overflow-hidden bg-slate-200 border border-slate-100">
                      {activeChat.profilePic ? (
                        <img 
                          src={activeChat.profilePic.startsWith('/uploads') 
                            ? `${API_URL}${activeChat.profilePic}` 
                            : activeChat.profilePic
                          } 
                          alt=""
                          className="h-full w-full object-cover" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={cn(
                        "flex h-full w-full items-center justify-center bg-green-100 text-green-700 font-bold",
                        activeChat.profilePic ? "hidden" : "flex"
                      )}>
                        {activeChat.name.charAt(0)}
                      </div>
                    </div>
                    {/* Active Status Dot */}
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-slate-900 leading-tight text-sm md:text-base truncate max-w-[120px] md:max-w-none">{activeChat.name}</h3>
                    <p className="text-[10px] text-slate-400">Active now</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-1 md:gap-3">
                 <button 
                  onClick={() => handleFeatureComingSoon("Audio call")}
                  className="p-2 text-slate-700 hover:bg-slate-50 rounded-full transition-colors"
                 >
                   <Phone className="h-5 w-5" />
                 </button>
                 <button 
                  onClick={() => handleFeatureComingSoon("Video call")}
                  className="p-2 text-slate-700 hover:bg-slate-50 rounded-full transition-colors"
                 >
                   <Video className="h-5 w-5" />
                 </button>
                 <button 
                  onClick={() => handleFeatureComingSoon("Chat settings")}
                  className="p-2 text-slate-700 hover:bg-slate-50 rounded-full transition-colors"
                 >
                   <Info className="h-5 w-5" />
                 </button>
               </div>
            </div>

            {/* Pinned Messages Banner */}
            {messages.filter(m => m.isPinned).length > 0 && (
              <div className="bg-amber-50 border-b border-amber-100 p-2 flex items-center gap-2 text-amber-800 text-xs px-4">
                <Pin className="h-3 w-3" />
                <span className="font-semibold truncate">Pinned: {messages.filter(m => m.isPinned).pop().content}</span>
              </div>
            )}

            {/* Messages */}
            <div 
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((msg) => {
                const isMine = String(msg.sender) === String(user._id);
                const isTemp = String(msg._id).startsWith('temp-');
                return (
                  <div 
                    key={msg._id} 
                    onTouchStart={() => handleTouchStart(msg._id)}
                    onTouchEnd={handleTouchEndOrMove}
                    onTouchMove={handleTouchEndOrMove}
                    onContextMenu={(e) => { e.preventDefault(); setActiveMessageMenu(msg._id); }}
                    className={cn(
                      "flex max-w-[80%] flex-col relative group",
                      isMine ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className="flex items-center gap-2">
                       {!isMine && (
                         <button onClick={(e) => { e.stopPropagation(); setActiveMessageMenu(activeMessageMenu === msg._id ? null : msg._id); }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                         </button>
                       )}
                       
                       <div className="relative">
                         {/* Context Menu */}
                         {activeMessageMenu === msg._id && (
                           <div className={cn(
                             "absolute top-0 z-10 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 text-sm overflow-hidden",
                             isMine ? "right-full mr-2" : "left-full ml-2"
                           )}>
                              <button onClick={() => { setReplyingTo(msg); setActiveMessageMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                                <Reply className="h-4 w-4" /> Reply
                              </button>
                              <button onClick={() => { setForwardingMessage(msg); setForwardModalOpen(true); setActiveMessageMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                                <Forward className="h-4 w-4" /> Forward
                              </button>
                              <button onClick={() => handleTogglePin(msg)} className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                                <Pin className="h-4 w-4" /> {msg.isPinned ? 'Unpin' : 'Pin'}
                              </button>
                              {isMine && (
                                <button onClick={() => handleUnsend(msg._id)} className="w-full text-left px-3 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600">
                                  <Trash2 className="h-4 w-4" /> Delete for you
                                </button>
                              )}
                           </div>
                         )}
                         
                         <div 
                           onClick={(e) => { e.stopPropagation(); setActiveMessageMenu(activeMessageMenu === msg._id ? null : msg._id); }}
                           className={cn(
                             "rounded-2xl px-4 py-2 text-sm shadow-sm cursor-pointer transition-transform active:scale-[0.98] duration-200",
                             isMine ? "bg-green-600 text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                           )}
                         >
                           {/* Replying To Snippet */}
                           {msg.replyTo && (
                             <div className={cn(
                               "mb-2 p-2 rounded-lg text-xs border-l-2",
                               isMine ? "bg-green-700/50 border-green-300" : "bg-slate-100 border-slate-300"
                             )}>
                                <span className={cn("font-bold block mb-0.5 flex items-center gap-1.5", isMine ? "text-green-100" : "text-slate-600")}>
                                  {msg.replyTo?.sender ? (
                                    String(msg.replyTo.sender?._id || msg.replyTo.sender) === String(user._id) ? "You" : (msg.replyTo.sender?.name || activeChat?.name || "User")
                                  ) : "User"}
                                  {msg.replyTo?.sender?.role && (
                                    <span className={cn(
                                      "text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-tight",
                                      isMine ? "bg-white/20 text-white" : "bg-green-100 text-green-700"
                                    )}>
                                      {msg.replyTo.sender.role}
                                    </span>
                                  )}
                                </span>
                                <p className="truncate opacity-90">{msg.replyTo.content || "Original message unavailable"}</p>
                             </div>
                           )}
                           {msg.content}
                         </div>
                       </div>

                       {isMine && (
                         <button onClick={(e) => { e.stopPropagation(); setActiveMessageMenu(activeMessageMenu === msg._id ? null : msg._id); }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                         </button>
                       )}
                    </div>
                    <span className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
                      {msg.isPinned && <Pin className="h-2 w-2" />}
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer - Instagram Style */}
            <div className="sticky bottom-0 bg-white p-3 md:p-4 border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex flex-col gap-2 max-w-4xl mx-auto">
                {replyingTo && (
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl mb-1 border-l-4 border-green-500 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-bold text-green-600 uppercase tracking-tight">Replying to {String(replyingTo.sender?._id || replyingTo.sender) === String(user._id) ? 'yourself' : (replyingTo.sender?.name || activeChat.name)}</span>
                      <p className="text-slate-500 truncate text-xs">{replyingTo.content}</p>
                    </div>
                    <button type="button" onClick={() => setReplyingTo(null)} className="p-1 text-slate-400 hover:text-slate-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center gap-2 md:gap-3">
                  {/* Camera Icon - Blue Circle */}
                  <button 
                    type="button" 
                    onClick={triggerImageUpload}
                    className="flex-shrink-0 bg-blue-500 text-white p-2.5 rounded-full hover:bg-blue-600 transition-colors shadow-sm active:scale-90 duration-200"
                  >
                    <Camera className="h-5 w-5" />
                  </button>

                  <div className="flex-1 relative flex flex-col">
                    {/* Emoji Picker Placeholder */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-full mb-3 left-0 bg-white shadow-2xl border border-slate-100 rounded-3xl p-4 flex gap-3 z-50 animate-in slide-in-from-bottom-2 duration-200">
                        {['🌾', '🚜', '🌱', '🍅', '🐄', '☀️', '😊', '🤝'].map(e => (
                          <button key={e} type="button" onClick={() => onAddEmoji(e)} className="text-xl hover:scale-125 transition-transform">{e}</button>
                        ))}
                      </div>
                    )}

                    <div className="relative flex items-center bg-slate-50 rounded-3xl px-3 sm:px-4 py-0.5 border border-slate-200/50 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Message..." 
                        className="w-full bg-transparent py-2.5 text-sm focus:outline-none text-slate-800"
                      />
                      
                      {/* Right side icons in input box */}
                      <div className="flex items-center gap-2 md:gap-3 ml-2 text-slate-600">
                        {newMessage.trim() ? (
                          <button 
                            type="submit"
                            disabled={sending}
                            className="font-bold text-blue-500 hover:text-blue-600 px-1 transition-colors text-sm"
                          >
                            Send
                          </button>
                        ) : (
                          <>
                            <button 
                              type="button" 
                              onClick={() => handleFeatureComingSoon("Voice message")}
                              className="hover:text-slate-900 transition-colors active:scale-95"
                            >
                              <Mic className="h-5 w-5" />
                            </button>
                            <button 
                              type="button" 
                              onClick={triggerImageUpload}
                              className="hover:text-slate-900 transition-colors active:scale-95"
                            >
                              <Image className="h-5 w-5" />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                              className={cn("hover:text-slate-900 transition-colors active:scale-95", showEmojiPicker && "text-blue-500")}
                            >
                              <Smile className="h-5 w-5" />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleFeatureComingSoon("Shared tools (Docs, Location)")}
                              className="hover:text-slate-900 transition-colors active:scale-95"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={onFileSelect}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="mb-4 rounded-full bg-slate-50 p-6">
              <MessageSquare className="h-12 w-12 opacity-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-600">Your Messages</h3>
            <p className="mt-2 text-sm max-w-xs">Select a conversation from the list or start a new one from a farmer's profile.</p>
          </div>
        )}
      </div>

      {/* Forward Modal */}
      {forwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Forward to...</h3>
              <button onClick={() => { setForwardModalOpen(false); setForwardingMessage(null); }} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-2">
              {chats.map(chat => (
                <button 
                  key={chat.user._id}
                  onClick={() => executeForward(chat.user)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left"
                >
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                    {chat.user.profilePic ? (
                      <img src={chat.user.profilePic.startsWith('/uploads') ? `${API_URL}${chat.user.profilePic}` : chat.user.profilePic} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-green-100 text-green-700 font-bold">{chat.user.name.charAt(0)}</div>
                    )}
                  </div>
                  <span className="font-bold text-sm text-slate-800">{chat.user.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
