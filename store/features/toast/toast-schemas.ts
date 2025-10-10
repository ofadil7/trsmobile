import { z } from 'zod';

export const toastSchema = z.object({
  isOpen: z.boolean(),
  message: z.string().optional(),
  warning: z.string().optional(),
  error: z.string().optional(),
});

export type ToastResponse = z.infer<typeof toastSchema>;
