import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [me, setMe] = useState('');
  const [call, setCall] = useState({});
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState(null);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    if (user && user._id) {
      const newSocket = io(API_URL);
      setSocket(newSocket);
      
      newSocket.emit('join', user._id);
      
      newSocket.on('me', (id) => setMe(id));
      
      newSocket.on('callUser', ({ from, name: callerName, signal, type }) => {
        setCall({ isReceivingCall: true, from, name: callerName, signal, type });
      });

      newSocket.on('callEnded', () => {
        setCallEnded(true);
        if (connectionRef.current) connectionRef.current.destroy();
        // Reset state
        setCallAccepted(false);
        setCall({});
        setStream(null);
      });

      return () => newSocket.disconnect();
    }
  }, [user]);

  const answerCall = () => {
    setCallAccepted(true);
    setCallEnded(false);
    
    const peer = new Peer({ 
      initiator: false, 
      trickle: false, 
      stream,
      config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
    });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) userVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  const callUser = (id, type = 'video') => {
    setCallEnded(false);
    const peer = new Peer({ 
      initiator: true, 
      trickle: false, 
      stream,
      config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
    });

    peer.on('signal', (data) => {
      socket.emit('callUser', { 
        userToCall: id, 
        signalData: data, 
        from: user._id, 
        name: user.name,
        type 
      });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) userVideo.current.srcObject = currentStream;
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = (targetId) => {
    setCallEnded(true);
    socket.emit('endCall', { to: targetId });
    if (connectionRef.current) connectionRef.current.destroy();
    setCallAccepted(false);
    setCall({});
    setStream(null);
  };

  return (
    <SocketContext.Provider value={{
      call,
      callAccepted,
      myVideo,
      userVideo,
      stream,
      callEnded,
      me,
      callUser,
      leaveCall,
      answerCall,
      setStream
    }}>
      {children}
    </SocketContext.Provider>
  );
};
