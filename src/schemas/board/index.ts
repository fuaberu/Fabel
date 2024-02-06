import { z } from "zod";

export const BoardFormSchema = z.object({
	name: z.string().min(1),
});

export const ColumnFormSchema = z.object({
	name: z.string().min(1),
});

export const TaskFormSchema = z.object({
	name: z.string().min(1),
	description: z.string(),
	dueDate: z.string().optional(),
});
