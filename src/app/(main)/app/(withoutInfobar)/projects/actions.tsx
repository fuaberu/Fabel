"use server";

import { db } from "@/lib/db";
import { Prisma, ProjectActivityType, TagColor } from "@prisma/client";
import { z } from "zod";
import { TaskFormSchema } from "@/schemas/board";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// Board
export const createBoardDb = async (data: Prisma.BoardCreateInput) => {
	try {
		const res = await db.board.create({ data });

		saveActivityLogs({
			type: "BOARD",
			entityId: res.id,
			description: "Created",
			projectId: res.id,
		});

		revalidatePath("/app", "layout");

		return { data: res };
	} catch (error) {
		return { data: null, message: "Something went wrong" };
	}
};

export const updateBoardDb = async (id: string, data: Prisma.BoardUpdateInput) => {
	try {
		const res = await db.board.update({ where: { id }, data });

		saveActivityLogs({
			type: "BOARD",
			entityId: id,
			description: "Updated",
			projectId: id,
		});

		revalidatePath("/app", "layout");
		return { data: res };
	} catch (error) {
		return { data: null, message: "Something went wrong" };
	}
};

export const deleteBoardDb = async (id: string) => {
	return { message: "Not implemented" };
	try {
		const res = await db.board.delete({ where: { id } });

		saveActivityLogs({
			type: "BOARD",
			entityId: id,
			description: "Deleted",
			projectId: id,
		});

		revalidatePath("/app", "layout");

		return { data: res };
	} catch (error) {
		return { data: null, message: "Something went wrong" };
	}
};

// Column
export const createColumnDb = async (data: Prisma.ColumnCreateInput) => {
	try {
		const res = await db.column.create({ data });

		saveActivityLogs({
			type: "COLUMN",
			entityId: res.id,
			description: "Created",
			projectId: res.boardId,
		});

		return { data: res };
	} catch (error) {
		return { data: null, message: "Something went wrong" };
	}
};

export const updateColumnDb = async (id: string, data: Prisma.ColumnUpdateInput) => {
	try {
		const res = await db.column.update({ where: { id }, data });

		saveActivityLogs({
			type: "COLUMN",
			entityId: id,
			description: "Updated",
			projectId: res.boardId,
		});

		revalidatePath("/app");

		return { data: res };
	} catch (error) {
		return { data: null, message: "Something went wrong" };
	}
};

export const deleteColumnDb = async (id: string) => {
	try {
		const res = await db.column.delete({ where: { id } });

		saveActivityLogs({
			type: "COLUMN",
			entityId: id,
			description: "Deleted",
			projectId: res.boardId,
		});

		return { data: res };
	} catch (error) {
		return { data: null, message: "Something went wrong" };
	}
};

export const updateColumnPositionDb = async ({ id, order }: { id: string; order: number }) => {
	try {
		const data: Prisma.ColumnUpdateInput = { order };

		const res = await db.column.update({
			where: { id },
			data,
		});

		revalidatePath("/app");

		saveActivityLogs({
			type: "COLUMN",
			entityId: id,
			description: "Updated Position",
			projectId: res.boardId,
		});

		return { data: res };
	} catch (error) {
		return { data: null, message: "Something went wrong" };
	}
};

// Task
export const createTaskDb = async (
	data: z.infer<typeof TaskFormSchema> & { columnId: string; order: number },
) => {
	try {
		const res = await db.task.create({
			data: {
				name: data.name,
				description: data.description,
				dueDate: data.dueDate,
				column: { connect: { id: data.columnId } },
				order: data.order,
				completedDate: data.completedDate,
			},
			include: { tags: true, column: { select: { boardId: true } } },
		});

		revalidatePath("/app");

		saveActivityLogs({
			type: "TASK",
			entityId: res.id,
			description: "Created",
			projectId: res.column.boardId,
		});

		return { data: res };
	} catch (error) {
		return { data: null, message: "Something went wrong" };
	}
};

export const updateTaskDb = async (id: string, data: z.infer<typeof TaskFormSchema>) => {
	try {
		const res = await db.task.update({
			where: { id },
			data,
			include: { tags: true, column: { select: { boardId: true } } },
		});

		revalidatePath("/app");

		saveActivityLogs({
			type: "TASK",
			entityId: res.id,
			description: "Updated",
			projectId: res.column.boardId,
		});

		return { data: res };
	} catch (error) {
		return { data: null, message: "Something went wrong" };
	}
};

export const deleteTaskDb = async (id: string) => {
	try {
		const res = await db.task.delete({
			where: { id },
			include: { tags: true, column: { select: { boardId: true } } },
		});

		revalidatePath("/app");

		saveActivityLogs({
			type: "TASK",
			entityId: res.id,
			description: "Deleted",
			projectId: res.column.boardId,
		});

		return { data: res };
	} catch (error) {
		return { data: null, message: "Something went wrong" };
	}
};

export const updateTaskPositionDb = async ({
	id,
	columnId,
	order,
	completedDate,
}: {
	id: string;
	columnId?: string;
	order: number;
	completedDate: Date | null;
}) => {
	try {
		const data: Prisma.TaskUpdateInput = { order, completedDate };

		if (columnId) {
			data.column = { connect: { id: columnId } };
		}

		const res = await db.task.update({
			where: { id },
			data,
			include: { tags: true, column: { select: { boardId: true } } },
		});

		saveActivityLogs({
			type: "TASK",
			entityId: res.id,
			description: "Deleted",
			projectId: res.column.boardId,
		});

		revalidatePath("/app");

		return { data: res };
	} catch (error) {
		return { data: null, message: "Something went wrong" };
	}
};

const tagSchema = z.object({
	name: z.string().min(1),
	color: z.nativeEnum(TagColor),
	boardId: z.string().min(1),
});
export const createTagDb = async (data: z.infer<typeof tagSchema>) => {
	try {
		const tag = await db.tag.create({
			data: {
				name: data.name,
				color: data.color,
				boardId: data.boardId,
			},
		});

		return { data: tag };
	} catch (error) {
		console.error(error);
		return { data: null, message: "Something went wrong" };
	}
};
export const editTagDb = async (id: string, data: z.infer<typeof tagSchema>) => {
	try {
		const tag = await db.tag.update({
			where: { id },
			data: {
				name: data.name,
				color: data.color,
				boardId: data.boardId,
			},
		});

		return { data: tag };
	} catch (error) {
		console.error(error);
		return { data: null, message: "Something went wrong" };
	}
};

// Logs
export const saveActivityLogs = async ({
	description,
	type,
	entityId,
	projectId,
}: {
	description: string;
	type: ProjectActivityType;
	entityId: string;
	projectId: string;
}) => {
	const user = await auth();

	return await db.projectActivity.create({
		data: {
			description,
			entityId,
			type,
			projectId,
			userId: user.id,
		},
	});
};
