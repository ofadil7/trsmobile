import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useEffect, useState } from 'react';
import { ChatMessagesResponse } from '../store/features/chatMessages/chatMessages-schemas';
import {
  addChatMessage,
  incrementUnreadMessage,
} from '../store/features/chatMessages/chatMessagesSlice';
import { setToastOpen } from '../store/features/toast/toastSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { API_BASE_URL } from '../store/services/api';

// Simple check for TextEncoder/TextDecoder
const setupPolyfills = () => {
  if (typeof TextEncoder === 'undefined' || typeof TextDecoder === 'undefined') {
    try {
      const { TextEncoder, TextDecoder } = require('text-encoding');
      global.TextEncoder = TextEncoder;
      global.TextDecoder = TextDecoder;
    } catch (error) {
      console.warn('Text encoding polyfill not available');
    }
  }
};

export const useChatHub = () => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const { auth } = useAppSelector((s) => s.auth);
  const currentUserId = auth?.id;
  const dispatch = useAppDispatch();
  const { openChatWithUserId } = useAppSelector((state) => state.chatMessages);

  useEffect(() => {
    if (!auth?.token || !currentUserId) {
      console.log('No auth token or user ID, skipping SignalR connection');
      return;
    }

    setupPolyfills();

    const connectToHub = async () => {
      try {
        setIsConnecting(true);
        console.log('Starting SignalR connection...');

        // Create the connection
        const conn = new HubConnectionBuilder()
          .withUrl(`${API_BASE_URL}/hub/chat`, {
            accessTokenFactory: () => auth.token || '',
            logger: LogLevel.Warning,
          })
          .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Simple retry intervals
          .build();

        // Set up message handler
        conn.on('ReceiveMessage', (msg: ChatMessagesResponse) => {
          console.log('Received message from:', msg.senderName);
          dispatch(addChatMessage(msg));

          if (msg.senderId !== currentUserId && msg.senderId !== openChatWithUserId) {
            dispatch(incrementUnreadMessage(msg.senderId!));
            dispatch(
              setToastOpen({
                isOpen: true,
                message: `${msg.senderName} sent you a message`,
              }),
            );
          }
        });

        // Connection event handlers
        conn.onclose((error) => {
          console.log('SignalR connection closed');
          setIsConnected(false);
        });

        conn.onreconnecting((error) => {
          console.log('SignalR reconnecting...');
          setIsConnected(false);
        });

        conn.onreconnected((connectionId) => {
          console.log('SignalR reconnected with ID:', connectionId);
          setIsConnected(true);
        });

        // Start the connection
        await conn.start();
        console.log('SignalR connection established successfully');

        setConnection(conn);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to establish SignalR connection:', error);
        setIsConnected(false);
      } finally {
        setIsConnecting(false);
      }
    };

    connectToHub();

    // Cleanup function
    return () => {
      if (connection) {
        console.log('Cleaning up SignalR connection');
        try {
          connection
            .stop()
            .then(() => {
              console.log('SignalR connection stopped');
            })
            .catch((error) => {
              console.error('Error stopping connection:', error);
            });
        } catch (error) {
          console.error('Error during connection cleanup:', error);
        }
        setConnection(null);
        setIsConnected(false);
      }
    };
  }, [auth?.token, currentUserId]); // Only depend on auth token and user ID

  // Safe method to send messages
  const sendMessage = async (methodName: string, ...args: any[]) => {
    if (!connection || connection.state !== 'Connected') {
      console.warn('Cannot send message - SignalR not connected');
      return false;
    }

    try {
      await connection.send(methodName, ...args);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  return {
    connection,
    isConnected,
    isConnecting,
    sendMessage,
  };
};
