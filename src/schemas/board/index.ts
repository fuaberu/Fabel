import { z } from "zod";

export const ColumnFormSchema = z.object({
	name: z.string().min(1),
});

export const TaskFormSchema = z.object({
	name: z.string().min(1),
	description: z.string(),
});
