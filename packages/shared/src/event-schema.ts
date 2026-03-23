import { z } from "zod";

import { feedEventTypes } from "./constants";

export const feedEventTypeSchema = z.enum(feedEventTypes);

export const watcherFeedEventSchema = z.object({
  id: z.string(),
  type: feedEventTypeSchema,
  title: z.string(),
  description: z.string(),
  timestamp: z.string(),
  txHash: z.string().optional(),
  ruleId: z.number().optional(),
  blockNumber: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type WatcherFeedEvent = z.infer<typeof watcherFeedEventSchema>;
