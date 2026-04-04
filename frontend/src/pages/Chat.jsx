import { useState, useEffect, useRef } from 'react';
import { cn } from '../utils/utils';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { 
  Phone, Video, VideoOff, Mic, MicOff, Camera, FileText, 
  Smile, Plus, X, Send, Play, Download, Trash2, Pin, 
  MoreVertical, MessageSquare, ChevronLeft, Search, Navigation, 
  MapPin, TrendingUp, TrendingDown, Minus, Loader2,
  ArrowLeft, Info, Reply, Forward, Image
} from 'lucide-react';

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
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const locallyDeletedIds = useRef(new Set());
  const pressTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingBlob, setRecordingBlob] = useState(null);
  const { 
    call, 
    callAccepted, 
    myVideo, 
    userVideo, 
    stream, 
    callEnded, 
    me: myId, 
    callUser, 
    leaveCall, 
    answerCall, 
    setStream 
  } = useSocket();

  const [activeMessageMenu, setActiveMessageMenu] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [showCallOverlay, setShowCallOverlay] = useState(false);
  const [callType, setCallType] = useState(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMessageMenu(null);
    if (activeMessageMenu) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMessageMenu]);

  // Real-time message listener
  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      // Only add if it's from/to the current active chat partner
      if (activeChat && (msg.sender === activeChat._id || msg.recipient === activeChat._id)) {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [socket, activeChat]);

  // Handle Visual Viewport for mobile keyboard
  useEffect(() => {
    if (!window.visualViewport) return;
    
    const handleViewportResize = () => {
      const chatMain = document.getElementById('chat-main-container');
      if (chatMain) {
        chatMain.style.height = `${window.visualViewport.height}px`;
        // Small delay to ensure layout has settled before scrolling
        setTimeout(scrollToBottom, 100);
      }
    };

    window.visualViewport.addEventListener('resize', handleViewportResize);
    window.visualViewport.addEventListener('scroll', handleViewportResize);
    
    // Initial call
    handleViewportResize();

    return () => {
      window.visualViewport.removeEventListener('resize', handleViewportResize);
      window.visualViewport.removeEventListener('scroll', handleViewportResize);
    };
  }, [activeChat]);

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
          // Filter out messages that were just locally deleted
          const serverMessages = data.messages || [];
          const filteredServerMessages = serverMessages.filter(m => !locallyDeletedIds.current.has(m._id));
          
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
      // Increase interval to 10s as a fallback since socket is now handling real-time
      const interval = setInterval(() => fetchMessages(targetId), 10000);
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

  const onFileSelect = async (e, type = 'image') => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;
    
    // Simulate upload - in real app, use a service or your backend
    const tempUrl = URL.createObjectURL(file);
    const msgType = type === 'doc' ? 'document' : 'image';
    
    handleSendMessage(null, {
      content: file.name,
      type: msgType,
      fileUrl: tempUrl,
      fileSize: file.size
    });
    
    e.target.value = null;
  };

  const triggerImageUpload = () => fileInputRef.current?.click();
  const triggerDocUpload = () => docInputRef.current?.click();

  const onAddEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    if (scrollHeight <= clientHeight) {
      setIsScrolledUp(false);
      return;
    }
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsScrolledUp(!isAtBottom);
  };

  const scrollToBottom = (behavior = 'smooth') => {
    if (chatContainerRef.current && !isScrolledUp) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior
      });
    }
  };

  useEffect(() => {
    const handleResize = () => scrollToBottom('auto');
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isScrolledUp]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('smooth');
      // A small safety fallback for slower-rendering media/images
      const timer = setTimeout(() => scrollToBottom('smooth'), 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isScrolledUp]);

  const handleTouchStart = (msgId) => {
    pressTimerRef.current = setTimeout(() => {
      setActiveMessageMenu(msgId);
    }, 500);
  };

  const handleTouchEndOrMove = () => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
  };

  // Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks = [];
      
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordingBlob(blob);
        const url = URL.createObjectURL(blob);
        handleSendMessage(null, {
          content: 'Voice Message',
          type: 'voice',
          fileUrl: url,
          duration: recordingTime
        });
        setRecordingTime(0);
        setIsRecording(false);
      };
      
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error('Mic error:', err);
      handleFeatureComingSoon("Microphone access");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
  };

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Real Calling Logic
  const initiateCall = async (type) => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({ 
        video: type === 'video', 
        audio: true 
      });
      setStream(currentStream);
      setCallType(type);
      setShowCallOverlay(true);
      
      const targetId = activeChat._id || activeChat.id;
      callUser(targetId, type);
    } catch (err) {
      console.error('Failed to get local stream', err);
      handleFeatureComingSoon("Camera/Microphone access");
    }
  };

  const handleAnswerCall = async () => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({ 
        video: call.type === 'video', 
        audio: true 
      });
      setStream(currentStream);
      setShowCallOverlay(true);
      answerCall();
    } catch (err) {
      console.error('Failed to get local stream for answer', err);
    }
  };

  const handleEndCall = () => {
    const targetId = activeChat?._id || activeChat?.id || call.from;
    leaveCall(targetId);
    setShowCallOverlay(false);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Save call to chat history
    handleSendMessage(null, {
      content: `${callType === 'video' ? 'Video' : 'Voice'} Call ended`,
      type: 'call',
      duration: 0 // In a real app, calculate actual duration
    });
  };

  useEffect(() => {
    if (callAccepted && !callEnded) {
      setShowCallOverlay(true);
    }
    if (callEnded) {
      setShowCallOverlay(false);
    }
  }, [callAccepted, callEnded]);

  const handleSendMessage = async (e, mediaData = null) => {
    if (e) e.preventDefault();
    const content = mediaData ? mediaData.content : newMessage;
    if (!content.trim() && !mediaData) return;

    const replyTarget = replyingTo;
    if (!mediaData) setNewMessage(''); 
    setReplyingTo(null);
    setIsScrolledUp(false);

    const tempMessage = {
      _id: 'temp-' + Date.now(),
      sender: user._id,
      recipient: activeChat._id || activeChat.id,
      content,
      type: mediaData?.type || 'text',
      fileUrl: mediaData?.fileUrl,
      fileSize: mediaData?.fileSize,
      duration: mediaData?.duration,
      replyTo: replyTarget,
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
          type: mediaData?.type || 'text',
          fileUrl: mediaData?.fileUrl,
          fileSize: mediaData?.fileSize,
          duration: mediaData?.duration,
          replyTo: replyTarget?._id
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => prev.map(m => m._id === tempMessage._id ? data.message : m));
        fetchChats();
      }
    } catch (err) {
      console.error('Send error:', err);
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
    <div className="flex w-full h-dvh md:h-[calc(100dvh-5rem)] items-center justify-center overflow-hidden md:rounded-3xl border-none md:border md:border-slate-200 bg-white md:shadow-xl">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div 
      id="chat-main-container"
      className={cn(
        "flex flex-col md:flex-row w-full h-full md:min-h-[calc(100vh-8rem)] bg-white rounded-none md:rounded-3xl shadow-none md:shadow-xl overflow-hidden animate-in fade-in duration-500",
        userId ? "flex" : "flex"
      )}
    >
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
                    className="p-1 text-slate-800 hover:bg-slate-100 rounded-full transition-colors md:hidden"
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
                  onClick={() => initiateCall('voice')}
                  className="p-2 text-slate-700 hover:bg-slate-50 rounded-full transition-colors"
                 >
                   <Phone className="h-5 w-5" />
                 </button>
                 <button 
                  onClick={() => initiateCall('video')}
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
                              "rounded-3xl px-4 py-2.5 text-sm shadow-sm cursor-pointer transition-transform active:scale-[0.98] duration-200",
                              isMine ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-slate-800 rounded-bl-none border border-slate-100"
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
                            {/* Specialized Rendering by Type */}
                            <div className="flex flex-col gap-2">
                              {msg.type === 'voice' ? (
                                <div className="flex items-center gap-3 min-w-[200px]">
                                  <button className={cn("p-2 rounded-full", isMine ? "bg-white/20" : "bg-slate-100")}>
                                    <Play className="h-4 w-4" />
                                  </button>
                                  <div className="flex-1 h-8 flex items-center gap-0.5">
                                    {[1,2,3,4,5,4,3,2,3,4,5,2].map((h, i) => (
                                      <div key={i} className={cn("flex-1 rounded-full", isMine ? "bg-white/40" : "bg-slate-300")} style={{ height: h * 4 }}></div>
                                    ))}
                                  </div>
                                  <span className="text-[10px] opacity-70">
                                    {Math.floor(msg.duration / 60)}:{String(msg.duration % 60).padStart(2, '0')}
                                  </span>
                                </div>
                              ) : msg.type === 'image' ? (
                                <div className="rounded-xl overflow-hidden -mx-2 -mt-1 mb-1">
                                  <img src={msg.fileUrl} alt="shared" className="max-h-60 w-full object-cover" />
                                </div>
                              ) : msg.type === 'document' ? (
                                <div className={cn("flex items-center gap-3 p-2 rounded-xl border", isMine ? "bg-white/10 border-white/20" : "bg-slate-50 border-slate-100")}>
                                  <div className="p-2 rounded-lg bg-red-100 text-red-600">
                                    <FileText className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-bold truncate">{msg.content}</p>
                                    <p className="text-[10px] opacity-60">{(msg.fileSize / 1024 / 1024).toFixed(1)} MB</p>
                                  </div>
                                  <Download className="h-4 w-4 opacity-50" />
                                </div>
                              ) : msg.type === 'call' ? (
                                <div className="flex items-center gap-2 py-1 opacity-80">
                                  {msg.content.includes('Video') ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                                  <span className="text-xs font-medium">{msg.content} ({Math.floor(msg.duration / 60)}:{String(msg.duration % 60).padStart(2, '0')})</span>
                                </div>
                              ) : (
                                msg.content
                              )}
                            </div>
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
              {/* Container end anchor for height calculations */}
            </div>

            {/* Footer - Instagram Style */}
            <div className="sticky bottom-0 bg-white p-3 md:p-4 border-t border-slate-100 pb-safe">
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
                  {/* Camera Icon - Outside Pill (Left) */}
                  <button 
                    type="button" 
                    onClick={triggerImageUpload}
                    className="flex-shrink-0 bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition-all shadow-md active:scale-90 duration-200"
                  >
                    <Camera className="h-5 w-5" />
                  </button>

                  {/* The Message Pill */}
                  <div className="flex-1 relative bg-slate-50 border border-slate-200/50 rounded-full px-4 py-1 flex items-center transition-all focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                    {/* Emoji Picker Overlay */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-full mb-4 left-0 right-0 bg-white shadow-2xl border border-slate-100 rounded-3xl p-4 flex justify-between z-50 animate-in slide-in-from-bottom-2 duration-200">
                        {['🌾', '🚜', '🌱', '🍅', '🐄', '☀️', '😊', '🤝'].map(e => (
                          <button key={e} type="button" onClick={() => onAddEmoji(e)} className="text-xl hover:scale-125 transition-transform">{e}</button>
                        ))}
                      </div>
                    )}
                    
                    {isRecording ? (
                      <div className="flex items-center gap-3 w-full py-1.5 h-8">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-xs font-mono font-bold text-slate-700 flex-1">
                          {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                        </span>
                        <button type="button" onClick={stopRecording} className="text-blue-600 font-bold text-sm px-2">
                          Send
                        </button>
                      </div>
                    ) : (
                      <>
                        <input 
                          type="text" 
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Message..." 
                          className="flex-1 bg-transparent py-2 text-base md:text-sm focus:outline-none text-slate-800 placeholder:text-slate-400"
                          inputMode="text"
                        />
                        
                        <div className="flex items-center gap-0.5 sm:gap-2 text-slate-400 flex-shrink-0 ml-1">
                           {!newMessage.trim() && (
                             <button type="button" onClick={startRecording} className="hover:text-slate-600 transition-colors p-1 flex-shrink-0">
                               <Mic className="h-5 w-5" />
                             </button>
                           )}
                           <button type="button" onClick={triggerImageUpload} className="hover:text-slate-600 transition-colors p-1 flex-shrink-0">
                             <Image className="h-5 w-5" />
                           </button>
                           <button 
                             type="button" 
                             onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                             className={cn("hover:text-slate-600 transition-colors p-1 flex-shrink-0", showEmojiPicker && "text-blue-500")}
                           >
                             <Smile className="h-5 w-5" />
                           </button>
                           <button 
                             type="button" 
                             onClick={() => handleFeatureComingSoon("Plus Menu")}
                             className="hover:text-slate-600 transition-colors p-1 flex-shrink-0"
                           >
                             <Plus className="h-5 w-5" />
                           </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Send Button (Visible when typing) */}
                  {newMessage.trim() && (
                    <button 
                      type="submit"
                      disabled={sending}
                      className="flex-shrink-0 bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition-all shadow-md active:scale-90 duration-200"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </form>
            </div>
            {/* Hidden Inputs */}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => onFileSelect(e, 'image')} />
            <input type="file" ref={docInputRef} className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={(e) => onFileSelect(e, 'doc')} />
            
            {/* Real Call Overlay */}
            {showCallOverlay && (
              <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center animate-in fade-in duration-500">
                 {/* Video Grid */}
                 <div className="relative w-full h-full flex flex-col">
                    {/* Remote Video (Full Screen) */}
                    <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                       {callType === 'video' || call.type === 'video' ? (
                          <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                       ) : (
                          <div className="flex flex-col items-center gap-4">
                             <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-green-500 shadow-2xl">
                                <img src={activeChat?.profilePic || 'https://via.placeholder.com/150'} className="h-full w-full object-cover" />
                             </div>
                             <h2 className="text-2xl font-bold text-white">{activeChat?.name || call.name}</h2>
                             <p className="text-green-400 animate-pulse uppercase tracking-widest text-xs font-bold font-mono">Voice Call Active</p>
                          </div>
                       )}
                       
                       {/* Connection Status Overlay */}
                       {!callAccepted && (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                             <div className="h-24 w-24 rounded-full border-4 border-t-green-500 border-green-500/20 animate-spin mb-6"></div>
                             <p className="text-white font-bold tracking-widest animate-pulse">CONNECTING...</p>
                          </div>
                       )}
                    </div>

                    {/* Local Video (Floating) */}
                    {(callType === 'video' || call.type === 'video') && stream && (
                       <div className="absolute top-6 right-6 w-32 h-44 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-20">
                          <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                       </div>
                    )}

                    {/* Call Controls */}
                    <div className="absolute bottom-12 left-0 w-full flex justify-center gap-8 items-center px-6">
                       <button className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90">
                          <MicOff className="h-6 w-6" />
                       </button>
                       
                       <button 
                          onClick={handleEndCall}
                          className="h-16 w-16 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-xl shadow-red-500/40 active:scale-95"
                       >
                          <Phone className="h-7 w-7 rotate-[135deg]" />
                       </button>

                       <button className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90">
                          <Video className="h-6 w-6" />
                       </button>
                    </div>
                 </div>
              </div>
            )}

            {/* Incoming Call Modal */}
            {call.isReceivingCall && !callAccepted && (
              <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in zoom-in duration-300">
                 <div className="flex flex-col items-center text-center max-w-sm w-full bg-slate-900 p-10 rounded-[40px] border border-white/10 shadow-2xl">
                    <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-blue-500 mb-6 shadow-xl relative">
                       <img src={activeChat?.profilePic || 'https://via.placeholder.com/150'} className="h-full w-full object-cover" />
                       <div className="absolute inset-0 border-4 border-blue-400 animate-ping rounded-full"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{call.name}</h2>
                    <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-10 flex items-center gap-2">
                       {call.type === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                       Incoming {call.type} call...
                    </p>
                    
                    <div className="flex gap-10 w-full justify-center">
                       <button 
                          onClick={handleEndCall}
                          className="h-16 w-16 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg active:scale-90"
                       >
                          <X className="h-8 w-8" />
                       </button>
                       <button 
                          onClick={handleAnswerCall}
                          className="h-16 w-16 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-all shadow-lg shadow-green-500/30 animate-bounce active:scale-90"
                       >
                          <Phone className="h-8 w-8" />
                       </button>
                    </div>
                 </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-slate-50/50">
            <div className="mb-6 rounded-full bg-white p-10 shadow-2xl shadow-green-100/50 animate-bounce duration-[3000ms]">
              <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <MessageSquare className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Your agriSmart Messages</h3>
            <p className="mt-4 text-slate-500 max-w-sm font-medium leading-relaxed">
              Connect with fellow farmers, experts, and market sellers. 
              Select a conversation to start chatting.
            </p>
            <div className="mt-8 flex gap-3">
              <div className="px-4 py-2 bg-white rounded-full border border-slate-200 text-xs font-bold text-slate-400">Secure</div>
              <div className="px-4 py-2 bg-white rounded-full border border-slate-200 text-xs font-bold text-slate-400">Real-time</div>
              <div className="px-4 py-2 bg-white rounded-full border border-slate-200 text-xs font-bold text-slate-400">Agri-focused</div>
            </div>
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
