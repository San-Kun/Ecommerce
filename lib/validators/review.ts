import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Rating minimal 1").max(5, "Rating maksimal 5"),
  comment: z.string().max(2000).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
