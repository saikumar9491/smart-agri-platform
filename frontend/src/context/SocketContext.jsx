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
  const [name, setName] = useState('');
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    if (user && user._id) {
      const newSocket = io(API_URL);
      setSocket(newSocket);
      setName(user.name);
      
      newSocket.emit('join', user._id);
      
      newSocket.on('me', (id) => setMe(id));

      newSocket.on('callUser', ({ from, name: callerName, signal, type }) => {
        setCall({ isReceivingCall: true, from, name: callerName, signal, type });
      });

      newSocket.on('callEnded', () => {
        setCallEnded(true);
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
        window.location.reload(); // Simplest way to reset state for media devices
      });
      
      return () => newSocket.disconnect();
    }
  }, [user]);

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  const callUser = (id, type) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: id, signalData: data, from: user._id, name, type });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = (targetId) => {
    setCallEnded(true);
    if (connectionRef.current) {
        connectionRef.current.destroy();
    }
    
    if (socket && targetId) {
        socket.emit('endCall', { to: targetId });
    }
    
    window.location.reload();
  };

  return (
    <SocketContext.Provider value={{
      socket,
      me,
      call,
      callAccepted,
      myVideo,
      userVideo,
      stream,
      name,
      setName,
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
