import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { Send, User, Search, Loader2, MessageSquare, ArrowLeft, MoreVertical, Reply, Pin, Trash2, Forward, X } from 'lucide-react';
import { cn } from '../utils/utils';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Chat() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // The user object we are chatting with
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
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
    if (activeChat) {
      setIsScrolledUp(false); // Ensure we start at the bottom of new chat
      fetchMessages(activeChat._id || activeChat.id);
      const interval = setInterval(() => fetchMessages(activeChat._id || activeChat.id), 2000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

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
    if (!isScrolledUp) {
      // Use setTimeout to ensure DOM is updated and height is calculated correctly
      const timer = setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
        }
      }, 150); // Slightly longer delay for mobile stability
      return () => clearTimeout(timer);
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
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      {/* Sidebar */}
      <div className={cn(
        "flex w-full flex-col border-r border-slate-100 md:w-80",
        activeChat ? "hidden md:flex" : "flex"
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
                onClick={() => setActiveChat(chat.user)}
                className={cn(
                  "flex w-full items-center gap-3 p-4 transition-colors hover:bg-slate-50 text-left",
                  activeChat?._id === chat.user._id && "bg-green-50/50"
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
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-white p-4">
               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveChat(null)}
                    className="md:hidden p-1 text-slate-500"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200">
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
                  <div>
                    <h3 className="font-bold text-slate-900">{activeChat.name}</h3>
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{activeChat.role}</p>
                  </div>
               </div>
               <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50">
                 <MoreVertical className="h-5 w-5" />
               </button>
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

            {/* Input */}
            <form onSubmit={handleSendMessage} className="bg-white p-4 border-t border-slate-100 flex flex-col gap-2">
              {replyingTo && (
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border-l-2 border-green-500 text-sm">
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-green-600 flex items-center gap-2 mb-0.5">
                      Replying to {String(replyingTo.sender?._id || replyingTo.sender) === String(user._id) ? 'yourself' : (replyingTo.sender?.name || activeChat.name)}
                      {replyingTo.sender?.role && (
                        <span className="text-[8px] bg-green-100 text-green-700 px-1 rounded uppercase">
                          {replyingTo.sender.role}
                        </span>
                      )}
                    </span>
                    <p className="text-slate-600 truncate text-xs">{replyingTo.content}</p>
                  </div>
                  <button type="button" onClick={() => setReplyingTo(null)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..." 
                  className="flex-1 rounded-xl bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 border-none"
                />
                <button 
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="rounded-xl bg-green-600 p-3 text-white transition-all hover:bg-green-700 disabled:opacity-50 shadow-md shadow-green-100"
                >
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
            </form>
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
