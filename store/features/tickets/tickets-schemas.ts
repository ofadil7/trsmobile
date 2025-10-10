import { z } from 'zod';

// Generic helper types
export type ApiResponse<T> = {
  data: T | null;
  metadata?: string;
  errors?: string[];
  traceId: string;
};

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export const PortersIDsRequestSchema = z.object({
  porterIds: z.array(z.number().int()).min(1, 'Au moins un brancardier doit être assigné.'),
});

export type PortersIDsRequest = z.infer<typeof PortersIDsRequestSchema>;

export type TicketResponseApi = ApiResponse<TicketResponse>;
export type TicketPagedApi = ApiResponse<PagedResult<TicketResponse>>;

export const BedMiniDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const PrecautionResponseSchema = z.object({
  id: z.number(),
  addDate: z.string(),
  name: z.string(),
  description: z.string(),
  equipments: z.array(z.string()),
  backgroundColor: z.string(),
  foregroundColor: z.string(),
  codeHL7: z.string(),
  status: z.string(),
});

export const GetAllTicketsRequestSchema = z.object({
  ticketType: z.string().nullable(),
  priorities: z.array(z.number().int()).nullable(),
  statuses: z.array(z.string()).nullable(),
  search: z.string().nullable(),
  pageNumber: z.number().int(),
  pageSize: z.number().int(),
  sortField: z.string().nullable(),
  sortOrder: z.number().int().nullable(),
  IsStatOnly: z.boolean().nullable().optional(),
  isCompletedIncluded: z.boolean().nullable().optional(),
});

export const GroupMiniDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const PrecautionDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  equipments: z.array(z.string()),
  isInConfinement: z.boolean(),
});

export const PrecautionStatusEventDtoSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  status: z.string(),
  timestamp: z.number(),
});

export const ServiceMiniDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  locationName: z.string().nullable(),
});

export const PrecautionMiniDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  backgroundColor: z.string(),
  foregroundColor: z.string(),
});

export const StatusChangeRequestSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
  customReason: z.string().optional(),
});

export const TicketAssignmentQueueDtoSchema = z.object({
  ticketId: z.number().int(),
  source: z.string().default('API'),
  nextEligibleAt: z.string(),
});

export const TicketStatusEventDtoSchema = z.object({
  id: z.number().int(),
  idPorter: z.number().int().nullable(),
  fromStatus: z.string().nullable(),
  toStatus: z.string(),
  reasonStatus: z.string(),
  customReasonStatus: z.string(),
  changedBy: z.number().int(),
  timestamp: z.string(),
});

export const UserMiniDtoSchema = z.object({
  id: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  status: z.string(),
});

const TicketTypeEnum = ['TRANSPORT_PATIENT', 'TRANSPORT_EQUIPMENT', 'TRANSPORT_MESSAGING'] as const;
const TicketStatusEnum = [
  'NEW',
  'SENT',
  'WAITING_FOR_ACCEPTANCE',
  'ACCEPTED',
  'ITEM_RETRIEVED',
  'MOVING_TO_DESTINATION',
  'MOVING_TO_ORIGIN',
  'WAITING_FOR_PORTERS',
  'ABANDONED',
  'COMPLETED',
  'CANCELLED',
  'REFUSED',
  'DELETED',
] as const;

export const TicketRequestSchema = z
  .object({
    idServiceDeparture: z.number({ message: 'Le service de départ est requis.' }),

    idBedDeparture: z.number().int().nullable(),

    idServiceArrival: z.number({ message: "Le service d'arrivée est requis." }),

    idBedArrival: z.number().int().nullable(),

    ticketType: z
      .string({ message: 'Le type de ticket est requis.' })
      .refine((val) => TicketTypeEnum.includes(val as never), {
        message: 'Type de ticket invalide.',
      }),

    priority: z
      .number({ message: 'La priorité est requise.' })
      .int()
      .min(1, 'La priorité doit être entre 1 et 6.')
      .max(6, 'La priorité doit être entre 1 et 6.'),

    returnEquipment: z.boolean(),

    isStat: z.boolean(),

    notes: z.string(),

    status: z
      .string({ message: 'Le statut est requis.' })
      .refine((val) => TicketStatusEnum.includes(val as never), {
        message: 'Statut invalide.',
      }),

    scheduledAt: z.string().nullable(),

    patientFileNumber: z
      .string({ message: 'Le numéro de dossier patient est requis.' })
      .max(50, 'Le numéro de dossier patient ne doit pas dépasser 50 caractères.'),

    nbrBrancardier: z
      .number({ message: 'Le nombre de brancardiers est requis.' })
      .int()
      .min(1, 'Le nombre de brancardiers doit être entre 1 et 3.')
      .max(3, 'Le nombre de brancardiers doit être entre 1 et 3.'),

    patientFileType: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.idServiceArrival === data.idServiceDeparture) {
      ctx.addIssue({
        path: ['idServiceArrival'],
        code: z.ZodIssueCode.custom,
        message: "Le service d'arrivée doit être différent du service de départ.",
      });
    }
  });

export const TicketResponseSchema = z.object({
  id: z.number().int(),
  serviceDeparture: ServiceMiniDtoSchema,
  bedDeparture: BedMiniDtoSchema.nullable(),
  serviceArrival: ServiceMiniDtoSchema,
  bedArrival: BedMiniDtoSchema.nullable(),
  ticketType: z.string(),
  priority: z.number().int(),
  isStat: z.boolean(),
  returnEquipment: z.boolean(),
  isInConfinement: z.boolean(),
  scheduledAt: z.string().nullable(),
  patientFileNumber: z.string(),
  nbrBrancardier: z.number().int(),
  user: UserMiniDtoSchema,
  group: GroupMiniDtoSchema.nullable(),
  porters: z.array(UserMiniDtoSchema),
  notes: z.string().nullable(),
  precautionStatus: PrecautionMiniDtoSchema,
  precautionStatusEvents: z.array(PrecautionResponseSchema),
  ticketStatus: z.string(),
  ticketStatusEvents: z.array(TicketStatusEventDtoSchema),
});

export type BedMiniDto = z.infer<typeof BedMiniDtoSchema>;
export type GetAllTicketsRequest = z.infer<typeof GetAllTicketsRequestSchema>;
export type GroupMiniDto = z.infer<typeof GroupMiniDtoSchema>;
export type PrecautionDto = z.infer<typeof PrecautionDtoSchema>;
export type PrecautionMiniDto = z.infer<typeof PrecautionMiniDtoSchema>;
export type PrecautionStatusEventDto = z.infer<typeof PrecautionStatusEventDtoSchema>;
export type ServiceMiniDto = z.infer<typeof ServiceMiniDtoSchema>;
export type StatusChangeRequest = z.infer<typeof StatusChangeRequestSchema>;
export type TicketAssignmentQueueDto = z.infer<typeof TicketAssignmentQueueDtoSchema>;
export type TicketRequest = z.infer<typeof TicketRequestSchema>;
export type TicketResponse = z.infer<typeof TicketResponseSchema>;
export type TicketStatusEventDto = z.infer<typeof TicketStatusEventDtoSchema>;
export type UserMiniDto = z.infer<typeof UserMiniDtoSchema>;
