import { z } from 'zod';

export const MembersRequestSchema = z.object({
  addUser: z.number().int().nullable(),
  modUser: z.number().int().nullable(),
  username: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  name: z.string(),
  email: z.string(),
  address: z.string(),
  tel: z.string(),
  noCountry: z.number().int(),
  noProvince: z.number().int(),
  noCity: z.number().int(),
  active: z.boolean().nullable(),
  noType: z
    .number()
    .int()
    .refine((val) => val !== 0, {
      message: 'Le role est requis.',
    }),
  groupeId: z.number().int(),
});

export const MembersResponseSchema = z.object({
  numero: z.number().int(),
  addUser: z.number().int().nullable(),
  nameAddUser: z.string().nullable(),
  roleAddUser: z.string().nullable(),
  addDate: z.string(),
  modUser: z.number().int().nullable(),
  nameModUser: z.string().nullable(),
  roleModUser: z.string().nullable(),
  modDate: z.string(),
  username: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  name: z.string(),
  email: z.string(),
  address: z.string(),
  tel: z.string(),
  noCountry: z.number().int(),
  nameCountry: z.string().nullable(),
  noProvince: z.number().int(),
  nameProvince: z.string().nullable(),
  noCity: z.number().int(),
  nameCity: z.string().nullable(),
  active: z.boolean().nullable(),
  noType: z.number().int(),
  role: z.string().nullable(),
  groupeId: z.number().int(),
  groupeName: z.string().nullable(),
  lastLogin: z.string(),
  lastHit: z.date(),
  isConnected: z.number().int(),
  dateDebutAbsence: z.string().nullable(),
  dateFinAbsence: z.string().nullable(),
});

export type MembersResponse = z.infer<typeof MembersResponseSchema>;
export type MembersRequest = z.infer<typeof MembersRequestSchema>;
