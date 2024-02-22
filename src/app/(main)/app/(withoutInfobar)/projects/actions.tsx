"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { saveActivityLogsNotification } from "../../actions";
import { z } from "zod";
import { TaskFormSchema } from "@/schemas/board";
import { revalidatePath } from "next/cache";

// Board
export const createBoardDb = async (data: Prisma.BoardCreateInput, pathname: string) => {
	const res = await db.board.create({ data });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Create Board",
		});

		revalidatePath("/app", "layout");
	}

	return res;
};

export const updateBoardDb = async (
	id: string,
	data: Prisma.BoardUpdateInput,
	pathname: string,
) => {
	const res = await db.board.update({ where: { id }, data });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Update Board",
		});

		revalidatePath("/app", "layout");
	}

	return res;
};

export const deleteBoardDb = async (id: string, pathname: string) => {
	return { message: "Not implemented" };
	const res = await db.board.delete({ where: { id } });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Delete Board",
		});

		revalidatePath("/app", "layout");
	}

	return res;
};

// Column
export const createColumnDb = async (data: Prisma.ColumnCreateInput, pathname: string) => {
	const res = await db.column.create({ data });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Create Column",
		});
	}

	return res;
};

export const updateColumnDb = async (
	id: string,
	data: Prisma.ColumnUpdateInput,
	pathname: string,
) => {
	const res = await db.column.update({ where: { id }, data });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Update Column",
		});

		revalidatePath("/app");
	}

	return res;
};

export const deleteColumnDb = async (id: string, pathname: string) => {
	const res = await db.column.delete({ where: { id } });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Delete Column",
		});
	}

	return res;
};

export const updateColumnPositionDb = async (
	{
		id,
		order,
	}: {
		id: string;
		order: number;
	},
	pathname: string,
) => {
	try {
		const data: Prisma.ColumnUpdateInput = { order };

		await db.column.update({
			where: { id },
			data,
		});

		saveActivityLogsNotification({
			pathname,
			description: "Update Column Position",
		});
	} catch (error) {
		console.error(error);
		throw new Error("Someting went wrong");
	}
};

// Task
export const createTaskDb = async (
	data: z.infer<typeof TaskFormSchema> & { columnId: string; order: number },
	pathname: string,
) => {
	const res = await db.task.create({
		data: {
			name: data.name,
			description: data.description,
			dueDate: data.dueDate,
			column: { connect: { id: data.columnId } },
			order: data.order,
			completedDate: data.completedDate,
		},
		include: { tags: true },
	});

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Create Task",
		});

		revalidatePath("/app");
	}

	return res;
};

export const updateTaskDb = async (
	id: string,
	data: z.infer<typeof TaskFormSchema>,
	pathname: string,
) => {
	const res = await db.task.update({ where: { id }, data });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Edit Task",
		});

		revalidatePath("/app");
	}

	return res;
};

export const deleteTaskDb = async (id: string, pathname: string) => {
	const res = await db.task.delete({ where: { id } });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Delete Task",
		});

		revalidatePath("/app");
	}

	return res;
};

export const updateTaskPositionDb = async (
	{
		id,
		columnId,
		order,
		completedDate,
	}: {
		id: string;
		columnId?: string;
		order: number;
		completedDate: Date | null;
	},
	pathname: string,
) => {
	try {
		const data: Prisma.TaskUpdateInput = { order, completedDate };

		if (columnId) {
			data.column = { connect: { id: columnId } };
		}

		await db.task.update({
			where: { id },
			data,
		});

		saveActivityLogsNotification({
			pathname,
			description: "Update Task",
		});

		revalidatePath("/app");
	} catch (error) {
		console.error(error);
		throw new Error("Someting went wrong");
	}
};
