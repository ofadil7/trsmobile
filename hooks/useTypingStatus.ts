import { HubConnection } from '@microsoft/signalr';
import { useCallback, useRef } from 'react';

export const useTypingStatus = (connection: HubConnection | null, currentUserId?: number) => {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendTyping = useCallback(
    async (receiverId: number, isTyping: boolean) => {
      if (!connection || connection.state !== 'Connected' || !currentUserId) {
        return;
      }

      try {
        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }

        if (isTyping) {
          // Send typing started
          await connection.send('SendTypingStatus', currentUserId, receiverId, true);

          // Set timeout to automatically send typing stopped after 2 seconds
          typingTimeoutRef.current = setTimeout(() => {
            sendTyping(receiverId, false);
          }, 2000);
        } else {
          // Send typing stopped
          await connection.send('SendTypingStatus', currentUserId, receiverId, false);
        }
      } catch (error) {
        console.error('Error sending typing status:', error);
      }
    },
    [connection, currentUserId],
  );

  // Cleanup function
  const cleanup = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  return { sendTyping, cleanup };
};
