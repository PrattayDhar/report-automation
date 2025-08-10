import { z } from "zod";

export const downtimeIncidentSchema = z.object({
  date: z.string(),
  issue: z.string(),
  channel: z.string(),
  service: z.string(),
  impactType: z.enum(['FULL', 'PARTIAL']),
  modality: z.enum(['PLANNED', 'UNPLANNED']),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.string(),
  reason: z.string().optional(),
});

export const weeklyReportSchema = z.object({
  id: z.string(),
  weekLabel: z.string(),
  weekStart: z.string(),
  weekEnd: z.string(),
  createdAt: z.string(),
  summary: z.object({
    totalIncidents: z.number(),
    totalDuration: z.number(),
    plannedDuration: z.number(),
    unplannedDuration: z.number(),
    plannedFullDuration: z.number(),
    plannedPartialDuration: z.number(),
    unplannedFullDuration: z.number(),
    unplannedPartialDuration: z.number(),
  }),
});

export const reliabilityDataSchema = z.object({
  channel: z.string(),
  plannedDowntime: z.number(),
  unplannedFullDowntime: z.number(),
  totalMinutesInPeriod: z.number(),
  uptimePercentage: z.number(),
});

export const processedDataSchema = z.object({
  summary: z.object({
    totalIncidents: z.number(),
    totalDuration: z.number(),
    plannedDuration: z.number(),
    unplannedDuration: z.number(),
    plannedFullDuration: z.number(),
    plannedPartialDuration: z.number(),
    unplannedFullDuration: z.number(),
    unplannedPartialDuration: z.number(),
  }),
  chartData: z.object({
    plannedFull: z.array(z.object({
      channel: z.string(),
      duration: z.number(),
    })),
    unplannedFull: z.array(z.object({
      channel: z.string(),
      duration: z.number(),
    })),
    plannedPartial: z.array(z.object({
      channel: z.string(),
      duration: z.number(),
    })),
    unplannedPartial: z.array(z.object({
      channel: z.string(),
      duration: z.number(),
    })),
  }),
  incidents: z.array(downtimeIncidentSchema),
  reliabilityData: z.array(reliabilityDataSchema),
});

export type DowntimeIncident = z.infer<typeof downtimeIncidentSchema>;
export type ProcessedData = z.infer<typeof processedDataSchema>;
export type WeeklyReport = z.infer<typeof weeklyReportSchema>;
export type ReliabilityData = z.infer<typeof reliabilityDataSchema>;
