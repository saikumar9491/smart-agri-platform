import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { Send, User, Search, Loader2, MessageSquare, ArrowLeft, MoreVertical } from 'lucide-react';
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
          // Overwrite with server data but keep sending messages that haven't landed yet
          return [...data.messages, ...sending];
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
      fetchMessages(activeChat._id || activeChat.id);
      const interval = setInterval(() => fetchMessages(activeChat._id || activeChat.id), 2000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const content = newMessage;
    setNewMessage(''); // Clear immediately

    // Optimistic Update
    const tempMessage = {
      _id: 'temp-' + Date.now(),
      sender: user._id,
      recipient: activeChat._id || activeChat.id,
      content,
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
          content
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
                      src={chat.user.profilePic.startsWith('/uploads') ? `${API_URL}${chat.user.profilePic}` : chat.user.profilePic} 
                      className="h-full w-full object-cover" 
                      alt={chat.user.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
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
                        src={activeChat.profilePic.startsWith('/uploads') ? `${API_URL}${activeChat.profilePic}` : activeChat.profilePic} 
                        className="h-full w-full object-cover" 
                        alt={activeChat.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => {
                const isMine = String(msg.sender) === String(user._id);
                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex max-w-[80%] flex-col",
                      isMine ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className={cn(
                      "rounded-2xl px-4 py-2 text-sm shadow-sm",
                      isMine ? "bg-green-600 text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                    )}>
                      {msg.content}
                    </div>
                    <span className="mt-1 text-[10px] text-slate-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="bg-white p-4 border-t border-slate-100">
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
    </div>
  );
}
