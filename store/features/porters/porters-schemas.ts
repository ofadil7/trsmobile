import { z } from 'zod';

export const statusOptions = [
  { label: 'Disponible', value: 'AVAILABLE' },
  { label: 'En déplacement', value: 'ON_THE_MOVE' },
  { label: 'En pause', value: 'ON_BREAK' },
  { label: 'Déconnecté', value: 'NOT_AVAILABLE' },
];

export const BedSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

export const GroupSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

export const PorterStatusSchema = z.enum(['AVAILABLE', 'ON_THE_MOVE', 'ON_BREAK', 'NOT_AVAILABLE']);

export const WorkRouteDtoSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  workRouteType: z.array(z.string()),
  workRouteBreak: z.array(z.object({ id: z.number().int(), name: z.string() })),
});

export const WorkShiftDtoSchema = z.object({
  punchInAt: z.string(),
  punchOutAt: z.string(),
});

export const ServiceMiniDtoSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  code: z.string(),
});

export const UserDtoSchema = z.object({
  id: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
});

export const PrecautionDtoSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

export const TicketStatusEventDtoSchema = z
  .object({
    id: z.number(),
    idPorter: z.number().nullable(), 
    porter: UserDtoSchema.optional(),
    fromStatus: z.string(),
    toStatus: z.string(),
    reasonStatus: z.string(),
    customReasonStatus: z.string(),
    changedBy: z.number().nullable(),
    timestamp: z.number(),
  })
  .transform((data) => ({
    ...data,
    createdAt: new Date(data.timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

export const TicketDtoSchema = z.object({
  id: z.number().int(),
  serviceMiniDeparture: ServiceMiniDtoSchema,
  bedDeparture: BedSchema.optional(),
  serviceMiniArrival: ServiceMiniDtoSchema,
  precaution: PrecautionDtoSchema.optional(),
  bedArrival: BedSchema.optional(),
  ticketType: z.string(),
  ticketStatus: z.string(),
});

export const PorterDtoSchema = z.object({
  id: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  status: PorterStatusSchema,
  workRoute: WorkRouteDtoSchema.optional(),
  workShift: WorkShiftDtoSchema.optional(),
  ticket: z.array(TicketDtoSchema),
});

export const PorterWorkingShiftDtoSchema = z.object({
  id: z.number().int(),
  workRoute: WorkRouteDtoSchema,
  workShift: WorkShiftDtoSchema,
});

export const PorterTicketHistoryDtoSchema = z.object({
  id: z.number().int(),
  serviceMiniDeparture: ServiceMiniDtoSchema,
  bedDeparture: BedSchema.optional(),
  serviceMiniArrival: ServiceMiniDtoSchema,
  bedArrival: BedSchema.optional(),
  ticketType: z.string(),
  priority: z.number().int(),
  isStat: z.boolean(),
  isInConfinement: z.boolean(),
  nbrBrancardier: z.number().int(),
  user: UserDtoSchema,
  group: GroupSchema,
  porters: z.array(UserDtoSchema),
  precaution: PrecautionDtoSchema.optional(),
  ticketStatus: z.string(),
  ticketStatusEvents: z.array(TicketStatusEventDtoSchema),
  ticketWaitForApprovalDate: z.string().optional(),
  ticketWaitForApprovalTime: z.string().optional(),
  ticketAcceptedTime: z.string().optional(),
  ticketCompletedTime: z.string().optional(),
});

export const PorterTicketCountDtoSchema = z.object({
  ticketCompletedCount: z.number().int(),
  ticketCancelledCount: z.number().int(),
  ticketAbandonedCount: z.number().int(),
});

export const PagedPorterResponseSchema = z.object({
  items: z.array(PorterDtoSchema),
  totalCount: z.number().int(),
  pageNumber: z.number().int(),
  pageSize: z.number().int(),
  totalPages: z.number().int(),
  hasPreviousPage: z.boolean(),
  hasNextPage: z.boolean(),
});

export const PagedWorkingShiftResponseSchema = z.object({
  items: z.array(PorterWorkingShiftDtoSchema),
  totalCount: z.number().int(),
  pageNumber: z.number().int(),
  pageSize: z.number().int(),
  totalPages: z.number().int(),
  hasPreviousPage: z.boolean(),
  hasNextPage: z.boolean(),
});

export const PagedTicketHistoryResponseSchema = z.object({
  items: z.array(PorterTicketHistoryDtoSchema),
  totalCount: z.number().int(),
  pageNumber: z.number().int(),
  pageSize: z.number().int(),
  totalPages: z.number().int(),
  hasPreviousPage: z.boolean(),
  hasNextPage: z.boolean(),
});

// Types
export type Bed = z.infer<typeof BedSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type PorterStatus = z.infer<typeof PorterStatusSchema>;
export type WorkRouteDto = z.infer<typeof WorkRouteDtoSchema>;
export type WorkShiftDto = z.infer<typeof WorkShiftDtoSchema>;
export type ServiceMiniDto = z.infer<typeof ServiceMiniDtoSchema>;
export type UserDto = z.infer<typeof UserDtoSchema>;
export type PrecautionDto = z.infer<typeof PrecautionDtoSchema>;
export type TicketStatusEventDto = z.infer<typeof TicketStatusEventDtoSchema>;
export type TicketDto = z.infer<typeof TicketDtoSchema>;
export type PorterDto = z.infer<typeof PorterDtoSchema>;
export type PorterWorkingShiftDto = z.infer<typeof PorterWorkingShiftDtoSchema>;
export type PorterTicketHistoryDto = z.infer<typeof PorterTicketHistoryDtoSchema>;
export type PorterTicketCountDto = z.infer<typeof PorterTicketCountDtoSchema>;
export type PagedPorterResponse = z.infer<typeof PagedPorterResponseSchema>;
export type PagedWorkingShiftResponse = z.infer<typeof PagedWorkingShiftResponseSchema>;
export type PagedTicketHistoryResponse = z.infer<typeof PagedTicketHistoryResponseSchema>;
