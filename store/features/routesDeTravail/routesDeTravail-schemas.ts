import { z } from 'zod';

export const WorkRouteBreakSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export const WorkRouteBreaksResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  isActive: z.boolean(),
});

export const WorkRouteResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  enabled: z.boolean(),
  workRouteType: z.array(z.string()),
  workRouteBreak: z.array(WorkRouteBreakSchema),
});

export const PagedWorkRouteResponseSchema = z.object({
  items: z.array(WorkRouteResponseSchema),
  totalCount: z.number().int(),
  pageNumber: z.number().int(),
  pageSize: z.number().int(),
  totalPages: z.number().int(),
  hasPreviousPage: z.boolean(),
  hasNextPage: z.boolean(),
});

export const WorkRouteRequestSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  startTime: z.string().min(1, "L'heure de début est requise"),
  endTime: z.string().min(1, "L'heure de fin est requise"),
  enabled: z.boolean().default(true),
  workRouteType: z.array(z.string()),
  workRouteBreak: z.array(z.number()).optional(),
});

export const AssignWorkRouteRequestSchema = z.object({
  userId: z.number().int(),
});

export const ActivateWorkRouteRequestSchema = z.object({
  enabled: z.boolean(),
});

// Types
export type WorkRouteRequest = z.infer<typeof WorkRouteRequestSchema>;
export type WorkRouteBreaksResponse = z.infer<typeof WorkRouteBreaksResponseSchema>;
export type WorkRouteResponse = z.infer<typeof WorkRouteResponseSchema>;
export type PagedWorkRouteResponse = z.infer<typeof PagedWorkRouteResponseSchema>;
export type AssignWorkRouteRequest = z.infer<typeof AssignWorkRouteRequestSchema>;
export type ActivateWorkRouteRequest = z.infer<typeof ActivateWorkRouteRequestSchema>;
