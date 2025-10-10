import { z } from 'zod';

export const ChatMessagesRequestSchema = z.object({
  senderId: z.number().int().nullable(),
  receiverId: z.number().int().nullable(),
  message: z.string().nonempty(),
});

export const ChatMessagesResponseSchema = z.object({
  id: z.number().int(),
  senderId: z.number().int().nullable(),
  senderName: z.string().nullable(),
  receiverId: z.number().int().nullable(),
  receiverName: z.string().nullable(),
  message: z.string(),
  timestamp: z.date(),
});

export type ChatMessagesResponse = z.infer<typeof ChatMessagesResponseSchema>;
export type ChatMessagesRequest = z.infer<typeof ChatMessagesRequestSchema>;
