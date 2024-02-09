"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { saveActivityLogsNotification } from "../actions";

// Board
export const createBoardDb = async (data: Prisma.BoardCreateInput, pathname: string) => {
	const res = await db.board.create({ data });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Create Board",
		});
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

export const updateOrderColumnDb = async (
	column_1: { id: string; order: number },
	column_2: { id: string; order: number },
	pathname: string,
) => {
	const res = await db.$transaction([
		db.column.update({ where: { id: column_1.id }, data: { order: column_1.order } }),
		db.column.update({ where: { id: column_2.id }, data: { order: column_2.order } }),
	]);

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Create Task",
		});
	}

	return res;
};

// Task
export const createTaskDb = async (data: Prisma.TaskCreateInput, pathname: string) => {
	const res = await db.task.create({
		data,
		include: { tags: true },
	});

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Create Task",
		});
	}

	return res;
};

export const updateTaskDb = async (id: string, data: Prisma.TaskUpdateInput, pathname: string) => {
	const res = await db.task.update({ where: { id }, data });

	if (res) {
		saveActivityLogsNotification({
			pathname,
			description: "Edit Task",
		});
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
	}

	return res;
};

export const updateTaskPositionDb = async (
	{
		id,
		columnId,
		order,
	}: {
		id: string;
		columnId?: string;
		order: number;
	},
	pathname: string,
) => {
	try {
		const data: Prisma.TaskUpdateInput = { order };

		if (columnId) {
			data.column = { connect: { id: columnId } };
		}

		console.log(data);

		await db.task.update({
			where: { id },
			data,
		});

		saveActivityLogsNotification({
			pathname,
			description: "Update Task",
		});
	} catch (error) {
		console.error(error);
		throw new Error("Someting went wrong");
	}
};
