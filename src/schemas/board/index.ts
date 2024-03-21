import { ProjectPages, TaskStatus } from "@prisma/client";
import { z } from "zod";

export const ProjectPreferencesSchema = z.object({
	defaultPage: z.enum([ProjectPages.BOARD, ProjectPages.CALENDAR]),
});

export const BoardFormSchema = z.object({
	name: z.string().min(1),
});

export const ColumnFormSchema = z.object({
	name: z.string().min(1),
	description: z.string(),
	taskStatus: z.nativeEnum(TaskStatus),
});

export const TaskFormSchema = z.object({
	name: z.string().min(1),
	description: z.string(),
	dueDate: z.date().nullable(),
	completedDate: z.date().nullable(),
});
