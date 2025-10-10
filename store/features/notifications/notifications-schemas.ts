import { z } from 'zod';

const payloadJsonSchema = z.object({
  title: z.string(),
  body: z.string(),
  redirectUrl: z.string(),
  originalPayload: z
    .object({
      TicketId: z.number(),
      Departure: z.string(),
      Arrival: z.string(),
      OriginPoint: z.string(),
      DestinationPoint: z.string(),
      PatientName: z.string(),
      Priority: z.string(),
      ScheduledTime: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  userId: z.string().nullable().optional(),
  templateCode: z.string(),
  processedAt: z.string().datetime(),
});

export const notificationInstanceSchema = z.object({
  numero: z.number(),
  noNotificationTemplate: z.number(),
  payloadJson: payloadJsonSchema,
  scheduledAt: z.string().datetime().nullable().optional(),
  sentAt: z.string().datetime().nullable().optional(),
  creationDate: z.string().datetime(),
  modificationDate: z.string().datetime(),
});

export const NotificationTargetSchema = z.object({
  numero: z.number(),
  noNotificationInstanceId: z.number(),
  noUser: z.number(),
  isRead: z.boolean(),
  readAt: z.date().nullable(),
  pushStatus: z.string(),
  pushError: z.string().nullable(),
  pushSentAt: z.date().nullable(),
  inAppVisible: z.boolean(),
  creationDate: z.date(),
  modificationDate: z.date(),
  notificationInstance: notificationInstanceSchema,
  user: z.any(),
});

export const SendNotificationRequestSchema = z.object({
  templateCode: z.string(),
  userId: z.number(),
  payload: z.any(),
  inAppVisible: z.boolean().default(true),
  pushEnabled: z.boolean().default(true),
  scheduledAt: z.date().nullable(),
});

export const SendBulkNotificationsRequestSchema = z.object({
  templateCode: z.string(),
  userIds: z.array(z.number()),
  payload: z.any(),
  inAppVisible: z.boolean().default(true),
  pushEnabled: z.boolean().default(true),
  scheduledAt: z.date().nullable(),
});

export const RegisterDeviceTokenRequestSchema = z.object({
  userId: z.number(),
  token: z.string(),
  platform: z.string().default('Web'),
});

export type NotificationInstance = z.infer<typeof notificationInstanceSchema>;
export type NotificationTarget = z.infer<typeof NotificationTargetSchema>;
export type SendNotificationRequest = z.infer<typeof SendNotificationRequestSchema>;
export type SendBulkNotificationsRequest = z.infer<typeof SendBulkNotificationsRequestSchema>;
export type RegisterDeviceTokenRequest = z.infer<typeof RegisterDeviceTokenRequestSchema>;
