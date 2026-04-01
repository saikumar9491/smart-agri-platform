import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [me, setMe] = useState('');

  useEffect(() => {
    if (user && user._id) {
      const newSocket = io(API_URL);
      setSocket(newSocket);
      
      newSocket.emit('join', user._id);
      
      newSocket.on('me', (id) => setMe(id));
      
      return () => newSocket.disconnect();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{
      socket,
      me
    }}>
      {children}
    </SocketContext.Provider>
  );
};
