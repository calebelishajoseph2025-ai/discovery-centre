/**
 * Zod validation schemas for Northside Discovery Centre.
 * Shared between client and server.
 * Pure module: no React, Next.js, or DOM dependencies.
 */

import { z } from 'zod';

export const LocalizedTextSchema = z.object({
  en: z.string().min(1, 'English text required'),
  ta: z.string().min(1, 'Tamil text required'),
});

export const CentreFactsSchema = z.object({
  name: LocalizedTextSchema,
  tagline: LocalizedTextSchema,
  address: z.literal('18 Garden Road, Riverdale'),
  city: z.string(),
  postalCode: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  googleMapsUrl: z.string().url(),
  timezone: z.literal('Asia/Kolkata'),
  hours: z.object({
    openTime: z.literal('10:00'),
    closeTime: z.literal('17:00'),
    openDays: z.array(z.string()).min(6),
    closedDays: z.array(z.string()).min(1),
    schedule: z.record(
      z.string(),
      z.object({
        open: z.boolean(),
        opens: z.string(),
        closes: z.string(),
        label: LocalizedTextSchema,
      })
    ),
  }),
  pricing: z.object({
    adultINR: z.literal(100),
    childINR: z.literal(50),
    currency: z.literal('INR'),
    policy: LocalizedTextSchema,
  }),
  accessibility: z.object({
    claim: LocalizedTextSchema,
    summary: LocalizedTextSchema,
    stepFreeEntrance: z.literal(true),
    wheelchairAccessible: z.literal(true),
    accessibleRestrooms: z.boolean(),
    seatingAvailable: z.boolean(),
  }),
  contact: z.object({
    email: z.string().email(),
    phonePlaceholder: z.string(),
  }),
});

export const ExhibitSchema = z.object({
  slug: z.enum([
    'light-lab',
    'build-bench',
    'sky-room',
    'echo-tunnel',
    'garden-trail',
  ]),
  name: LocalizedTextSchema,
  tagline: LocalizedTextSchema,
  description: LocalizedTextSchema,
  durationMinutes: z.number().int().positive(),
  zone: z.string(),
  floor: z.literal('Ground floor'),
  interests: z.array(z.string()).min(1),
  ageRange: LocalizedTextSchema,
  accessibility: LocalizedTextSchema,
  whatYoullDo: z.array(LocalizedTextSchema).min(1),
  tips: z.array(LocalizedTextSchema).min(1),
  accentToken: z.string(),
  calm: z.boolean(),
  sensoryNote: LocalizedTextSchema,
  initialFavourites: z.number().int().nonnegative(),
});

export const FAQSchema = z.object({
  id: z.string(),
  category: z.string(),
  question: LocalizedTextSchema,
  answer: LocalizedTextSchema,
});

export const JourneyStageSchema = z.object({
  id: z.enum(['arriving', 'exploring', 'deciding']),
  stepNumber: z.number().int().positive(),
  title: LocalizedTextSchema,
  subtitle: LocalizedTextSchema,
  description: LocalizedTextSchema,
  guideLine: LocalizedTextSchema,
  targetAnchor: z.string(),
});

export const BusynessCellSchema = z.object({
  hour: z.number().int().min(10).max(16),
  slotLabel: z.string(),
  score: z.number().min(0).max(100),
  category: z.enum(['quiet', 'moderate', 'busy']),
  label: LocalizedTextSchema,
});

export const DayBusynessSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  dayName: LocalizedTextSchema,
  open: z.boolean(),
  slots: z.array(BusynessCellSchema).nullable(),
});

export const PlanInputSchema = z.object({
  timeMinutes: z
    .number()
    .int()
    .min(20, 'Time available must be at least 20 minutes')
    .max(300, 'Time available cannot exceed 300 minutes (5 hours)'),
  interests: z.array(z.string()).default([]),
  adults: z
    .number()
    .int()
    .min(1, 'At least 1 adult required')
    .max(10, 'Maximum 10 adults per group'),
  children: z
    .number()
    .int()
    .min(0, 'Children cannot be negative')
    .max(10, 'Maximum 10 children per group')
    .default(0),
  stepFree: z.boolean().default(false),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  arrival: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Arrival must be in HH:mm format')
    .default('10:00'),
  quiet: z.boolean().default(false),
});

export type PlanInput = z.infer<typeof PlanInputSchema>;

export const FeedbackInputSchema = z.object({
  helpful: z.boolean(),
  comment: z
    .string()
    .max(280, 'Comment cannot exceed 280 characters')
    .optional()
    .nullable(),
  plan: PlanInputSchema,
  locale: z.enum(['en', 'ta']).default('en'),
  quiet: z.boolean().default(false),
});

export type FeedbackInput = z.infer<typeof FeedbackInputSchema>;

export const FavouriteActionSchema = z.object({
  action: z.enum(['add', 'remove']),
});

export const ShortPlanPayloadSchema = z.object({
  input: PlanInputSchema,
  locale: z.enum(['en', 'ta']).default('en'),
});

export type ShortPlanPayload = z.infer<typeof ShortPlanPayloadSchema>;
